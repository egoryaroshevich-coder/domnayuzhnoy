import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { GalleryClient } from "@/components/GalleryClient";
import { BookingBand, PageHero } from "@/components/UI";

export const metadata = { title: "Галерея Дома на Южной", description: "Фотографии дома, новой бани, спален, кухни, террасы, BBQ-зоны и купели Фурако в Доме на Южной." };

export default function Gallery() {
  return <>
    <section className="video-tour">
      <Image src="/images/album/album-29.jpg" fill alt="Дом на Южной среди зелени" sizes="100vw" />
      <div className="hero-shade" />
      <div><span>Видеообзор дома</span><h2>Прогуляйтесь по дому<br />до своего приезда.</h2><a className="video-play-link" href="https://vt.tiktok.com/ZSQ4QLona/" target="_blank" rel="noreferrer" aria-label="Открыть видеообзор Дома на Южной в ТикТок"><Play fill="currentColor" /></a></div>
    </section>
    <PageHero eyebrow="Галерея / 04" title="Посмотрите, как устроен Дом на Южной." text="Внутри: гостиная, кухня и спальни. Во дворе: новая баня, терраса, BBQ-зона и горячая купель." image="/images/album/sauna-01.jpg" />
    <section className="gallery-page editorial"><GalleryClient /></section>
    <section className="tour-cta"><span>Свежие фотографии и видео</span><h2>Следите за жизнью<br />Дома на Южной.</h2><Link href="https://www.instagram.com/dom_na_yuzhnoy/" target="_blank" rel="noreferrer"><span>Открыть<br />Инстаграм</span><ArrowUpRight /></Link></section>
    <BookingBand />
  </>;
}
