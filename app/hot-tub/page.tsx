import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, Check, Flame, Sparkles, ThermometerSun, Users } from "lucide-react";
import { BookingBand, Chapter, PageHero, Reveal } from "@/components/UI";

export const metadata: Metadata = {
  title: "Купель Фурако в Борисове",
  description: "Горячая купель Фурако в Доме на Южной: вода 38–42 °C, джакузи-функция, отдых до 6 человек и стоимость от 150 BYN."
};

const hotTubGallery = [
  ["album-24.jpg", "Горячая вода в купели Фурако"],
  ["album-13.jpg", "Купель с подсветкой в зимний вечер"],
  ["album-04.jpg", "Купель на террасе под навесом"],
  ["album-27.jpg", "Купель и банные халаты для гостей"],
  ["album-15.jpg", "Вечерняя подсветка купели"],
  ["sauna-07.jpg", "Купель рядом с деревянной баней"]
];

export default function HotTubPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Купель Фурако в Доме на Южной",
    description: "Горячая купель Фурако с джакузи-функцией для отдыха до шести человек в Борисове.",
    provider: { "@type": "VacationRental", name: "Дом на Южной" },
    offers: [
      { "@type": "Offer", name: "Купель для двоих", price: 150, priceCurrency: "BYN" },
      { "@type": "Offer", name: "Купель для компании до четырёх человек", price: 200, priceCurrency: "BYN" },
      { "@type": "Offer", name: "Купель для компании больше четырёх человек", price: 250, priceCurrency: "BYN" },
      { "@type": "Offer", name: "Баня с купелью", price: 400, priceCurrency: "BYN" }
    ]
  };

  return (
    <div className="sauna-page hot-tub-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHero
        eyebrow="Купель / 03"
        title="Горячая вода. Открытое небо."
        text="Купель Фурако нагревается до 38–42 °C и вмещает до шести человек. Отдельно — от 150 BYN, вместе с баней — 400 BYN."
        image="/images/album/album-04.jpg"
      />

      <section className="sauna-intro editorial">
        <Chapter index="01" label="Отдых под открытым небом" />
        <div className="sauna-intro-grid">
          <Reveal className="sauna-intro-copy">
            <span>Тёплая вода в любое время года</span>
            <h2>Вечер начинается<br /><em>с тёплой воды.</em></h2>
            <p>Купель находится на закрытой террасе рядом с домом и баней. Встроенная печь нагревает воду до комфортной температуры, а утеплённая чаша помогает сохранять тепло до четырёх часов.</p>
            <p>Можно выбрать спокойный отдых под открытым небом или включить джакузи-функцию. Купель бронируется отдельно от дома и бани — добавьте её на нужном шаге оформления заявки.</p>
            <Link href="/booking">Выбрать даты <ArrowUpRight /></Link>
          </Reveal>
          <Reveal className="sauna-intro-image hot-tub-intro-image" delay={0.12}>
            <Image src="/images/album/album-24.jpg" fill alt="Горячая купель Фурако под открытым небом" sizes="(max-width: 900px) 100vw, 52vw" />
            <span>Фурако на террасе<br />рядом с домом</span>
          </Reveal>
        </div>
      </section>

      <section className="sauna-details hot-tub-details">
        <article><ThermometerSun /><span>01</span><h3>38–42 °C</h3><p>Комфортную температуру воды согласуем и подготовим к вашему приезду.</p></article>
        <article><Users /><span>02</span><h3>До 6 человек</h3><p>В чаше достаточно места для пары, семьи или небольшой компании друзей.</p></article>
        <article><Sparkles /><span>03</span><h3>Джакузи-функция</h3><p>Пузырьки и мягкий массаж помогают расслабиться после насыщенного дня.</p></article>
      </section>

      <section className="sauna-rates editorial">
        <div className="sauna-rates-heading">
          <span>Стоимость</span>
          <h2>Выберите<br /><em>свой формат.</em></h2>
          <p>Стоимость отдельной купели зависит от количества гостей. Для полного банного вечера можно забронировать единый комплекс.</p>
        </div>
        <div className="sauna-rate-grid">
          <article>
            <Bath />
            <small>Купель отдельно</small>
            <strong>от 150 <span>BYN</span></strong>
            <p><Check /> Для двоих — 150 BYN</p>
            <p><Check /> Для компании до 4 человек — 200 BYN</p>
            <p><Check /> Для компании больше 4 человек — 250 BYN</p>
            <p><Check /> Второй и следующие дни без замены воды — 80 BYN</p>
            <Link href="/booking">Забронировать купель <ArrowUpRight /></Link>
          </article>
          <article className="sauna-rate-featured">
            <Flame />
            <small>Баня + купель</small>
            <strong>400 <span>BYN</span></strong>
            <p><Check /> Единая стоимость комплекса</p>
            <p><Check /> Баня без ограничения по времени</p>
            <p><Check /> Горячая купель Фурако</p>
            <Link href="/booking">Забронировать комплекс <ArrowUpRight /></Link>
          </article>
        </div>
      </section>

      <section className="hot-tub-evening">
        <Image src="/images/album/album-13.jpg" fill alt="Купель Фурако с подсветкой зимним вечером" sizes="100vw" />
        <div className="hero-shade" />
        <div>
          <Bath />
          <span>Тёплая вода в любую погоду</span>
          <h2>Вечером купель становится<br />центром отдыха.</h2>
          <p>Летом — свежий воздух и зелень вокруг. Зимой — горячая вода, пар и мягкая подсветка на фоне снега.</p>
        </div>
      </section>

      <section className="sauna-gallery editorial">
        <Chapter index="02" label="Фотографии купели" />
        <div className="sauna-gallery-heading">
          <h2>Днём, вечером<br /><em>и зимой.</em></h2>
          <p>Купель находится на отдельной террасе рядом с баней. Пространство закрыто от посторонних взглядов и подготовлено для спокойного отдыха.</p>
        </div>
        <div className="sauna-gallery-grid hot-tub-gallery-grid">
          {hotTubGallery.map(([src, alt], index) => (
            <Reveal className={`sauna-gallery-item sauna-gallery-item-${index + 1}`} delay={(index % 3) * 0.07} key={src}>
              <Image src={`/images/album/${src}`} fill alt={alt} sizes="(max-width: 680px) 100vw, 34vw" />
            </Reveal>
          ))}
        </div>
        <Link className="sauna-gallery-link" href="/gallery">Все фотографии <ArrowUpRight /></Link>
      </section>

      <BookingBand />
    </div>
  );
}
