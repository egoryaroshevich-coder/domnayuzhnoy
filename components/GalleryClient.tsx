"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GalleryCategory =
  | "exterior"
  | "bedrooms"
  | "living"
  | "kitchen"
  | "grounds"
  | "bath"
  | "relaxation";

type GalleryItem = {
  file: string;
  category: GalleryCategory;
  categoryLabel: string;
  caption: string;
  alt: string;
  shape?: "portrait" | "landscape" | "standard";
};

const shots: GalleryItem[] = [
  ["album-03.jpg", "grounds", "BBQ-зона", "Дом для отдыха", "Терраса, купель Фурако и Дом на Южной", "landscape"],
  ["album-04.jpg", "bath", "Купель", "Купель рядом с террасой", "Купель Фурако рядом с террасой", "portrait"],
  ["album-29.jpg", "exterior", "Дом снаружи", "Дом среди зелени", "Внешний вид Дома на Южной в Борисове", "landscape"],
  ["album-36.jpg", "grounds", "BBQ-зона", "Место для долгого вечера", "Уютная терраса с шезлонгами", "portrait"],
  ["album-24.jpg", "bath", "Купель", "Горячая вода под открытым небом", "Уличная купель Фурако", "standard"],
  ["album-22.jpg", "kitchen", "Кухня", "Всё для домашних ужинов", "Оборудованная кухня Дома на Южной", "landscape"],
  ["album-38.jpg", "bedrooms", "Спальни", "Тихое утро в доме", "Светлая спальня для гостей", "portrait"],
  ["album-08.jpg", "living", "Гостиная", "Пространство для праздника", "Празднично оформленная гостиная", "landscape"],
  ["album-01.jpg", "relaxation", "Зона отдыха", "Отдых на свежем воздухе", "Купель и шезлонги на деревянной террасе", "portrait"],
  ["album-30.jpg", "exterior", "Дом снаружи", "Архитектура для отдыха", "Боковой фасад Дома на Южной", "standard"],
  ["album-31.jpg", "grounds", "BBQ-зона", "Зелёный двор для отдыха", "Шезлонги в зелёном дворе", "landscape"],
  ["album-35.jpg", "kitchen", "Кухня", "Уютная кухня", "Кухня и обеденная зона", "portrait"],
  ["album-02.jpg", "grounds", "BBQ-зона", "Терраса за лёгкими шторами", "Терраса с мягкими шторами", "portrait"],
  ["album-05.jpg", "living", "Гостиная", "Сервировка для особого дня", "Праздничная сервировка в гостиной", "landscape"],
  ["album-06.jpg", "bath", "Купель", "Летнее настроение", "Купель с надувным фламинго", "standard"],
  ["album-07.jpg", "relaxation", "Зона отдыха", "Мы рады вашим питомцам", "Зона отдыха рядом с купелью", "portrait"],
  ["album-09.jpg", "living", "Гостиная", "Дом, готовый к торжеству", "Праздничное оформление гостиной", "standard"],
  ["album-10.jpg", "living", "Гостиная", "Вечер за общим столом", "Гостиная с праздничным столом", "portrait"],
  ["album-11.jpg", "living", "Гостиная", "Всё готово к встрече гостей", "Банкетный стол в гостиной", "landscape"],
  ["album-12.jpg", "exterior", "Дом снаружи", "Праздник начинается у входа", "Украшенный вход в Дом на Южной", "portrait"],
  ["album-13.jpg", "bath", "Купель", "Купель в вечернем свете", "Купель Фурако с фиолетовой подсветкой", "landscape"],
  ["album-15.jpg", "bath", "Купель", "Вечер у купели", "Зона отдыха рядом с купелью", "standard"],
  ["album-17.jpg", "relaxation", "Зона отдыха", "Отдых рядом с купелью", "Зона отдыха у купели", "portrait"],
  ["album-18.jpg", "bedrooms", "Спальни", "Комната для спокойного сна", "Гостевая спальня Дома на Южной", "standard"],
  ["album-19.jpg", "grounds", "BBQ-зона", "Воздух и пространство", "Терраса и купель рядом с домом", "portrait"],
  ["album-20.jpg", "exterior", "Дом снаружи", "Дом в тихом районе Борисова", "Фасад дома и зелёный двор", "landscape"],
  ["album-21.jpg", "living", "Гостиная", "Большой праздничный стол", "Банкет в гостиной Дома на Южной", "portrait"],
  ["album-26.jpg", "relaxation", "Зона отдыха", "Отдых у купели", "Зона купели Фурако", "landscape"],
  ["album-27.jpg", "bath", "Купель", "Всё подготовлено к отдыху", "Купель Фурако и банные халаты", "portrait"],
  ["album-32.jpg", "living", "Гостиная", "Светлая обеденная зона", "Обеденная зона столовой и гостиной", "landscape"],
  ["album-33.jpg", "kitchen", "Кухня", "Удобная кухня для компании", "Кухонная зона с техникой", "portrait"],
  ["album-34.jpg", "relaxation", "Зона отдыха", "Уютная пауза на террасе", "Зона отдыха на террасе", "standard"],
  ["album-37.jpg", "grounds", "BBQ-зона", "Купель среди зелени", "Купель Фурако в зелёном дворе", "portrait"],
  ["album-39.jpg", "kitchen", "Кухня", "Кухня с выходом на террасу", "Кухня и дверь на террасу", "landscape"]
].map(([file, category, categoryLabel, caption, alt, shape]) => ({
  file,
  category: category as GalleryCategory,
  categoryLabel,
  caption,
  alt,
  shape: shape as GalleryItem["shape"]
}));

const filters: Array<[GalleryCategory | "all", string]> = [
  ["all", "Все"],
  ["exterior", "Дом снаружи"],
  ["bedrooms", "Спальни"],
  ["living", "Гостиная"],
  ["kitchen", "Кухня"],
  ["grounds", "BBQ-зона"],
  ["bath", "Купель"],
  ["relaxation", "Зона отдыха"]
];

export function GalleryClient() {
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [active, setActive] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => shots.filter((shot) => filter === "all" || shot.category === filter),
    [filter]
  );

  const close = useCallback(() => setActive(null), []);
  const previous = useCallback(() => {
    setActive((current) => current === null ? null : (current - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);
  const next = useCallback(() => {
    setActive((current) => current === null ? null : (current + 1) % filtered.length);
  }, [filtered.length]);

  useEffect(() => {
    if (active === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [active, close, next, previous]);

  useEffect(() => {
    if (active === null) return;
    thumbsRef.current
      ?.querySelector<HTMLButtonElement>(`[data-gallery-index="${active}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const selectFilter = (value: GalleryCategory | "all") => {
    setFilter(value);
    setActive(null);
  };

  return (
    <>
      <div className="gallery-filters" aria-label="Категории фотографий">
        {filters.map(([key, label]) => (
          <button
            type="button"
            className={filter === key ? "active" : ""}
            onClick={() => selectFilter(key)}
            key={key}
          >
            {label}<span>{key === "all" ? shots.length : shots.filter((shot) => shot.category === key).length}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="gallery-masonry">
        <AnimatePresence mode="popLayout">
          {filtered.map((shot, index) => (
            <motion.button
              type="button"
              aria-label={`Открыть фото: ${shot.categoryLabel}`}
              className={`gallery-card gallery-card-${shot.shape ?? "standard"}`}
              layout
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: .96 }}
              transition={{ duration: .55, delay: Math.min(index * .025, .3) }}
              key={shot.file}
              onClick={() => setActive(index)}
            >
              <Image
                src={`/images/album/${shot.file}`}
                fill
                alt={shot.alt}
                loading="lazy"
                quality={82}
                sizes="(max-width: 680px) 94vw, (max-width: 1000px) 48vw, 32vw"
              />
              <span className="gallery-card-shade" />
              <span className="gallery-card-copy">
                <small>{shot.categoryLabel}</small>
              </span>
              <span className="gallery-card-open"><Maximize2 size={15} /></span>
              <span className="gallery-card-number">{String(index + 1).padStart(2, "0")}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active !== null && filtered[active] && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Полноэкранный просмотр галереи"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="gallery-lightbox-top">
              <span>{filtered[active].categoryLabel}</span>
              <span>{String(active + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}</span>
              <button type="button" onClick={close} aria-label="Закрыть полноэкранный просмотр"><X /></button>
            </div>

            <button type="button" className="gallery-lightbox-prev" onClick={previous} aria-label="Предыдущее изображение"><ArrowLeft /></button>
            <motion.div
              className="gallery-lightbox-stage"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={.18}
              onDragEnd={(_, info) => {
                if (info.offset.x > 60) previous();
                if (info.offset.x < -60) next();
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  className="gallery-lightbox-image"
                  key={filtered[active].file}
                  initial={{ opacity: 0, scale: .96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: .35 }}
                >
                  <Image
                    src={`/images/album/${filtered[active].file}`}
                    fill
                    priority
                    quality={88}
                    alt={filtered[active].alt}
                    sizes="95vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <button type="button" className="gallery-lightbox-next" onClick={next} aria-label="Следующее изображение"><ArrowRight /></button>

            <div className="gallery-lightbox-bottom">
              <div className="gallery-lightbox-caption">
                <small>Листайте свайпом, миниатюрами или стрелками</small>
              </div>
              <div className="gallery-lightbox-thumbs" ref={thumbsRef} aria-label="Миниатюры галереи">
                {filtered.map((shot, index) => (
                  <button
                    type="button"
                    data-gallery-index={index}
                    className={index === active ? "active" : ""}
                    aria-label={`Показать фото ${index + 1}: ${shot.categoryLabel}`}
                    aria-current={index === active ? "true" : undefined}
                    onClick={() => setActive(index)}
                    key={shot.file}
                  >
                    <Image src={`/images/album/${shot.file}`} fill alt="" loading="lazy" sizes="68px" quality={55} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
