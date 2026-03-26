import { useEffect, useMemo, useState } from "react";
import { APP_SETTINGS } from "./appSettings";
import { asset, getSeasonalImage, getSpecialDayImage, pickDeterministic } from "./weatherConfig";

type EventType = "holiday" | "vacation" | "special";
type Region = "BY" | "US";

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
  if (region === "US") {
    return (
      <svg
        className="inline-block h-3.5 w-5 align-[-2px]"
        viewBox="0 0 19 10"
        role="img"
        aria-label="United States flag"
      >
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
    <svg
      className="inline-block h-3.5 w-5 align-[-2px]"
      viewBox="0 0 15 9"
      role="img"
      aria-label="Germany flag"
    >
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

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  const startDay = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - startDay);
  const out: Date[] = [];
  for (let i = 0; i < 42; i += 1) out.push(addDays(start, i));
  return out;
}

function isInRange(day: Date, start: string, end: string): boolean {
  const dayKey = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const startKey = parseDateKey(start).getTime();
  const endKey = parseDateKey(end).getTime();
  return dayKey >= startKey && dayKey <= endKey;
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

    const validRegion = regionRaw === "BY" || regionRaw === "US";
    const validDate = /^\d{4}-\d{2}-\d{2}$/;
    if (!validRegion || !validDate.test(start) || !validDate.test(end)) continue;

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const today = new Date();
  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const pageBg = getSeasonalImage(cursor);
  const pageBgOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarPageBackgroundOpacity));
  const tileBgOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarTileImageOpacity));
  const tileOverlayOpacity = Math.min(1, Math.max(0, APP_SETTINGS.calendarTileOverlayOpacity));

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
    () => events.filter((e) => activeRegions.includes(e.region)),
    [events, activeRegions]
  );

  const grid = useMemo(() => monthGrid(cursor), [cursor]);

  const monthEvents = useMemo(() => {
    return filteredEvents.filter((e) => {
      const s = parseDateKey(e.start);
      const en = parseDateKey(e.end);
      return (
        (s.getFullYear() === year && s.getMonth() === month) ||
        (en.getFullYear() === year && en.getMonth() === month) ||
        (s < new Date(year, month, 1) && en > new Date(year, month + 1, 0))
      );
    });
  }, [filteredEvents, month, year]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-stone-100 text-slate-900">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pageBg})`, opacity: pageBgOpacity }} />
      <div className="absolute inset-0 bg-stone-100/78" />

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-3xl font-semibold">Calendar: Holidays & School Vacations</h2>
            <p className="text-sm text-slate-700">Sources: BY/US resource files (holidays, vacations, special-days)</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date(year, month - 1, 1))}>Prev</button>
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date())}>Today</button>
            <button className="px-3 py-1 rounded-xl border bg-white" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next</button>
          </div>
        </div>

        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-lg font-medium">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showBY} onChange={(e) => setShowBY(e.target.checked)} />
              <span>Bavaria (BY)</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showUS} onChange={(e) => setShowUS(e.target.checked)} />
              <span>United States (US)</span>
            </label>
          </div>
        </div>

        {loadError && (
          <div className="mb-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            Failed to load calendar resources: {loadError}
          </div>
        )}

        <div className="grid grid-cols-7 text-xs font-semibold text-slate-600 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
            <div key={w} className="px-2 py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
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
                  "relative min-h-28 rounded-xl border p-2 bg-white flex flex-col gap-1 overflow-hidden " +
                  holidayFrameClass + " " +
                  (inMonth ? "" : "opacity-50 ") +
                  (isToday ? "outline outline-2 outline-slate-900 " : "")
                }
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tileBg})`, opacity: tileBgOpacity }} />
                {tileHolidayTint && <div className={`absolute inset-0 ${tileHolidayTint}`} />}
                <div className="absolute inset-0 bg-white" style={{ opacity: tileOverlayOpacity }} />

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

        <section className="mt-6">
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
      </div>
    </div>
  );
}

