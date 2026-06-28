"use client";

import { useEffect, useState } from "react";
import Map from "@/components/Map";
import AppHeader from "@/components/AppHeader";
import TripPlannerCard from "@/components/TripPlannerCard";
import TripSummary from "@/components/TripSummary";
import RouteCard from "@/components/RouteCard";
import WeatherCard from "@/components/WeatherCard";
import DirectionsPanel from "@/components/DirectionsPanel";
import VehicleProfileCard from "@/components/VehicleProfileCard";

import { VehicleMode } from "@/lib/vehicleProfiles";
import { useTripRoutes } from "@/hooks/useTripRoutes";
import { useRouteWeather } from "@/hooks/useRouteWeather";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>("car");

  const {
    routes,
    activeRoute,
    activeRouteIndex,
    setActiveRouteIndex,
    loadingRoutes,
    error,
    setError,
    generateRoutes,
  } = useTripRoutes();

  const {
    weatherSummary,
    weatherScore,
    loadingWeather,
    weatherError,
  } = useRouteWeather(activeRoute, departure, vehicleMode);

  const { startNavigation } = useVoiceNavigation(activeRoute);

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

  useEffect(() => {
    if (weatherError) {
      setError(weatherError);
    }
  }, [weatherError, setError]);

  function goToDashboard() {
    if (activeRoute) {
      sessionStorage.setItem(
        "currentTrip",
        JSON.stringify({
          from,
          to,
          departure,
          route: activeRoute.coords,
          weatherScore,
          weatherSummary,
          vehicleMode,
          createdAt: new Date().toISOString(),
        })
      );
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <AppHeader />

        <TripPlannerCard
          from={from}
          to={to}
          departure={departure}
          loading={loadingRoutes}
          setFrom={setFrom}
          setTo={setTo}
          setDeparture={setDeparture}
          onGenerate={() => generateRoutes(from, to)}
        />

        <div className="mt-6">
          <VehicleProfileCard
            vehicleMode={vehicleMode}
            setVehicleMode={setVehicleMode}
          />
        </div>

        <button
          onClick={goToDashboard}
          className="mt-4 w-full rounded-xl bg-slate-700 p-3 font-semibold hover:bg-slate-600"
        >
          Dashboard
        </button>

        {error && (
          <div className="mt-4 rounded-xl border border-red-700 bg-red-900/40 p-3">
            {error}
          </div>
        )}

        <TripSummary
          from={from}
          to={to}
          duration={activeRoute?.duration}
          distance={activeRoute?.distance}
          score={weatherScore}
        />

        {activeRoute && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-3">
            <Map route={activeRoute.coords} weatherPoints={weatherSummary} />
          </div>
        )}

        {routes.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">Route Options</h2>

            <div className="grid gap-3 md:grid-cols-3">
              {routes.map((route, index) => (
                <RouteCard
                  key={index}
                  index={index}
                  active={activeRouteIndex === index}
                  duration={route.duration}
                  distance={route.distance}
                  onClick={() => setActiveRouteIndex(index)}
                />
              ))}
            </div>
          </section>
        )}

        {loadingWeather && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
            Checking weather along selected route...
          </div>
        )}

        {weatherSummary.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">Weather Along Route</h2>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {weatherSummary.map((w, index) => (
                <WeatherCard
                  key={index}
                  w={w}
                  vehicleMode={vehicleMode}
                />
              ))}
            </div>
          </section>
        )}

        <DirectionsPanel
          steps={activeRoute?.steps ?? []}
          onStartNavigation={startNavigation}
        />
      </div>
    </main>
  );
}