import React, { useEffect, useState } from "react";

/**
 * Simple Weather‑Aware Clock
 * ----------------------------------------------------
 * Displays the current date, time, and weather with background image.
 *
 * Setup (Vite + Tailwind):
 * - Add your OpenWeather API key below or as VITE_OPENWEATHER_KEY.
 */

import { OPENWEATHER_KEY, WEATHER_BACKGROUNDS } from "./config";

function pickBackground(main) {
  return WEATHER_BACKGROUNDS[main] || WEATHER_BACKGROUNDS.Clear;
}

export default function WeatherClock() {
  const [time, setTime] = useState(new Date());
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);

  // live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // get location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 52.52, lon: 13.405 }) // fallback: Berlin
    );
  }, []);

  // fetch weather
  useEffect(() => {
    async function getWeather() {
      if (!coords || !OPENWEATHER_KEY || OPENWEATHER_KEY.includes("PASTE_")) return;
      const q = new URLSearchParams({ lat: coords.lat, lon: coords.lon, units: "metric", appid: OPENWEATHER_KEY });
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q.toString()}`);
      if (res.ok) setWeather(await res.json());
    }
    getWeather();
  }, [coords]);

  const main = weather?.weather?.[0]?.main;
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const bg = pickBackground(main);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center text-center">
      {/* background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 text-white space-y-4 p-4">
        <h1 className="text-6xl font-bold drop-shadow-lg">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </h1>
        <h2 className="text-2xl font-medium drop-shadow-md">
          {time.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </h2>
        {city && (
          <p className="text-lg drop-shadow-md">
            {city} • {main} • {Math.round(temp)}°C
          </p>
        )}
      </div>
    </div>
  );
}
