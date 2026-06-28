export type VehicleMode = "car" | "pickup" | "rv" | "semi" | "bus";

export const vehicleProfiles = {
  car: {
    label: "Car",
    emoji: "🚗",
    description: "Standard weather sensitivity",
    windCaution: 35,
    windHigh: 45,
    windExtreme: 55,
  },
  pickup: {
    label: "Pickup + Trailer",
    emoji: "🛻",
    description: "Trailer sway and crosswind risk",
    windCaution: 25,
    windHigh: 35,
    windExtreme: 45,
  },
  rv: {
    label: "RV / Camper",
    emoji: "🚐",
    description: "High-profile vehicle wind sensitivity",
    windCaution: 22,
    windHigh: 32,
    windExtreme: 42,
  },
  semi: {
    label: "Semi Truck",
    emoji: "🚛",
    description: "High-profile commercial vehicle",
    windCaution: 25,
    windHigh: 35,
    windExtreme: 45,
  },
  bus: {
    label: "Bus",
    emoji: "🚌",
    description: "Passenger vehicle with crosswind sensitivity",
    windCaution: 25,
    windHigh: 35,
    windExtreme: 45,
  },
} as const;

export function getVehicleWindRisk(
  wind: number,
  vehicleMode: VehicleMode
) {
  const profile = vehicleProfiles[vehicleMode];

  if (wind >= profile.windExtreme) return "Extreme";
  if (wind >= profile.windHigh) return "High";
  if (wind >= profile.windCaution) return "Caution";
  return "Low";
}