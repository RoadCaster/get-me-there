"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number];
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function AddressAutocomplete({ label, value, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?autocomplete=true&limit=5&country=us&access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }`
      );

      const data = await res.json();
      setSuggestions(data.features || []);
      setOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative">
      <div className="mb-1 text-sm text-slate-400">{label}</div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 p-3">
        <MapPin className="text-blue-400" size={18} />

        <input
          className="w-full bg-transparent outline-none"
          value={value}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 3 && setOpen(true)}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.place_name);
                setOpen(false);
                setSuggestions([]);
              }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-800"
            >
              {s.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}