export async function getRoutes(from: [number, number], to: [number, number]) {
  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/` +
      `${from[0]},${from[1]};${to[0]},${to[1]}` +
      `?alternatives=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  );

  const data = await res.json();

  return data.routes.map((r: any) => ({
    coords: r.geometry.coordinates,
    duration: r.duration,
    distance: r.distance,
  }));
}