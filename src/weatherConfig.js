// src/weatherConfig.js
export const OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_KEY || "7b9b2146c3bae897733dce1b616e7b4d";

export const WEATHER_IMAGES = {
  Clear: ["/weathercow/images/beach.png", "/weathercow/images/lake.png", "/weathercow/images/hiking.png", "/weathercow/images/summer_small.png"],
  Clouds: ["/weathercow/images/foggy.png", "/weathercow/images/lake.png", "/weathercow/images/fall.png"],
  Rain: ["/weathercow/images/rainy_summer.png"],
  Drizzle: ["/weathercow/images/rainy_summer.png"],
  Thunderstorm: ["/weathercow/images/rainy_summer.png"],
  Snow: ["/weathercow/images/winter.png", "/weathercow/images/ski.png"],
  Mist: ["/weathercow/images/foggy.png"],
  Fog: ["/weathercow/images/foggy.png"],
  Haze: ["/weathercow/images/foggy.png"],
};

export const SEASONAL_IMAGES = {
  winter: ["/weathercow/images/winter.png", "/weathercow/images/ski.png"],   // Dec–Feb
  spring: ["/weathercow/images/spring.png", "/weathercow/images/wine.png"],  // Mar–May
  summer: ["/weathercow/images/beach.png", "/weathercow/images/lake.png"],   // Jun–Aug
  autumn: ["/weathercow/images/fall.png", "/weathercow/images/wine.png"],    // Sep–Nov
};

export const PART_OF_DAY_IMAGES = {
  morning: "/weathercow/images/morning.png",
  night: "/weathercow/images/night.png",
};

export function getSpecialDayImage(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;

  if (md === "01-01") return "/weathercow/images/new_year.png";           // New Year
  if (md === "07-04") return "/weathercow/images/july_4th_cow.png";       // 4th of July
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return "/weathercow/images/oktoberfest_cow.png"; // Oktoberfest
  if (m === 2) return "/weathercow/images/carnival.png";                  // Carnival (simplified)
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