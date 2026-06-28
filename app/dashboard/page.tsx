"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTrips, deleteTrip, saveTrip } from "@/lib/trips";

export default function Dashboard() {
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);

    const draft = sessionStorage.getItem("currentTrip");

    if (draft) {
      setCurrentTrip(JSON.parse(draft));
    }

    const { data } = await supabase.auth.getSession();

    if (data.session) {
      setUser(data.session.user);
      const savedTrips = await getTrips();
      setTrips(savedTrips);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleSaveCurrentTrip() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      const goLogin = confirm(
        "You need to log in to save trips. Go to login page?"
      );

      if (goLogin) {
        window.location.href = "/login";
      }

      return;
    }

    if (!currentTrip) return;

    await saveTrip({
      from: currentTrip.from,
      to: currentTrip.to,
      route: currentTrip.route,
    });

    sessionStorage.removeItem("currentTrip");
    setCurrentTrip(null);

    const savedTrips = await getTrips();
    setTrips(savedTrips);

    alert("Trip saved!");
  }

  async function handleDelete(id: string) {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              {user ? `Signed in as ${user.email}` : "Guest mode"}
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
          >
            Plan New Trip
          </button>
        </div>

        {currentTrip && (
          <div className="mb-8 p-5 bg-blue-900/30 border border-blue-700 rounded-xl">
            <h2 className="text-xl font-semibold">Current Trip</h2>

            <p className="mt-2 text-slate-300">
              {currentTrip.from} → {currentTrip.to}
            </p>

            {currentTrip.weatherScore !== null && (
              <p className="text-slate-300 mt-1">
                Weather Risk Score:{" "}
                <span className="font-bold text-white">
                  {currentTrip.weatherScore}
                </span>
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveCurrentTrip}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
              >
                Save Trip
              </button>

              <button
                onClick={() => {
                  sessionStorage.removeItem("currentTrip");
                  setCurrentTrip(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 p-5 bg-purple-900/30 border border-purple-700 rounded-xl">
          <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
          <p className="text-slate-300 mt-1">
            Unlock unlimited saved trips, advanced weather routing, and AI trip
            optimization.
          </p>

          <button
            onClick={() => alert("Stripe integration coming next")}
            className="mt-4 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
          >
            Upgrade
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Saved Trips</h2>

        {trips.length === 0 && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
            No saved trips yet.
          </div>
        )}

        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="font-semibold">
                {trip.from_location} → {trip.to_location}
              </div>

              <div className="text-sm text-slate-400 mt-1">
                Saved: {new Date(trip.created_at).toLocaleString()}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    router.push(
                      `/?from=${encodeURIComponent(
                        trip.from_location
                      )}&to=${encodeURIComponent(trip.to_location)}`
                    );
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
                >
                  Load
                </button>

                <button
                  onClick={() => handleDelete(trip.id)}
                  className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}