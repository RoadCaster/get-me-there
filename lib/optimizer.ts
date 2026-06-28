export function scoreRouteWeather(weather: any[]) {
  let score = 0;

  for (const w of weather) {
    const c = w.condition.toLowerCase();

    if (c.includes("storm")) score += 5;
    if (c.includes("rain")) score += 2;
    if (c.includes("snow")) score += 5;

    if (w.wind > 25) score += 2;
    if (w.temp < 32) score += 2;
    if (w.temp > 95) score += 1;
  }

  return score;
}