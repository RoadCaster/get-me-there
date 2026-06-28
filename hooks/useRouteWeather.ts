"use client";

import { useEffect, useState } from "react";
import { getHourlyForecast } from "@/lib/weather";
import { scoreRouteWeather } from "@/lib/optimizer";
import { RouteOption } from "@/lib/routes";
import { VehicleMode } from "@/lib/vehicleProfiles";

function getSamplePoints(route: number[][], count = 6) {
  if (!route.length) return [];

  const points = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor((route.length - 1) * (i / (count - 1)));
    points.push(route[index]);
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
  vehicleMode: VehicleMode
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
        setWeatherScore(null);
        setWeatherSummary([]);

        const samplePoints = getSamplePoints(activeRoute.coords, 6);
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
              location: forecast?.[0]?.location || `Stop ${index + 1}`,
              arrivalTime,
              condition: closest?.condition || "Unknown",
              temp: closest?.temp ?? null,
              wind: closest?.wind ?? null,
              precip: closest?.precip ?? null,
            };
          })
        );

        const score = scoreRouteWeather(weatherPoints, vehicleMode);

        setWeatherSummary(weatherPoints);
        setWeatherScore(score);
      } catch {
        setWeatherError("Weather data could not be loaded for this route.");
      } finally {
        setLoadingWeather(false);
      }
    }

    loadWeatherForSelectedRoute();
  }, [activeRoute, departure, vehicleMode]);

  return {
    weatherSummary,
    weatherScore,
    loadingWeather,
    weatherError,
  };
}