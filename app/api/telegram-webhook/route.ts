import { NextRequest, NextResponse } from "next/server";
import { enumerateStayDates, rangeHasConflict } from "@/lib/booking-core";
import { loadBookedDateSet } from "@/lib/booking-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type TelegramCallback = {
  id?: string;
  data?: string;
  message?: {
    message_id?: number;
    chat?: { id?: number | string };
  };
};

type TelegramUpdate = {
  callback_query?: TelegramCallback;
};

type BookingRecord = {
  id: string;
  name: string | null;
  phone: string | null;
  telegram: string | null;
  check_in: string;
  check_out: string;
  guests: number | null;
  services: string[] | null;
  total_price: number | null;
  status: string;
};

async function telegramRequest(token: string, method: string, payload: unknown) {
  const apiResponse = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const result = await apiResponse.json().catch(() => ({})) as { ok?: boolean; result?: unknown; description?: string };

  if (!apiResponse.ok || result.ok !== true) {
    console.error(`Telegram ${method} failed.`, apiResponse.status, result.description ?? "");
    throw new Error(`Telegram ${method} failed`);
  }

  return result.result;
}

async function answerCallback(token: string, callbackQueryId: string, text: string, showAlert = false) {
  await telegramRequest(token, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert
  });
}

function servicesMessage(services: string[] | null) {
  const extraServices = Array.isArray(services)
    ? services.filter((service) => service && service !== "Дом")
    : [];

  return extraServices.length
    ? `Дополнительные услуги:\n${extraServices.map((service) => `- ${service}`).join("\n")}`
    : "Дополнительные услуги: Нет";
}

function confirmedMessage(booking: BookingRecord) {
  return [
    "Бронь подтверждена",
    "",
    `Имя: ${booking.name ?? "Не указано"}`,
    `Даты проживания: ${booking.check_in} - ${booking.check_out}`,
    `Телефон: ${booking.phone ?? "Не указан"}`,
    "",
    servicesMessage(booking.services),
    "",
    "Статус: CONFIRMED"
  ].join("\n");
}

function cancelledMessage(booking: BookingRecord, wasConfirmed: boolean) {
  return [
    wasConfirmed ? "Бронь отменена" : "Заявка отклонена",
    "",
    `Имя: ${booking.name ?? "Не указано"}`,
    `Даты: ${booking.check_in} - ${booking.check_out}`,
    "",
    servicesMessage(booking.services),
    ...(wasConfirmed ? ["", "Даты освобождены."] : []),
    "",
    "Статус: CANCELLED"
  ].join("\n");
}

function cancelKeyboard(bookingId: string) {
  return {
    inline_keyboard: [[
      { text: "Отменить бронь", callback_data: `cancel:${bookingId}` }
    ]]
  };
}

async function editCallbackMessage(config: { token: string }, callback: TelegramCallback, text: string, replyMarkup?: unknown) {
  await telegramRequest(config.token, "editMessageText", {
    chat_id: callback.message?.chat?.id,
    message_id: callback.message?.message_id,
    text,
    reply_markup: replyMarkup || { inline_keyboard: [] }
  });
}

async function getBooking(bookingId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("id,name,phone,telegram,check_in,check_out,guests,services,total_price,status")
    .eq("id", bookingId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Could not load booking for Telegram callback.", error.message);
    throw new Error("Supabase booking lookup failed");
  }

  return data as BookingRecord | null;
}

async function changeStatus(bookingId: string, expectedStatus: string, nextStatus: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: nextStatus })
    .eq("id", bookingId)
    .eq("status", expectedStatus)
    .select("id,name,phone,telegram,check_in,check_out,guests,services,total_price,status")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Could not update booking from Telegram.", error.message);
    throw new Error("Supabase booking update failed");
  }

  return data as BookingRecord | null;
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const ownerChatId = String(process.env.TELEGRAM_CHAT_ID ?? "");
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

  if (!token || !ownerChatId || !webhookSecret) {
    console.error("Telegram webhook environment variables are incomplete.");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (receivedSecret !== webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const callback = update.callback_query;
  if (!callback?.id || !callback.message?.chat?.id || !callback.message?.message_id) {
    return NextResponse.json({ ok: true });
  }

  if (String(callback.message.chat.id) !== ownerChatId) {
    await answerCallback(token, callback.id, "Действие недоступно.", true);
    return NextResponse.json({ ok: true });
  }

  const match = /^(confirm|reject|cancel):([A-Za-z0-9_-]{1,64})$/.exec(callback.data || "");
  if (!match) {
    await answerCallback(token, callback.id, "Неизвестная команда.", true);
    return NextResponse.json({ ok: true });
  }

  const [, action, bookingId] = match;

  try {
    const booking = await getBooking(bookingId);
    if (!booking) {
      await answerCallback(token, callback.id, "Заявка не найдена.", true);
      return NextResponse.json({ ok: true });
    }

    const expectedStatus = action === "cancel" ? "confirmed" : "new";
    if (booking.status !== expectedStatus) {
      await answerCallback(token, callback.id, "Статус уже изменён ранее.", true);
      return NextResponse.json({ ok: true });
    }

    if (action === "confirm") {
      const occupiedDates = await loadBookedDateSet();
      for (const date of enumerateStayDates(booking.check_in, booking.check_out)) {
        occupiedDates.delete(date);
      }
      if (rangeHasConflict(booking.check_in, booking.check_out, occupiedDates)) {
        await answerCallback(token, callback.id, "На эти даты уже есть подтверждённая бронь.", true);
        return NextResponse.json({ ok: true });
      }
    }

    const nextStatus = action === "confirm" ? "confirmed" : "cancelled";
    const updated = await changeStatus(bookingId, expectedStatus, nextStatus);
    if (!updated) {
      await answerCallback(token, callback.id, "Статус уже изменён ранее.", true);
      return NextResponse.json({ ok: true });
    }

    if (nextStatus === "confirmed") {
      await editCallbackMessage({ token }, callback, confirmedMessage(updated), cancelKeyboard(bookingId));
      await answerCallback(token, callback.id, "Бронь подтверждена.");
    } else {
      await editCallbackMessage({ token }, callback, cancelledMessage(updated, action === "cancel"));
      await answerCallback(token, callback.id, action === "cancel" ? "Бронь отменена." : "Заявка отклонена.");
    }
  } catch (error) {
    console.error("Telegram booking callback failed.", error);
    try {
      await answerCallback(token, callback.id, "Не удалось выполнить действие. Попробуйте ещё раз.", true);
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
