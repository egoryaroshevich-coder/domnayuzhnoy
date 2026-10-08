import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bath,
  CalendarDays,
  Check,
  Coffee,
  Flame,
  Gift,
  Laptop,
  MoonStar,
  Users,
  Wifi
} from "lucide-react";
import { BookingBand, Chapter, PageHero, Reveal } from "@/components/UI";

export const metadata: Metadata = {
  title: "Workation — баня или купель в подарок",
  description: "Workation в Доме на Южной: при бронировании от трёх будних ночей подряд для компании от двух человек — баня или купель на выбор в подарок."
};

const rhythm = [
  {
    Icon: Coffee,
    time: "Утро",
    title: "Начните день без дороги до офиса",
    text: "Спокойный завтрак, кофе и привычные рабочие задачи — только в более тихой обстановке и без городской спешки."
  },
  {
    Icon: Wifi,
    time: "День",
    title: "Выберите удобное место для работы",
    text: "В доме есть высокоскоростной Wi-Fi. Можно расположиться на кухне, в спальне или выйти с ноутбуком на террасу."
  },
  {
    Icon: MoonStar,
    time: "Вечер",
    title: "Закройте ноутбук и переключитесь",
    text: "После рабочих дел вас ждёт отдых: одна топка деревянной бани или горячей купели уже входит в предложение."
  }
];

export default function WorkationPage() {
  return (
    <div className="workation-page">
      <PageHero
        eyebrow="Workation / 04"
        title="Workation в Доме на Южной."
        text="Три будние ночи подряд, спокойная работа за городом и одна топка бани или купели на выбор в подарок."
        image="/images/workation/terrace-work.webp"
      />

      <section className="workation-intro editorial">
        <Chapter index="01" label="Work + Vacation" />
        <div className="workation-intro-grid">
          <Reveal className="workation-intro-copy">
            <span>Постоянное предложение</span>
            <h2>Смена обстановки.<br /><em>Без паузы в делах.</em></h2>
            <p className="workation-lead">Workation — это формат, в котором рабочие будни становятся частью небольшого загородного отдыха.</p>
            <p>Вы приезжаете на несколько дней, сохраняете привычный ритм и меняете домашний офис на просторный дом с кухней, Wi-Fi и террасой. После работы не нужно никуда ехать: можно собраться за ужином, выйти во двор, попариться в бане или отдохнуть в горячей купели.</p>
            <p>Формат подойдёт удалённым специалистам, предпринимателям, студентам и всем, кому хочется спокойно закончить важные дела вдали от городской суеты. Работать удалённо необязательно — предложение доступно всем гостям.</p>
            <Link href="/booking">Выбрать даты <ArrowUpRight /></Link>
          </Reveal>
          <Reveal className="workation-intro-image" delay={0.12}>
            <Image
              src="/images/workation/kitchen-work.webp"
              fill
              alt="Рабочее место с ноутбуком на кухне Дома на Южной"
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <span>Домашний комфорт<br />и рабочий ритм</span>
          </Reveal>
        </div>
      </section>

      <section className="workation-facts">
        <article><CalendarDays /><span>01</span><strong>От 3 ночей</strong><p>Минимум три последовательные будние ночи, приходящиеся на понедельник–четверг.</p></article>
        <article><Users /><span>02</span><strong>От 2 гостей</strong><p>Предложение действует для пары и для компании большего состава.</p></article>
        <article><Gift /><span>03</span><strong>Один подарок</strong><p>Одна топка бани или купели на выбор при каждом подходящем бронировании.</p></article>
      </section>

      <section className="workation-rhythm editorial">
        <div className="workation-rhythm-heading">
          <span>02 / Сценарий дня</span>
          <h2>Работайте в своём ритме.<br /><em>Отдыхайте сразу после.</em></h2>
          <p>Здесь не нужно выбирать между делами и сменой обстановки. У каждого времени дня появляется своё место.</p>
        </div>
        <div className="workation-rhythm-grid">
          <Reveal className="workation-rhythm-image">
            <Image
              src="/images/workation/bedroom-work.webp"
              fill
              alt="Ноутбук в спальне Дома на Южной во время Workation"
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </Reveal>
          <div className="workation-rhythm-list">
            {rhythm.map(({ Icon, time, title, text }, index) => (
              <Reveal className="workation-rhythm-item" delay={index * 0.07} key={time}>
                <Icon />
                <span>{time}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="workation-gift editorial">
        <Chapter index="03" label="Подарок к проживанию" />
        <div className="workation-gift-heading">
          <div>
            <span>Выбор за вами</span>
            <h2>Тёплый пар<br />или горячая вода.</h2>
          </div>
          <p>При подходящем бронировании выберите один формат отдыха. Если хочется и баню, и купель, один вариант останется подарком, а второй рассчитается по действующему тарифу.</p>
        </div>

        <div className="workation-gift-grid">
          <Reveal className="workation-gift-option">
            <div className="workation-gift-image">
              <Image
                src="/images/workation/sauna-work.webp"
                fill
                alt="Workation с отдыхом в деревянной бане"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div><Flame /><span>Вариант 01</span><h3>Одна топка бани</h3><p>Деревянная парная и комната отдыха без ограничения по времени.</p></div>
          </Reveal>
          <Reveal className="workation-gift-option" delay={0.1}>
            <div className="workation-gift-image">
              <Image
                src="/images/workation/hot-tub-work.webp"
                fill
                alt="Работа на террасе рядом с горячей купелью Фурако"
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div><Bath /><span>Вариант 02</span><h3>Одна топка купели</h3><p>Горячая купель Фурако под открытым небом для спокойного вечера.</p></div>
          </Reveal>
        </div>
      </section>

      <section className="workation-rules editorial">
        <div className="workation-rules-copy">
          <span>04 / Как получить подарок</span>
          <h2>Всё считается<br /><em>автоматически.</em></h2>
          <p>Выберите даты и укажите состав компании в форме бронирования. Если условия выполнены, форма сразу покажет предложение Workation и предложит выбрать подарок.</p>
          <Link href="/booking">Перейти к бронированию <ArrowUpRight /></Link>
        </div>
        <div className="workation-rules-list">
          <div><span>01</span><p><Check /> В бронировании есть минимум три последовательные ночи, приходящиеся на понедельник–четверг.</p></div>
          <div><span>02</span><p><Check /> В заявке указано не менее двух гостей.</p></div>
          <div><span>03</span><p><Check /> Вы выбрали одну топку бани или купели в качестве подарка.</p></div>
          <div><span>04</span><p><Check /> Пятница и выходные могут входить в более длительное проживание, но не засчитываются в три подарочные будние ночи.</p></div>
          <small>Подарок предоставляется при каждом бронировании, которое соответствует условиям. Свободные даты и детали отдыха подтверждает владелец.</small>
        </div>
      </section>

      <section className="workation-final-image">
        <Image
          src="/images/workation/terrace-work.webp"
          fill
          alt="Рабочий день на солнечной террасе Дома на Южной"
          sizes="100vw"
        />
        <div className="hero-shade" />
        <Reveal><Laptop /><span>Дом на Южной</span><h2>Несколько рабочих дней.<br />Совсем другое ощущение недели.</h2></Reveal>
      </section>

      <BookingBand />
    </div>
  );
}
