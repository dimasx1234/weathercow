<div className="grid grid-cols-7 gap-1">
  {Array.from({ length: 7 }).map((_, i) => (
    <div key={i} className="p-2 border">Col {i + 1}</div>
  ))}
</div>


import React from "react";
import WeatherTime from "./WeatherTime.jsx";



export default function App() {
  return <WeatherTime />;
}