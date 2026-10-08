export const MAX_GUESTS = 20;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const HOUSE_PRICE_EFFECTIVE_DATE = "2026-11-01";
export const WORKATION_GIFT_SERVICES = {
  sauna: "Workation: баня в подарок",
  hottub: "Workation: купель в подарок"
} as const;

export type HouseTariffPeriod = "not-selected" | "until-november" | "from-november" | "mixed";
export type WorkationGift = keyof typeof WORKATION_GIFT_SERVICES | null;

export type WorkationEligibility = {
  eligible: boolean;
  nights: number;
  hasEnoughGuests: boolean;
  hasEnoughNights: boolean;
  hasConsecutiveWeekdays: boolean;
};

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
  houseTariff: HouseTariffPeriod;
  saunaCost: number;
  hottubCost: number;
  banquetCost: number;
  workationEligible: boolean;
  workationGift: WorkationGift;
  workationDiscount: number;
  totalCost: number;
};

export const WEEKDAY_HOUSE_PRICES: Readonly<Record<number, number>> = {
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

export const WEEKEND_HOUSE_PRICES_UNTIL_NOVEMBER: Readonly<Record<number, number>> = {
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

export const WEEKEND_HOUSE_PRICES_FROM_NOVEMBER: Readonly<Record<number, number>> = {
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 600,
  7: 700,
  8: 750,
  9: 800,
  10: 850
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
  return [...new Set(["Дом", ...normalized])].slice(0, 16);
}

export function isWorkationGiftService(service: string) {
  return Object.values(WORKATION_GIFT_SERVICES).includes(service as (typeof WORKATION_GIFT_SERVICES)[keyof typeof WORKATION_GIFT_SERVICES]);
}

export function getWorkationEligibility(checkIn: string, checkOut: string, guests: number): WorkationEligibility {
  const nights = nightsCount(checkIn, checkOut);
  const stayDates = nights > 0 ? enumerateStayDates(checkIn, checkOut) : [];
  let consecutiveWeekdays = 0;
  let longestWeekdayRun = 0;

  for (const date of stayDates) {
    const day = dateFromIso(date)?.getUTCDay();
    consecutiveWeekdays = day !== undefined && day >= 1 && day <= 4 ? consecutiveWeekdays + 1 : 0;
    longestWeekdayRun = Math.max(longestWeekdayRun, consecutiveWeekdays);
  }

  const hasEnoughGuests = guests >= 2;
  const hasEnoughNights = nights >= 3;
  const hasConsecutiveWeekdays = longestWeekdayRun >= 3;

  return {
    eligible: hasEnoughGuests && hasEnoughNights && hasConsecutiveWeekdays,
    nights,
    hasEnoughGuests,
    hasEnoughNights,
    hasConsecutiveWeekdays
  };
}

export function calculateBookingCosts({ checkIn, checkOut, guests, services }: BookingCostInput): BookingCosts {
  const checkInDate = dateFromIso(checkIn);
  const checkOutDate = dateFromIso(checkOut);
  const pricedGuests = Math.min(10, Math.max(2, guests));
  let houseCost = 0;
  let hasOctoberTariff = false;
  let hasNovemberTariff = false;

  if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
    const cursor = new Date(checkInDate);
    while (cursor < checkOutDate) {
      const day = cursor.getUTCDay();
      const date = cursor.toISOString().slice(0, 10);
      const usesNovemberTariff = date >= HOUSE_PRICE_EFFECTIVE_DATE;
      const weekendPrices = usesNovemberTariff
        ? WEEKEND_HOUSE_PRICES_FROM_NOVEMBER
        : WEEKEND_HOUSE_PRICES_UNTIL_NOVEMBER;
      const prices = day === 0 || day === 5 || day === 6 ? weekendPrices : WEEKDAY_HOUSE_PRICES;
      houseCost += prices[pricedGuests] ?? prices[10];
      hasNovemberTariff ||= usesNovemberTariff;
      hasOctoberTariff ||= !usesNovemberTariff;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const houseTariff: HouseTariffPeriod = hasOctoberTariff && hasNovemberTariff
    ? "mixed"
    : hasNovemberTariff
      ? "from-november"
      : hasOctoberTariff
        ? "until-november"
        : "not-selected";

  const workation = getWorkationEligibility(checkIn, checkOut, guests);
  const requestedWorkationGift: WorkationGift = services.includes(WORKATION_GIFT_SERVICES.sauna)
    ? "sauna"
    : services.includes(WORKATION_GIFT_SERVICES.hottub)
      ? "hottub"
      : null;
  const workationGift = workation.eligible ? requestedWorkationGift : null;
  const saunaSelected = services.includes("Баня") || workationGift === "sauna";
  const hottubSelected = services.includes("Купель") || services.includes("Купель Фурако") || workationGift === "hottub";
  const waterChangeSelected = services.includes("Повторная смена воды");
  const saunaBaseCost = saunaSelected ? 250 : 0;
  const hottubBaseCost = !hottubSelected ? 0 : saunaSelected ? 150 : guests <= 2 ? 150 : guests <= 4 ? 200 : 250;
  const saunaCost = workationGift === "sauna" ? 0 : saunaBaseCost;
  const hottubCost = (workationGift === "hottub" ? 0 : hottubBaseCost) + (hottubSelected && waterChangeSelected ? 80 : 0);
  const banquetPricePerGuest = guests <= 10 ? 50 : guests <= 15 ? 45 : 40;
  const banquetCost = services.includes("Банкет") ? guests * banquetPricePerGuest : 0;
  const workationDiscount = workationGift === "sauna"
    ? saunaBaseCost
    : workationGift === "hottub"
      ? hottubBaseCost
      : 0;

  return {
    houseCost,
    houseTariff,
    saunaCost,
    hottubCost,
    banquetCost,
    workationEligible: workation.eligible,
    workationGift,
    workationDiscount,
    totalCost: houseCost + saunaCost + hottubCost + banquetCost
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
