"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type Props = {
  fromCoords: [number, number];
  toCoords: [number, number];
  onRoute?: (coords: number[][], duration: number) => void;
};

export default function Map({ fromCoords, toCoords, onRoute }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // -------------------------
  // INIT MAP
  // -------------------------
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: fromCoords,
      zoom: 5,
    });
  }, []);

  // -------------------------
  // ROUTE CALCULATION
  // -------------------------
  useEffect(() => {
    if (!map.current) return;
    if (!fromCoords || !toCoords) return;

    const getRoute = async () => {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const data = await res.json();

      const route = data.routes[0].geometry.coordinates;
      const duration = data.routes[0].duration;

      // send to parent
      if (onRoute) {
        onRoute(route, duration);
      }

      const geojson = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: route,
        },
      };

      // -------------------------
      // ADD / UPDATE ROUTE LAYER
      // -------------------------
      const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;

      if (source) {
        source.setData(geojson);
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: geojson,
        });

        map.current.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
          },
        });
      }

      // fit map to route
      const bounds = new mapboxgl.LngLatBounds();
      route.forEach((coord: number[]) => bounds.extend(coord as [number, number]));

      map.current.fitBounds(bounds, {
        padding: 60,
      });
    };

    getRoute();
  }, [fromCoords, toCoords]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-xl mt-6 overflow-hidden"
    />
  );
}