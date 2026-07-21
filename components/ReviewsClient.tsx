"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Quote, Star } from "lucide-react";
import { useMemo, useState } from "react";

export type Review = {
  author: string;
  date: string;
  rating: number;
  source?: string;
  text: string;
  accent: string;
};

export type ReviewsData = {
  source: { name: string; url: string; updatedAt: string };
  extraSources?: Array<{ name: string; url: string; label: string }>;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  collectionCount: number;
  items: Review[];
};

const ratingFilters = ["Все", "5", "4", "3", "2", "1"];

export function ReviewsClient({ data }: { data: ReviewsData }) {
  const [filter, setFilter] = useState("Все");
  const reviews = useMemo(
    () => [...data.items].sort((first, second) => second.rating - first.rating),
    [data.items]
  );
  const filtered = useMemo(
    () => filter === "Все" ? reviews : reviews.filter((review) => review.rating === Number(filter)),
    [filter, reviews]
  );

  return (
    <>
      <section className="reviews-summary editorial">
        <div className="reviews-score">
          <small>Рейтинг гостей</small>
          <strong>{String(data.rating).replace(".", ",")}</strong>
          <div aria-label={`Рейтинг ${String(data.rating).replace(".", ",")} из 5`}>
            {Array.from({ length: 5 }, (_, index) => <Star key={index} fill="currentColor" />)}
          </div>
          <p>{data.ratingCount} оценок · {data.collectionCount} отзывов в подборке</p>
        </div>
        <div className="reviews-trust-copy">
          <span>Отзывы из разных источников</span>
          <h2>Впечатления людей,<br /><em>которые уже были в доме.</em></h2>
          <p>В подборке собраны дословные выдержки из открытых отзывов на Яндекс Картах и Kufar Путешествиях. Instagram-highlight оставлен как дополнительный источник.</p>
          <a href={data.source.url} target="_blank" rel="noreferrer">
            Открыть отзывы на Яндекс Картах <ExternalLink />
          </a>
          {data.extraSources?.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.name}>
              {source.label} <ExternalLink />
            </a>
          ))}
          <small className="reviews-updated">Данные обновлены: {data.source.updatedAt.split("-").reverse().join(".")}</small>
        </div>
      </section>

      <section className="reviews-list-section editorial">
        <div className="reviews-list-heading">
          <div><span>Отзывы гостей</span><h2>Спокойно. Честно.<br />Из первых рук.</h2></div>
          <div className="review-filters" aria-label="Фильтр отзывов по оценке">
            {ratingFilters.map((rating) => (
              <button type="button" key={rating} onClick={() => setFilter(rating)} className={filter === rating ? "active" : ""}>
                {rating === "Все" ? "Все" : <>{rating} <Star fill="currentColor" /></>}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="review-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((review, index) => (
              <motion.article
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: .96 }}
                transition={{ delay: index * .05 }}
                key={`${review.author}-${review.date}`}
              >
                <Quote />
                <div className="review-card-stars">
                  {review.rating > 0
                    ? Array.from({ length: review.rating }, (_, star) => <Star key={star} fill="currentColor" />)
                    : <span>Без числовой оценки</span>}
                </div>
                <h3>{review.accent}</h3>
                <p>{review.text}</p>
                <footer>
                  <strong>{review.author}</strong>
                  <span>{review.source ? `${review.date} · ${review.source}` : review.date}</span>
                </footer>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {!filtered.length && (
          <motion.div className="review-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Star />
            <h3>Отзывов с такой оценкой пока нет</h3>
            <p>Выберите другую оценку или вернитесь ко всем отзывам.</p>
            <button type="button" onClick={() => setFilter("Все")}>Показать все отзывы</button>
          </motion.div>
        )}
      </section>
    </>
  );
}
