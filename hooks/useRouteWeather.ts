"use client";

import { useEffect, useState } from "react";
import { getHourlyForecast } from "@/lib/weather";
import { scoreRouteWeather } from "@/lib/optimizer";
import { RouteOption } from "@/lib/routes";
import { VehicleMode } from "@/lib/vehicleProfiles";

type Position = {
  lat: number;
  lon: number;
};

function distanceSquared(a: number[], b: number[]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

function findClosestRouteIndex(route: number[][], position: Position | null) {
  if (!position) return 0;

  let closestIndex = 0;
  let closestDistance = Infinity;

  route.forEach((coord, index) => {
    const d = distanceSquared(coord, [position.lon, position.lat]);

    if (d < closestDistance) {
      closestDistance = d;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function getUpcomingSamplePoints(
  route: number[][],
  position: Position | null,
  count = 4
) {
  if (!route.length) return [];

  const startIndex = findClosestRouteIndex(route, position);
  const remaining = route.slice(startIndex);

  if (remaining.length <= count) return remaining;

  const points = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor((remaining.length - 1) * (i / (count - 1)));
    points.push(remaining[index]);
  }

  return points;
}

function findClosestForecastHour(forecast: any[], targetTime: Date) {
  if (!forecast.length) return null;

  return forecast.reduce((closest, current) => {
    const closestDiff = Math.abs(
      new Date(closest.time).getTime() - targetTime.getTime()
    );

    const currentDiff = Math.abs(
      new Date(current.time).getTime() - targetTime.getTime()
    );

    return currentDiff < closestDiff ? current : closest;
  });
}

export function useRouteWeather(
  activeRoute: RouteOption | null,
  departure: string,
  vehicleMode: VehicleMode,
  currentPosition: Position | null
) {
  const [weatherSummary, setWeatherSummary] = useState<any[]>([]);
  const [weatherScore, setWeatherScore] = useState<number | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    async function loadWeatherForSelectedRoute() {
      if (!activeRoute?.coords?.length) {
        setWeatherSummary([]);
        setWeatherScore(null);
        return;
      }

      try {
        setWeatherError("");
        setLoadingWeather(true);

        const samplePoints = getUpcomingSamplePoints(
          activeRoute.coords,
          currentPosition,
          4
        );

        const start = departure ? new Date(departure) : new Date();

        const weatherPoints = await Promise.all(
          samplePoints.map(async ([lon, lat], index) => {
            const secondsPerSegment =
              activeRoute.duration / Math.max(samplePoints.length - 1, 1);

            const arrivalTime = new Date(
              start.getTime() + secondsPerSegment * index * 1000
            );

            const forecast = await getHourlyForecast(lat, lon);
            const closest = findClosestForecastHour(forecast, arrivalTime);

            return {
              lat,
              lon,
              location: forecast?.[0]?.location || `Upcoming ${index + 1}`,
              arrivalTime,
              condition: closest?.condition || "Unknown",
              temp: closest?.temp ?? null,
              wind: closest?.wind ?? null,
              precip: closest?.precip ?? null,
            };
          })
        );

        setWeatherSummary(weatherPoints);
        setWeatherScore(scoreRouteWeather(weatherPoints, vehicleMode));
      } catch {
        setWeatherError("Weather data could not be loaded for this route.");
      } finally {
        setLoadingWeather(false);
      }
    }

    loadWeatherForSelectedRoute();
  }, [activeRoute, departure, vehicleMode, currentPosition]);

  return {
    weatherSummary,
    weatherScore,
    loadingWeather,
    weatherError,
  };
}