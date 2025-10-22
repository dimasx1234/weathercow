import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './WeatherTime.tsx'
import App2 from './WeatherCalendar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
