import { NextRequest, NextResponse } from "next/server";
import { addDays, collectBookedDates, DATE_PATTERN, rangesFromDateSet, todayInTimeZone } from "@/lib/booking-core";
import { loadBookedRows } from "@/lib/booking-server";
import { hasSupabaseServerConfig } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const noStoreHeaders = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store"
};

export async function GET(request: NextRequest) {
  const defaultFrom = todayInTimeZone();
  const from = request.nextUrl.searchParams.get("from") ?? defaultFrom;
  const to = request.nextUrl.searchParams.get("to") ?? addDays(from, 370);

  if (
    !DATE_PATTERN.test(from) ||
    !DATE_PATTERN.test(to) ||
    from >= to ||
    to > addDays(from, 400)
  ) {
    return NextResponse.json(
      { error: "Некорректный диапазон дат." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      {
        configured: false,
        busy: [],
        timeZone: "Europe/Minsk",
        updatedAt: new Date().toISOString()
      },
      { headers: noStoreHeaders }
    );
  }

  try {
    const rows = await loadBookedRows();
    const dateSet = collectBookedDates(rows);
    const filteredDates = new Set([...dateSet].filter((date) => date >= from && date < to));

    return NextResponse.json({
      configured: true,
      busy: rangesFromDateSet(filteredDates),
      timeZone: "Europe/Minsk",
      updatedAt: new Date().toISOString()
    }, {
      headers: noStoreHeaders
    });
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить доступность. Попробуйте обновить календарь." },
      { status: 502, headers: noStoreHeaders }
    );
  }
}
