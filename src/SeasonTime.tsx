import { useEffect, useState } from "react";
import BackgroundDebugPanel from "./BackgroundDebugPanel";
import { APP_SETTINGS } from "./appSettings";
import { OPENWEATHER_KEY, selectBackgroundImageDetails } from "./weatherConfig";

type Coords = { lat: number; lon: number } | null;

type WeatherResponse = {
  weather?: { main?: string; description?: string; icon?: string }[];
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};

export default function WeatherClock() {
  const [time, setTime] = useState(new Date());
  const [coords, setCoords] = useState<Coords>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 48.1374, lon: 11.5755 })
    );
  }, []);

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

  const main = weather?.weather?.[0]?.main;
  const temp = weather?.main?.temp;
  const city = weather?.name;
  const sunriseMs = weather?.sys?.sunrise ? weather.sys.sunrise * 1000 : undefined;
  const sunsetMs = weather?.sys?.sunset ? weather.sys.sunset * 1000 : undefined;

  const selection = selectBackgroundImageDetails({
    now: time,
    weatherMain: main,
    sunriseMs,
    sunsetMs,
    strategy: APP_SETTINGS.seasonClockStrategy,
  });
  const bg = selection.image;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center text-center">
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
      <BackgroundDebugPanel selection={selection} now={time} />
    </div>
  );
}
