export const MAX_GUESTS = 20;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type BusyRange = {
  start: string;
  end: string;
};

export type BookingCostInput = {
  checkIn: string;
  checkOut: string;
  guests: number;
  services: string[];
};

export type BookingCosts = {
  houseCost: number;
  hottubCost: number;
  banquetCost: number;
  totalCost: number;
};

const WEEKDAY_HOUSE_PRICES: Record<number, number> = {
  2: 200,
  3: 300,
  4: 350,
  5: 400,
  6: 450,
  7: 500,
  8: 600,
  9: 650,
  10: 700
};

const WEEKEND_HOUSE_PRICES: Record<number, number> = {
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 550,
  7: 600,
  8: 650,
  9: 700,
  10: 750
};

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && DATE_PATTERN.test(value);
}

export function clean(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function dateFromIso(value: unknown) {
  if (!isIsoDate(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}

export function todayInTimeZone(timeZone = "Europe/Minsk") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function uniqueServices(services: unknown) {
  const source = Array.isArray(services) ? services : [services];
  const normalized = source
    .map((service) => clean(service, 60))
    .filter(Boolean)
    .map((service) => service === "Купель Фурако" ? "Купель" : service);
  return [...new Set(["Дом", ...normalized])].slice(0, 12);
}

export function calculateBookingCosts({ checkIn, checkOut, guests, services }: BookingCostInput): BookingCosts {
  const checkInDate = dateFromIso(checkIn);
  const checkOutDate = dateFromIso(checkOut);
  const pricedGuests = Math.min(10, Math.max(2, guests));
  let houseCost = 0;

  if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
    const cursor = new Date(checkInDate);
    while (cursor < checkOutDate) {
      const day = cursor.getUTCDay();
      const prices = day === 0 || day === 5 || day === 6 ? WEEKEND_HOUSE_PRICES : WEEKDAY_HOUSE_PRICES;
      houseCost += prices[pricedGuests] ?? prices[10];
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const hottubSelected = services.includes("Купель") || services.includes("Купель Фурако");
  const waterChangeSelected = services.includes("Повторная смена воды");
  const hottubBaseCost = !hottubSelected ? 0 : guests <= 2 ? 150 : guests <= 4 ? 200 : 250;
  const hottubCost = hottubBaseCost + (hottubSelected && waterChangeSelected ? 80 : 0);
  const banquetPricePerGuest = guests <= 10 ? 50 : guests <= 15 ? 45 : 40;
  const banquetCost = services.includes("Банкет") ? guests * banquetPricePerGuest : 0;

  return {
    houseCost,
    hottubCost,
    banquetCost,
    totalCost: houseCost + hottubCost + banquetCost
  };
}

export function enumerateStayDates(checkIn: string, checkOut: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  const dates: string[] = [];

  if (!start) return dates;
  if (!end || end <= start) return [checkIn];

  const cursor = new Date(start);
  let guard = 0;
  while (cursor < end && guard < 500) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }

  return dates;
}

export function rangeHasConflict(checkIn: string, checkOut: string, occupiedDates: Set<string>) {
  return enumerateStayDates(checkIn, checkOut).some((date) => occupiedDates.has(date));
}

export function rangesFromDateSet(dates: Set<string>): BusyRange[] {
  const sorted = [...dates].filter(isIsoDate).sort();
  const ranges: BusyRange[] = [];

  for (const date of sorted) {
    const previous = ranges.at(-1);
    if (previous && previous.end === date) {
      previous.end = addDays(date, 1);
    } else {
      ranges.push({ start: date, end: addDays(date, 1) });
    }
  }

  return ranges;
}

export function collectBookedDates(rows: Array<Record<string, unknown>>) {
  const dates = new Set<string>();

  for (const row of rows) {
    const status = typeof row.status === "string" ? row.status : "";
    if (status && status !== "confirmed" && status !== "completed") continue;

    const singleDate = row.booked_date ?? row.date ?? row.day ?? row.stay_date;
    if (isIsoDate(singleDate)) dates.add(singleDate);

    const checkIn = row.check_in ?? row.checkIn;
    const checkOut = row.check_out ?? row.checkOut;
    if (isIsoDate(checkIn)) {
      for (const date of enumerateStayDates(checkIn, isIsoDate(checkOut) ? checkOut : addDays(checkIn, 1))) {
        dates.add(date);
      }
    }
  }

  return dates;
}

export function nightsCount(checkIn: string, checkOut: string) {
  const start = dateFromIso(checkIn);
  const end = dateFromIso(checkOut);
  return start && end && end > start ? Math.round((end.getTime() - start.getTime()) / 86400000) : 0;
}
