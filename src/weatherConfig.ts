import { IMAGE_FILES } from "./imageManifest";

export type PartOfDay =
  | "morning"
  | "midday"
  | "evening"
  | "earlyNight"
  | "lateNight"
  | "night";

export type SeasonName = "winter" | "spring" | "summer" | "autumn";

export type Coords = { lat: number; lon: number } | null;

export type WeatherResponse = {
  weather?: { main?: string; description?: string; icon?: string }[];
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  sys?: { sunrise?: number; sunset?: number };
  name?: string;
};

// Keep key in .env for production; fallback is retained for local development.
export const OPENWEATHER_KEY: string =
  import.meta.env.VITE_OPENWEATHER_KEY ?? "7b9b2146c3bae897733dce1b616e7b4d";

export const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

const partAliases: Array<[PartOfDay, RegExp]> = [
  ["earlyNight", /early_night/],
  ["lateNight", /late_night/],
  ["midday", /midday/],
  ["evening", /evening/],
  ["morning", /early_morning|morning/],
  ["night", /night/],
];

function getSeasonFromName(file: string): SeasonName | null {
  if (/_winter_/.test(file)) return "winter";
  if (/_spring_/.test(file)) return "spring";
  if (/_summer_/.test(file)) return "summer";
  if (/_fall_/.test(file) || /_autumn_/.test(file)) return "autumn";
  return null;
}

function getPartFromName(file: string): PartOfDay | null {
  for (const [part, pattern] of partAliases) {
    if (pattern.test(file)) return part;
  }
  return null;
}

function pushUnique(target: string[], value: string) {
  if (!target.includes(value)) target.push(value);
}

const seasonalBuckets: Record<SeasonName, string[]> = {
  spring: [],
  summer: [],
  autumn: [],
  winter: [],
};

const seasonalPartMap: Record<SeasonName, Partial<Record<PartOfDay, string>>> = {
  spring: {},
  summer: {},
  autumn: {},
  winter: {},
};

const weatherBuckets: Record<string, string[]> = {
  Clear: [],
  Clouds: [],
  Rain: [],
  Drizzle: [],
  Thunderstorm: [],
  Snow: [],
  Mist: [],
  Fog: [],
  Haze: [],
};

for (const file of IMAGE_FILES) {
  const url = asset(file);
  const season = getSeasonFromName(file);
  const part = getPartFromName(file);

  if (season) {
    pushUnique(seasonalBuckets[season], url);
    if (part && !seasonalPartMap[season][part]) {
      seasonalPartMap[season][part] = url;
    }
  }

  if (/beach|lake|hiking/.test(file)) pushUnique(weatherBuckets.Clear, url);
  if (/cloud/.test(file)) pushUnique(weatherBuckets.Clouds, url);
  if (/thunderstorm/.test(file)) pushUnique(weatherBuckets.Thunderstorm, url);
  if (/heavy_rain/.test(file)) pushUnique(weatherBuckets.Rain, url);
  if (/_rain/.test(file)) {
    pushUnique(weatherBuckets.Rain, url);
    pushUnique(weatherBuckets.Drizzle, url);
  }
  if (/fog/.test(file)) {
    pushUnique(weatherBuckets.Mist, url);
    pushUnique(weatherBuckets.Fog, url);
    pushUnique(weatherBuckets.Haze, url);
  }
  if (/ski|snow/.test(file)) pushUnique(weatherBuckets.Snow, url);
}

export const WEATHER_IMAGES: Record<string, string[]> = weatherBuckets;
export const SEASONAL_IMAGES: Record<SeasonName, string[]> = seasonalBuckets;

export const PART_OF_DAY_IMAGES: Record<PartOfDay, string> = {
  morning: seasonalPartMap.summer.morning ?? asset("011_summer_morning.png"),
  midday: seasonalPartMap.summer.midday ?? asset("012_summer_midday.png"),
  evening: seasonalPartMap.summer.evening ?? asset("013_summer_evening.png"),
  earlyNight: seasonalPartMap.summer.earlyNight ?? asset("014_summer_early_night.png"),
  lateNight: seasonalPartMap.summer.lateNight ?? asset("015_summer_late_night.png"),
  night: asset("night.png"),
};

export const WEATHER_ICON: Record<string, string> = {
  Clear: WEATHER_IMAGES.Clear[0] ?? asset("099_beach.png"),
  Clouds: WEATHER_IMAGES.Clouds[0] ?? asset("080_clouds.png"),
  Rain: WEATHER_IMAGES.Rain[0] ?? asset("082_rain.png"),
  Drizzle: WEATHER_IMAGES.Drizzle[0] ?? asset("082_rain.png"),
  Thunderstorm: WEATHER_IMAGES.Thunderstorm[0] ?? asset("083_thunderstorm.png"),
  Snow: WEATHER_IMAGES.Snow[0] ?? asset("099_ski.png"),
  Mist: WEATHER_IMAGES.Mist[0] ?? asset("081_foggy.png"),
  Fog: WEATHER_IMAGES.Fog[0] ?? asset("081_foggy.png"),
  Haze: WEATHER_IMAGES.Haze[0] ?? asset("081_foggy.png"),
};

export function getSpecialDayImage(date: Date): string | null {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;

  if (md === "01-01") return asset("099_new_year.png");
  if (md === "07-04") return asset("099_july_4th_cow.png");
  if (md === "10-31") return asset("099_halloween.png");
  if (md === "12-25") return asset("099_christmas_cow.png");

  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return asset("099_oktoberfest_cow.png");
  if (m === 2) return asset("099_carnival.png");

  if (md === "02-10" && yyyy === 2026) return asset("099_chinese_new_year.png");
  if (md === "04-05" && yyyy === 2026) return asset("099_easter_cow.png");
  if (md === "04-02" && yyyy === 2026) return asset("099_passover_cow.png");
  if (md === "10-27" || md === "10-28" || md === "10-29") return asset("099_exida_symposium.png");

  return null;
}

export function getSeason(date: Date): SeasonName {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

export function getPartOfDay(
  date: Date,
  sunriseMs?: number,
  sunsetMs?: number
): PartOfDay {
  const t = date.getTime();
  if (sunriseMs && sunsetMs && sunriseMs < sunsetMs) {
    const TWO_H = 2 * 60 * 60 * 1000;
    const THREE_H = 3 * 60 * 60 * 1000;

    const morningStart = sunriseMs;
    const morningEnd = sunriseMs + TWO_H;
    const eveningStart = sunsetMs - THREE_H;
    const earlyNightEnd = sunsetMs + TWO_H;

    if (t < morningStart) return "night";
    if (t < morningEnd) return "morning";
    if (t < eveningStart) return "midday";
    if (t < sunsetMs) return "evening";
    if (t < earlyNightEnd) return "earlyNight";
    return "lateNight";
  }

  const h = date.getHours();
  if (h < 5) return "night";
  if (h < 10) return "morning";
  if (h < 17) return "midday";
  if (h < 20) return "evening";
  if (h < 23) return "earlyNight";
  return "lateNight";
}

export function getPartOfDayImage(date: Date, sunriseMs?: number, sunsetMs?: number): string {
  const season = getSeason(date);
  const part = getPartOfDay(date, sunriseMs, sunsetMs);
  const seasonImage = seasonalPartMap[season][part];
  if (seasonImage) return seasonImage;
  if (part === "night") return PART_OF_DAY_IMAGES.night;
  return PART_OF_DAY_IMAGES[part];
}

export function pickDeterministic(list: string[] | undefined, date: Date, salt = 0): string | null {
  if (!list || list.length === 0) return null;
  const seed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${salt}`);
  const idx = seed % list.length;
  return list[idx];
}

export function selectBackgroundImage(input: {
  now: Date;
  weatherMain?: string;
  sunriseMs?: number;
  sunsetMs?: number;
}): string {
  const { now, weatherMain, sunriseMs, sunsetMs } = input;
  const special = getSpecialDayImage(now);
  if (special) return special;

  const dayPartImage = getPartOfDayImage(now, sunriseMs, sunsetMs);
  if (dayPartImage) return dayPartImage;

  if (weatherMain) {
    const weatherPick = pickDeterministic(WEATHER_IMAGES[weatherMain], now);
    if (weatherPick) return weatherPick;
  }

  const season = getSeason(now);
  return pickDeterministic(SEASONAL_IMAGES[season], now, 7) ?? PART_OF_DAY_IMAGES.night;
}
