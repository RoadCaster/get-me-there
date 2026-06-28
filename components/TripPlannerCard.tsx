import { CalendarDays, LocateFixed, MapPin, Rocket } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type Props = {
  from: string;
  to: string;
  departure: string;
  loading: boolean;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  setDeparture: (v: string) => void;
  onGenerate: () => void;
};

export default function TripPlannerCard({
  from,
  to,
  departure,
  loading,
  setFrom,
  setTo,
  setDeparture,
  onGenerate,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-950/80 p-6 shadow-2xl shadow-blue-900/30">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-950 to-emerald-500/10" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-500/30">
            <Rocket className="text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-wide">
              GET ME THERE
            </h2>
            <p className="text-sm text-slate-400">
              Smarter routes. Better weather. Safer arrivals.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
            <LocateFixed className="text-green-400" />
            <AddressAutocomplete
             label="Starting point"
             value={from}
             onChange={setFrom}
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
            <MapPin className="text-pink-400" />
            <AddressAutocomplete
             label="Destination"
             value={to}
             onChange={setTo}
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
            <CalendarDays className="text-blue-400" />
            <input
              type="datetime-local"
              className="w-full bg-transparent outline-none"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </div>

          <button
            onClick={onGenerate}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 p-4 text-lg font-black text-slate-950 shadow-lg shadow-green-500/30 transition hover:scale-[1.02]"
          >
            {loading ? "CHECKING THE ROAD..." : "GET ME THERE"}
          </button>
        </div>
      </div>
    </section>
  );
}