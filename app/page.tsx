import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Play } from "lucide-react";
import { BookingBand, Chapter, Reveal } from "@/components/UI";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <Image src="/images/DEXe4w0oUmD-3.jpg" fill priority alt="Дом на Южной и терраса вечером" sizes="100vw" />
        <div className="hero-shade" />
        <div className="hero-orbit"><i /><span>БОРИСОВ · ЮЖНАЯ, 12А</span></div>
        <div className="home-hero-copy">
          <Reveal><span className="kicker">Дом на Южной / отдых в центре Борисова</span></Reveal>
          <h1 className="statement-title"><span>Место, где </span><em>можно не спешить.</em></h1>
          <Reveal delay={.35} className="hero-bottom">
            <p>Современный двухэтажный дом, уютная терраса<br />и горячая купель Фурако для отдыха до 10 гостей.</p>
            <Link href="/booking" className="glass-button">Забронировать <ArrowUpRight /></Link>
          </Reveal>
        </div>
        <div className="scroll-note"><ArrowDown /> Познакомиться с домом</div>
      </section>

      <section className="video-tour home-video-tour">
        <Image src="/images/album/album-29.jpg" fill alt="Дом на Южной среди зелени" sizes="100vw" />
        <div className="hero-shade" />
        <div><span>Видеообзор дома</span><h2>Посмотрите дом<br />перед приездом.</h2><a className="video-play-link" href="https://vt.tiktok.com/ZSQ4QLona/" target="_blank" rel="noreferrer" aria-label="Открыть видеообзор Дома на Южной в ТикТок"><Play fill="currentColor" /></a></div>
      </section>

      <section className="intro editorial">
        <Chapter index="01" label="О доме" />
        <Reveal className="intro-title"><h2>В городе.<br /><em>Но вдали<br />от суеты.</em></h2></Reveal>
        <Reveal className="intro-copy"><p>«Дом на Южной» находится в тихом районе Борисова, рядом с городскими удобствами. Его можно арендовать посуточно или на длительный срок для семейного отдыха, встречи с друзьями или камерного события.</p><Link href="/about">Посмотреть комнаты <ArrowUpRight /></Link></Reveal>
        <div className="image-duet">
          <Reveal className="duet-a"><Image src="/images/customer-updates/dining-table-setting.jpg" fill alt="Сервированный стол в Доме на Южной" sizes="55vw" /></Reveal>
          <Reveal className="duet-b" delay={.15}><Image src="/images/DKsDidmIIvD-6.jpg" fill alt="Купель Фурако и зона отдыха" sizes="35vw" /></Reveal>
          <div className="floating-note">Дом. Терраса.<br />Купель.</div>
        </div>
      </section>

      <section className="numbers">
        <Chapter index="02" label="Вместимость и удобства" />
        <div className="number-grid">
          {[["10", "спальных мест"], ["04", "отдельные спальни"], ["02", "ванные комнаты"], ["38–42°", "температура Фурако"]].map(([n, t], i) => (
            <Reveal key={n} delay={i * .08}><strong>{n}</strong><span>{t}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="feature-frame">
        <Image src="/images/DKsDidmIIvD-4.jpg" fill alt="Горячая купель Фурако и шезлонги" sizes="100vw" />
        <div className="feature-card glass-panel"><span>ФУРАКО / 03</span><h2>Горячая вода.<br />Свежий воздух.</h2><p>Купель нагревается до 38–42 °C, имеет джакузи-функцию и сохраняет комфортную температуру до четырёх часов.</p><Link href="/amenities">Все удобства дома <ArrowUpRight /></Link></div>
      </section>

      <section className="testimonial">
        <span>Отзывы гостей</span>
        <blockquote>«Дом вживую даже лучше, чем на фото. Оснащён всем, что может понадобиться для жизни».</blockquote>
        <p>Александра · оценка 5 из 5</p>
        <Link href="/reviews">Читать все отзывы <ArrowUpRight /></Link>
      </section>

      <section className="home-gallery editorial">
        <Chapter index="04" label="Фотографии дома" />
        <div className="gallery-heading"><h2>Комнаты, терраса<br /><em>и пространство для отдыха.</em></h2><Link href="/gallery">Открыть галерею <ArrowUpRight /></Link></div>
        <div className="strip">
          {["customer-updates/kitchen-bright-vertical.jpg", "DEXszpDomze-6.jpg", "customer-updates/terrace-canopy.jpg"].map((src, i) => <div key={src} className={`strip-${i + 1}`}><Image src={`/images/${src}`} fill alt="Интерьер, терраса и зоны отдыха Дома на Южной" sizes="40vw" /></div>)}
        </div>
      </section>

      <BookingBand />
    </>
  );
}
