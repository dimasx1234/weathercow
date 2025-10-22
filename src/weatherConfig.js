// src/weatherConfig.js
export const OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_KEY || "7b9b2146c3bae897733dce1b616e7b4d";

// WEATHER → images (hard-coded absolute URLs)
export const WEATHER_IMAGES = {
  Clear: [
    "/weathercow/images/099_beach.png",
    "/weathercow/images/099_lake.png",
    "/weathercow/images/099_hiking.png",
  ],
  Clouds: [
    "/weathercow/images/081_foggy.png",
    "/weathercow/images/003_fall_midday.png",
    "/weathercow/images/099_wine.png",
  ],
  Rain: [
    "/weathercow/images/082_rain.png",
    "/weathercow/images/083_heavy_rain.png",
  ],
  Drizzle: [
    "/weathercow/images/082_rain.png",
    "/weathercow/images/083_heavy_rain.png",
  ],
  Thunderstorm: [
    "/weathercow/images/083_thunderstorm.png",
    "/weathercow/images/083_heavy_rain.png",
  ],
  Snow: [
    "/weathercow/images/004_winter_midday.png",
    "/weathercow/images/099_ski.png",
  ],
  Mist: [
    "/weathercow/images/081_foggy.png",
    "/weathercow/images/099_lake.png",
  ],
  Fog: [
    "/weathercow/images/081_foggy.png",
    "/weathercow/images/003_fall_midday.png",
  ],
  Haze: [
    "/weathercow/images/081_foggy.png",
    "/weathercow/images/099_wine.png",
  ],
};

// Seasonal fallbacks
export const SEASONAL_IMAGES = {
  winter: [
    "/weathercow/images/004_winter_midday.png",
    "/weathercow/images/099_ski.png",
    "/weathercow/images/099_wine.png",
    "/weathercow/images/099_christmas_cow.png",
  ],
  spring: [
    "/weathercow/images/002_spring_midday.png",
    "/weathercow/images/099_wine.png",
    "/weathercow/images/099_easter_cow.png",
  ],
  summer: [
    "/weathercow/images/010_summer_early_morning.png",
    "/weathercow/images/011_summer_morning.png",
    "/weathercow/images/012_summer_midday.png",
    "/weathercow/images/013_summer_evening.png",
    "/weathercow/images/014_summer_early_night.png",
    "/weathercow/images/015_summer_late_night.png",
    "/weathercow/images/099_beach.png",
    "/weathercow/images/099_lake.png",
    "/weathercow/images/099_hiking.png",
  ],
  autumn: [
    "/weathercow/images/003_fall_midday.png",
    "/weathercow/images/099_wine.png",
    "/weathercow/images/081_foggy.png",
    "/weathercow/images/099_oktoberfest_cow.png",
  ],
};

// Time-of-day images
export const PART_OF_DAY_IMAGES = {
  morning: "/weathercow/images/011_summer_morning.png",
  midday: "/weathercow/images/012_summer_midday.png",
  evening: "/weathercow/images/013_summer_evening.png",
  earlyNight: "/weathercow/images/014_summer_early_night.png",
  lateNight: "/weathercow/images/015_summer_late_night.png",
  night: "/weathercow/images/night.png",
};

// Special days
export function getSpecialDayImage(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const md = `${mm}-${dd}`;

  if (md === "01-01") return "/weathercow/images/099_new_year.png";
  if (md === "07-04") return "/weathercow/images/099_july_4th_cow.png";
  if (md === "10-31") return "/weathercow/images/099_halloween.png";
  if (md === "12-25") return "/weathercow/images/099_christmas_cow.png";

  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 9 && d >= 15) || (m === 10 && d <= 5)) return "/weathercow/images/099_oktoberfest_cow.png";
  if (m === 2) return "/weathercow/images/099_carnival.png";

  // Examples for movable feasts (fill real dates per year if you want):
  if (md === "02-10") return "/weathercow/images/099_chinese_new_year.png";
  if (md === "04-09") return "/weathercow/images/099_easter_cow.png";
  if (md === "04-20") return "/weathercow/images/099_passover_cow.png";
  // exida Symposium
  if (md === "10-27" || (md === "10-28") || (md === "10-29")) return "/weathercow/images/099_exida_symposium.png";

  return null;
}

// Helpers
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