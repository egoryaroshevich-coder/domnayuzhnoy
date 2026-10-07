import { NextResponse } from "next/server";
import { calculateBookingCosts, clean, dateFromIso, MAX_GUESTS, rangeHasConflict, uniqueServices, type HouseTariffPeriod } from "@/lib/booking-core";
import { loadBookedDateSet } from "@/lib/booking-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type BookingPayload = {
  name?: unknown;
  phone?: unknown;
  telegram?: unknown;
  checkIn?: unknown;
  checkOut?: unknown;
  arrival?: unknown;
  departure?: unknown;
  adults?: unknown;
  children?: unknown;
  guests?: unknown;
  services?: unknown;
  comment?: unknown;
  message?: unknown;
  website?: unknown;
  botField?: unknown;
  "bot-field"?: unknown;
};

type TelegramResult = {
  ok?: boolean;
  description?: string;
};

function numberValue(value: unknown, fallback = 0) {
  const number = Number.parseInt(clean(value, 3), 10);
  return Number.isFinite(number) ? number : fallback;
}

async function parsePayload(request: Request): Promise<BookingPayload> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    return await request.json() as BookingPayload;
  }

  const form = await request.formData();
  return {
    name: form.get("name"),
    phone: form.get("phone"),
    telegram: form.get("telegram"),
    checkIn: form.get("checkIn"),
    checkOut: form.get("checkOut"),
    adults: form.get("adults"),
    children: form.get("children"),
    services: form.getAll("services"),
    comment: form.get("comment"),
    botField: form.get("bot-field")
  };
}

function bookingMessage(booking: {
  name: string;
  phone: string;
  telegram: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  services: string[];
  houseTariff: HouseTariffPeriod;
  totalCost: number;
  comment: string;
}) {
  const extraServices = booking.services.filter((service) => service && service !== "Дом");
  const servicesText = extraServices.length
    ? `Дополнительные услуги:\n${extraServices.map((service) => `- ${service}`).join("\n")}`
    : "Дополнительные услуги: Нет";
  const tariffText = booking.houseTariff === "mixed"
    ? "Тариф дома: октябрьские ночи по текущему прайсу, с 1 ноября — по новому"
    : booking.houseTariff === "from-november"
      ? "Тариф дома: новый прайс с 1 ноября 2026"
      : "Тариф дома: текущий прайс до 31 октября 2026";

  return [
    "Новая заявка с сайта «Дом на Южной»",
    "",
    `Имя: ${booking.name}`,
    `Телефон: ${booking.phone}`,
    `Telegram: ${booking.telegram || "Не указан"}`,
    "",
    `Заезд: ${booking.checkIn}`,
    `Выезд: ${booking.checkOut}`,
    "",
    `Гостей: ${booking.guests}`,
    tariffText,
    "",
    servicesText,
    "",
    `Стоимость: ${booking.totalCost} BYN`,
    booking.comment ? `Комментарий: ${booking.comment}` : "Комментарий: Нет",
    "",
    "Статус: NEW"
  ].join("\n");
}

function newBookingKeyboard(bookingId: string) {
  return {
    inline_keyboard: [[
      { text: "Подтвердить", callback_data: `confirm:${bookingId}` },
      { text: "Отклонить", callback_data: `reject:${bookingId}` }
    ]]
  };
}

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    payload = await parsePayload(request);
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный формат данных." }, { status: 400 });
  }

  if (clean(payload.website ?? payload.botField ?? payload["bot-field"], 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 40);
  const telegram = clean(payload.telegram, 80);
  const checkIn = clean(payload.checkIn ?? payload.arrival, 10);
  const checkOut = clean(payload.checkOut ?? payload.departure, 10);
  const adults = numberValue(payload.adults, numberValue(payload.guests, 1));
  const children = numberValue(payload.children, 0);
  const guests = adults + children;
  const services = uniqueServices(payload.services);
  const comment = clean(payload.comment ?? payload.message, 1000);
  const phoneDigits = phone.replace(/\D/g, "");
  const checkInDate = dateFromIso(checkIn);
  const checkOutDate = dateFromIso(checkOut);
  const errors: string[] = [];

  if (!name) errors.push("Укажите имя.");
  if (!phone || phoneDigits.length < 9 || phoneDigits.length > 15) errors.push("Укажите корректный телефон.");
  if (!checkInDate) errors.push("Укажите дату заезда.");
  if (!checkOutDate) errors.push("Укажите дату выезда.");
  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) errors.push("Дата выезда должна быть позже даты заезда.");
  if (!Number.isInteger(adults) || adults < 1) errors.push("Должен быть указан минимум один взрослый.");
  if (!Number.isInteger(children) || children < 0) errors.push("Некорректное количество детей.");
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) errors.push("Количество гостей должно быть от 1 до 20.");

  if (errors.length) {
    return NextResponse.json({ ok: false, error: errors[0] }, { status: 400 });
  }

  const costs = calculateBookingCosts({ checkIn, checkOut, guests, services });
  const token = process.env.TELEGRAM_BOT_TOKEN ?? process.env.BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID ?? process.env.CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram environment variables are not configured.");
    return NextResponse.json({ ok: false, error: "Сервис уведомлений временно недоступен." }, { status: 500 });
  }

  try {
    const bookedDates = await loadBookedDateSet();
    if (rangeHasConflict(checkIn, checkOut, bookedDates)) {
      return NextResponse.json({
        ok: false,
        code: "DATES_UNAVAILABLE",
        error: "На выбранный период есть занятые даты. Выберите другой период."
      }, { status: 409 });
    }

    const supabase = getSupabaseAdmin();
    const record = {
      name,
      phone,
      telegram: telegram || null,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      guests,
      services,
      hot_tub: services.includes("Купель"),
      banquet: services.includes("Банкет"),
      total_price: costs.totalCost,
      comment: comment || null,
      status: "new",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert(record)
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("Supabase booking insert failed.", error?.message ?? "No id returned");
      return NextResponse.json({
        ok: false,
        error: "Не удалось сохранить заявку. Попробуйте ещё раз или свяжитесь с нами по телефону."
      }, { status: 502 });
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: bookingMessage({ name, phone, telegram, checkIn, checkOut, guests, services, houseTariff: costs.houseTariff, totalCost: costs.totalCost, comment }),
        reply_markup: newBookingKeyboard(String(data.id)),
        disable_web_page_preview: true
      }),
      cache: "no-store"
    });
    const telegramResult = await telegramResponse.json().catch(() => ({})) as TelegramResult;

    if (!telegramResponse.ok || telegramResult.ok !== true) {
      console.error("Telegram API rejected booking notification.", telegramResponse.status, telegramResult.description ?? "");
      return NextResponse.json({ ok: false, error: "Не удалось доставить уведомление." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Booking request failed.", error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз."
    }, { status: 502 });
  }
}
