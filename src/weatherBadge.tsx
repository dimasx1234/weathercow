// src/WeatherBadge.tsx
//import React from "react";

function WeatherBadge({
  iconUrl,
  label,
  temp,
  feelsLike,
  wind,
  humidity,
}: {
  iconUrl?: string | null;
  label?: string | null;
  temp?: number | null;
  feelsLike?: number | null;
  wind?: number | null; // m/s per OpenWeather (≈ *3.6 for km/h)
  humidity?: number | null; // %
}) {
  return (
    <div className="inline-flex flex-col items-center justify-between rounded-2xl bg-white/85 backdrop-blur px-4 py-2 text-sm text-gray-800 shadow relative w-fit">
      {/* --- Top info --- */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-center">
        <span className="font-medium">{label ?? "—"}</span>
        {typeof temp === "number" && <span>• {Math.round(temp)}°C</span>}
        {typeof feelsLike === "number" && <span>• feels {Math.round(feelsLike)}°C</span>}
        {typeof wind === "number" && <span>• {Math.round(wind * 3.6)} km/h</span>}
        {typeof humidity === "number" && <span>• {humidity}%</span>}
      </div>

      {/* --- Bottom icon --- */}
      {iconUrl && (
        <img
          src={iconUrl}
          alt={label ?? "weather"}
          className="w-[20%] mt-2 opacity-80"
          loading="lazy"
        />
      )}
    </div>
  );
}

export default WeatherBadge;
