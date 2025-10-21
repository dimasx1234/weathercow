import { useEffect, useMemo, useState } from "react";

/**
 * Weather-Aware Calendar
 * ----------------------------------------------------
 * Detects location, fetches weather, and renders a month view.
 * Background image now chosen via:
 *   special day → time of day → weather (rotating) → seasonal fallback
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

type Coords = { lat: number; lon: number } | null;
type Status = "init" | "locating" | "loading" | "ready" | "error";
type WeatherResponse = {
  weather?: { main?: string; description?: string }[];
  main?: { temp?: number };
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};


// Helper kept local: computes time-of-day from sunrise/sunset
function getPartOfDay(date: Date, sunriseMs: number | undefined, sunsetMs: number | undefined) {
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

// Small utility: format month name
const monthName = (d) => d.toLocaleString(undefined, { month: "long", year: "numeric" });

// Calendar utility: return array of Date objects for display grid (6 weeks)
function getMonthGrid(anchorDate: Date) {
  const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(first);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  start.setDate(first.getDate() - startDay);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// Simple button
function Btn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-2xl shadow-sm border hover:shadow transition active:scale-[.99] bg-white/80 backdrop-blur text-sm"
    >
      {children}
    </button>
  );
}

export default function WeatherCalendar() {
  const [today] = useState(() => new Date());
  const [cursor, setCursor] = useState(() => new Date());
  const [coords, setCoords] = useState<Coords>(null);   
  // const [weather, setWeather] = useState(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<Status>("init"); ; // init | locating | loading | ready | error
  //const [err, setErr] = useState(null);
  const [err, setErr] = useState<string | null>(null);

  // Ask for geolocation (on mount)
  useEffect(() => {
    async function getLocation() {
      setStatus("locating");
      if (!("geolocation" in navigator)) {
        setErr("Geolocation is not supported by this browser.");
        setStatus("error");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          //setErr("Location permission denied. Using fallback (Berlin).");
          setCoords({ lat: 52.52, lon: 13.405 }); // Berlin fallback
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
    getLocation();
  }, []);

  // Fetch current weather when coords are available
  useEffect(() => {
    async function fetchWeather() {
      if (!coords || !OPENWEATHER_KEY || OPENWEATHER_KEY.includes("PASTE_")) return;
      setStatus("loading");
      try {
        //const q = new URLSearchParams({ lat: coords.lat, lon: coords.lon, units: "metric", appid: OPENWEATHER_KEY });
      const q = new URLSearchParams({
      lat: String(coords.lat),
      lon: String(coords.lon),
      units: "metric",
      appid: OPENWEATHER_KEY,
      });
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q.toString()}`);
        if (!res.ok) throw new Error("Weather HTTP " + res.status);
        const json = await res.json();
        setWeather(json);
        setStatus("ready");
      } catch (e) {
        setErr(e.message);
        setStatus("error");
      }
    }
    fetchWeather();
  }, [coords]);

  const grid = useMemo(() => getMonthGrid(cursor), [cursor]);
  const inMonth = (d) => d.getMonth() === cursor.getMonth();
  const isToday = (d) => d.toDateString() === today.toDateString();

  // Extract weather data
  const main = weather?.weather?.[0]?.main; // e.g., "Clear", "Clouds"...
  const desc = weather?.weather?.[0]?.description;
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const sunriseMs = weather?.sys?.sunrise ? weather.sys.sunrise * 1000 : undefined;
  const sunsetMs  = weather?.sys?.sunset  ? weather.sys.sunset  * 1000 : undefined;

  // === Background selection: special day → part of day → weather → seasonal ===
  const special   = getSpecialDayImage(new Date());
  const partOfDay = getPartOfDay(new Date(), sunriseMs, sunsetMs);

  let bg = null;
  if (special) {
    bg = special; // special day wins
  } else if (partOfDay === "morning") {
    bg = PART_OF_DAY_IMAGES.morning;
  } else if (partOfDay === "night") {
    bg = PART_OF_DAY_IMAGES.night;
  } else if (main && WEATHER_IMAGES[main]) {
    bg = pickDeterministic(WEATHER_IMAGES[main], new Date());
  }

  if (!bg) {
    const season = getSeason(new Date());
    bg = pickDeterministic(SEASONAL_IMAGES[season], new Date(), 7) || "/images/beach.png";
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center blur-[1px]"
        style={{ backgroundImage: `url(${bg})` }}
      />
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/80" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Weather-Aware Calendar</h1>
            <p className="text-sm text-gray-700">
              {status === "init" && "Initializing…"}
              {status === "locating" && "Detecting your location…"}
              {status === "loading" && "Fetching weather…"}
              {status === "ready" && (
                <>
                  {city ? `${city} • ` : ""}
                  {main ? `${main}` : "—"}
                  {desc ? ` (${desc})` : ""}
                  {typeof temp === "number" ? ` • ${Math.round(temp)}°C` : ""}
                </>
              )}
              {status === "error" && (err || "Could not load weather.")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Btn onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>← Prev</Btn>
            <Btn onClick={() => setCursor(new Date())}>Today</Btn>
            <Btn onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>Next →</Btn>
          </div>
        </div>

        {/* Month label */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-medium">{monthName(cursor)}</h2>
          <div className="text-xs text-gray-600">Background follows special days, daytime & weather</div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-xs text-gray-600 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
            <div key={w} className="px-2 py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((d, i) => {
            const muted = !inMonth(d);
            const todayCell = isToday(d);
            return (
              <div
                key={i}
                className={
                  "aspect-square rounded-2xl p-2 border bg-white/80 backdrop-blur shadow-sm flex flex-col" +
                  (muted ? " opacity-60" : "") +
                  (todayCell ? " ring-2 ring-black/50" : "")
                }
              >
                <div className="text-sm font-medium">{d.getDate()}</div>
                {/* Slot for your events or content */}
                <div className="mt-auto text-[10px] text-gray-500">&nbsp;</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-600">
          Tip: edit images & rules in <code>src/weatherConfig.js</code>, and store PNGs in <code>/public/images</code>.
        </div>
      </div>
    </div>
  );
}
