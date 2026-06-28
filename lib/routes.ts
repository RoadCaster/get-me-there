export type RouteStep = {
  instruction: string;
  distance: number;
  duration: number;
  name: string;
};

export type RouteOption = {
  coords: number[][];
  duration: number;
  distance: number;
  steps: RouteStep[];
};

export async function getRoutes(
  from: [number, number],
  to: [number, number]
): Promise<RouteOption[]> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/` +
    `${from[0]},${from[1]};${to[0]},${to[1]}` +
    `?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("No routes found");
  }

  return data.routes.map((r: any) => ({
    coords: r.geometry.coordinates,
    duration: r.duration,
    distance: r.distance,
    steps: r.legs?.[0]?.steps?.map((s: any) => ({
      instruction: s.maneuver?.instruction || "Continue",
      distance: s.distance,
      duration: s.duration,
      name: s.name || "",
    })) || [],
  }));
}