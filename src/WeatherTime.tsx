import React, { useEffect, useState } from "react";

/**
 * Simple Weather-Aware Clock
 * ----------------------------------------------------
 * Displays the current date, time, and weather with background image.
 * Uses config from ./weatherConfig for images/holidays/seasons.
 */

import {
  OPENWEATHER_KEY,
  WEATHER_IMAGES,
  SEASONAL_IMAGES,
  PART_OF_DAY_IMAGES,
  getSpecialDayImage,
  getSeason,
  pickDeterministic,
} from "./weatherConfig";

// Helper kept local: computes time-of-day from sunrise/sunset
function getPartOfDay(date, sunriseMs, sunsetMs) {
  const t = date.getTime();
  if (sunriseMs && sunsetMs) {
    if (t < sunriseMs) return "night";
    if (t >= sunriseMs && t < sunriseMs + 2 * 60 * 60 * 1000) return "morning";
    if (t >= sunsetMs) return "night";
    return "day";
  }
  const h = date.getHours();
  if (h < 6) return "night";
  if (h < 10) return "morning";
  if (h >= 20) return "night";
  return "day";
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

  // ---- data we need for selecting background ----
  const main = weather?.weather?.[0]?.main;        // "Clear", "Clouds", ...
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const sunriseMs = weather?.sys?.sunrise ? weather.sys.sunrise * 1000 : undefined;
  const sunsetMs  = weather?.sys?.sunset  ? weather.sys.sunset  * 1000 : undefined;

  // === Part D) IMAGE SELECTION BLOCK ===
  const special   = getSpecialDayImage(time);
  const partOfDay = getPartOfDay(time, sunriseMs, sunsetMs);

  let bg = null;
  if (special) {
    bg = special; // special day wins
  } else if (partOfDay === "morning") {
    bg = PART_OF_DAY_IMAGES.morning;
  } else if (partOfDay === "night") {
    bg = PART_OF_DAY_IMAGES.night;
  } else if (main && WEATHER_IMAGES[main]) {
    bg = pickDeterministic(WEATHER_IMAGES[main], time);
  }

  if (!bg) {
    const season = getSeason(time);
    bg = pickDeterministic(SEASONAL_IMAGES[season], time, 7) || "/images/beach.png";
  }
  // === End Part D) ===

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
            {city} • {main ?? "—"}{typeof temp === "number" ? ` • ${Math.round(temp)}°C` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
