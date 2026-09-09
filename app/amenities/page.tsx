import Image from "next/image";
import { Bath, Flame, PartyPopper, PawPrint, Trees, Tv, UtensilsCrossed } from "lucide-react";
import { BookingBand, Chapter, PageHero, Reveal } from "@/components/UI";

export const metadata = { title: "Услуги и удобства", description: "Баня, купель Фурако, оборудованная кухня, Wi-Fi, терраса и оформление мероприятий в Доме на Южной." };

const services = [
  [Flame, "Деревянная баня", "Парная и комната отдыха. Бронь без ограничения по времени — 250 BYN, вместе с купелью — 400 BYN."],
  [Bath, "Купель Фурако", "Вода 38–42 °C, встроенная печь, утеплённая чаша и джакузи-функция."],
  [UtensilsCrossed, "Оборудованная кухня", "Плита, холодильник, посуда и столовые приборы для самостоятельного приготовления еды."],
  [Tv, "Связь и развлечения", "Высокоскоростной Wi-Fi, кабельное ТВ и телевизоры в спальнях второго этажа."],
  [PartyPopper, "Праздники и встречи", "Пространство подходит для семейных праздников и может быть оформлено под выбранную идею."],
  [PawPrint, "Можно с животными", "Размещение с питомцами разрешено. Условия лучше согласовать с владельцами до бронирования."],
  [Trees, "Терраса и BBQ-зона", "На улице можно отдохнуть на террасе, приготовить ужин на мангале и провести вечер у купели."]
];
const day = [
  ["Утро", "Домашний завтрак", "Приготовьте завтрак на оборудованной кухне и начните день без спешки.", "DEXjA_7tRmK-3.jpg"],
  ["День", "Время с близкими", "Соберитесь в гостиной, отдохните на террасе или устройте семейный праздник.", "DEXjA_7tRmK-4.jpg"],
  ["Вечер", "Баня и горячая Фурако", "Начните с тёплой деревянной парной, а затем отдохните в купели под открытым небом.", "album/sauna-03.jpg"],
  ["Ночь", "Спокойный сон", "Четыре спальни с двуспальными кроватями обеспечивают комфортный отдых после насыщенного дня.", "DEXszpDomze-6.jpg"]
];

export default function Experience() {
  return <>
    <PageHero eyebrow="Услуги / 03" title="Всё для отдыха без лишних хлопот." text="Всё необходимое для комфорта: дом, деревянная баня, терраса и горячая купель Фурако." image="/images/album/sauna-07.jpg" />
    <section className="editorial service-section">
      <Chapter index="01" label="Что доступно гостям" />
      <Reveal><h2>Нужное для комфорта.<br /><em>Пространство для впечатлений.</em></h2></Reveal>
      <div className="service-grid">{services.map(([Icon, title, text], i) => <Reveal className={`service-card-${i + 1}`} key={title as string} delay={i * .07}><Icon /><span>0{i + 1}</span><h3>{title as string}</h3><p>{text as string}</p></Reveal>)}</div>
    </section>

    <section className="day-story">
      <div className="day-intro"><span>02 / Сценарий отдыха</span><h2>Проведите день<br />так, как хочется.</h2></div>
      {day.map(([time, title, text, src], i) => <article key={time}>
        <div className="day-image"><Image src={`/images/${src}`} fill alt={title} sizes="50vw" /></div>
        <Reveal className="day-copy"><strong>{time}</strong><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></Reveal>
      </article>)}
    </section>

    <section className="privacy-section">
      <Image src="/images/DEXe4w0oUmD-2.jpg" fill alt="Дом на Южной зимним вечером" sizes="100vw" />
      <div className="hero-shade" />
      <Reveal><span>Тихий район / город рядом</span><h2>Спокойный отдых<br />в пределах Борисова.</h2><p>Дом расположен в тихом и безопасном районе, при этом городские удобства остаются в лёгкой доступности. Возможна посуточная и долгосрочная аренда.</p></Reveal>
    </section>
    <BookingBand />
  </>;
}
