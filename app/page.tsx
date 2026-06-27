"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import * as turf from "@turf/turf";
import { geocode } from "@/lib/geocode";

export default function Home() {
  // FORM
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");

  // COORDS
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);

  // ROUTE + WEATHER
  const [route, setRoute] = useState<number[][]>([]);
  const [duration, setDuration] = useState(0);
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);

  // -------------------------
  // WAYPOINTS
  // -------------------------
  function getWaypoints(coords: number[][]) {
    const line = turf.lineString(coords);
    const distance = turf.length(line);
    const steps = 8;

    const points = [];

    for (let i = 0; i <= steps; i++) {
      const segment = turf.along(line, (distance * i) / steps);
      points.push(segment.geometry.coordinates);
    }

    return points;
  }

  // -------------------------
  // TIME PER POINT
  // -------------------------
  function getTimeAtPoint(
    index: number,
    total: number,
    duration: number,
    startTime: Date
  ) {
    const secondsPerPoint = duration / total;

    return new Date(
      startTime.getTime() + secondsPerPoint * index * 1000
    );
  }

  // -------------------------
  // RISK SCORING
  // -------------------------
  function getWeatherRisk(condition: string, temp: number) {
    let score = 0;
    const c = condition.toLowerCase();

    if (c.includes("rain")) score += 2;
    if (c.includes("storm")) score += 3;
    if (c.includes("snow")) score += 3;
    if (c.includes("thunder")) score += 3;
    if (temp > 95) score += 1;
    if (temp < 32) score += 1;

    return score;
  }

  function getRouteRisk(list: any[]) {
    return list.reduce((sum, w) => {
      return sum + getWeatherRisk(w.weather || "", w.temp || 70);
    }, 0);
  }

  // -------------------------
  // WEATHER PIPELINE
  // -------------------------
  useEffect(() => {
    if (!route.length || !duration || !departureTime) return;

    const run = async () => {
      const results = await Promise.all(
        route.map(async ([lon, lat], i) => {
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_KEY}&q=${lat},${lon}`
          );

          const data = await res.json();

          return {
            location: data.location?.name,
            time: getTimeAtPoint(i, route.length, duration, departureTime),
            weather: data.current?.condition?.text,
            temp: data.current?.temp_f,
          };
        })
      );

      setWeatherData(results);
    };

    run();
  }, [route, duration, departureTime]);

  // -------------------------
  // SUBMIT TRIP
  // -------------------------
  async function handleSubmit() {
    const fromC = await geocode(from);
    const toC = await geocode(to);

    setFromCoords(fromC as [number, number]);
    setToCoords(toC as [number, number]);

    setDepartureTime(new Date(departure));

    setRoute([]);
    setWeatherData([]);
    setRecommendation(null);
  }

  // -------------------------
  // OPTIMIZER
  // -------------------------
  async function findBestDepartureTime(base: Date) {
    const options = [];

    for (let i = 0; i < 5; i++) {
      const testTime = new Date(base.getTime() + i * 60 * 60 * 1000);

      const results = await Promise.all(
        route.map(async ([lon, lat]) => {
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_KEY}&q=${lat},${lon}`
          );

          const data = await res.json();

          return {
            weather: data.current?.condition?.text,
            temp: data.current?.temp_f,
          };
        })
      );

      const score = getRouteRisk(results);

      options.push({
        time: testTime,
        score,
      });
    }

    const best = options.sort((a, b) => a.score - b.score)[0];
    setRecommendation(best);
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <h1 className="text-4xl font-bold text-center mb-6">
        Get Me There
      </h1>

      {/* FORM */}
      <div className="max-w-xl mx-auto bg-slate-900 p-6 rounded-xl mb-6">
        <input
          className="w-full p-3 mb-3 rounded bg-slate-800"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 rounded bg-slate-800"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full p-3 mb-4 rounded bg-slate-800"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
        >
          Plan Trip
        </button>

        <button
          onClick={() =>
            departureTime && findBestDepartureTime(departureTime)
          }
          className="w-full mt-3 bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
        >
          Find Best Departure Time
        </button>
      </div>

      {/* MAP */}
      {fromCoords && toCoords && (
        <Map
          fromCoords={fromCoords}
          toCoords={toCoords}
          onRoute={(coords, duration) => {
            setRoute(coords);
            setDuration(duration);
          }}
        />
      )}

      {/* WEATHER */}
      <div className="mt-6 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-3">
          Weather Along Route
        </h2>

        {weatherData.map((w, i) => (
          <div key={i} className="p-3 bg-slate-800 rounded mb-2">
            <div className="font-semibold">{w.location}</div>
            <div>{w.time?.toLocaleTimeString?.()}</div>
            <div>{w.temp}°F — {w.weather}</div>
          </div>
        ))}
      </div>

      {/* RECOMMENDATION */}
      {recommendation && (
        <div className="mt-6 max-w-xl mx-auto p-4 bg-green-900 rounded">
          <h3 className="font-bold">🧭 Recommended Departure</h3>
          <p className="mt-2">
            Best time:{" "}
            <strong>{recommendation.time.toLocaleTimeString()}</strong>
          </p>
          <p>Risk Score: {recommendation.score}</p>
        </div>
      )}

      {/* ALERTS */}
      {weatherData.length > 0 && (
        <div className="mt-6 max-w-xl mx-auto p-4 bg-red-900 rounded">
          <h3 className="font-bold mb-2">⚠️ Travel Alerts</h3>

          {weatherData
            .filter((w) =>
              getWeatherRisk(w.weather || "", w.temp || 70) >= 3
            )
            .map((w, i) => (
              <div key={i}>⚠️ Risk near {w.location}</div>
            ))}
        </div>
      )}

    </main>
  );
}