import React, { useEffect, useState } from "react";

/**
 * Simple Weather‑Aware Clock
 * ----------------------------------------------------
 * Displays the current date, time, and weather with background image.
 *
 * Setup (Vite + Tailwind):
 * - Add your OpenWeather API key below or as VITE_OPENWEATHER_KEY.
 */

const OPENWEATHER_KEY = "7b9b2146c3bae897733dce1b616e7b4d"

const WEATHER_BACKGROUNDS = {
  Clear: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop",
  Clouds: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1974&auto=format&fit=crop",
  Rain: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?q=80&w=1974&auto=format&fit=crop",
  Drizzle: "https://images.unsplash.com/photo-1527766833261-b09c3163a791?q=80&w=1974&auto=format&fit=crop",
  Thunderstorm: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6a?q=80&w=1974&auto=format&fit=crop",
  Snow: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1974&auto=format&fit=crop",
  Mist: "https://images.unsplash.com/photo-1502085671122-2b3a6a36e9a9?q=80&w=1974&auto=format&fit=crop",
  Fog: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format&fit=crop",
  Haze: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1974&auto=format&fit=crop",
  Smoke: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1974&auto=format&fit=crop",
  Dust: "https://images.unsplash.com/photo-1609326148596-732a2770b12b?q=80&w=1974&auto=format&fit=crop",
  Sand: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1974&auto=format&fit=crop",
  Squall: "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=1974&auto=format&fit=crop",
  Tornado: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=1974&auto=format&fit=crop",
};

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
      <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: `url(${bg})` }} />
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
