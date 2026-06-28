"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTrips, deleteTrip } from "@/lib/trips";

export default function Dashboard() {
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------
  // LOAD USER + TRIPS
  // -----------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data } = await supabase.auth.getSession();

      // Not logged in → still allow viewing dashboard (optional SaaS choice)
      if (!data.session) {
        setUser(null);
        setTrips([]);
        setLoading(false);
        return;
      }

      setUser(data.session.user);

      const t = await getTrips();
      setTrips(t);

      setLoading(false);
    };

    load();
  }, []);

  // -----------------------
  // DELETE TRIP
  // -----------------------
  async function handleDelete(id: string) {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (loading) {
    return (
      <div className="p-6 text-white bg-slate-950 min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <p className="text-slate-400">
            {user ? `Signed in as ${user.email}` : "Viewing as guest"}
          </p>
        </div>

        {/* UPGRADE CARD */}
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700 rounded-xl">
          <h2 className="font-semibold">Upgrade to Pro</h2>
          <p className="text-sm text-slate-300">
            Unlock unlimited saved trips, advanced weather routing, and AI optimization
          </p>

          <button
            onClick={() => alert("Stripe integration next step")}
            className="mt-3 bg-purple-600 px-4 py-2 rounded"
          >
            Upgrade
          </button>
        </div>

        {/* EMPTY STATE */}
        {trips.length === 0 && (
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
            No saved trips yet.
          </div>
        )}

        {/* TRIPS LIST */}
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl"
            >
              <div className="font-semibold">
                {trip.from_location} → {trip.to_location}
              </div>

              <div className="text-xs text-slate-400 mt-1">
                Saved: {new Date(trip.created_at).toLocaleString()}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                {/* LOAD TRIP INTO MAP */}
                <button
                  onClick={() => {
                    router.push(
                      `/?from=${encodeURIComponent(trip.from_location)}&to=${encodeURIComponent(trip.to_location)}`
                    );
                  }}
                  className="bg-blue-600 px-3 py-1 rounded"
                >
                  Load
                </button>

                {/* DELETE */}
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="bg-red-600 px-3 py-1 rounded"
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