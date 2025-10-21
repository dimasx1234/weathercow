import React, { useEffect, useMemo, useState } from "react";

/**
 * Weather‑Aware Calendar
 * ----------------------------------------------------
 * A single‑file React component that:
 * 1) Detects the user's location (via browser geolocation)
 * 2) Fetches current weather (OpenWeatherMap)
 * 3) Chooses a background image based on weather
 * 4) Renders a simple, clean month calendar
 *
 * Setup (Vite or Next.js works fine):
 * - Install TailwindCSS (https://tailwindcss.com/docs/installation)
 * - Add this component to your app and render <WeatherCalendar />
 * - Add your OpenWeather API key as an env var or inline below
 * - (Optional) Replace Unsplash URLs with your own images under /public/images/
 */

// 1) Configure your OpenWeather API key
// Prefer using an environment variable. For Vite: import.meta.env.VITE_OPENWEATHER_KEY
const OPENWEATHER_KEY = "7b9b2146c3bae897733dce1b616e7b4d"


// 2) Small utility: format month name
const monthName = (d) => d.toLocaleString(undefined, { month: "long", year: "numeric" });

// 3) Calendar utility: return array of Date objects for display grid (6 weeks)
function getMonthGrid(anchorDate) {
  const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(first);
  const startDay = (first.getDay() + 6) % 7; // make Monday=0
  start.setDate(first.getDate() - startDay);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// 4) Map weather => background image URL
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
  if (!main) return WEATHER_BACKGROUNDS.Clear;
  return WEATHER_BACKGROUNDS[main] || WEATHER_BACKGROUNDS.Clouds;
}

// 5) Simple button
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
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState("init"); // init | locating | loading | ready | error
  const [err, setErr] = useState(null);

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
        (e) => {
          setErr("Location permission denied. Using fallback (Berlin).");
          // Berlin fallback
          setCoords({ lat: 52.52, lon: 13.405 });
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
        const q = new URLSearchParams({ lat: coords.lat, lon: coords.lon, units: "metric", appid: OPENWEATHER_KEY });
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

  const main = weather?.weather?.[0]?.main; // e.g., "Clear", "Clouds"...
  const desc = weather?.weather?.[0]?.description;
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const bg = pickBackground(main);

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
            <h1 className="text-3xl font-semibold tracking-tight">Weather‑Aware Calendar</h1>
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
          <div className="text-xs text-gray-600">Background adapts to current weather</div>
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
          Tip: replace Unsplash URLs with your own images in <code>WEATHER_BACKGROUNDS</code> or host local assets in <code>/public</code>.
        </div>
      </div>
    </div>
  );
}
