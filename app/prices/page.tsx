import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgePercent, Bath, CalendarDays, Check, Flame, PartyPopper, Users } from "lucide-react";
import { BookingBand, PageHero } from "@/components/UI";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { OffersCarousel, type Offer } from "@/components/OffersCarousel";

export const metadata: Metadata = {
  title: "Цены и акции",
  description: "Актуальные цены на аренду Дома на Южной, баню, комплекс бани с купелью и банкет, акции и ближайшая доступность."
};

const weekdays = [
  [2, 200], [3, 300], [4, 350], [5, 400], [6, 450], [7, 500], [8, 600], [9, 650], [10, 700]
];

const weekends = [
  [2, 200], [3, 300], [4, 400], [5, 500], [6, 550], [7, 600], [8, 650], [9, 700], [10, 750]
];

const offers: Offer[] = [
  { value: "−50%", title: "Для пар", text: "Скидка на второй день бронирования.", image: "DGQGOfsNNbm-1.jpg" },
  { value: "Подарок", title: "День рождения", text: "Бонус на проживание имениннику. Условия уточняйте при выборе даты.", image: "offers/birthday-bonus.jpg" },
  { value: "−20%", title: "Срочное бронирование", text: "При бронировании за один день до заезда или непосредственно в день заезда.", image: "DF7csgDMZnU-1.jpg" },
  { value: "Можно вместе", title: "Отдых с питомцами", text: "Дом принимает гостей с домашними животными.", image: "offers/pets-friendly-card.jpg" }
];

function PriceTable({ rows }: { rows: number[][] }) {
  return (
    <div className="price-table">
      {rows.map(([guests, price]) => (
        <div key={guests}>
          <span>{guests} {guests < 5 ? "гостя" : "гостей"}</span>
          <strong>{price} BYN</strong>
        </div>
      ))}
    </div>
  );
}

export default function PricesPage() {
  return (
    <>
      <PageHero
        eyebrow="Цены / 05"
        title="Понятная стоимость. Никаких сюрпризов."
        text="Цена зависит от дня недели, количества гостей и формата отдыха. Актуальную сумму лучше уточнить перед бронированием."
        image="/images/album/album-03.jpg"
      />

      <section className="price-intro editorial">
        <div>
          <span>Проживание</span>
          <h2>Выберите день<br /><em>и состав компании.</em></h2>
        </div>
        <p>Минимальная стоимость проживания — 200 BYN за двоих. В праздничные дни действует прайс выходного дня. Итоговую сумму и свободные даты подтверждает владелец.</p>
      </section>

      <section className="price-cards editorial">
        <article className="price-card">
          <div className="price-card-top"><CalendarDays /><span>Пн · Вт · Ср · Чт</span></div>
          <small>Будние дни</small>
          <h2>От 200 BYN</h2>
          <p>Стоимость суток для компании от 2 до 10 гостей.</p>
          <PriceTable rows={weekdays} />
          <Link href="/booking">Узнать свободные даты <ArrowUpRight /></Link>
        </article>

        <article className="price-card price-card-featured">
          <div className="price-popular">Самый популярный тариф</div>
          <div className="price-card-top"><CalendarDays /><span>Пт · Сб · Вс</span></div>
          <small>Выходные дни</small>
          <h2>От 200 BYN</h2>
          <p>В праздничные дни также применяется этот прайс.</p>
          <PriceTable rows={weekends} />
          <Link href="/booking">Узнать свободные даты <ArrowUpRight /></Link>
        </article>
      </section>

      <section className="extras-pricing editorial">
        <div className="extras-heading">
          <span>Дополнительные форматы</span>
          <h2>Баня и купель.<br /><em>Пространство для компании.</em></h2>
        </div>
        <div className="extras-grid">
          <article>
            <Flame />
            <span>Баня</span>
            <h3>250 BYN</h3>
            <ul>
              <li><Check /> Баня без купели — 250 BYN</li>
              <li><Check /> Без ограничений по времени</li>
              <li><Check /> Баня вместе с купелью — 400 BYN</li>
            </ul>
            <p>Деревянная парная и отдельная комната отдыха для спокойного вечера с близкими.</p>
          </article>
          <article>
            <Bath />
            <span>Купель Фурако</span>
            <h3>От 150 BYN</h3>
            <ul>
              <li><Check /> Для пары — 150 BYN</li>
              <li><Check /> Для компании из 4 человек — 200 BYN</li>
              <li><Check /> Для компании свыше 4 человек — 250 BYN</li>
              <li><Check /> Вторые и последующие сутки без смены воды — 80 BYN</li>
            </ul>
            <p>Купель одновременно вмещает до 6 человек.</p>
          </article>
          <article>
            <PartyPopper />
            <span>Банкет</span>
            <h3>От 40 BYN / чел.</h3>
            <ul>
              <li><Check /> До 10 человек — 50 BYN с человека</li>
              <li><Check /> 11–15 человек — 45 BYN с человека</li>
              <li><Check /> Свыше 15 человек — 40 BYN с человека</li>
              <li><Check /> Время проведения — с 14:00 до 00:00</li>
              <li><Check /> После 00:00 — 50 BYN за каждый час</li>
            </ul>
            <p>Скидки и акции на бронирование банкета не распространяются.</p>
          </article>
        </div>
      </section>

      <section className="offers-section price-offers editorial">
        <div className="price-offers-title"><BadgePercent /><span>Акции</span><h2>Приятные условия<br /><em>для вашего отдыха.</em></h2><p>Иногда доступны специальные условия для пар, праздников, отдыха с питомцами и бронирования в ближайшие даты. Актуальные акции уточняйте при выборе дат.</p></div>
        <OffersCarousel offers={offers} />
      </section>

      <section className="price-availability editorial">
        <div className="price-availability-copy">
          <span>Доступность дома</span>
          <h2>Сначала даты.<br /><em>Затем планы.</em></h2>
          <p>Посмотрите календарь, выберите свободный период и отправьте заявку. Владельцы подтвердят дату, формат отдыха и итоговую стоимость.</p>
        </div>
        <AvailabilityCalendar mode="compact" />
      </section>

      <section className="price-note">
        <Users />
        <p>Дом рассчитан на 10 спальных мест. Баню, комплекс с купелью, день рождения, банкет, размещение с питомцами и другие услуги согласовывайте заранее.</p>
      </section>

      <BookingBand />
    </>
  );
}
