"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import { geocode } from "@/lib/geocode";
import { getRoutes } from "@/lib/routes";
import { getHourlyForecast } from "@/lib/weather";
import { scoreRouteWeather } from "@/lib/optimizer";
import { supabase } from "@/lib/supabase";
import { saveTrip } from "@/lib/trips";

export default function Home() {
  // =========================
  // AUTH GUARD
  // =========================
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, []);

  // =========================
  // FORM STATE
  // =========================
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");

  // =========================
  // LOCATION STATE
  // =========================
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);

  // =========================
  // ROUTES (MULTI-ROUTE ENGINE)
  // =========================
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<number[][]>([]);
  const [bestRouteIndex, setBestRouteIndex] = useState(0);

  // =========================
  // WEATHER + ANALYTICS
  // =========================
  const [weatherResults, setWeatherResults] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);

  // =========================
  // STEP 1: BUILD TRIP
  // =========================
  async function handleSubmit() {
    const fromC = await geocode(from);
    const toC = await geocode(to);

    setFromCoords(fromC);
    setToCoords(toC);

    const routeData = await getRoutes(fromC, toC);

    setRoutes(routeData);
    setActiveRoute(routeData[0].coords);
  }

  // =========================
  // STEP 2: ANALYZE ROUTES (SMART WEATHER)
  // =========================
  async function analyzeRoutes() {
    const scored = await Promise.all(
      routes.map(async (r) => {
        const mid = Math.floor(r.coords.length / 2);
        const [lon, lat] = r.coords[mid];

        const forecast = await getHourlyForecast(lat, lon);
        const score = scoreRouteWeather(forecast);

        return { ...r, score };
      })
    );

    const best = scored.sort((a, b) => a.score - b.score)[0];

    setBestRouteIndex(scored.indexOf(best));
    setActiveRoute(best.coords);
    setWeatherResults(scored);
  }

  // =========================
  // STEP 3: SAVE TRIP (SAAS FEATURE)
  // =========================
  async function handleSaveTrip() {
    if (!fromCoords || !toCoords || !activeRoute) return;

    await saveTrip({
      from,
      to,
      route: activeRoute,
    });
  }

  // =========================
  // UI
  // =========================
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">Get Me There</h1>

        {/* FORM */}
        <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800">

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
            onClick={handleSubmit}
            className="w-full bg-blue-600 p-3 rounded"
          >
            Generate Routes
          </button>

          <button
            onClick={analyzeRoutes}
            className="w-full bg-emerald-600 p-3 rounded"
          >
            Optimize Weather Routes
          </button>

          <button
            onClick={handleSaveTrip}
            className="w-full bg-purple-600 p-3 rounded"
          >
            Save Trip
          </button>
        </div>

        {/* MAP */}
        {fromCoords && toCoords && (
          <div className="mt-6">
            <Map
              fromCoords={fromCoords}
              toCoords={toCoords}
              onRoute={(coords) => setActiveRoute(coords)}
            />
          </div>
        )}

        {/* ROUTE SCORES */}
        {weatherResults.length > 0 && (
          <div className="mt-6 space-y-2">
            {weatherResults.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded border ${
                  i === bestRouteIndex
                    ? "border-green-500"
                    : "border-slate-700"
                }`}
              >
                Route {i + 1} — Risk Score: {r.score}
              </div>
            ))}
          </div>
        )}

        {/* RECOMMENDATION PLACEHOLDER */}
        {recommendation && (
          <div className="mt-6 bg-green-900/30 p-4 rounded border border-green-700">
            Best Departure: {recommendation.time?.toString?.()}
          </div>
        )}

      </div>
    </main>
  );
}