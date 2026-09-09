import Image from "next/image";
import { BookingBand, Chapter, PageHero, Reveal } from "@/components/UI";

export const metadata = { title: "О доме", description: "Двухэтажный Дом на Южной в Борисове: четыре спальни, две ванные комнаты, баня, терраса и купель Фурако." };

const materials = [
  ["Полностью оборудованная кухня", "customer-updates/kitchen-bright-vertical.jpg"], ["Просторная гостиная", "customer-updates/living-room-chairs.jpg"], ["Четыре светлые спальни", "DEXszpDomze-6.jpg"],
  ["Две ванные комнаты", "DEXjA_7tRmK-2.jpg"], ["Деревянная баня", "album/sauna-03.jpg"], ["Горячая купель", "DKsDidmIIvD-6.jpg"]
];

export default function About() {
  return <div className="about-page">
    <PageHero eyebrow="О доме / 01" title="Приглашаем в гости." text="Светлые комнаты, четыре спальни, новая баня и всё необходимое для комфортного отдыха до 10 гостей." image="/images/DEXe4w0oUmD-3.jpg" />
    <section className="editorial story">
      <Chapter index="01" label="Пространство дома" />
      <Reveal><h2>Комфортно вместе.<br /><em>Уютно каждому.</em></h2></Reveal>
      <div className="story-grid">
        <Reveal><p className="lead">На двух этажах расположены четыре спальни с двуспальными кроватями и две ванные комнаты.</p><p>На первом этаже гостей ждут оборудованная кухня, светлая гостиная с телевизором и большой диван, который превращается в дополнительное двухместное спальное место. Во дворе доступны отдельная деревянная баня, терраса и горячая купель.</p></Reveal>
        <Reveal delay={.15} className="story-image"><Image src="/images/customer-updates/stairs-wall.jpg" fill alt="Лестница Дома на Южной" sizes="45vw" /></Reveal>
      </div>
    </section>

    <section className="room-sequence">
      {[
        ["01", "Гостиная", "Светлое общее пространство с современным телевизором и большим диваном, который раскладывается в двухместное спальное место.", "customer-updates/living-room-chairs.jpg"],
        ["02", "Кухня", "Плита, холодильник, посуда и столовые приборы — всё необходимое, чтобы готовить привычные блюда во время отдыха.", "customer-updates/kitchen-table-flowers.jpg"],
        ["03", "Спальни", "Четыре отдельные спальни с двуспальными кроватями. В комнатах второго этажа установлены телевизоры.", "DEXszpDomze-6.jpg"],
        ["04", "Терраса, баня и купель", "Отдельная деревянная баня, терраса для встреч и горячая купель с джакузи-функцией для отдыха в любое время года.", "album/sauna-07.jpg"]
      ].map(([n, title, text, src], i) => <article key={n} className={i % 2 ? "reverse" : ""}><div className="room-image"><Image src={`/images/${src}`} fill alt={title} sizes="55vw" /></div><Reveal className="room-copy"><span>{n} / 04</span><h3>{title}</h3><p>{text}</p></Reveal></article>)}
    </section>

    <section className="materials editorial">
      <Chapter index="03" label="Главные удобства" />
      <Reveal><h2>Продумано для жизни.<br /><em>Подготовлено для отдыха.</em></h2></Reveal>
      <div className="material-grid">{materials.map(([name, src], i) => <Reveal key={name} delay={(i % 3) * .06}><div className="material-image"><Image src={`/images/${src}`} fill alt={name} sizes="33vw" /></div><span>0{i + 1}</span><h3>{name}</h3></Reveal>)}</div>
    </section>
    <BookingBand />
  </div>;
}
