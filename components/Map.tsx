"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  route: number[][];
};

export default function Map({ route }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    map.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  useEffect(() => {
    if (!map.current || !route || route.length === 0) return;

    const m = map.current;

    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };

    const drawRoute = () => {
      const source = m.getSource("active-route") as mapboxgl.GeoJSONSource;

      if (source) {
        source.setData(geojson);
      } else {
        m.addSource("active-route", {
          type: "geojson",
          data: geojson,
        });

        m.addLayer({
          id: "active-route-line",
          type: "line",
          source: "active-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 5,
          },
        });
      }

      const bounds = new mapboxgl.LngLatBounds();

      route.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });

      m.fitBounds(bounds, {
        padding: 60,
      });
    };

    if (m.isStyleLoaded()) {
      drawRoute();
    } else {
      m.once("load", drawRoute);
    }
  }, [route]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-800"
    />
  );
}