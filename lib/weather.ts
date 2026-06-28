export async function getHourlyForecast(lat: number, lon: number) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_KEY}&q=${lat},${lon}&days=2`
  );

  const data = await res.json();

  return data.forecast.forecastday[0].hour.map((h: any) => ({
    time: h.time,
    temp: h.temp_f,
    condition: h.condition.text,
    wind: h.wind_mph,
    precip: h.chance_of_rain,
  }));
}