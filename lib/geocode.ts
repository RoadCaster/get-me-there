export async function geocode(place: string) {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  );

  const data = await res.json();

  const [lon, lat] = data.features[0].center;

  return [lon, lat];
}