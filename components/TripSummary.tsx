import { Clock, Route, ShieldAlert } from "lucide-react";

type Props = {
  from: string;
  to: string;
  duration?: number;
  distance?: number;
  score: number | null;
};

export default function TripSummary({ from, to, duration, distance, score }: Props) {
  if (!duration || !distance) return null;

  return (
    <section className="mt-6 grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Route className="mb-2 text-blue-400" />
        <div className="font-semibold">{from} → {to}</div>
        <div className="text-sm text-slate-400">Selected route</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Clock className="mb-2 text-emerald-400" />
        <div className="font-semibold">{Math.round(duration / 60)} minutes</div>
        <div className="text-sm text-slate-400">{Math.round(distance / 1609)} miles</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <ShieldAlert className="mb-2 text-yellow-400" />
        <div className="font-semibold">{score ?? "Checking..."}</div>
        <div className="text-sm text-slate-400">Weather risk score</div>
      </div>
    </section>
  );
}