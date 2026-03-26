import { useEffect, useMemo, useState } from "react";
import { OPENWEATHER_KEY, selectBackgroundImage } from "./weatherConfig";

type Coords = { lat: number; lon: number } | null;
type Status = "init" | "locating" | "loading" | "ready" | "error";

type WeatherResponse = {
  weather?: { main?: string; description?: string; icon?: string }[];
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};

const monthName = (d: Date) => d.toLocaleString(undefined, { month: "long", year: "numeric" });

function getMonthGrid(anchorDate: Date) {
  const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(first);
  const startDay = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - startDay);

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function Btn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
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
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<Status>("init");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setStatus("locating");
    if (!("geolocation" in navigator)) {
      setErr("Geolocation is not supported by this browser.");
      setStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 48.1374, lon: 11.5755 }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      if (!coords || !OPENWEATHER_KEY || OPENWEATHER_KEY.includes("PASTE_")) return;
      setStatus("loading");
      try {
        const q = new URLSearchParams({
          lat: String(coords.lat),
          lon: String(coords.lon),
          units: "metric",
          appid: OPENWEATHER_KEY,
        });
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q.toString()}`);
        if (!res.ok) throw new Error(`Weather HTTP ${res.status}`);
        const json = (await res.json()) as WeatherResponse;
        setWeather(json);
        setStatus("ready");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    }
    fetchWeather();
  }, [coords]);

  const grid = useMemo(() => getMonthGrid(cursor), [cursor]);
  const inMonth = (d: Date) => d.getMonth() === cursor.getMonth();
  const isToday = (d: Date) => d.toDateString() === today.toDateString();

  const main = weather?.weather?.[0]?.main;
  const desc = weather?.weather?.[0]?.description;
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const sunriseMs = weather?.sys?.sunrise ? weather.sys.sunrise * 1000 : undefined;
  const sunsetMs = weather?.sys?.sunset ? weather.sys.sunset * 1000 : undefined;

  const bg = selectBackgroundImage({
    now: new Date(),
    weatherMain: main,
    sunriseMs,
    sunsetMs,
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center blur-[1px]"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/80" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Cow Calendar</h1>
            <p className="text-sm text-gray-700">
              {status === "init" && "Initializing..."}
              {status === "locating" && "Detecting your location..."}
              {status === "loading" && "Fetching weather..."}
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

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-medium">{monthName(cursor)}</h2>
          <div className="text-xs text-gray-600">Background follows special days, daytime and weather</div>
        </div>

        <div className="grid grid-cols-7 text-xs text-gray-600 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
            <div key={w} className="px-2 py-1">
              {w}
            </div>
          ))}
        </div>

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
                <div className="mt-auto text-[10px] text-gray-500">&nbsp;</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
