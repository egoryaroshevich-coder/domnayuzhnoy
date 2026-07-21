import Image from "next/image";
import { ArrowUpRight, Building2, Clock3, MapPin, Route } from "lucide-react";
import { BookingBand, PageHero, Reveal } from "@/components/UI";

export const metadata = { title: "Расположение", description: "Дом на Южной находится по адресу: Беларусь, Минская область, Борисов, улица Южная, 12А. Около 70 км от Минска." };

const distances = [
  [Route, "≈ 70 км", "от Минска"],
  [Building2, "Борисов", "городские удобства рядом"],
  [Clock3, "По брони", "заезд согласовывается заранее"],
  [MapPin, "12А", "улица Южная"]
];

export default function Location() {
  return <>
    <PageHero eyebrow="Расположение / 05" title="В центре Борисова. В тихом районе." text="Минская область, Борисов, улица Южная, 12А. Около 70 километров от Минска." image="/images/DEXe4w0oUmD-2.jpg" />
    <section className="location-mood">
      <div className="location-mood-image"><Image src="/images/DEXe4w0oUmD-3.jpg" fill alt="Дом на Южной и терраса" sizes="50vw" /></div>
      <Reveal><span>Тихий городской район</span><h2>Спокойная улица.<br />Всё нужное<br />остаётся рядом.</h2><p>Дом расположен в тихом и безопасном районе Борисова. Гости получают приватное пространство для отдыха, не отказываясь от удобства городской инфраструктуры.</p></Reveal>
    </section>
    <section className="distance-section editorial">
      <span>Проверенные ориентиры</span>
      <div className="distance-grid">{distances.map(([Icon,time,label],i) => <Reveal key={label as string} delay={i*.05}><Icon /><span>0{i+1}</span><strong>{time as string}</strong><p>{label as string}</p></Reveal>)}</div>
    </section>
    <section className="route-section editorial">
      <div><span>Как добраться из Минска</span><h2>Простой маршрут<br />до Южной, 12А.</h2></div>
      <ol>
        <li><strong>1</strong><p>Выезжайте из Минска по трассе М1 в сторону Борисова.</p></li>
        <li><strong>2</strong><p>На подъезде к Борисову следуйте по указателям в город и постройте маршрут до улицы Южной, 12А.</p></li>
        <li><strong>3</strong><p>Перед выездом откройте Яндекс Карты: они покажут актуальную дорогу и время в пути.</p></li>
      </ol>
    </section>
    <section className="map-embed-section editorial">
      <div className="map-embed-copy"><span>Яндекс Карты</span><h2>Южная улица, 12А.</h2><p>Ниже встроена обычная интерактивная карта. Можно приблизить район, открыть маршрут и перейти в карточку Дома на Южной.</p><a href="https://yandex.by/maps/org/dom_na_yuzhnoy/101450404971/" target="_blank" rel="noreferrer">Открыть в Яндекс Картах <ArrowUpRight /></a></div>
      <div className="yandex-map-frame">
        <iframe title="Дом на Южной на Яндекс Картах" src="https://yandex.by/map-widget/v1/?ll=28.498962%2C54.221906&mode=search&oid=101450404971&ol=biz&z=15" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
    <BookingBand />
  </>;
}
