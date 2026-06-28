import { VehicleMode, vehicleProfiles } from "@/lib/vehicleProfiles";

type Props = {
  vehicleMode: VehicleMode;
  setVehicleMode: (mode: VehicleMode) => void;
};

export default function VehicleProfileCard({
  vehicleMode,
  setVehicleMode,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="mb-3 text-xl font-semibold">Vehicle Profile</h2>

      <div className="grid gap-3 md:grid-cols-5">
        {Object.entries(vehicleProfiles).map(([key, profile]) => {
          const mode = key as VehicleMode;
          const active = vehicleMode === mode;

          return (
            <button
              key={key}
              onClick={() => setVehicleMode(mode)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-green-500 bg-green-900/30"
                  : "border-slate-700 bg-slate-800/60 hover:border-blue-500"
              }`}
            >
              <div className="text-3xl">{profile.emoji}</div>
              <div className="mt-2 font-semibold">{profile.label}</div>
              <div className="mt-1 text-xs text-slate-400">
                {profile.description}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}