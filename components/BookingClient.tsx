"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  Bath,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Flame,
  KeyRound,
  LoaderCircle,
  Phone,
  UserRound,
  Users,
  X
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AvailabilityCalendar, DateRangeSelection } from "@/components/AvailabilityCalendar";
import { calculateBookingCosts, nightsCount, uniqueServices, type HouseTariffPeriod } from "@/lib/booking-core";

const steps = [
  ["01", "Заявка", "Вы сообщаете даты, количество гостей и формат отдыха."],
  ["02", "Подтверждение", "Владелец проверяет свободные даты и уточняет актуальную стоимость."],
  ["03", "Согласование", "Вы подтверждаете баню, купель, размещение с питомцем или оформление события."],
  ["04", "Заезд", "Дом готовят к вашему приезду в согласованное время."]
];

type FieldErrors = Partial<Record<"name" | "phone" | "arrival" | "departure" | "guests", string>>;

const wellnessOptions = [
  { service: "Баня", price: "250 BYN", detail: "Без ограничения по времени", Icon: Flame },
  { service: "Купель", price: "150–250 BYN", detail: "Отдельная горячая купель Фурако", Icon: Bath }
];

const serviceOptions = [
  ["Банкет", "40/45/50 BYN / гость"],
  ["День рождения", "Обсудим формат"],
  ["Свадьба / камерное торжество", "По согласованию"],
  ["Отдых для пары", "Есть спецусловия"],
  ["Семейный отдых", "Подберём вариант"],
  ["Повторная смена воды", "80 BYN"],
  ["Фотосессия", "По запросу"],
  ["Украшение дома", "По запросу"],
  ["Размещение с питомцем", "Можно согласовать"],
  ["Нужна консультация", "Свяжемся с вами"]
];

const tariffNotices: Record<HouseTariffPeriod, { eyebrow: string; title: string; text: string }> = {
  "not-selected": {
    eyebrow: "Изменение тарифа",
    title: "До 31 октября — текущие цены",
    text: "Для ночей с 1 ноября 2026 года сумма автоматически рассчитывается по новому прайсу."
  },
  "until-november": {
    eyebrow: "Текущий прайс",
    title: "Выбранные даты — по октябрьским ценам",
    text: "Все выбранные ночи приходятся на период до 1 ноября 2026 года."
  },
  "from-november": {
    eyebrow: "Новый прайс",
    title: "Для выбранных дат действует новый тариф",
    text: "Стоимость рассчитана по прайсу, который вступает в силу 1 ноября 2026 года."
  },
  mixed: {
    eyebrow: "Переходный период",
    title: "В расчёте учтены два тарифа",
    text: "Ночи октября посчитаны по текущим ценам, а ночи с 1 ноября — по новому прайсу."
  }
};

function validate(form: FormData) {
  const errors: FieldErrors = {};
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const arrival = String(form.get("checkIn") ?? "");
  const departure = String(form.get("checkOut") ?? "");
  const adults = Number(form.get("adults"));
  const children = Number(form.get("children"));
  const guests = adults + children;
  const phoneDigits = phone.replace(/\D/g, "");

  if (name.length < 2) errors.name = "Укажите имя, чтобы мы знали, как к вам обращаться.";
  if (phoneDigits.length < 9 || phoneDigits.length > 15) errors.phone = "Укажите телефон в международном формате.";
  if (!arrival) errors.arrival = "Выберите дату заезда.";
  if (!departure) errors.departure = "Выберите дату выезда.";
  if (arrival && departure && departure <= arrival) errors.departure = "Дата выезда должна быть позже даты заезда.";
  if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0 || guests < 1 || guests > 20) {
    errors.guests = "Укажите от 1 до 20 гостей, минимум один взрослый.";
  }

  return errors;
}

export function BookingClient() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [dates, setDates] = useState<DateRangeSelection>({ arrival: "", departure: "" });
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const guests = adults + children;
  const services = useMemo(() => uniqueServices(selectedServices), [selectedServices]);
  const costs = useMemo(() => calculateBookingCosts({
    checkIn: dates.arrival,
    checkOut: dates.departure,
    guests,
    services
  }), [dates.arrival, dates.departure, guests, services]);
  const nights = useMemo(() => nightsCount(dates.arrival, dates.departure), [dates.arrival, dates.departure]);
  const saunaPackageSelected = services.includes("Баня") && services.includes("Купель");
  const tariffNotice = tariffNotices[costs.houseTariff];

  const toggleService = (service: string, selected: boolean) => {
    setSelectedServices((current) => selected
      ? [...current, service]
      : current.filter((item) => item !== service));
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const errors = validate(form);
    setFieldErrors(errors);
    setError("");

    if (Object.keys(errors).length) {
      const firstError = Object.keys(errors)[0];
      if (firstError === "arrival" || firstError === "departure") {
        formElement.querySelector<HTMLElement>(".booking-calendar-field")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (firstError === "guests") {
        formElement.querySelector<HTMLElement>('[name="adults"]')?.focus();
      } else {
        formElement.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      }
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      telegram: form.get("telegram"),
      checkIn: form.get("checkIn"),
      checkOut: form.get("checkOut"),
      adults: Number(form.get("adults")),
      children: Number(form.get("children")),
      services: form.getAll("services"),
      comment: form.get("comment"),
      website: form.get("website")
    };

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({})) as { error?: string; code?: string };

      if (!response.ok) {
        if (result.code === "DATES_UNAVAILABLE") {
          setDates({ arrival: "", departure: "" });
          setFieldErrors({
            arrival: "Выбранный период уже занят.",
            departure: "Пожалуйста, выберите новые даты."
          });
          setCalendarRefresh((current) => current + 1);
        }
        throw new Error(result.error || "Не удалось отправить заявку.");
      }

      formElement.reset();
      setDates({ arrival: "", departure: "" });
      setAdults(1);
      setChildren(0);
      setSelectedServices([]);
      setDone(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="request-hero">
        <div className="request-key"><KeyRound /></div>
        <span>Бронирование / 08</span>
        <h1>Ваш отдых начинается<br /> с <em>выбора дат.</em></h1>
        <p>Выберите свободный период, укажите состав гостей и формат отдыха. Мы передадим заявку владельцам, чтобы они подтвердили дату, стоимость и детали бронирования.</p>
      </section>

      <section className="booking-intro-strip">
          <div><CalendarDays /><span>Даты</span><p>Укажите желаемые дни заезда и выезда.</p></div>
        <div><Users /><span>Компания</span><p>До 20 гостей для отдыха или события.</p></div>
        <div><Clock3 /><span>Ответ</span><p>Владельцы получат заявку и свяжутся с вами.</p></div>
        <Link href="/prices">Посмотреть все цены</Link>
      </section>

      <section className="private-form-section">
        <div className="form-heading">
          <span>Узнать свободные даты</span>
          <h2>Расскажите о<br />предстоящем отдыхе.</h2>
          <p>Поля со звёздочкой обязательны. После отправки заявки владелец подтвердит даты и окончательную стоимость.</p>
          <div className="form-assurance"><Check /> Данные используются только для связи по вашей заявке.</div>
        </div>

        <form className="private-form booking-request-form" onSubmit={submit} noValidate>
          <div className={`booking-price-change booking-price-change-${costs.houseTariff}`} aria-live="polite">
            <span className="booking-price-change-icon"><CalendarDays /></span>
            <div>
              <small>{tariffNotice.eyebrow}</small>
              <strong>{tariffNotice.title}</strong>
              <p>{tariffNotice.text}</p>
            </div>
          </div>

          <div className={`booking-calendar-field ${fieldErrors.arrival || fieldErrors.departure ? "has-error" : ""}`}>
            <AvailabilityCalendar
              value={dates}
              refreshToken={calendarRefresh}
              onChange={(selection) => {
                setDates(selection);
                clearFieldError("arrival");
                clearFieldError("departure");
              }}
            />
            <input type="hidden" name="checkIn" value={dates.arrival} />
            <input type="hidden" name="checkOut" value={dates.departure} />
            {(fieldErrors.arrival || fieldErrors.departure) && (
              <small className="booking-calendar-error">{fieldErrors.arrival ?? fieldErrors.departure}</small>
            )}
          </div>

          <div className={`booking-field ${fieldErrors.name ? "has-error" : ""}`}>
            <label htmlFor="booking-name">Полное имя *</label>
            <div><UserRound /><input id="booking-name" required name="name" autoComplete="name" placeholder="Как к вам обращаться?" onChange={() => clearFieldError("name")} /></div>
            {fieldErrors.name && <small>{fieldErrors.name}</small>}
          </div>

          <div className={`booking-field booking-field-wide ${fieldErrors.phone ? "has-error" : ""}`}>
            <label htmlFor="booking-phone">Телефон / мессенджер *</label>
            <div><Phone /><input id="booking-phone" required name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+375 29 000-00-00" onChange={() => clearFieldError("phone")} /></div>
            <small className="field-hint">Лучше указать номер, к которому привязан Telegram или WhatsApp.</small>
            {fieldErrors.phone && <small>{fieldErrors.phone}</small>}
          </div>

          <div className={`booking-field ${fieldErrors.guests ? "has-error" : ""}`}>
            <label htmlFor="booking-adults">Взрослые *</label>
            <div><Users /><select id="booking-adults" name="adults" value={adults} onChange={(event) => {
              const nextAdults = Number(event.target.value);
              setAdults(nextAdults);
              if (nextAdults + children > 20) setChildren(20 - nextAdults);
              clearFieldError("guests");
            }}>{Array.from({ length: 20 }, (_, index) => index + 1).map((count) => <option value={count} key={count}>{count}</option>)}</select></div>
            {fieldErrors.guests && <small>{fieldErrors.guests}</small>}
          </div>

          <div className="booking-field">
            <label htmlFor="booking-children">Дети</label>
            <div><Baby /><select id="booking-children" name="children" value={children} onChange={(event) => {
              setChildren(Number(event.target.value));
              clearFieldError("guests");
            }}>{Array.from({ length: 21 - adults }, (_, index) => <option value={index} key={index}>{index}</option>)}</select></div>
          </div>

          <div className="booking-field booking-field-wide">
            <label htmlFor="booking-telegram">Telegram</label>
            <div><UserRound /><input id="booking-telegram" name="telegram" placeholder="@username" /></div>
          </div>

          <fieldset className="booking-wellness">
            <legend>Отдельные услуги</legend>
            <p className="booking-wellness-intro">Баню и купель можно выбрать независимо друг от друга</p>
            <div className="booking-wellness-grid">
              {wellnessOptions.map(({ service, price, detail, Icon }) => (
                <label className="booking-wellness-option" key={service}>
                  <input
                    type="checkbox"
                    name="services"
                    value={service}
                    checked={selectedServices.includes(service)}
                    onChange={(event) => toggleService(service, event.target.checked)}
                  />
                  <span className="booking-wellness-card">
                    <span className="booking-wellness-icon"><Icon /></span>
                    <span className="booking-wellness-copy"><b>{service}</b><small>{detail}</small></span>
                    <strong>{price}</strong>
                    <span className="booking-wellness-check"><Check /></span>
                  </span>
                </label>
              ))}
            </div>
            {saunaPackageSelected && <p className="booking-services-note"><Check /> Вы выбрали баню и купель отдельно. Для двух услуг действует цена комплекса 400 BYN.</p>}
          </fieldset>

          <fieldset className="booking-services">
            <legend>Дополнительные пожелания</legend>
            {serviceOptions.map(([service, price]) => (
              <label key={service}><input
                type="checkbox"
                name="services"
                value={service}
                checked={selectedServices.includes(service)}
                onChange={(event) => toggleService(service, event.target.checked)}
              /><span>{service} · {price}</span></label>
            ))}
          </fieldset>

          <div className="booking-field booking-field-wide">
            <label htmlFor="booking-message">Особые пожелания</label>
            <div className="booking-textarea"><textarea id="booking-message" rows={5} name="comment" maxLength={1200} placeholder="Например: хотим баню с купелью, нужен банкет на 8 человек, планируем приехать с небольшой собакой..." /></div>
          </div>

          <div className="booking-estimate booking-field-wide" aria-live="polite">
            <div><span>Даты</span><b>{nights ? `${nights} ${nights === 1 ? "сутки" : "суток"}` : "Выберите период"}</b></div>
            <div><span>Гости</span><b>{guests}</b></div>
            <div><span>Дом</span><b>{costs.houseCost} BYN</b></div>
            <div><span>Баня</span><b>{costs.saunaCost} BYN</b></div>
            <div><span>Купель</span><b>{costs.hottubCost} BYN</b></div>
            <div><span>Банкет</span><b>{costs.banquetCost} BYN</b></div>
            <div className="booking-estimate-total"><span>Предварительно</span><b>{costs.totalCost} BYN</b></div>
          </div>

          <label className="booking-honeypot" aria-hidden="true">Сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>

          <AnimatePresence>
            {error && (
              <motion.div className="booking-form-error" role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CircleAlert /> <span><strong>Заявка не отправлена.</strong>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button className="booking-submit" type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle className="booking-spinner" /> Отправляем заявку...</> : <>Отправить заявку <span>↗</span></>}
          </button>
          <small className="booking-consent">Нажимая кнопку, вы соглашаетесь на обработку данных для ответа по бронированию.</small>
        </form>
      </section>

      <section className="next-steps">
        <span>Что произойдёт дальше</span>
        <h2>Личный подход<br />с первого сообщения.</h2>
        <div>{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <AnimatePresence>
        {done && (
          <motion.div className="booking-confirmation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="booking-success-title">
            <motion.div initial={{ scale: .9, y: 35 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 230, damping: 24 }}>
              <button type="button" onClick={() => setDone(false)} aria-label="Закрыть подтверждение"><X /></button>
              <motion.span initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .15, type: "spring" }}><Check /></motion.span>
              <small>Запрос принят</small>
              <h2 id="booking-success-title">Заявка успешно отправлена</h2>
              <p>Мы получили вашу заявку и свяжемся с вами в ближайшее время для подтверждения бронирования.</p>
              <button type="button" className="booking-confirmation-close" onClick={() => setDone(false)}>Вернуться на сайт</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
