import {
  VehicleMode,
  getVehicleWindRisk,
} from "@/lib/vehicleProfiles";

export function scoreRouteWeather(
  weather: any[],
  vehicleMode: VehicleMode = "car"
) {
  let score = 0;

  for (const w of weather) {
    const c = w.condition?.toLowerCase() || "";

    if (c.includes("storm")) score += 5;
    if (c.includes("thunder")) score += 5;
    if (c.includes("rain")) score += 2;
    if (c.includes("snow")) score += 5;
    if (c.includes("ice")) score += 5;

    const windRisk = getVehicleWindRisk(Number(w.wind || 0), vehicleMode);

    if (windRisk === "Caution") score += 2;
    if (windRisk === "High") score += 4;
    if (windRisk === "Extreme") score += 7;

    if (w.temp < 32) score += 2;
    if (w.temp > 95) score += 1;
  }

  return score;
}