// src/weatherConfig.js
export const OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_KEY || "7b9b2146c3bae897733dce1b616e7b4d";

export const WEATHER_IMAGES = {
  Clear: ["/images/beach.png", "/images/lake.png", "/images/hiking.png", "/images/summer_small.png"],
  Clouds: ["/images/foggy.png", "/images/lake.png", "/images/fall.png"],
  Rain: ["/images/rainy_summer.png"],
  Drizzle: ["/images/rainy_summer.png"],
  Thunderstorm: ["/images/rainy_summer.png"],
  Snow: ["/images/winter.png", "/images/ski.png"],
  Mist: ["/images/foggy.png"],
  Fog: ["/images/foggy.png"],
  Haze: ["/images/foggy.png"],
};

export const SEASONAL_IMAGES = {
  winter: ["/images/winter.png", "/images/ski.png"],   // Dec–Feb
  spring: ["/images/spring.png", "/images/wine.png"],  // Mar–May
  summer: ["/images/beach.png", "/images/lake.png"],   // Jun–Aug
  autumn: ["/images/fall.png", "/images/wine.png"],    // Sep–Nov
};

export const PART_OF_DAY_IMAGES = {
  morning: "/images/morning.png",
  night: "/images/night.png",
};

export function getSpecialDayImage(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;

  if (md === "01-01") return "/images/new_year.png";           // New Year
  if (md === "07-04") return "/images/july_4th_cow.png";       // 4th of July
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return "/images/oktoberfest_cow.png"; // Oktoberfest
  if (m === 2) return "/images/carnival.png";                  // Carnival (simplified)
  return null;
}

export function getSeason(date) {
  const m = date.getMonth() + 1;
  if (m === 12 || m <= 2) return "winter";
  if (m <= 5) return "spring";
  if (m <= 8) return "summer";
  return "autumn";
}

export function pickDeterministic(list, date, salt = 0) {
  if (!list || list.length === 0) return null;
  const seed = Number(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}${salt}`);
  const idx = seed % list.length;
  return list[idx];
}