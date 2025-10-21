// Asset helper that respects Vite's base path (/weathercow/)
export const asset = (file: string) =>
  new URL(`weathercow/images/${file}`, import.meta.env.BASE_URL).href;

export const OPENWEATHER_KEY: string =
  (import.meta as any)?.env?.VITE_OPENWEATHER_KEY ?? "7b9b2146c3bae897733dce1b616e7b4d";;

export type PartOfDay = "morning" | "night";

export const WEATHER_IMAGES: Record<string, string[]> = {
  Clear: [asset("beach.png"), asset("lake.png"), asset("hiking.png"), asset("summer_small.png")],
  Clouds: [asset("foggy.png"), asset("lake.png"), asset("fall.png")],
  Rain: [asset("rainy_summer.png")],
  Drizzle: [asset("rainy_summer.png")],
  Thunderstorm: [asset("rainy_summer.png")],
  Snow: [asset("winter.png"), asset("ski.png")],
  Mist: [asset("foggy.png")],
  Fog: [asset("foggy.png")],
  Haze: [asset("foggy.png")],
};

export const SEASONAL_IMAGES: Record<"winter"|"spring"|"summer"|"autumn", string[]> = {
  winter: [asset("winter.png"), asset("ski.png")],
  spring: [asset("spring.png"), asset("wine.png")],
  summer: [asset("beach.png"), asset("lake.png")],
  autumn: [asset("fall.png"), asset("wine.png")],
};

export const PART_OF_DAY_IMAGES: Record<PartOfDay, string> = {
  morning: asset("morning.png"),
  night: asset("night.png"),
};

export function getSpecialDayImage(date: Date): string | null {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;
  if (md === "01-01") return asset("new_year.png");
  if (md === "07-04") return asset("july_4th_cow.png");
  const m = date.getMonth() + 1, d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return asset("oktoberfest_cow.png");
  if (m === 2) return asset("carnival.png");
  return null;
}

export function getSeason(date: Date): "winter"|"spring"|"summer"|"autumn" {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

export function pickDeterministic(list: string[] | undefined, date: Date, salt = 0): string | null {
  if (!list || list.length === 0) return null;
  const seed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${salt}`);
  const idx = seed % list.length;
  return list[idx];
}
