import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { APP_SETTINGS } from "./appSettings";
import { asset, getSeasonalImage, getSpecialDayImage, pickDeterministic, selectBackgroundImageDetails } from "./weatherConfig";

type EventType = "holiday" | "vacation" | "special";
type Region = "BY" | "US" | "ALL" | "GLOBAL";
type CalendarLocale = "de-DE" | "en-US";

type CalendarEvent = {
  id: string;
  type: EventType;
  region: Region;
  title: string;
  start: string;
  end: string;
  imageFile?: string;
};

function holidayBadgeClass(region: Region): string {
  if (region === "US") return "bg-gradient-to-r from-red-600 via-white to-blue-700 text-slate-900";
  return "bg-gradient-to-r from-white via-sky-100 to-blue-600 text-slate-900 border border-blue-200";
}

function specialBadgeClass(): string {
  return "bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300";
}

function RegionFlag({ region }: { region: Region }) {
  if (region === "GLOBAL" || region === "ALL") {
    return <span className="inline-block align-[-2px]" aria-label="Global">🌍</span>;
  }
  if (region === "US") {
    return (
      <svg className="inline-block h-3.5 w-5 align-[-2px]" viewBox="0 0 19 10" role="img" aria-label="United States flag">
        <rect width="19" height="10" fill="#b22234" />
        <rect y="1" width="19" height="1" fill="#fff" />
        <rect y="3" width="19" height="1" fill="#fff" />
        <rect y="5" width="19" height="1" fill="#fff" />
        <rect y="7" width="19" height="1" fill="#fff" />
        <rect y="9" width="19" height="1" fill="#fff" />
        <rect width="8" height="5.5" fill="#3c3b6e" />
        <g fill="#fff">
          <circle cx="1" cy="1" r="0.25" />
          <circle cx="2.5" cy="1" r="0.25" />
          <circle cx="4" cy="1" r="0.25" />
          <circle cx="5.5" cy="1" r="0.25" />
          <circle cx="7" cy="1" r="0.25" />
          <circle cx="1.75" cy="2" r="0.25" />
          <circle cx="3.25" cy="2" r="0.25" />
          <circle cx="4.75" cy="2" r="0.25" />
          <circle cx="6.25" cy="2" r="0.25" />
          <circle cx="1" cy="3" r="0.25" />
          <circle cx="2.5" cy="3" r="0.25" />
          <circle cx="4" cy="3" r="0.25" />
          <circle cx="5.5" cy="3" r="0.25" />
          <circle cx="7" cy="3" r="0.25" />
          <circle cx="1.75" cy="4" r="0.25" />
          <circle cx="3.25" cy="4" r="0.25" />
          <circle cx="4.75" cy="4" r="0.25" />
          <circle cx="6.25" cy="4" r="0.25" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="inline-block h-3.5 w-5 align-[-2px]" viewBox="0 0 15 9" role="img" aria-label="Germany flag">
      <rect width="15" height="3" fill="#000" />
      <rect y="3" width="15" height="3" fill="#dd0000" />
      <rect y="6" width="15" height="3" fill="#ffce00" />
    </svg>
  );
}

function parseDateKey(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

type WordClockLanguage = "en" | "de" | "ru";

type WordClockCell = {
  id: string;
  label: string;
};

type WordClockVariant = {
  id: WordClockLanguage;
  label: string;
  grid: WordClockCell[][];
};

const WORD_CLOCK_VARIANTS: WordClockVariant[] = [
  {
    id: "en",
    label: "ENGLISH",
    grid: [
      [
        { id: "it", label: "IT" },
        { id: "is", label: "IS" },
        { id: "half", label: "HALF" },
        { id: "ten-min", label: "TEN" },
        { id: "quarter", label: "QUARTER" },
        { id: "twenty-min", label: "TWENTY" },
      ],
      [
        { id: "five-min", label: "FIVE" },
        { id: "to", label: "TO" },
        { id: "past", label: "PAST" },
        { id: "one", label: "ONE" },
        { id: "two", label: "TWO" },
        { id: "three", label: "THREE" },
      ],
      [
        { id: "four", label: "FOUR" },
        { id: "five-hour", label: "FIVE" },
        { id: "six", label: "SIX" },
        { id: "seven", label: "SEVEN" },
        { id: "eight", label: "EIGHT" },
        { id: "nine", label: "NINE" },
      ],
      [
        { id: "ten-hour", label: "TEN" },
        { id: "eleven", label: "ELEVEN" },
        { id: "twelve", label: "TWELVE" },
        { id: "oclock", label: "O'CLOCK" },
        { id: "", label: "" },
        { id: "", label: "" },
      ],
    ],
  },
  {
    id: "de",
    label: "GERMAN",
    grid: [
      [
        { id: "es", label: "ES" },
        { id: "ist", label: "IST" },
        { id: "fuenf-min", label: "FÜNF" },
        { id: "zehn-min", label: "ZEHN" },
        { id: "viertel", label: "VIERTEL" },
        { id: "zwanzig-min", label: "ZWANZIG" },
      ],
      [
        { id: "nach", label: "NACH" },
        { id: "vor", label: "VOR" },
        { id: "halb", label: "HALB" },
        { id: "elf", label: "ELF" },
        { id: "eins", label: "EINS" },
        { id: "zwei", label: "ZWEI" },
      ],
      [
        { id: "drei", label: "DREI" },
        { id: "vier", label: "VIER" },
        { id: "fuenf-hour", label: "FÜNF" },
        { id: "sechs", label: "SECHS" },
        { id: "sieben", label: "SIEBEN" },
        { id: "", label: "" },
      ],
      [
        { id: "acht", label: "ACHT" },
        { id: "neun", label: "NEUN" },
        { id: "zehn-hour", label: "ZEHN" },
        { id: "elf-hour", label: "ELF" },
        { id: "zwolf", label: "ZWÖLF" },
        { id: "uhr", label: "UHR" },
      ],
    ],
  },
  {
    id: "ru",
    label: "RUSSIAN",
    grid: [
      [
        { id: "bez", label: "БЕЗ" },
        { id: "pyat-min", label: "ПЯТЬ" },
        { id: "minut", label: "МИНУТ" },
        { id: "dvadcat-min", label: "ДВАДЦАТЬ" },
        { id: "chetvert", label: "ЧЕТВЕРТЬ" },
        { id: "desyat-min", label: "ДЕСЯТЬ" },
      ],
      [
        { id: "posle", label: "ПОСЛЕ" },
        { id: "poloviny", label: "ПОЛОВИНЫ" },
        { id: "rovno", label: "РОВНО" },
        { id: "odin", label: "ОДИН" },
        { id: "dva", label: "ДВА" },
        { id: "tri", label: "ТРИ" },
      ],
      [
        { id: "chetyre", label: "ЧЕТЫРЕ" },
        { id: "pyat-hour", label: "ПЯТЬ" },
        { id: "shest", label: "ШЕСТЬ" },
        { id: "sem", label: "СЕМЬ" },
        { id: "vosem", label: "ВОСЕМЬ" },
        { id: "devyat", label: "ДЕВЯТЬ" },
      ],
      [
        { id: "desyat-hour", label: "ДЕСЯТЬ" },
        { id: "odinnadtsat", label: "ОДИННАДЦАТЬ" },
        { id: "dvenadtsat", label: "ДВЕНАДЦАТЬ" },
        { id: "", label: "" },
        { id: "", label: "" },
        { id: "", label: "" },
      ],
    ],
  },
];

const WORD_CLOCK_HOUR_IDS: Record<WordClockLanguage, Record<number, string>> = {
  en: {
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five-hour",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten-hour",
    11: "eleven",
    12: "twelve",
  },
  de: {
    1: "eins",
    2: "zwei",
    3: "drei",
    4: "vier",
    5: "fuenf-hour",
    6: "sechs",
    7: "sieben",
    8: "acht",
    9: "neun",
    10: "zehn-hour",
    11: "elf-hour",
    12: "zwolf",
  },
  ru: {
    1: "odin",
    2: "dva",
    3: "tri",
    4: "chetyre",
    5: "pyat-hour",
    6: "shest",
    7: "sem",
    8: "vosem",
    9: "devyat",
    10: "desyat-hour",
    11: "odinnadtsat",
    12: "dvenadtsat",
  },
};

function getWordClockActiveWords(language: WordClockLanguage, date: Date): Set<string> {
  const active = new Set<string>([]);
  const hourRaw = date.getHours() % 12;
  let hour = hourRaw === 0 ? 12 : hourRaw;
  const minute = date.getMinutes();
  let rounded = Math.round(minute / 5) * 5;

  if (rounded === 60) {
    rounded = 0;
    hour = (hour % 12) + 1;
  }

  const currentHourId = WORD_CLOCK_HOUR_IDS[language][hour];
  const nextHourId = WORD_CLOCK_HOUR_IDS[language][hour === 12 ? 1 : hour + 1];

  if (language === "en") {
    active.add("it");
    active.add("is");
    if (rounded === 0) {
      active.add(currentHourId);
      active.add("oclock");
      return active;
    }
    if (rounded === 15) {
      active.add("quarter");
      active.add("past");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 30) {
      active.add("half");
      active.add("past");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 45) {
      active.add("quarter");
      active.add("to");
      active.add(nextHourId);
      return active;
    }
    if (rounded < 30) {
      if (rounded === 5) active.add("five-min");
      if (rounded === 10) active.add("ten-min");
      if (rounded === 20) active.add("twenty-min");
      if (rounded === 25) {
        active.add("twenty-min");
        active.add("five-min");
      }
      active.add("past");
      active.add(currentHourId);
      return active;
    }
    const minutesTo = 60 - rounded;
    if (minutesTo === 5) active.add("five-min");
    if (minutesTo === 10) active.add("ten-min");
    if (minutesTo === 20) active.add("twenty-min");
    if (minutesTo === 25) {
      active.add("twenty-min");
      active.add("five-min");
    }
    active.add("to");
    active.add(nextHourId);
    return active;
  }

  if (language === "de") {
    active.add("es");
    active.add("ist");
    if (rounded === 0) {
      active.add(currentHourId);
      active.add("uhr");
      return active;
    }
    if (rounded === 15) {
      active.add("viertel");
      active.add("nach");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 30) {
      active.add("halb");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 45) {
      active.add("viertel");
      active.add("vor");
      active.add(nextHourId);
      return active;
    }
    if (rounded < 30) {
      if (rounded === 5) active.add("fuenf-min");
      if (rounded === 10) active.add("zehn-min");
      if (rounded === 20) active.add("zwanzig-min");
      if (rounded === 25) {
        active.add("fuenf-min");
        active.add("vor");
        active.add("halb");
        active.add(nextHourId);
        return active;
      }
      active.add("nach");
      active.add(currentHourId);
      return active;
    }
    const minutesTo = 60 - rounded;
    if (minutesTo === 5) active.add("fuenf-min");
    if (minutesTo === 10) active.add("zehn-min");
    if (minutesTo === 20) active.add("zwanzig-min");
    active.add("vor");
    active.add(nextHourId);
    return active;
  }

  if (language === "ru") {
    if (rounded === 0) {
      active.add(currentHourId);
      active.add("rovno");
      return active;
    }
    if (rounded === 5) {
      active.add("pyat-min");
      active.add("minut");
      active.add("posle");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 10) {
      active.add("desyat-min");
      active.add("minut");
      active.add("posle");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 15) {
      active.add("chetvert");
      active.add("posle");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 20) {
      active.add("dvadcat-min");
      active.add("minut");
      active.add("posle");
      active.add(currentHourId);
      return active;
    }
    if (rounded === 25) {
      active.add("pyat-min");
      active.add("minut");
      active.add("bez");
      active.add("poloviny");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 30) {
      active.add("poloviny");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 35) {
      active.add("pyat-min");
      active.add("minut");
      active.add("posle");
      active.add("poloviny");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 40) {
      active.add("dvadcat-min");
      active.add("minut");
      active.add("bez");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 45) {
      active.add("chetvert");
      active.add("bez");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 50) {
      active.add("desyat-min");
      active.add("minut");
      active.add("bez");
      active.add(nextHourId);
      return active;
    }
    if (rounded === 55) {
      active.add("pyat-min");
      active.add("minut");
      active.add("bez");
      active.add(nextHourId);
      return active;
    }
  }

  return active;
}

function isAbsoluteDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isAnnualDate(s: string): boolean {
  return /^\d{2}-\d{2}$/.test(s);
}

function parseAnnualDateKey(s: string): { month: number; day: number } {
  const [m, d] = s.split("-").map(Number);
  return { month: m, day: d };
}

function dateToMonthDayNumber(date: Date): number {
  return (date.getMonth() + 1) * 100 + date.getDate();
}

function annualRangeContainsDay(day: Date, start: string, end: string): boolean {
  const todayMd = dateToMonthDayNumber(day);
  const s = parseAnnualDateKey(start);
  const e = parseAnnualDateKey(end);
  const startMd = s.month * 100 + s.day;
  const endMd = e.month * 100 + e.day;
  if (startMd <= endMd) return todayMd >= startMd && todayMd <= endMd;
  return todayMd >= startMd || todayMd <= endMd;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const start = new Date(first);
  const startDay = (first.getDay() + 6) % 7;
  const end = new Date(last);
  const endDay = (last.getDay() + 6) % 7;
  start.setDate(first.getDate() - startDay);
  end.setDate(last.getDate() + (6 - endDay));
  const out: Date[] = [];
  const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  for (let i = 0; i < days; i += 1) out.push(addDays(start, i));
  return out;
}

function isInRange(day: Date, start: string, end: string): boolean {
  if (isAnnualDate(start) && isAnnualDate(end)) {
    return annualRangeContainsDay(day, start, end);
  }
  const dayKey = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const startKey = parseDateKey(start).getTime();
  const endKey = parseDateKey(end).getTime();
  return dayKey >= startKey && dayKey <= endKey;
}

function annualRangeOverlapsMonth(start: string, end: string, year: number, monthIndexZeroBased: number): boolean {
  const startMd = Number(start.replace("-", ""));
  const endMd = Number(end.replace("-", ""));
  const month = monthIndexZeroBased + 1;
  const monthStartMd = month * 100 + 1;
  const monthEndMd = month * 100 + new Date(year, month, 0).getDate();
  const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart <= bEnd && bStart <= aEnd;
  if (startMd <= endMd) return overlaps(startMd, endMd, monthStartMd, monthEndMd);
  return overlaps(startMd, 1231, monthStartMd, monthEndMd) || overlaps(101, endMd, monthStartMd, monthEndMd);
}

function parseResource(text: string, type: EventType): CalendarEvent[] {
  const rows = text.split(/\r?\n/).map((line) => line.trim());
  const out: CalendarEvent[] = [];
  for (let i = 0; i < rows.length; i += 1) {
    const line = rows[i];
    if (!line || line.startsWith("#")) continue;

    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 4) continue;
    const [regionRaw, title, start, end, imageFile] = parts;

    const validRegion = regionRaw === "BY" || regionRaw === "US" || regionRaw === "GLOBAL" || regionRaw === "ALL";
    const validDatePair =
      (isAbsoluteDate(start) && isAbsoluteDate(end)) ||
      (isAnnualDate(start) && isAnnualDate(end));
    if (!validRegion || !validDatePair) continue;

    out.push({
      id: `${type}-${regionRaw}-${title}-${start}-${end}-${i}`,
      type,
      region: regionRaw,
      title,
      start,
      end,
      imageFile: type === "special" ? imageFile : undefined,
    });
  }
  return out;
}

function vacationImageForDay(day: Date, vacations: CalendarEvent[]): string | null {
  if (vacations.length === 0) return null;
  const titleBlob = vacations.map((v) => v.title.toLowerCase()).join(" ");
  if (titleBlob.includes("summer")) {
    return pickDeterministic(
      [asset("090_vacation_summer_beach.png"), asset("092_vacation_summer_lake.png"), asset("091_vacation_summer_hiking.png")],
      day,
      19
    );
  }
  if (titleBlob.includes("winter") || titleBlob.includes("christmas")) {
    return pickDeterministic([asset("093_vacation_winter_ski.png")], day, 23);
  }
  return null;
}

export default function HolidayCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [showBY, setShowBY] = useState(true);
  const [showUS, setShowUS] = useState(true);
  const [locale, setLocale] = useState<CalendarLocale>(() =>
    typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("de")
      ? "de-DE"
      : "en-US"
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const today = new Date();
  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const pageBg = getSeasonalImage(cursor);
  const pageBgOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarPageBackgroundOpacity));
  const tileBgOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarTileImageOpacity));
  const tileOverlayOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarTileOverlayOpacity));
  const printOrientation =
    APP_SETTINGS.calendarPrintOrientation === "portrait" || APP_SETTINGS.calendarPrintOrientation === "landscape"
      ? APP_SETTINGS.calendarPrintOrientation
      : "auto";
  const printVars = {
    "--print-tile-bg-opacity": Math.min(1, Math.max(0, APP_SETTINGS.calendarPrintTileImageOpacity)),
    "--print-tile-overlay-opacity": Math.min(1, Math.max(0, APP_SETTINGS.calendarPrintTileOverlayOpacity)),
    "--print-tile-min-height": `${Math.max(56, APP_SETTINGS.calendarPrintTileMinHeightPx)}px`,
  } as CSSProperties;

  useEffect(() => {
    async function loadResources() {
      try {
        const base = import.meta.env.BASE_URL;
        const [holidayRes, vacationRes, specialRes] = await Promise.all([
          fetch(`${base}resources/bank-holidays.txt`),
          fetch(`${base}resources/school-vacations.txt`),
          fetch(`${base}resources/special-days.txt`),
        ]);
        if (!holidayRes.ok || !vacationRes.ok || !specialRes.ok) throw new Error("Could not load resource files");

        const [holidaysText, vacationsText, specialsText] = await Promise.all([
          holidayRes.text(),
          vacationRes.text(),
          specialRes.text(),
        ]);

        setEvents([
          ...parseResource(holidaysText, "holiday"),
          ...parseResource(vacationsText, "vacation"),
          ...parseResource(specialsText, "special"),
        ]);
        setLoadError(null);
      } catch (e: unknown) {
        setLoadError(e instanceof Error ? e.message : "Unknown resource loading error");
        setEvents([]);
      }
    }
    loadResources();
  }, []);

  const activeRegions = useMemo(() => {
    const regions: Region[] = [];
    if (showBY) regions.push("BY");
    if (showUS) regions.push("US");
    return regions;
  }, [showBY, showUS]);

  const filteredEvents = useMemo(
    () => events.filter((e) => e.region === "GLOBAL" || e.region === "ALL" || activeRegions.includes(e.region)),
    [events, activeRegions]
  );

  const grid = useMemo(() => monthGrid(cursor), [cursor]);
  const weekdayHeaders = useMemo(() => {
    const mondayAnchor = new Date(2024, 0, 1);
    return Array.from({ length: 7 }).map((_, idx) =>
      addDays(mondayAnchor, idx).toLocaleDateString(locale, { weekday: "short" })
    );
  }, [locale]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => {
      if (isAnnualDate(e.start) && isAnnualDate(e.end)) {
        return annualRangeOverlapsMonth(e.start, e.end, year, month);
      }
      const s = parseDateKey(e.start);
      const en = parseDateKey(e.end);
      return (
        (s.getFullYear() === year && s.getMonth() === month) ||
        (en.getFullYear() === year && en.getMonth() === month) ||
        (s < new Date(year, month, 1) && en > new Date(year, month + 1, 0))
      );
    });
  }, [filteredEvents, month, year]);

  const wordClockNow = new Date();
  const wordClockSelection = selectBackgroundImageDetails({
    now: wordClockNow,
    strategy: APP_SETTINGS.calendarStrategy,
  });
  const wordClockBg = wordClockSelection.image;

  return (
    <div
      className={`calendar-print-root calendar-print-${printOrientation} relative min-h-screen w-full overflow-hidden bg-stone-100 text-slate-900`}
      style={printVars}
    >
      <div className="calendar-page-bg absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pageBg})`, opacity: pageBgOpacity }} />
      <div className="calendar-page-overlay absolute inset-0 bg-stone-100/78" />

      <div className="relative z-10 max-w-6xl mx-auto p-6 calendar-print-content">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="calendar-print-titleblock">
            <h2 className="text-3xl font-semibold">Calendar: Holidays & School Vacations</h2>
            <p className="text-sm text-slate-700">Sources: BY/US resource files (holidays, vacations, special-days)</p>
          </div>
          <div className="calendar-print-controls flex gap-2">
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date(year, month - 1, 1))}>Prev</button>
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date())}>Today</button>
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next</button>
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => window.print()}>Print to PDF</button>
          </div>
        </div>

        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="calendar-print-month text-lg font-medium">{cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })}</div>
          <div className="calendar-print-controls flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showBY} onChange={(e) => setShowBY(e.target.checked)} />
              <span>Bavaria (BY)</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showUS} onChange={(e) => setShowUS(e.target.checked)} />
              <span>United States (US)</span>
            </label>
            <div className="inline-flex items-center rounded-xl border overflow-hidden">
              <button
                className={`px-2 py-0.5 ${locale === "de-DE" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}
                onClick={() => setLocale("de-DE")}
              >
                DE
              </button>
              <button
                className={`px-2 py-0.5 ${locale === "en-US" ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}
                onClick={() => setLocale("en-US")}
              >
                US
              </button>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            Failed to load calendar resources: {loadError}
          </div>
        )}

        <div className="grid grid-cols-7 text-xs font-semibold text-slate-600 mb-1">
          {weekdayHeaders.map((w) => (
            <div key={w} className="px-2 py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 calendar-grid">
          {grid.map((d) => {
            const inMonth = d.getMonth() === month;
            const isToday = d.toDateString() === today.toDateString();
            const dayEvents = filteredEvents.filter((e) => isInRange(d, e.start, e.end));
            const daySpecials = dayEvents.filter((e) => e.type === "special");
            const dayHolidays = dayEvents.filter((e) => e.type === "holiday");
            const dayVacations = dayEvents.filter((e) => e.type === "vacation");
            const visibleCount = Math.max(3, daySpecials.length + dayHolidays.length);
            const visibleEvents = [...daySpecials, ...dayHolidays, ...dayVacations].slice(0, visibleCount);

            const specialImageFromResource = daySpecials.find((e) => e.imageFile)?.imageFile;
            const vacationImage = vacationImageForDay(d, dayVacations);
            const tileBg = specialImageFromResource
              ? asset(specialImageFromResource)
              : (getSpecialDayImage(d) ?? vacationImage ?? getSeasonalImage(d));

            const holidayRegions = Array.from(new Set(dayHolidays.map((e) => e.region)));
            const hasUSHoliday = holidayRegions.includes("US");
            const hasBYHoliday = holidayRegions.includes("BY");
            const tileHolidayTint =
              hasUSHoliday && hasBYHoliday
                ? "bg-gradient-to-r from-blue-200/35 via-white/25 to-red-200/35"
                : hasUSHoliday
                  ? "bg-gradient-to-r from-red-200/30 to-blue-200/30"
                  : hasBYHoliday
                    ? "bg-gradient-to-r from-white/40 to-blue-200/30"
                    : "";
            const holidayFrameClass =
              hasUSHoliday && hasBYHoliday
                ? "ring-2 ring-violet-500 ring-offset-1 ring-offset-white"
                : hasUSHoliday
                  ? "ring-2 ring-rose-500 ring-offset-1 ring-offset-white"
                  : hasBYHoliday
                    ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-white"
                    : "";

            return (
              <div
                key={d.toISOString()}
                className={
                  "calendar-day-tile relative min-h-28 rounded-xl border p-2 bg-white flex flex-col gap-1 overflow-hidden " +
                  holidayFrameClass + " " +
                  (inMonth ? "" : "opacity-50 ") +
                  (isToday ? "outline outline-2 outline-slate-900 " : "")
                }
              >
                <div className="calendar-tile-bg absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tileBg})`, opacity: tileBgOpacity }} />
                {tileHolidayTint && <div className={`absolute inset-0 ${tileHolidayTint}`} />}
                <div className="calendar-tile-overlay absolute inset-0 bg-white" style={{ opacity: tileOverlayOpacity }} />

                <div className="relative z-10 flex flex-col gap-1">
                  <div className="text-sm font-semibold">{d.getDate()}</div>
                  {visibleEvents.map((e) => (
                    <div
                      key={`${d.toISOString()}-${e.id}`}
                      className={
                        "text-[10px] rounded px-1 py-0.5 truncate " +
                        (e.type === "special"
                          ? specialBadgeClass()
                          : e.type === "holiday"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-amber-100 text-amber-900")
                      }
                    >
                      {e.type === "special"
                        ? <><span>{"\u2728 "}</span><RegionFlag region={e.region} />{" "}{e.title}</>
                        : <><RegionFlag region={e.region} />{" "}{e.title}</>}
                    </div>
                  ))}
                  {dayEvents.length > visibleEvents.length && (
                    <div className="text-[10px] text-slate-600">+{dayEvents.length - visibleEvents.length} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-6 calendar-month-list">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 mb-2">This Month</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {monthEvents.map((e) => (
              <div key={e.id} className="rounded-lg border bg-white px-3 py-2 text-sm">
                <span
                  className={
                    e.type === "special"
                      ? `inline-block rounded px-1.5 py-0.5 font-semibold ${specialBadgeClass()}`
                      : e.type === "holiday"
                        ? `inline-block rounded px-1.5 py-0.5 font-semibold ${holidayBadgeClass(e.region)}`
                        : "text-amber-800 font-semibold"
                  }
                >
                  {e.type === "special" ? "Special" : e.type === "holiday" ? "Holiday" : "Vacation"}
                </span>
                <span> • <RegionFlag region={e.region} /> {e.region} • {e.title} • {e.start} to {e.end}</span>
              </div>
            ))}
            {monthEvents.length === 0 && <div className="text-sm text-slate-600">No events for this month.</div>}
          </div>
        </section>

        <section
          className="overflow-hidden bg-transparent text-white"
          style={{ breakBefore: "page", pageBreakBefore: "always", minHeight: "100vh", height: "100vh" }}
        >
          <div className="relative h-full">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${wordClockBg})` }} />
            <div className="absolute inset-0 bg-slate-950/55" />
            <div className="relative z-10 grid h-full w-full grid-rows-3 gap-3 p-2 sm:p-4">
              {WORD_CLOCK_VARIANTS.map((variant) => {
                const activeWordIds = getWordClockActiveWords(variant.id, wordClockNow);
                return (
                  <div key={variant.id} className="relative h-full overflow-hidden rounded-3xl bg-slate-950/20">
                    <div className="relative z-10 h-full">
                      <div
                        className="grid h-full w-full grid-cols-6 gap-3 p-4 sm:p-6"
                        style={{ gridAutoRows: "minmax(0, 1fr)" }}
                      >
                        {variant.grid.flat().map(({ id, label }, idx) => {
                          const active = id ? activeWordIds.has(id) : false;
                          return (
                            <div
                              key={`${variant.id}-${idx}-${id}`}
                              className={`flex min-h-0 items-center justify-center w-full ${
                                active ? "text-white opacity-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]" : "text-slate-400 opacity-60"
                              } text-[clamp(1.4rem,3vw,3rem)] font-semibold uppercase leading-none tracking-[0.18em] transition`}
                            >
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
