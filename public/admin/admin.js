const STATUS_LABELS = {
  new: "Новая",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена"
};

const app = document.querySelector("#admin-app");
const loading = document.querySelector("#admin-loading");
const notice = document.querySelector("#admin-notice");
const bookingsBody = document.querySelector("#bookings-body");
const bookingsEmpty = document.querySelector("#bookings-empty");
const stats = document.querySelector("#admin-stats");
const dialog = document.querySelector("#booking-dialog");
const editForm = document.querySelector("#booking-edit-form");
const manualDialog = document.querySelector("#manual-booking-dialog");
const manualForm = document.querySelector("#manual-booking-form");
const manualName = document.querySelector("#manual-name");
const manualPhone = document.querySelector("#manual-phone");
const manualCheckIn = document.querySelector("#manual-check-in");
const manualCheckOut = document.querySelector("#manual-check-out");
const manualGuests = document.querySelector("#manual-guests");
const manualTotalPrice = document.querySelector("#manual-total-price");
const manualComment = document.querySelector("#manual-comment");
const manualError = document.querySelector("#manual-booking-error");
const manualSubmit = document.querySelector("#manual-booking-submit");
const searchInput = document.querySelector("#booking-search");
const calendarGrid = document.querySelector("#admin-calendar-grid");
const calendarMonth = document.querySelector("#admin-calendar-month");
const calendarSelectionTitle = document.querySelector("#calendar-selection-title");
const calendarSelectionList = document.querySelector("#calendar-selection-list");
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const longDateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const moneyFormatter = new Intl.NumberFormat("ru-RU");

let bookings = [];
let bookedDates = new Set();
let activeFilter = "all";
let searchQuery = "";
let selectedCalendarDate = "";
let displayedMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function localDate(value) {
  return value ? new Date(`${String(value).slice(0, 10)}T12:00:00`) : null;
}

function isoDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDate(value) {
  const date = localDate(value);
  return date ? dateFormatter.format(date) : "—";
}

function formatMoney(value) {
  return `${moneyFormatter.format(Number(value) || 0)} BYN`;
}

function addDays(value, days) {
  const date = typeof value === "string" ? localDate(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function bookingPhoneHtml(booking) {
  const phone = String(booking.phone || "").trim();
  if (!phone || phone === "Не указан") {
    return '<span class="cell-muted">Телефон не указан</span>';
  }
  return `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`;
}

function bookingOriginHtml(booking) {
  if (booking.source === "manual") {
    return '<span class="cell-muted manual-source">Добавлено вручную</span>';
  }
  return `<span class="cell-muted">${escapeHtml(booking.telegram || "Telegram не указан")}</span>`;
}

function setNotice(message = "", isError = false) {
  notice.textContent = message;
  notice.classList.toggle("error", isError);
}

function hasJwtClockSkewError(result) {
  const results = Array.isArray(result) ? result : [result];
  return results.some(item => /JWT issued at future/i.test(item?.error?.message || ""));
}

async function withSessionClockSkewRetry(operation) {
  let result = await operation();
  let retried = false;

  for (const delay of [1500, 3000]) {
    if (!hasJwtClockSkewError(result)) {
      if (retried) setNotice("");
      return result;
    }
    retried = true;
    setNotice("Синхронизируем защищённую сессию...");
    await new Promise(resolve => setTimeout(resolve, delay));
    await window.supabaseClient.auth.refreshSession();
    result = await operation();
  }

  if (retried && !hasJwtClockSkewError(result)) setNotice("");
  return result;
}

function adminErrorMessage(error, fallback) {
  return /JWT issued at future/i.test(error?.message || "")
    ? "Не удалось синхронизировать защищённую сессию. Обновите страницу."
    : error?.message || fallback;
}

function servicesFor(booking) {
  const services = Array.isArray(booking.services)
    ? booking.services.filter(service => service && service !== "Дом")
    : [];
  if (booking.hot_tub) services.push("Купель");
  if (booking.banquet) services.push("Банкет");
  return [...new Set(services)];
}

function isRevenueBooking(booking) {
  return booking.status === "confirmed" || booking.status === "completed";
}

function isSameMonth(date, sample) {
  return date && date.getFullYear() === sample.getFullYear() && date.getMonth() === sample.getMonth();
}

function isSameYear(date, sample) {
  return date && date.getFullYear() === sample.getFullYear();
}

function renderStats() {
  const now = new Date();
  const revenueBookings = bookings.filter(isRevenueBooking);
  const monthRevenue = revenueBookings
    .filter(item => isSameMonth(localDate(item.check_in), now))
    .reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const yearRevenue = revenueBookings
    .filter(item => isSameYear(localDate(item.check_in), now))
    .reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const average = revenueBookings.length
    ? Math.round(revenueBookings.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0) / revenueBookings.length)
    : 0;
  const values = [
    ["Доход за месяц", formatMoney(monthRevenue)],
    ["Доход за год", formatMoney(yearRevenue)],
    ["Средний чек", formatMoney(average)],
    ["Подтверждённые брони", bookings.filter(item => item.status === "confirmed").length]
  ];

  stats.innerHTML = values.map(([label, value]) =>
    `<div class="admin-stat"><b>${escapeHtml(value)}</b><span>${label}</span></div>`
  ).join("");
}

function startOfWeek(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function matchesFilter(booking) {
  if (["new", "confirmed", "cancelled", "completed"].includes(activeFilter)) {
    return booking.status === activeFilter;
  }
  if (activeFilter === "all") return true;

  const checkIn = localDate(booking.check_in);
  if (!checkIn) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (activeFilter === "today") return isoDate(checkIn) === isoDate(today);
  if (activeFilter === "week") {
    const weekStart = startOfWeek(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return checkIn >= weekStart && checkIn < weekEnd;
  }
  return isSameMonth(checkIn, today);
}

function matchesSearch(booking) {
  if (!searchQuery) return true;
  return [booking.name, booking.phone, booking.telegram]
    .some(value => String(value || "").toLocaleLowerCase("ru").includes(searchQuery));
}

function visibleBookings() {
  return bookings.filter(booking => matchesFilter(booking) && matchesSearch(booking));
}

function bookingActions(booking) {
  const actions = [
    `<button class="row-action details" type="button" data-action="details" data-id="${escapeHtml(booking.id)}">Подробнее</button>`
  ];
  if (booking.status !== "confirmed") actions.push(`<button class="row-action confirm" type="button" data-action="confirmed" data-id="${escapeHtml(booking.id)}">Подтвердить</button>`);
  if (booking.status !== "cancelled") actions.push(`<button class="row-action cancel" type="button" data-action="cancelled" data-id="${escapeHtml(booking.id)}">Отменить</button>`);
  if (booking.status === "confirmed") actions.push(`<button class="row-action" type="button" data-action="completed" data-id="${escapeHtml(booking.id)}">Завершить</button>`);
  return actions.join("");
}

function renderBookings() {
  const visible = visibleBookings();
  bookingsEmpty.hidden = visible.length > 0;
  bookingsEmpty.textContent = searchQuery
    ? "По вашему запросу заявки не найдены."
    : "Заявок с таким фильтром пока нет.";

  bookingsBody.innerHTML = visible.map(booking => {
    const services = servicesFor(booking);
    const status = STATUS_LABELS[booking.status] || booking.status || "Новая";
    return `<tr data-booking-id="${escapeHtml(booking.id)}">
      <td class="guest-cell" data-label="Гость"><b>${escapeHtml(booking.name)}</b>${bookingPhoneHtml(booking)}${bookingOriginHtml(booking)}</td>
      <td class="date-cell" data-label="Даты"><b>${formatDate(booking.check_in)} — ${formatDate(booking.check_out)}</b><span class="cell-muted">${escapeHtml(booking.created_at ? `Создана ${formatDate(booking.created_at)}` : "")}</span></td>
      <td data-label="Гости">${escapeHtml(booking.guests ?? ((booking.adults || 0) + (booking.children || 0)))}<span class="cell-muted">Взр. ${escapeHtml(booking.adults ?? 0)} · Дет. ${escapeHtml(booking.children ?? 0)}</span></td>
      <td data-label="Услуги"><div class="service-tags">${services.length ? services.map(item => `<span class="service-tag">${escapeHtml(item)}</span>`).join("") : '<span class="cell-muted">Только дом</span>'}</div></td>
      <td data-label="Стоимость"><b>${formatMoney(booking.total_price)}</b></td>
      <td data-label="Комментарий"><span class="cell-muted comment-preview">${escapeHtml(booking.comment || "Нет комментария")}</span></td>
      <td data-label="Статус"><span class="status-badge status-${escapeHtml(booking.status || "new")}">${escapeHtml(status)}</span></td>
      <td data-label="Действия"><div class="row-actions">${bookingActions(booking)}</div></td>
    </tr>`;
  }).join("");
}

function addRange(target, checkIn, checkOut) {
  const start = localDate(checkIn);
  const end = localDate(checkOut);
  if (!start) return;
  const cursor = new Date(start);
  if (!end || end <= start) {
    target.add(checkIn);
    return;
  }
  while (cursor < end) {
    target.add(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
}

function collectBookedRows(rows) {
  const dates = new Set();
  rows.forEach(row => {
    const single = row.booked_date || row.date || row.day || row.stay_date;
    if (single) dates.add(single);
    if (row.check_in || row.checkIn) addRange(dates, row.check_in || row.checkIn, row.check_out || row.checkOut);
  });
  return dates;
}

function pendingDates() {
  const dates = new Set();
  bookings.filter(item => item.status === "new").forEach(item => addRange(dates, item.check_in, item.check_out));
  return dates;
}

function bookingIncludesDate(booking, value) {
  const start = localDate(booking.check_in);
  const end = localDate(booking.check_out);
  const date = localDate(value);
  if (!start || !date || booking.status === "cancelled") return false;
  if (!end || end <= start) return isoDate(start) === value;
  return date >= start && date < end;
}

function renderCalendarSelection() {
  if (!selectedCalendarDate) {
    calendarSelectionTitle.textContent = "Выберите день в календаре";
    calendarSelectionList.innerHTML = '<p class="calendar-empty-copy">Здесь появятся заявки, связанные с выбранной датой.</p>';
    return;
  }

  const date = localDate(selectedCalendarDate);
  const related = bookings.filter(booking => bookingIncludesDate(booking, selectedCalendarDate));
  calendarSelectionTitle.textContent = longDateFormatter.format(date);
  calendarSelectionList.innerHTML = related.length
    ? related.map(booking => `<button class="calendar-booking" type="button" data-open-booking="${escapeHtml(booking.id)}">
        <span><b>${escapeHtml(booking.name)}</b><small>${escapeHtml(booking.source === "manual" && booking.phone === "Не указан" ? "Добавлено вручную" : booking.phone)}</small></span>
        <span><b>${formatMoney(booking.total_price)}</b><small>${escapeHtml(STATUS_LABELS[booking.status] || booking.status)}</small></span>
      </button>`).join("")
    : '<p class="calendar-empty-copy">На эту дату активных заявок нет.</p>';
}

function renderCalendar() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const pending = pendingDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  calendarMonth.textContent = monthFormatter.format(displayedMonth);
  calendarGrid.replaceChildren();

  for (let index = 0; index < offset; index += 1) {
    const empty = document.createElement("span");
    empty.className = "admin-calendar-empty";
    calendarGrid.append(empty);
  }

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(year, month, day);
    const value = isoDate(date);
    const cell = document.createElement("button");
    const status = bookedDates.has(value) ? "booked" : pending.has(value) ? "pending" : "free";
    const relatedCount = bookings.filter(booking => bookingIncludesDate(booking, value)).length;
    cell.type = "button";
    cell.dataset.calendarDate = value;
    cell.className = `admin-calendar-day ${status}`;
    cell.classList.toggle("selected", selectedCalendarDate === value);
    if (date < today) cell.classList.add("past");
    cell.setAttribute("aria-label", `${longDateFormatter.format(date)}, ${status === "booked" ? "занято" : status === "pending" ? "ожидание" : "свободно"}`);
    cell.innerHTML = `<span>${day}</span>${relatedCount ? `<small>${relatedCount} ${relatedCount === 1 ? "заявка" : "заявки"}</small>` : ""}`;
    calendarGrid.append(cell);
  }
  renderCalendarSelection();
}

async function loadData(showMessage = false) {
  if (showMessage) setNotice("Обновляем данные...");

  const [bookingsResult, datesResult] = await withSessionClockSkewRetry(() => Promise.all([
    window.supabaseClient.from("bookings").select("*").order("created_at", { ascending: false }),
    window.supabaseClient.from("booked_dates").select("*")
  ]));

  if (bookingsResult.error || datesResult.error) {
    setNotice(adminErrorMessage(bookingsResult.error || datesResult.error, "Не удалось загрузить данные."), true);
    return;
  }

  bookings = bookingsResult.data || [];
  bookedDates = collectBookedRows(datesResult.data || []);
  renderStats();
  renderBookings();
  renderCalendar();
  if (showMessage) setNotice("Данные обновлены.");
}

async function updateStatus(id, status) {
  setNotice("Сохраняем статус...");
  if (status === "confirmed") {
    const booking = bookings.find(item => String(item.id) === String(id));
    const dates = new Set();
    if (booking) addRange(dates, booking.check_in, booking.check_out);
    if ([...dates].some(date => bookedDates.has(date))) {
      setNotice("На эти даты уже есть подтверждённая бронь.", true);
      return;
    }
  }
  const { error } = await withSessionClockSkewRetry(() =>
    window.supabaseClient.from("bookings").update({ status }).eq("id", id)
  );
  if (error) {
    setNotice(adminErrorMessage(error, "Не удалось изменить статус."), true);
    return;
  }
  await loadData();
  setNotice(status === "confirmed" ? "Бронирование подтверждено, календарь обновлён." : status === "cancelled" ? "Бронирование отменено, даты освобождены." : "Статус обновлён.");
}

function detailItem(label, value, className = "") {
  return `<div class="booking-detail-item ${className}"><span>${label}</span><b>${escapeHtml(value || "—")}</b></div>`;
}

function openEditor(id) {
  const booking = bookings.find(item => String(item.id) === String(id));
  if (!booking) return;
  document.querySelector("#edit-booking-id").value = booking.id;
  const services = servicesFor(booking);
  document.querySelectorAll('[name="edit-service"]').forEach(input => {
    input.checked = services.includes(input.value);
  });
  document.querySelector("#edit-comment").value = booking.comment || "";
  document.querySelector("#dialog-error").textContent = "";
  document.querySelector("#booking-detail-grid").innerHTML = [
    detailItem("Имя", booking.name),
    detailItem("Статус", STATUS_LABELS[booking.status] || booking.status),
    detailItem("Источник", booking.source === "manual" ? "Добавлено вручную" : "Заявка с сайта"),
    detailItem("Телефон", booking.phone),
    detailItem("Telegram", booking.telegram || "Не указан"),
    detailItem("Заезд", formatDate(booking.check_in)),
    detailItem("Выезд", formatDate(booking.check_out)),
    detailItem("Гости", `${booking.guests ?? ((booking.adults || 0) + (booking.children || 0))} · взрослых ${booking.adults ?? 0}, детей ${booking.children ?? 0}`),
    detailItem("Стоимость", formatMoney(booking.total_price)),
    detailItem("Создана", booking.created_at ? new Date(booking.created_at).toLocaleString("ru-RU") : "—", "detail-wide")
  ].join("");
  dialog.showModal();
}

function setManualBookingError(message = "") {
  manualError.textContent = message;
}

function syncManualCheckout() {
  if (!manualCheckIn.value) return;
  const earliestCheckout = addDays(manualCheckIn.value, 1);
  manualCheckOut.min = earliestCheckout;
  if (!manualCheckOut.value || manualCheckOut.value < earliestCheckout) {
    manualCheckOut.value = earliestCheckout;
  }
}

function openManualBooking() {
  const today = isoDate(new Date());
  const initialCheckIn = selectedCalendarDate && selectedCalendarDate >= today
    ? selectedCalendarDate
    : today;

  manualForm.reset();
  manualCheckIn.min = today;
  manualCheckIn.value = initialCheckIn;
  manualCheckOut.value = addDays(initialCheckIn, 1);
  syncManualCheckout();
  setManualBookingError();
  manualSubmit.disabled = false;
  manualSubmit.textContent = "Зарезервировать";
  manualDialog.showModal();
  manualName.focus();
}

function manualBookingErrorMessage(error) {
  const message = error?.message || "";
  if (/DATES_UNAVAILABLE/i.test(message)) return "Эти даты уже заняты другой подтверждённой бронью.";
  if (/INVALID_DATES/i.test(message)) return "Проверьте даты заезда и выезда.";
  if (/INVALID_GUESTS/i.test(message)) return "Количество гостей должно быть от 1 до 20.";
  if (/INVALID_PRICE/i.test(message)) return "Стоимость не может быть отрицательной.";
  if (/NAME_REQUIRED/i.test(message)) return "Укажите имя гостя или название брони.";
  return adminErrorMessage(error, "Не удалось зарезервировать даты.");
}

async function createManualBooking(event) {
  event.preventDefault();
  setManualBookingError();

  const checkIn = manualCheckIn.value;
  const checkOut = manualCheckOut.value;
  const guests = Number(manualGuests.value);
  const totalPrice = Number(manualTotalPrice.value);
  const dates = new Set();

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    setManualBookingError("Дата выезда должна быть позже даты заезда.");
    return;
  }

  addRange(dates, checkIn, checkOut);
  if ([...dates].some(date => bookedDates.has(date))) {
    setManualBookingError("Эти даты уже заняты другой подтверждённой бронью.");
    return;
  }

  manualSubmit.disabled = true;
  manualSubmit.textContent = "Сохраняем...";

  const { error } = await withSessionClockSkewRetry(() =>
    window.supabaseClient.rpc("create_manual_booking", {
      p_name: manualName.value.trim(),
      p_phone: manualPhone.value.trim() || null,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guests: guests,
      p_total_price: totalPrice,
      p_comment: manualComment.value.trim() || null
    })
  );

  manualSubmit.disabled = false;
  manualSubmit.textContent = "Зарезервировать";

  if (error) {
    setManualBookingError(manualBookingErrorMessage(error));
    return;
  }

  manualDialog.close();
  selectedCalendarDate = checkIn;
  const selectedDate = localDate(checkIn);
  displayedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  await loadData();
  setNotice(`Даты ${formatDate(checkIn)} — ${formatDate(checkOut)} зарезервированы вручную.`);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportCsv() {
  const rows = visibleBookings();
  if (!rows.length) {
    setNotice("Нет заявок для экспорта.", true);
    return;
  }
  const header = ["Имя", "Телефон", "Telegram", "Заезд", "Выезд", "Взрослые", "Дети", "Гостей", "Услуги", "Стоимость BYN", "Комментарий", "Статус", "Создана"];
  const lines = rows.map(booking => [
    booking.name,
    booking.phone,
    booking.telegram,
    booking.check_in,
    booking.check_out,
    booking.adults,
    booking.children,
    booking.guests,
    ["Дом", ...servicesFor(booking)].join(", "),
    booking.total_price,
    booking.comment,
    STATUS_LABELS[booking.status] || booking.status,
    booking.created_at
  ].map(csvCell).join(";"));
  const blob = new Blob([`\uFEFF${header.map(csvCell).join(";")}\r\n${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dom-na-yuzhnoy-bookings-${isoDate(new Date())}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setNotice(`Экспортировано заявок: ${rows.length}.`);
}

bookingsBody.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "details") openEditor(button.dataset.id);
  else updateStatus(button.dataset.id, button.dataset.action);
});

editForm.addEventListener("submit", async event => {
  event.preventDefault();
  const id = document.querySelector("#edit-booking-id").value;
  const services = ["Дом", ...[...document.querySelectorAll('[name="edit-service"]:checked')].map(input => input.value)];
  const changes = {
    services,
    hot_tub: services.includes("Купель"),
    banquet: services.includes("Банкет"),
    comment: document.querySelector("#edit-comment").value.trim() || null
  };
  const { error } = await withSessionClockSkewRetry(() =>
    window.supabaseClient.from("bookings").update(changes).eq("id", id)
  );
  if (error) {
    document.querySelector("#dialog-error").textContent = adminErrorMessage(error, "Не удалось сохранить изменения.");
    return;
  }
  dialog.close();
  await loadData();
  setNotice("Изменения сохранены.");
});

document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
document.querySelector("#dialog-cancel").addEventListener("click", () => dialog.close());
document.querySelector("#manual-booking-open").addEventListener("click", openManualBooking);
document.querySelector("#manual-booking-close").addEventListener("click", () => manualDialog.close());
document.querySelector("#manual-booking-cancel").addEventListener("click", () => manualDialog.close());
manualCheckIn.addEventListener("change", syncManualCheckout);
manualForm.addEventListener("submit", createManualBooking);
document.querySelector("#status-filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
  renderBookings();
});
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLocaleLowerCase("ru");
  renderBookings();
});
document.querySelector("#export-csv").addEventListener("click", exportCsv);
document.querySelector(".admin-tabs").addEventListener("click", event => {
  const button = event.target.closest("[data-admin-tab]");
  if (!button) return;
  document.querySelectorAll("[data-admin-tab]").forEach(item => item.classList.toggle("active", item === button));
  document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.toggle("active", panel.id === `${button.dataset.adminTab}-panel`));
});
calendarGrid.addEventListener("click", event => {
  const day = event.target.closest("[data-calendar-date]");
  if (!day) return;
  selectedCalendarDate = day.dataset.calendarDate;
  renderCalendar();
});
calendarSelectionList.addEventListener("click", event => {
  const button = event.target.closest("[data-open-booking]");
  if (button) openEditor(button.dataset.openBooking);
});
document.querySelector("#admin-calendar-prev").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  selectedCalendarDate = "";
  renderCalendar();
});
document.querySelector("#admin-calendar-next").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  selectedCalendarDate = "";
  renderCalendar();
});
document.querySelector("#admin-refresh").addEventListener("click", () => loadData(true));
document.querySelector("#admin-logout").addEventListener("click", async () => {
  await window.supabaseClient.auth.signOut();
  location.replace("../admin-login/");
});

async function initializeAdmin() {
  const { data, error } = await withSessionClockSkewRetry(() => window.supabaseClient.auth.getUser());
  const user = data.user;

  if (error || !user) {
    await window.supabaseClient.auth.signOut();
    location.replace("../admin-login/");
    return;
  }

  document.querySelector("#admin-user-email").textContent = user.email || "Авторизованный пользователь";
  loading.hidden = true;
  app.hidden = false;
  await loadData();
}

initializeAdmin();
