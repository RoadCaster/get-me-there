type Props = {
  steps: any[];
  onStartNavigation: () => void;
};

export default function DirectionsPanel({ steps, onStartNavigation }: Props) {
  if (!steps?.length) return null;

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-xl font-semibold">Turn-by-Turn Directions</h2>

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
        {steps.map((step, index) => (
          <div key={index} className="rounded-xl bg-slate-800 p-3">
            <div className="font-medium">{index + 1}. {step.instruction}</div>
            <div className="text-sm text-slate-400">
              {(step.distance / 1609).toFixed(1)} mi • {Math.round(step.duration / 60)} min
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStartNavigation}
        className="mt-4 w-full rounded-xl bg-green-600 p-3 font-semibold hover:bg-green-500"
      >
        Start Voice Navigation
      </button>
    </section>
  );
}