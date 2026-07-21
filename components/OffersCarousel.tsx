"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export type Offer = {
  value: string;
  title: string;
  text: string;
  image: string;
};

export function OffersCarousel({ offers }: { offers: Offer[] }) {
  const [active, setActive] = useState(0);
  const offer = offers[active];

  const goTo = (index: number) => {
    setActive((index + offers.length) % offers.length);
  };

  return (
    <div className="offers-carousel" aria-label="Акции Дома на Южной">
      <div className="offers-carousel-stage" aria-live="polite">
        <div className="offer-carousel-image">
          <Image
            src={`/images/${offer.image}`}
            fill
            alt={`Акция: ${offer.title}`}
            sizes="(max-width: 800px) 92vw, 50vw"
            priority={active === 0}
          />
        </div>
        <article className="offer-carousel-card">
          <span>{String(active + 1).padStart(2, "0")} / {String(offers.length).padStart(2, "0")}</span>
          <strong>{offer.value}</strong>
          <h3>{offer.title}</h3>
          <p>{offer.text}</p>
          <Link href="/booking">Уточнить условия <ArrowUpRight /></Link>
        </article>
      </div>

      <div className="offers-carousel-controls">
        <div className="offers-carousel-arrows" aria-label="Листать акции">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Предыдущая акция">
            <ArrowLeft />
          </button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Следующая акция">
            <ArrowRight />
          </button>
        </div>
        <div className="offers-carousel-tabs" aria-label="Выбрать акцию">
          {offers.map((item, index) => (
            <button
              type="button"
              key={item.title}
              onClick={() => goTo(index)}
              className={index === active ? "active" : ""}
              aria-pressed={index === active}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
