"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BusyRange = {
  start: string;
  end: string;
};

type AvailabilityResponse = {
  configured: boolean;
  busy: BusyRange[];
  timeZone: string;
  updatedAt: string;
  error?: string;
};

export type DateRangeSelection = {
  arrival: string;
  departure: string;
};

type AvailabilityCalendarProps = {
  mode?: "booking" | "compact";
  value?: DateRangeSelection;
  onChange?: (selection: DateRangeSelection) => void;
  refreshToken?: number;
};

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: string, amount: number) {
  const value = parseDate(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function monthStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function moveMonth(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function monthKey(date: Date) {
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

function monthDays(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= count ? dateKey(year, month, day) : null;
  });
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    day: "numeric",
    month: "long"
  }).format(parseDate(date));
}

function formatBusyRange(range: BusyRange) {
  const lastBusyDay = addDays(range.end, -1);
  if (range.start === lastBusyDay) return formatDay(range.start);
  return `${formatDay(range.start)} — ${formatDay(lastBusyDay)}`;
}

function expandBusyDates(ranges: BusyRange[]) {
  const dates = new Set<string>();
  for (const range of ranges) {
    let current = range.start;
    let guard = 0;
    while (current < range.end && guard < 400) {
      dates.add(current);
      current = addDays(current, 1);
      guard += 1;
    }
  }
  return dates;
}

export function AvailabilityCalendar({
  mode = "booking",
  value = { arrival: "", departure: "" },
  onChange,
  refreshToken = 0
}: AvailabilityCalendarProps) {
  const today = useMemo(todayKey, []);
  const initialMonth = useMemo(() => monthStart(parseDate(today)), [today]);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);
  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const busyDates = useMemo(() => expandBusyDates(availability?.busy ?? []), [availability]);
  const maximumMonth = useMemo(() => moveMonth(initialMonth, 11), [initialMonth]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setStatus("loading");
      setMessage("");
      try {
        const response = await fetch(`/api/availability?from=${today}&to=${addDays(today, 370)}`, {
          signal: controller.signal,
          cache: "no-store"
        });
        const data = await response.json() as AvailabilityResponse;
        if (!response.ok) throw new Error(data.error || "Не удалось загрузить календарь.");
        setAvailability(data);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Не удалось загрузить календарь.");
      }
    };
    load();
    return () => controller.abort();
  }, [refreshToken, reloadIndex, today]);

  const selectDate = (date: string) => {
    if (mode === "compact" || date < today || busyDates.has(date)) return;
    setMessage("");

    if (!value.arrival || value.departure) {
      onChange?.({ arrival: date, departure: "" });
      return;
    }

    if (date <= value.arrival) {
      onChange?.({ arrival: date, departure: "" });
      return;
    }

    let current = value.arrival;
    while (current < date) {
      if (busyDates.has(current)) {
        setMessage("Между выбранными датами есть занятый день. Выберите другой период.");
        return;
      }
      current = addDays(current, 1);
    }

    onChange?.({ arrival: value.arrival, departure: date });
  };

  const retry = () => {
    setAvailability(null);
    setStatus("loading");
    setMessage("");
    setReloadIndex((current) => current + 1);
  };

  const canGoBack = monthKey(visibleMonth) > monthKey(initialMonth);
  const canGoForward = monthKey(visibleMonth) < monthKey(maximumMonth);
  const upcomingBusy = (availability?.busy ?? []).filter((range) => range.end > today).slice(0, 3);

  return (
    <section className={`availability-calendar availability-calendar-${mode}`}>
      <div className="availability-calendar-header">
        <div>
          <span>{mode === "booking" ? "Выбор периода" : "Ближайшая доступность"}</span>
          <h3>{monthNames[visibleMonth.getUTCMonth()]} <em>{visibleMonth.getUTCFullYear()}</em></h3>
        </div>
        <div className="availability-calendar-nav">
          <button type="button" disabled={!canGoBack} onClick={() => setVisibleMonth((current) => moveMonth(current, -1))} aria-label="Предыдущий месяц"><ChevronLeft /></button>
          <button type="button" disabled={!canGoForward} onClick={() => setVisibleMonth((current) => moveMonth(current, 1))} aria-label="Следующий месяц"><ChevronRight /></button>
        </div>
      </div>

      <div className="availability-weekdays" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="availability-days" aria-label={`Календарь: ${monthNames[visibleMonth.getUTCMonth()]} ${visibleMonth.getUTCFullYear()}`}>
        {days.map((date, index) => {
          if (!date) return <span className="availability-day-empty" key={`empty-${index}`} />;
          const busy = busyDates.has(date);
          const past = date < today;
          const selectedStart = date === value.arrival;
          const selectedEnd = date === value.departure;
          const inRange = Boolean(value.arrival && value.departure && date > value.arrival && date < value.departure);
          const isToday = date === today;
          const disabled = past || busy || mode === "compact";
          const label = `${formatDay(date)}${busy ? ", занято" : past ? ", дата прошла" : ", свободно"}`;

          return (
            <motion.button
              type="button"
              key={date}
              disabled={disabled}
              aria-label={label}
              aria-pressed={selectedStart || selectedEnd}
              className={[
                "availability-day",
                busy ? "is-busy" : "is-free",
                past ? "is-past" : "",
                isToday ? "is-today" : "",
                selectedStart ? "is-start" : "",
                selectedEnd ? "is-end" : "",
                inRange ? "is-range" : ""
              ].filter(Boolean).join(" ")}
              whileHover={disabled ? undefined : { y: -3 }}
              whileTap={disabled ? undefined : { scale: .94 }}
              onClick={() => selectDate(date)}
            >
              <span>{Number(date.slice(-2))}</span>
              {busy && <small>занято</small>}
              {isToday && !busy && <small>сегодня</small>}
            </motion.button>
          );
        })}
      </div>

      <div className="availability-legend">
        <span><i className="legend-free" /> Свободно</span>
        <span><i className="legend-busy" /> Занято</span>
        {mode === "booking" && <span><i className="legend-selected" /> Ваши даты</span>}
      </div>

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div className="availability-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="loading">
            <LoaderCircle className="booking-spinner" /> Проверяем занятость дат...
          </motion.div>
        )}
        {status === "error" && (
          <motion.div className="availability-status availability-status-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="error">
            <CircleAlert />
            <span>{message}</span>
            <button type="button" onClick={retry} aria-label="Повторить загрузку"><RotateCw /></button>
          </motion.div>
        )}
        {status === "ready" && !availability?.configured && (
          <motion.div className="availability-status availability-status-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="not-configured">
            <CalendarCheck /> Календарь ожидает подключения к Supabase. Выбранные даты дополнительно подтвердит владелец.
          </motion.div>
        )}
        {status === "ready" && availability?.configured && (
          <motion.div className="availability-status availability-status-ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="ready">
            <CalendarCheck /> Данные синхронизированы с календарём бронирований.
          </motion.div>
        )}
      </AnimatePresence>

      {message && status !== "error" && (
        <motion.div className="availability-inline-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <CircleAlert /> {message}
        </motion.div>
      )}

      {mode === "booking" ? (
        <div className="availability-selection">
          <div><small>Заезд</small><strong>{value.arrival ? formatDay(value.arrival) : "Выберите дату"}</strong></div>
          <ArrowRight />
          <div><small>Выезд</small><strong>{value.departure ? formatDay(value.departure) : "Затем дату выезда"}</strong></div>
        </div>
      ) : (
        <div className="availability-upcoming">
          <div>
            <small>Ближайшие занятые периоды</small>
            {status === "ready" && availability?.configured && upcomingBusy.length
              ? upcomingBusy.map((range) => <span key={`${range.start}-${range.end}`}>{formatBusyRange(range)}</span>)
              : <span>{availability?.configured ? "В ближайшее время даты свободны" : "Появятся после подключения календаря"}</span>}
          </div>
          <Link href="/booking">Выбрать даты <ArrowRight /></Link>
        </div>
      )}
    </section>
  );
}
