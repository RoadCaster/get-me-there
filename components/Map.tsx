"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type WeatherPoint = {
  lat: number;
  lon: number;
  location: string;
  arrivalTime: Date;
  condition: string;
  temp: number | null;
  wind: number | null;
  precip: number | null;
};

type Props = {
  route: number[][];
  weatherPoints?: WeatherPoint[];
  onLocationUpdate?: (position: { lat: number; lon: number }) => void;
};

export default function Map({
  route,
  weatherPoints = [],
  onLocationUpdate,
}: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const watchId = useRef<number | null>(null);

  const [followMode, setFollowMode] = useState(false);
  const [radarOn, setRadarOn] = useState(false);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
      }),
      "top-right"
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !route?.length) return;

    const m = map.current;

    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };

    const drawRoute = () => {
      const source = m.getSource("active-route") as mapboxgl.GeoJSONSource;

      if (source) {
        source.setData(geojson);
      } else {
        m.addSource("active-route", {
          type: "geojson",
          data: geojson,
        });

        m.addLayer({
          id: "active-route-line",
          type: "line",
          source: "active-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#22c55e",
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });
      }

      const bounds = new mapboxgl.LngLatBounds();

      route.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });

      m.fitBounds(bounds, { padding: 70 });
    };

    if (m.isStyleLoaded()) drawRoute();
    else m.once("load", drawRoute);
  }, [route]);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    weatherPoints.forEach((point, index) => {
      const el = document.createElement("div");

      el.className =
        "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-sm font-bold text-white shadow-lg cursor-pointer";

      function getWeatherEmoji(condition: string) {
  const c = condition.toLowerCase();

  if (c.includes("storm") || c.includes("thunder")) return "⛈️";
  if (c.includes("rain")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("fog")) return "🌫️";
  if (c.includes("sun") || c.includes("clear")) return "☀️";

  return "🌦️";
}

el.innerText = getWeatherEmoji(point.condition || "");

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
  <div style="
    background:#0f172a;
    color:#f8fafc;
    font-family:Inter, system-ui, sans-serif;
    min-width:210px;
    padding:12px;
    border-radius:12px;
    border:1px solid #334155;
    box-shadow:0 10px 30px rgba(0,0,0,.35);
  ">
    <div style="font-weight:700; margin-bottom:6px;">
      ${point.location || `Waypoint ${index + 1}`}
    </div>
    <div style="font-size:13px; color:#cbd5e1;">
      ETA: ${new Date(point.arrivalTime).toLocaleTimeString()}
    </div>
    <div style="margin-top:8px; font-weight:600;">
      ${point.condition || "Weather unavailable"}
    </div>
    <div style="font-size:13px; color:#cbd5e1;">
      Temp: ${point.temp ?? "?"}°F
    </div>
    <div style="font-size:13px; color:#cbd5e1;">
      Wind: ${point.wind ?? "?"} mph
    </div>
    <div style="font-size:13px; color:#cbd5e1;">
      Rain chance: ${point.precip ?? "?"}%
    </div>
  </div>
`);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.lon, point.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      markers.current.push(marker);
    });
  }, [weatherPoints]);

  function startFollowMode() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported on this device.");
      return;
    }

    if (!map.current) return;

    setFollowMode(true);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const lon = position.coords.longitude;
        const lat = position.coords.latitude;
        const heading = position.coords.heading;
        onLocationUpdate?.({
  lat: position.coords.latitude,
  lon: position.coords.longitude,
});

        map.current?.easeTo({
          center: [lon, lat],
          zoom: 15,
          pitch: 55,
          bearing: heading || map.current.getBearing(),
          duration: 1000,
        });
      },
      () => {
        alert("Could not access your location.");
        setFollowMode(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  }

  function stopFollowMode() {
    setFollowMode(false);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }

  async function toggleRadar() {
    if (!map.current) return;

    const m = map.current;

    const addRadar = async () => {
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = await res.json();

      const latest = data.radar.past[data.radar.past.length - 1].path;

      const radarTileUrl = `https://tilecache.rainviewer.com${latest}/256/{z}/{x}/{y}/2/1_1.png`;

      if (!m.getSource("weather-radar")) {
        m.addSource("weather-radar", {
          type: "raster",
          tiles: [radarTileUrl],
          tileSize: 256,
        });

        m.addLayer(
          {
            id: "weather-radar-layer",
            type: "raster",
            source: "weather-radar",
            paint: {
              "raster-opacity": 0.65,
            },
          },
          "active-route-line"
        );
      }
    };

    if (radarOn) {
      if (m.getLayer("weather-radar-layer")) {
        m.removeLayer("weather-radar-layer");
      }

      if (m.getSource("weather-radar")) {
        m.removeSource("weather-radar");
      }

      setRadarOn(false);
    } else {
      if (m.isStyleLoaded()) await addRadar();
      else m.once("load", addRadar);

      setRadarOn(true);
    }
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-800"
      />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        {!followMode ? (
          <button
            onClick={startFollowMode}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-green-500"
          >
            Follow Me
          </button>
        ) : (
          <button
            onClick={stopFollowMode}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-500"
          >
            Stop Follow
          </button>
        )}

        <button
          onClick={toggleRadar}
          className={`rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg ${
            radarOn
              ? "bg-blue-700 hover:bg-blue-600"
              : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          {radarOn ? "Radar On" : "Weather Radar"}
        </button>
      </div>
    </div>
  );
}