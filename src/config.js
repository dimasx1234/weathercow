export const OPENWEATHER_KEY =
  import.meta.env.VITE_OPENWEATHER_KEY || "7b9b2146c3bae897733dce1b616e7b4d";

// Local image mapping (for custom backgrounds)
export const WEATHER_BACKGROUNDS = {
  Clear: "/images/beach.png",
  Clouds: "/images/foggy.png",
  Rain: "/images/rainy_summer.png",
  Snow: "/images/winter.png",
  Mist: "/images/foggy.png",
  Fog: "/images/foggy.png",
  Thunderstorm: "/images/rainy_summer.png",
  // fallback if none match:
  Default: "/images/beach.png",
};

export const WEATHER_BACKGROUNDS_inet = {
  Clear: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop",
  Clouds: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1974&auto=format&fit=crop",
  Rain: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?q=80&w=1974&auto=format&fit=crop",
  Drizzle: "https://images.unsplash.com/photo-1527766833261-b09c3163a791?q=80&w=1974&auto=format&fit=crop",
  Thunderstorm: "https://images.unsplash.com/photo-1461511669078-d46bf351cd6a?q=80&w=1974&auto=format&fit=crop",
  Snow: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?q=80&w=1974&auto=format&fit=crop",
  Mist: "https://images.unsplash.com/photo-1502085671122-2b3a6a36e9a9?q=80&w=1974&auto=format&fit=crop",
  Fog: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format&fit=crop",
  Haze: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1974&auto=format&fit=crop",
  Smoke: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1974&auto=format&fit=crop",
  Dust: "https://images.unsplash.com/photo-1609326148596-732a2770b12b?q=80&w=1974&auto=format&fit=crop",
  Sand: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1974&auto=format&fit=crop",
  Squall: "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=1974&auto=format&fit=crop",
  Tornado: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=1974&auto=format&fit=crop",
};
