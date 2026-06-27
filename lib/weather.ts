export async function getWeather(lat: number, lon: number) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_KEY}&q=${lat},${lon}&days=1`
  );

  return res.json();
}