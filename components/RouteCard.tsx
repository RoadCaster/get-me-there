type Props = {
  index: number;
  active: boolean;
  duration: number;
  distance: number;
  onClick: () => void;
};

export default function RouteCard({ index, active, duration, distance, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active
          ? "border-green-500 bg-green-900/20"
          : "border-slate-800 bg-slate-900 hover:border-blue-500"
      }`}
    >
      <div className="font-semibold">Route {index + 1}</div>
      <div className="text-sm text-slate-400">
        {Math.round(duration / 60)} min • {Math.round(distance / 1609)} miles
      </div>
    </button>
  );
}