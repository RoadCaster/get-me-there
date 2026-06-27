"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type Props = {
  fromCoords?: [number, number];
  toCoords?: [number, number];
  onRoute?: (coords: number[][], duration: number) => void;
};

export default function Map({ fromCoords, toCoords, onRoute }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-90.1994, 38.6270],
      zoom: 4,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    if (!fromCoords || !toCoords) return;

    const getRoute = async () => {
      const res = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const json = await res.json();
      const route = json.routes[0].geometry.coordinates;
      const duration = json.routes[0].duration;

      if (onRoute) {
        onRoute(route, duration);
      }

      if (map.current!.getSource("route")) {
        (map.current!.getSource("route") as any).setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        });
        return;
      }

      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        },
      });

      map.current!.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
        },
      });
    };

    getRoute();
  }, [fromCoords, toCoords]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-xl overflow-hidden mt-6"
    />
  );
}