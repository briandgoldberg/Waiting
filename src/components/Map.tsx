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

    map.on("load", () => {
      map.addSource("projects", {
        type: "geojson",
        data: toFeatureCollection(projects) as GeoJSON.FeatureCollection,
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 40,
      });

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
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when the filtered project set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const applyData = () => {
      const source = map.getSource("projects") as GeoJSONSource | undefined;
      if (source) source.setData(toFeatureCollection(projects) as GeoJSON.FeatureCollection);
    };
    if (map.isStyleLoaded()) applyData();
    else map.once("load", applyData);
  }, [projects]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
