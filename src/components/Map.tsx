"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MaplibreMap } from "maplibre-gl";
import type { ProjectDTO } from "@/lib/types";
import { formatCapacity } from "@/lib/data/taxonomies";

// Free, no-API-key vector basemap (CARTO's Voyager style, widely used with
// MapLibre). Requires "© CARTO © OpenStreetMap contributors" attribution,
// which MapLibre renders automatically from the style's own metadata.
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// v2 of this component used a clustered GeoJSON source rendered as GL
// circle layers. In production, pins never appeared on first load — only
// sometimes, after a filter change forced a fresh source.setData() call —
// pointing at a timing issue in MapLibre's worker-built tile/cluster
// pipeline (geojson-vt/supercluster run off the main thread) rather than
// anything about the data itself. Rather than keep chasing that pipeline's
// internal timing, this version sidesteps it entirely: plain DOM markers
// (maplibregl.Marker), positioned with CSS transforms on every render tick,
// no worker, no tiling, no clustering. Simpler and much harder to get stuck
// in a "silently never rendered" state. Trade-off: no native clustering, so
// dense areas show overlapping pins rather than a merged bubble — acceptable
// at hundreds of points; revisit with client-side clustering (e.g.
// supercluster run on the main thread) if density becomes a real problem.

function capacityRadius(p: ProjectDTO): number {
  if (p.capacityUnit === "MW" && p.capacityValue != null) {
    // sqrt scale so area (not radius) is roughly proportional to capacity
    return Math.max(3.5, Math.min(12, Math.sqrt(p.capacityValue) * 0.4));
  }
  return 4;
}

const MARKER_COLOR = "#2563eb";

function popupHtml(p: ProjectDTO): string {
  const capacityLabel = formatCapacity(p.capacityValue, p.capacityUnit);
  return `
    <div style="min-width:220px;font-family:inherit;">
      <div style="padding:12px 14px 10px;border-bottom:1px solid var(--border);">
        <div style="font-weight:600;font-size:14px;line-height:1.3;">${p.name}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px;">
          ${p.state ?? ""} · ${capacityLabel}${p.isAggregateExample ? " · aggregate" : ""}
        </div>
      </div>
      <div style="padding:10px 14px;font-size:12px;">
        <div><strong>Waiting:</strong> ${p.yearsWaiting != null ? p.yearsWaiting.toFixed(1) + " yrs" : "—"}</div>
        <a href="/project/${p.slug}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:var(--accent);text-decoration:underline;">
          View project →
        </a>
      </div>
    </div>
  `;
}

export function Map({ projects }: { projects: ProjectDTO[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Re)build markers whenever the filtered project set changes. Simplest
  // correct approach: clear everything and re-add — cheap at hundreds of
  // markers, and avoids diffing bugs.
  useEffect(() => {
    const maybeMap = mapRef.current;
    if (!maybeMap) return;
    const map: MaplibreMap = maybeMap;

    function renderMarkers() {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      for (const p of projectsRef.current) {
        if (p.lat == null || p.lon == null) continue;

        const size = capacityRadius(p) * 2;
        const el = document.createElement("div");
        el.style.cssText = `
          width:${size}px;height:${size}px;border-radius:50%;
          background:${MARKER_COLOR};opacity:0.85;
          border:1px solid #ffffff;box-shadow:0 1px 2px rgba(0,0,0,0.3);
          cursor:pointer;
        `;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "260px" })
            .setLngLat([p.lon as number, p.lat as number])
            .setHTML(popupHtml(p))
            .addTo(map);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.lon, p.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    }

    if (map.loaded() || map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once("load", renderMarkers);
    }
    // Markers are plain DOM, so no readiness event is strictly required —
    // render immediately too in case neither flag/event ever fires (same
    // class of issue seen with the GL-layer approach this replaced).
    renderMarkers();
  }, [projects]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
