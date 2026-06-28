"use client";

import { useEffect, useState } from "react";
import Map from "@/components/Map";
import { geocode } from "@/lib/geocode";
import { getRoutes, RouteOption } from "@/lib/routes";
import { getHourlyForecast } from "@/lib/weather";
import { scoreRouteWeather } from "@/lib/optimizer";
import { supabase } from "@/lib/supabase";
import { saveTrip } from "@/lib/trips";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);

  const [weatherScore, setWeatherScore] = useState<number | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<any[]>([]);

  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [error, setError] = useState("");

  const activeRoute = routes[activeRouteIndex];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get("from");
    const toParam = params.get("to");

    if (fromParam && toParam) {
      setFrom(fromParam);
      setTo(toParam);
      generateRoutes(fromParam, toParam);
    }
  }, []);

  async function generateRoutes(fromValue = from, toValue = to) {
    try {
      setError("");
      setLoadingRoutes(true);
      setWeatherScore(null);
      setWeatherSummary([]);
      setRoutes([]);

      const fromC = await geocode(fromValue);
      const toC = await geocode(toValue);

      if (!fromC || !toC) {
        throw new Error("Could not find one of those locations.");
      }

      setFromCoords(fromC);
      setToCoords(toC);

      const routeOptions = await getRoutes(fromC, toC);

      setRoutes(routeOptions);
      setActiveRouteIndex(0);
    } catch (err: any) {
      setError(err.message || "Something went wrong generating routes.");
    } finally {
      setLoadingRoutes(false);
    }
  }

  function getSamplePoints(route: number[][], count = 6) {
    if (!route.length) return [];

    const points = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor((route.length - 1) * (i / (count - 1)));
      points.push(route[index]);
    }

    return points;
  }

  function getEstimatedArrivalTime(index: number, total: number) {
    const start = departure ? new Date(departure) : new Date();

    if (!activeRoute?.duration) return start;

    const secondsPerSegment = activeRoute.duration / Math.max(total - 1, 1);

    return new Date(start.getTime() + secondsPerSegment * index * 1000);
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

  useEffect(() => {
    async function loadWeatherForSelectedRoute() {
      if (!activeRoute?.coords?.length) return;

      try {
        setLoadingWeather(true);
        setWeatherScore(null);
        setWeatherSummary([]);

        const samplePoints = getSamplePoints(activeRoute.coords, 6);

        const weatherPoints = await Promise.all(
          samplePoints.map(async ([lon, lat], index) => {
            const arrivalTime = getEstimatedArrivalTime(
              index,
              samplePoints.length
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

        const score = scoreRouteWeather(weatherPoints);

        setWeatherSummary(weatherPoints);
        setWeatherScore(score);
      } catch {
        setError("Weather data could not be loaded for this route.");
      } finally {
        setLoadingWeather(false);
      }
    }

    loadWeatherForSelectedRoute();
  }, [activeRouteIndex, routes]);

  async function handleSaveTrip() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      const goLogin = confirm(
        "You need to log in to save routes. Go to login page?"
      );

      if (goLogin) {
        window.location.href = "/login";
      }

      return;
    }

    if (!activeRoute) return;

    await saveTrip({
      from,
      to,
      route: activeRoute.coords,
    });

    alert("Trip saved!");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Get Me There</h1>
          <p className="text-slate-400 mt-2">
            Weather-aware route planning for road trips
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <input
            className="w-full p-3 bg-slate-800 rounded"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <input
            className="w-full p-3 bg-slate-800 rounded"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <input
            type="datetime-local"
            className="w-full p-3 bg-slate-800 rounded"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
          />

          <button
            onClick={() => generateRoutes()}
            className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-semibold"
          >
            {loadingRoutes ? "Generating routes..." : "Generate Routes"}
          </button>

          <button
            onClick={handleSaveTrip}
            disabled={!activeRoute}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 p-3 rounded font-semibold"
          >
            Save Selected Trip
          </button>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full bg-slate-700 hover:bg-slate-600 p-3 rounded font-semibold"
          >
            Dashboard
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded">
            {error}
          </div>
        )}

        {activeRoute && (
          <div className="mt-6">
            <Map route={activeRoute.coords} />
          </div>
        )}

        {routes.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">Route Options</h2>

            {routes.map((route, index) => (
              <button
                key={index}
                onClick={() => setActiveRouteIndex(index)}
                className={`w-full text-left p-4 rounded border transition ${
                  activeRouteIndex === index
                    ? "border-green-500 bg-green-900/20"
                    : "border-slate-700 bg-slate-900/40 hover:border-blue-500"
                }`}
              >
                <div className="font-semibold">Route {index + 1}</div>

                <div className="text-sm text-slate-400">
                  Duration: {Math.round(route.duration / 60)} min
                </div>

                <div className="text-sm text-slate-400">
                  Distance: {Math.round(route.distance / 1609)} miles
                </div>
              </button>
            ))}
          </div>
        )}

        {loadingWeather && (
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded">
            Loading weather for selected route...
          </div>
        )}

        {weatherScore !== null && (
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded">
            <h2 className="text-xl font-semibold">Selected Route Weather</h2>

            <div className="mt-2">
              Weather Risk Score:{" "}
              <span className="font-bold">{weatherScore}</span>
            </div>

            <div className="mt-4 space-y-2">
              {weatherSummary.map((w, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-800 rounded flex justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {w.location || `Stop ${index + 1}`}
                    </div>
                    <div className="text-sm text-slate-400">
                      {w.arrivalTime.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div>{w.condition}</div>
                    <div className="text-sm text-slate-400">
                      {w.temp !== null ? `${w.temp}°F` : "Temp unavailable"}
                    </div>
                    <div className="text-sm text-slate-400">
                      Wind: {w.wind ?? "?"} mph
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}