"use client";

import { RouteOption } from "@/lib/routes";

function getDistanceInFeet(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusFeet = 20902231;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusFeet * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speak(text: string) {
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function useVoiceNavigation(activeRoute: RouteOption | null) {
  function startNavigation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported on this device.");
      return;
    }

    if (!activeRoute?.steps?.length) {
      alert("Select a route first.");
      return;
    }

    let currentStepIndex = 0;
    const spokenSteps = new Set<number>();

    navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;

        const step = activeRoute.steps[currentStepIndex];

        if (!step?.location) return;

        const [stepLon, stepLat] = step.location;

        const distanceFeet = getDistanceInFeet(
          currentLat,
          currentLon,
          stepLat,
          stepLon
        );

        if (distanceFeet <= 500 && !spokenSteps.has(currentStepIndex)) {
          speak(step.instruction);
          spokenSteps.add(currentStepIndex);
          currentStepIndex++;
        }
      },
      () => {
        alert("Could not access your location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  }

  return { startNavigation };
}