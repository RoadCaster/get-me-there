import { MapPinned } from "lucide-react";

export default function AppHeader() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-600 p-3">
          <MapPinned />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Get Me There</h1>
          <p className="text-slate-400">Weather-aware road trip routing</p>
        </div>
      </div>

      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700"
      >
        Dashboard
      </button>
    </header>
  );
}