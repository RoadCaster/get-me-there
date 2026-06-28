import { CloudSun, Wind } from "lucide-react";
import {
  VehicleMode,
  getVehicleWindRisk,
} from "@/lib/vehicleProfiles";

type Props = {
  w: any;
  vehicleMode: VehicleMode;
};

function getRiskStyle(risk: string) {
  if (risk === "Extreme") return "text-red-300 bg-red-950/60 border-red-700";
  if (risk === "High") return "text-orange-300 bg-orange-950/60 border-orange-700";
  if (risk === "Caution") return "text-yellow-300 bg-yellow-950/60 border-yellow-700";
  return "text-green-300 bg-green-950/40 border-green-700";
}

export default function WeatherCard({ w, vehicleMode }: Props) {
  const wind = Number(w.wind || 0);
  const windRisk = getVehicleWindRisk(wind, vehicleMode);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold">{w.location}</div>
          <div className="text-sm text-slate-400">
            {w.arrivalTime.toLocaleTimeString()}
          </div>
        </div>

        <CloudSun className="text-yellow-400" />
      </div>

      <div className="mt-3 text-sm text-slate-300">
        {w.condition} • {w.temp}°F
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
        <Wind size={16} /> {wind} mph
      </div>

      <div
        className={`mt-3 rounded-xl border px-3 py-2 text-sm font-semibold ${getRiskStyle(
          windRisk
        )}`}
      >
        {windRisk === "Low"
          ? "Low wind risk"
          : `${windRisk} wind risk for this vehicle`}
      </div>
    </div>
  );
}