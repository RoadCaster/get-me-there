export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6">
      <h1 className="text-6xl font-bold text-center">
        Get Me There
      </h1>

      <p className="mt-4 text-xl text-slate-300 text-center max-w-xl">
        Know the weather before you get there.
      </p>

      <button className="mt-10 rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold hover:bg-blue-700 transition">
        Plan My Trip
      </button>
    </main>
  );
}