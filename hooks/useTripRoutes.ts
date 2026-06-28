"use client";

import { useState } from "react";
import { geocode } from "@/lib/geocode";
import { getRoutes, RouteOption } from "@/lib/routes";

export function useTripRoutes() {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [error, setError] = useState("");

  const activeRoute =
    activeRouteIndex !== null ? routes[activeRouteIndex] : null;

  async function generateRoutes(from: string, to: string) {
    try {
      setError("");
      setLoadingRoutes(true);
      setRoutes([]);
      setActiveRouteIndex(null);

      const fromCoords = await geocode(from);
      const toCoords = await geocode(to);

      if (!fromCoords || !toCoords) {
        throw new Error("Could not find one of those locations.");
      }

      const routeOptions = await getRoutes(fromCoords, toCoords);

      setRoutes(routeOptions);
      setActiveRouteIndex(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong generating routes.");
    } finally {
      setLoadingRoutes(false);
    }
  }

  return {
    routes,
    activeRoute,
    activeRouteIndex,
    setActiveRouteIndex,
    loadingRoutes,
    error,
    setError,
    generateRoutes,
  };
}