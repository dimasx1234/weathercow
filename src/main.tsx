import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './SeasonTime.tsx'
import App2 from './WeatherTime.tsx'
import App3 from './WeatherForecast.tsx'
//import App2 from './WeatherCalendar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <App2 />
    <App3 />
  </StrictMode>,
)
