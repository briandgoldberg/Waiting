"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MaplibreMap, type GeoJSONSource } from "maplibre-gl";
import type { ProjectDTO } from "@/lib/types";
import { getCauseCategory } from "@/lib/data/causeCategories";
import { formatCapacity } from "@/lib/data/taxonomies";

// Free, no-API-key vector basemap (CARTO's Voyager style, widely used with
// MapLibre). Requires "© CARTO © OpenStreetMap contributors" attribution,
// which MapLibre renders automatically from the style's own metadata.
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

function capacityRadius(p: ProjectDTO): number {
  if (p.capacityUnit === "MW" && p.capacityValue != null) {
    // sqrt scale so area (not radius) is roughly proportional to capacity
    return Math.max(6, Math.min(28, Math.sqrt(p.capacityValue) * 0.9));
  }
  return 8;
}

function primaryColor(p: ProjectDTO): string {
  const first = p.causeSlugs[0];
  if (!first) return "#9ca3af";
  return getCauseCategory(first)?.color ?? "#9ca3af";
}

function toFeatureCollection(projects: ProjectDTO[]) {
  return {
    type: "FeatureCollection" as const,
    features: projects
      .filter((p) => p.lat != null && p.lon != null)
      .map((p) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [p.lon as number, p.lat as number] },
        properties: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          state: p.state,
          fuelType: p.fuelType,
          stage: p.currentStage,
          yearsWaiting: p.yearsWaiting,
          capacityLabel: formatCapacity(p.capacityValue, p.capacityUnit),
          causeLabel: p.causeSlugs[0] ? getCauseCategory(p.causeSlugs[0])?.label : "Not yet determined",
          color: primaryColor(p),
          radius: capacityRadius(p),
          isAggregateExample: p.isAggregateExample,
        },
      })),
  };
}

export function Map({ projects }: { projects: ProjectDTO[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [-96, 39],
      zoom: 3.4,
      minZoom: 2,
      maxZoom: 14,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // MapLibre's "load" event is the textbook way to know a map is ready,
    // but in production it has been observed to never fire even after the
    // basemap has visibly finished rendering (isStyleLoaded()/loaded() stay
    // false indefinitely — some style sub-resource apparently never
    // resolves the internal "fully loaded" bookkeeping, despite every
    // tile/sprite/glyph request succeeding). Gating addSource/addLayer
    // behind "load" alone silently drops every project pin when that
    // happens — confirmed live in production on 2026-08-14: tiles/sprite
    // all 200'd, the basemap rendered, but isStyleLoaded() stayed false
    // forever and "load" never fired, so the "projects" source was never
    // added at all. Fix: don't wait on any single event. Retry a cheap,
    // idempotent setup function on a short interval until it actually
    // succeeds, using isStyleLoaded() (not the "load" event) as the
    // real readiness check — addSource works as soon as that's true,
    // regardless of whether "load" itself ever fires.
    let cancelled = false;
    let attempts = 0;

    function trySetUpProjectLayers() {
      if (cancelled || map.getSource("projects")) return;
      attempts += 1;

      // isStyleLoaded()/loaded() are NOT used as the gate here — confirmed
      // live in production that they can stay false forever even though
      // addSource works fine. Just try it, and if the style genuinely
      // isn't ready yet (it throws), retry shortly. This is what actually
      // succeeds in the environment where the flags never flip.
      try {
        map.addSource("projects", {
          type: "geojson",
          data: toFeatureCollection(projectsRef.current) as GeoJSON.FeatureCollection,
          cluster: true,
          clusterMaxZoom: 8,
          clusterRadius: 40,
        });
      } catch {
        if (attempts < 100) setTimeout(trySetUpProjectLayers, 100); // ~10s ceiling
        return;
      }

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "projects",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#1e3a5f",
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 25, 28],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "projects",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
          "text-font": ["Noto Sans Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "projects",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["get", "radius"],
          "circle-opacity": 0.82,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("projects") as GeoJSONSource;
        if (clusterId == null) return;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, string | number | boolean>;
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

        popupRef.current?.remove();
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="min-width:220px;font-family:inherit;">
            <div style="padding:12px 14px 10px;border-bottom:1px solid var(--border);">
              <div style="font-weight:600;font-size:14px;line-height:1.3;">${props.name}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px;">
                ${props.state ?? ""} · ${props.capacityLabel}${props.isAggregateExample ? " · aggregate" : ""}
              </div>
            </div>
            <div style="padding:10px 14px;font-size:12px;">
              <div><strong>Waiting:</strong> ${
                props.yearsWaiting != null ? Number(props.yearsWaiting).toFixed(1) + " yrs" : "—"
              }</div>
              <div><strong>Cause:</strong> ${props.causeLabel}</div>
              <a href="/project/${props.slug}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:var(--accent);text-decoration:underline;">
                View project →
              </a>
            </div>
          </div>
        `;

        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "260px" })
          .setLngLat(coords)
          .setDOMContent(el)
          .addTo(map);
      });

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      // If the projects prop changed while we were still waiting for style
      // readiness, apply the latest data now instead of the possibly-stale
      // snapshot captured when trySetUpProjectLayers first ran.
      const source = map.getSource("projects") as GeoJSONSource;
      source.setData(toFeatureCollection(projectsRef.current) as GeoJSON.FeatureCollection);
    }

    // Race every plausible readiness signal — whichever comes first wins,
    // the rest are harmless no-ops thanks to the getSource("projects") guard.
    map.on("load", trySetUpProjectLayers);
    map.on("styledata", trySetUpProjectLayers);
    map.on("idle", trySetUpProjectLayers);
    trySetUpProjectLayers();

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when the filtered project set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("projects") as GeoJSONSource | undefined;
    if (source) source.setData(toFeatureCollection(projects) as GeoJSON.FeatureCollection);
    // If the source doesn't exist yet, trySetUpProjectLayers's own retry
    // loop will pick up the latest projectsRef.current value once it runs.
  }, [projects]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
