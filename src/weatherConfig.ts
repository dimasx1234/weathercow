// src/weatherConfig.ts

// --- Types you can reuse in components ---
export type PartOfDay =
  | "morning"
  | "midday"
  | "evening"
  | "earlyNight"
  | "lateNight"
  | "night";

export type Coords = { lat: number; lon: number } | null;

export type WeatherResponse = {
  weather?: { main?: string; description?: string; icon?: string }[];
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number }; // m/s
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};

// --- API key (prefer .env: VITE_OPENWEATHER_KEY=...) ---
export const OPENWEATHER_KEY: string =
  (import.meta as any)?.env?.VITE_OPENWEATHER_KEY ??
  "7b9b2146c3bae897733dce1b616e7b4d";

// --- URL helper for images in public/images ---
// Works in dev ("/images/...") and on GH Pages ("/weathercow/images/...")
export const asset = (file: string) =>
  `${import.meta.env.BASE_URL}images/${file}`;

// --- Weather → candidate background images (rotates deterministically) ---
export const WEATHER_IMAGES: Record<string, string[]> = {
  Clear: [asset("099_beach.png"), asset("099_lake.png"), asset("099_hiking.png")],
  Clouds: [asset("080_clouds.png"), asset("081_foggy.png")],
  Rain: [asset("082_rain.png"), asset("083_heavy_rain.png")],
  Drizzle: [asset("082_rain.png")],
  Thunderstorm: [asset("083_thunderstorm.png")],
  Snow: [asset("099_ski.png")],
  Mist: [asset("081_foggy.png")],
  Fog: [asset("081_foggy.png")],
  Haze: [asset("081_foggy.png")],
};

// --- Seasonal fallbacks ---
export const SEASONAL_IMAGES: Record<"winter" | "spring" | "summer" | "autumn", string[]> = {
  spring: [
    asset("020_spring_early_morning.png"),
    asset("020_spring_early_morning_2.png"),
    asset("021_spring_morning.png"),
    asset("022_spring_midday.png"),
    asset("023_spring_evening.png"),
    asset("024_spring_early_night.png"),
    asset("025_spring_late_night.png"),
    asset("099_wine.png"),
    asset("099_easter_cow.png"),
  ],
  summer: [
    asset("010_summer_early_morning.png"),
    asset("011_summer_morning.png"),
    asset("012_summer_midday.png"),
    asset("013_summer_evening.png"),
    asset("014_summer_early_night.png"),
    asset("015_summer_late_night.png"),
    asset("099_beach.png"),
    asset("099_lake.png"),
    asset("099_hiking.png"),
  ],
  autumn: [
    asset("030_fall_early_morning.png"),
    asset("031_fall_morning.png"),
    asset("032_fall_midday.png"),
    asset("033_fall_evening.png"),
    asset("034_fall_early_night.png"),
    asset("035_fall_night.png.png"), // filename currently has double ".png"
    asset("081_foggy.png"),
    asset("099_wine.png"),
    asset("099_oktoberfest_cow.png"),
    asset("080_clouds.png"),
  ],
  winter: [
    asset("041_winter_early_morning.png"),
    asset("040_winter_morning.png"),
    asset("042_winter_midday.png"),
    asset("043_winter_evening.png"),
    asset("044_winter_early_night.png"),
    asset("045_winter_night.png"),
    asset("099_ski.png"),
    asset("099_christmas_cow.png"),
  ],
};

// --- Time-of-day images (6 buckets) ---
export const PART_OF_DAY_IMAGES: Record<PartOfDay, string> = {
  morning: asset("011_summer_morning.png"),
  midday: asset("012_summer_midday.png"),
  evening: asset("013_summer_evening.png"),
  earlyNight: asset("014_summer_early_night.png"),
  lateNight: asset("015_summer_late_night.png"),
  night: asset("night.png"), // or asset("045_winter_night.png")
};

// --- Small icons for a weather badge (optional) ---
export const WEATHER_ICON: Record<string, string> = {
  Clear: asset("099_beach.png"),
  Clouds: asset("080_clouds.png"),
  Rain: asset("082_rain.png"),
  Drizzle: asset("082_rain.png"),
  Thunderstorm: asset("083_thunderstorm.png"),
  Snow: asset("099_ski.png"),
  Mist: asset("081_foggy.png"),
  Fog: asset("081_foggy.png"),
  Haze: asset("081_foggy.png"),
};

// --- Special days (override backgrounds when matched) ---
export function getSpecialDayImage(date: Date): string | null {
  //const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;

  // Fixed-date holidays
  if (md === "01-01") return asset("099_new_year.png");
  if (md === "07-04") return asset("099_july_4th_cow.png");
  if (md === "10-31") return asset("099_halloween.png");
  if (md === "12-25") return asset("099_christmas_cow.png");

  // Oktoberfest (approx Sep 15 – Oct 5)
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return asset("099_oktoberfest_cow.png");

  // Carnival (simple: whole February)
  if (m === 2) return asset("099_carnival.png");

  // Optional: add your own yearly dates
  // Example: Chinese New Year varies — add specific year mapping if you wish:
  // if (md === "02-10" && yyyy === 2025) return asset("099_chinese_new_year.png");
  // Example company event:
  // if (md === "11-12") return asset("099_exida_symposium.png");

  return null;
}

// --- Helpers ---
export function getSeason(date: Date): "winter" | "spring" | "summer" | "autumn" {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

export function pickDeterministic(
  list: string[] | undefined,
  date: Date,
  salt = 0
): string | null {
  if (!list || list.length === 0) return null;
  const seed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${salt}`);
  const idx = seed % list.length;
  return list[idx];
}
