import { useEffect, useState } from "react";

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
  //WEATHER_ICON
} from "./weatherConfig";
//import WeatherBadge from "./weatherBadge";

type Coords = { lat: number; lon: number } | null;

type WeatherResponse = {
  weather?: { main?: string; description?: string; icon?: string }[];
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};

type PartOfDay =
  | "morning"
  | "midday"
  | "evening"
  | "earlyNight"
  | "lateNight"
  | "night";

// Helper: compute part-of-day using sunrise/sunset if available
function getPartOfDay(
  date: Date,
  sunriseMs?: number,
  sunsetMs?: number
): PartOfDay {
  const t = date.getTime();

  if (sunriseMs && sunsetMs && sunriseMs < sunsetMs) {
    const TWO_H = 2 * 60 * 60 * 1000;
    const THREE_H = 3 * 60 * 60 * 1000;

    const morningStart = sunriseMs;                 // sunrise → +2h
    const morningEnd = sunriseMs + TWO_H;

    const eveningStart = sunsetMs - THREE_H;        // -3h → sunset
    const eveningEnd = sunsetMs;

    const earlyNightStart = sunsetMs;               // sunset → +2h
    const earlyNightEnd = sunsetMs + TWO_H;

    const lateNightStart = earlyNightEnd;           // +2h after sunset → 02:00-ish (heuristic)
    // Heuristic for "late night" end: either 02:00 or until next sunrise window; fallback 2am local
    const next2am = new Date(date);
    next2am.setHours(2, 0, 0, 0);
    const lateNightEnd = Math.max(t, lateNightStart) <= next2am.getTime()
      ? next2am.getTime()
      : lateNightStart + TWO_H; // cheap guard if local time already past 02:00

    if (t < morningStart) return "night";
    if (t >= morningStart && t < morningEnd) return "morning";
    if (t >= eveningStart && t < eveningEnd) return "evening";
    if (t >= earlyNightStart && t < earlyNightEnd) return "earlyNight";
    if (t >= lateNightStart && t < lateNightEnd) return "lateNight";
    if (t >= morningEnd && t < eveningStart) return "midday";
    return "night";
  }

  // Fallback heuristic when sunrise/sunset not available
  const h = date.getHours();
  if (h < 5) return "night";
  if (h < 10) return "morning";
  if (h < 17) return "midday";
  if (h < 20) return "evening";
  if (h < 23) return "earlyNight";
  return "lateNight";
}

export default function WeatherClock() {
  const [time, setTime] = useState(new Date());
  const [coords, setCoords] = useState<Coords>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

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
      () => setCoords({ lat: 48.1374, lon: 11.5755 }) // fallback: Munich
    );
  }, []);

  // fetch weather
  useEffect(() => {
    async function getWeather() {
      if (!coords || !OPENWEATHER_KEY || OPENWEATHER_KEY.includes("PASTE_")) return;
      const q = new URLSearchParams({
        lat: String(coords.lat),
        lon: String(coords.lon),
        units: "metric",
        appid: OPENWEATHER_KEY,
      });
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as WeatherResponse;
        setWeather(json);
      }
    }
    getWeather();
  }, [coords]);

  // ---- data we need for selecting background ----
  const main = weather?.weather?.[0]?.main;        // "Clear", "Clouds", ...
  const temp = weather?.main?.temp;
  //const desc = weather?.weather?.[0]?.description ?? null;

  // Option A: local icon via mapping
  //const localIcon = main ? WEATHER_ICON[main] : undefined;
  //const iconUrl = localIcon;

  const city = weather?.name;
  const sunriseMs = weather?.sys?.sunrise ? weather.sys.sunrise * 1000 : undefined;
  const sunsetMs  = weather?.sys?.sunset  ? weather.sys.sunset  * 1000 : undefined;

  // === IMAGE SELECTION ===
  const special     = getSpecialDayImage(time);
  const partOfDay   = getPartOfDay(time, sunriseMs, sunsetMs);

  let bg: string | null = null;

  if (special) {
    bg = special; // special day wins
  } else {
    // time-of-day slice first
    switch (partOfDay) {
      case "morning":
        bg = PART_OF_DAY_IMAGES.morning;
        break;
      case "midday":
        bg = PART_OF_DAY_IMAGES.midday;
        break;
      case "evening":
        bg = PART_OF_DAY_IMAGES.evening;
        break;
      case "earlyNight":
        bg = PART_OF_DAY_IMAGES.earlyNight;
        break;
      case "lateNight":
        bg = PART_OF_DAY_IMAGES.lateNight;
        break;
      case "night":
        bg = PART_OF_DAY_IMAGES.night;
        break;
    }

    // then weather-based rotation if no time-of-day image (shouldn’t happen, but safe)
    if (!bg && main && WEATHER_IMAGES[main]) {
      bg = pickDeterministic(WEATHER_IMAGES[main], time);
    }
  }

  // seasonal fallback
  if (!bg) {
    const season = getSeason(time);
    bg =
      pickDeterministic(SEASONAL_IMAGES[season], time, 7) ||
      PART_OF_DAY_IMAGES.night;
  }

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
            {city}
            {city && " • "}
            {main ?? "—"}
            {typeof temp === "number" && ` • ${Math.round(temp)}°C`}
            {typeof weather?.main?.feels_like === "number" && ` (feels ${Math.round(weather.main.feels_like)}°C)`}
            {typeof weather?.wind?.speed === "number" && ` • ${Math.round(weather.wind.speed * 3.6)} km/h`}
          </p>
        )}

      </div>
    </div>
  );
}
