import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, Check, Clock3, Flame, Leaf } from "lucide-react";
import { BookingBand, Chapter, PageHero, Reveal } from "@/components/UI";

export const metadata: Metadata = {
  title: "Баня в Борисове",
  description: "Деревянная баня в Доме на Южной: 250 BYN без ограничения по времени или 400 BYN в комплексе с горячей купелью."
};

const videos = [
  { src: "/videos/sauna/exterior.m4v", poster: "/images/album/sauna-01.jpg", label: "Баня снаружи" },
  { src: "/videos/sauna/steam-room.m4v", poster: "/images/album/sauna-03.jpg", label: "Парная" },
  { src: "/videos/sauna/table.m4v", poster: "/images/album/sauna-05.jpg", label: "Комната отдыха" }
];

const saunaGallery = [
  ["sauna-03.jpg", "Парная с печью и дубовыми вениками"],
  ["sauna-02.jpg", "Комната отдыха в деревянной бане"],
  ["sauna-07.jpg", "Горячая купель рядом с баней"],
  ["sauna-04.jpg", "Деревянные полки в парной"],
  ["sauna-05.jpg", "Угощения на столе в комнате отдыха"],
  ["sauna-08.jpg", "Плетёные тапочки для гостей бани"]
];

export default function SaunaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Баня в Доме на Южной",
    description: "Деревянная баня с парной и комнатой отдыха в Борисове.",
    provider: { "@type": "VacationRental", name: "Дом на Южной" },
    offers: [
      { "@type": "Offer", name: "Баня без купели", price: 250, priceCurrency: "BYN" },
      { "@type": "Offer", name: "Баня с купелью", price: 400, priceCurrency: "BYN" }
    ]
  };

  return (
    <div className="sauna-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHero
        eyebrow="Баня / 02"
        title="Тёплый пар. Долгий вечер."
        text="Отдельная деревянная баня с парной и комнатой отдыха. Без ограничения по времени — 250 BYN, вместе с купелью — 400 BYN."
        image="/images/album/sauna-01.jpg"
      />

      <section className="sauna-intro editorial">
        <Chapter index="01" label="Новая зона отдыха" />
        <div className="sauna-intro-grid">
          <Reveal className="sauna-intro-copy">
            <span>Тепло дерева и живой пар</span>
            <h2>Сначала тепло.<br /><em>Потом тишина.</em></h2>
            <p>Парная находится в отдельном деревянном строении рядом с террасой. Внутри есть всё для банного вечера: удобные полки, печь, веники и светлая комната отдыха с большим столом.</p>
            <Link href="/booking">Выбрать даты <ArrowUpRight /></Link>
          </Reveal>
          <Reveal className="sauna-intro-image" delay={.12}>
            <Image src="/images/album/sauna-03.jpg" fill alt="Интерьер парной в Доме на Южной" sizes="(max-width: 900px) 100vw, 52vw" />
            <span>Новая баня<br />в Доме на Южной</span>
          </Reveal>
        </div>
      </section>

      <section className="sauna-details">
        <article><Flame /><span>01</span><h3>Деревянная парная</h3><p>Тёплые деревянные стены, удобные полки, печь и дубовые веники.</p></article>
        <article><Leaf /><span>02</span><h3>Комната отдыха</h3><p>Отдельное пространство с большим столом для спокойного отдыха между заходами.</p></article>
        <article><Clock3 /><span>03</span><h3>Без ограничения по времени</h3><p>Баню можно забронировать за 250 BYN и не следить за часами.</p></article>
      </section>

      <section className="sauna-rates editorial">
        <div className="sauna-rates-heading">
          <span>Стоимость</span>
          <h2>Два формата.<br /><em>Один вечер для себя.</em></h2>
          <p>Выберите только баню или дополните отдых горячей купелью Фурако.</p>
        </div>
        <div className="sauna-rate-grid">
          <article>
            <Flame />
            <small>Баня без купели</small>
            <strong>250 <span>BYN</span></strong>
            <p><Check /> Без ограничения по времени</p>
            <p><Check /> Парная и комната отдыха</p>
            <Link href="/booking">Забронировать <ArrowUpRight /></Link>
          </article>
          <article className="sauna-rate-featured">
            <Bath />
            <small>Баня + купель</small>
            <strong>400 <span>BYN</span></strong>
            <p><Check /> Единая стоимость комплекса</p>
            <p><Check /> Баня и горячая купель Фурако</p>
            <Link href="/booking">Забронировать комплекс <ArrowUpRight /></Link>
          </article>
        </div>
      </section>

      <section className="sauna-gallery editorial">
        <Chapter index="02" label="Фотографии бани" />
        <div className="sauna-gallery-heading">
          <h2>Посмотрите<br /><em>все детали.</em></h2>
          <p>Парная, комната отдыха и купель находятся рядом, поэтому легко собрать свой сценарий вечера.</p>
        </div>
        <div className="sauna-gallery-grid">
          {saunaGallery.map(([src, alt], index) => (
            <Reveal className={`sauna-gallery-item sauna-gallery-item-${index + 1}`} delay={(index % 3) * .07} key={src}>
              <Image src={`/images/album/${src}`} fill alt={alt} sizes="(max-width: 680px) 100vw, 34vw" />
            </Reveal>
          ))}
        </div>
        <Link className="sauna-gallery-link" href="/gallery">Все фотографии <ArrowUpRight /></Link>
      </section>

      <section className="sauna-videos editorial">
        <div className="sauna-videos-heading"><span>Видео / 03</span><h2>Загляните внутрь<br /><em>до приезда.</em></h2></div>
        <div className="sauna-video-grid">
          {videos.map((video) => (
            <figure key={video.src}>
              <video controls playsInline preload="metadata" poster={video.poster} aria-label={video.label}>
                <source src={video.src} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              <figcaption>{video.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <BookingBand />
    </div>
  );
}
