import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { collectBookedDates } from "@/lib/booking-core";

export async function loadBookedDateSet() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("booked_dates")
    .select("*");

  if (error) {
    console.error("Supabase booked_dates request failed.", error.message);
    throw new Error("Не удалось проверить занятость дат.");
  }

  return collectBookedDates((data ?? []) as Array<Record<string, unknown>>);
}

export async function loadBookedRows() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("booked_dates")
    .select("*");

  if (error) {
    console.error("Supabase booked_dates request failed.", error.message);
    throw new Error("Не удалось загрузить календарь занятости.");
  }

  return (data ?? []) as Array<Record<string, unknown>>;
}
