import { useEffect, useMemo, useState } from "react";
import { APP_SETTINGS } from "./appSettings";
import { OPENWEATHER_KEY, getSeasonalImage, getSmallForecastImageUrl, getWeatherImage, PART_OF_DAY_IMAGES } from "./weatherConfig";

type Coords = { lat: number; lon: number } | null;
type Status = "init" | "locating" | "loading" | "ready" | "error";

type ForecastItem = {
  dt: number;
  main?: { temp?: number };
  weather?: { main?: string; description?: string }[];
};

type ForecastEntry = {
  when: Date;
  main?: string;
  description?: string;
  temp?: number;
  image: string;
};

type DailySummary = {
  date: Date;
  label: string;
  main?: string;
  image: string;
  minTemp?: number;
  maxTemp?: number;
  hasData: boolean;
};

type ForecastResponse = {
  list?: ForecastItem[];
  city?: { name?: string };
};

export default function WeatherForecast() {
  const [coords, setCoords] = useState<Coords>(null);
  const [status, setStatus] = useState<Status>("init");
  const [err, setErr] = useState<string | null>(null);
  const [city, setCity] = useState<string>("");
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const now = new Date();
  const forecastHours = Math.max(3, APP_SETTINGS.forecastHoursAhead);
  const forecastSlotCount = Math.max(1, Math.floor(forecastHours / 3));
  const forecastBackground = getSeasonalImage(now);
  const forecastBgOpacity = Math.min(1, Math.max(0, APP_SETTINGS.forecastBackgroundOpacity));

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
    async function fetchForecast() {
      if (!coords || !OPENWEATHER_KEY || OPENWEATHER_KEY.includes("PASTE_")) return;
      setStatus("loading");
      try {
        const q = new URLSearchParams({
          lat: String(coords.lat),
          lon: String(coords.lon),
          units: "metric",
          appid: OPENWEATHER_KEY,
        });
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${q.toString()}`);
        if (!res.ok) throw new Error(`Forecast HTTP ${res.status}`);
        const json = (await res.json()) as ForecastResponse;
        setForecast(json.list ?? []);
        setCity(json.city?.name ?? "");
        setStatus("ready");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    }
    fetchForecast();
  }, [coords]);

  const hourlyEntries = useMemo<ForecastEntry[]>(() => {
    return forecast.slice(0, forecastSlotCount).map((item) => {
      const when = new Date(item.dt * 1000);
      const main = item.weather?.[0]?.main;
      const description = item.weather?.[0]?.description;
      const fullImage = getWeatherImage(main, when) ?? PART_OF_DAY_IMAGES.night;
      const image = getSmallForecastImageUrl(fullImage);
      return {
        when,
        main,
        description,
        temp: item.main?.temp,
        image,
      };
    });
  }, [forecast, forecastSlotCount]);

  const sections = useMemo(() => {
    const map = new Map<string, ForecastEntry[]>();
    for (const entry of hourlyEntries) {
      const key = entry.when.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(entry);
    }
    return Array.from(map.entries()).map(([key, entries]) => ({
      key,
      date: entries[0]?.when ?? new Date(key),
      entries,
    }));
  }, [hourlyEntries]);

  const dailySummaries = useMemo<DailySummary[]>(() => {
    const byDay = new Map<string, ForecastItem[]>();
    for (const item of forecast) {
      const when = new Date(item.dt * 1000);
      const key = new Date(when.getFullYear(), when.getMonth(), when.getDate()).toISOString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)?.push(item);
    }

    const summaries: DailySummary[] = [];
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let offset = 1; offset <= 7; offset += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      const items = byDay.get(key) ?? [];

      if (items.length === 0) {
        summaries.push({
          date,
          label: date.toLocaleDateString(undefined, { weekday: "short" }),
          image: getSmallForecastImageUrl(PART_OF_DAY_IMAGES.night),
          hasData: false,
        });
        continue;
      }

      const withTemp = items.filter((i) => typeof i.main?.temp === "number");
      const minTemp =
        withTemp.length > 0
          ? Math.min(...withTemp.map((i) => i.main?.temp as number))
          : undefined;
      const maxTemp =
        withTemp.length > 0
          ? Math.max(...withTemp.map((i) => i.main?.temp as number))
          : undefined;

      const representative = [...items].sort((a, b) => {
        const ha = new Date(a.dt * 1000).getHours();
        const hb = new Date(b.dt * 1000).getHours();
        return Math.abs(ha - 12) - Math.abs(hb - 12);
      })[0];
      const repWhen = new Date(representative.dt * 1000);
      const repMain = representative.weather?.[0]?.main;
      const fullImage = getWeatherImage(repMain, repWhen) ?? PART_OF_DAY_IMAGES.night;

      summaries.push({
        date,
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        main: repMain,
        image: getSmallForecastImageUrl(fullImage),
        minTemp,
        maxTemp,
        hasData: true,
      });
    }
    return summaries;
  }, [forecast]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${forecastBackground})`, opacity: forecastBgOpacity }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Forecast</h2>
          <p className="text-sm text-white/80">
            {status === "init" && "Initializing..."}
            {status === "locating" && "Detecting your location..."}
            {status === "loading" && "Loading forecast..."}
            {status === "ready" && `${city ? `${city} • ` : ""}Next ${forecastHours} hours`}
            {status === "error" && (err || "Could not load forecast.")}
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
                  {section.date.toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })}
                </h3>
                <div className="h-px flex-1 bg-white/20" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.entries.map((entry) => (
                  <article key={entry.when.toISOString()} className="rounded-2xl overflow-hidden border border-white/20">
                    <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url(${entry.image})` }}>
                      <div className="absolute inset-0 bg-black/35" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-base font-semibold">
                          {entry.when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-black/40">
                      <p className="text-sm font-semibold">{entry.main ?? "Unknown"}</p>
                      <p className="text-xs text-white/80">{entry.description ?? "No details"}</p>
                      <p className="text-sm mt-1">{typeof entry.temp === "number" ? `${Math.round(entry.temp)}°C` : "—"}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {sections.length === 0 && status === "ready" && (
            <p className="text-sm text-white/80">No forecast entries returned.</p>
          )}
        </div>

        <section className="mt-8 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Next 7 Days</h3>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {dailySummaries.map((day) => (
              <article key={day.date.toISOString()} className="rounded-xl overflow-hidden border border-white/20">
                <div className="relative h-24 bg-cover bg-center" style={{ backgroundImage: `url(${day.image})` }}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute top-2 left-2 text-xs font-semibold">{day.label}</div>
                </div>
                <div className="p-2 bg-black/40">
                  <p className="text-xs font-semibold">{day.hasData ? day.main ?? "Unknown" : "No data"}</p>
                  <p className="text-xs text-white/80">
                    {day.hasData && typeof day.minTemp === "number" && typeof day.maxTemp === "number"
                      ? `${Math.round(day.minTemp)}° / ${Math.round(day.maxTemp)}°C`
                      : "—"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


