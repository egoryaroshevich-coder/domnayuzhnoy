"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: .9, delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

export function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: string; text: string; image: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  return (
    <section className="page-hero" ref={ref}>
      <motion.div className="page-hero-image" style={{ y }}><Image src={image} fill priority alt={title} sizes="100vw" /></motion.div>
      <div className="hero-shade" />
      <div className="page-hero-copy">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }}>{eyebrow}</motion.span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <ArrowDownRight className="page-hero-arrow" />
    </section>
  );
}

export function Chapter({ index, label }: { index: string; label: string }) {
  return <div className="chapter"><span>{index}</span><p>{label}</p></div>;
}

export function BookingBand() {
  return (
    <section className="booking-band">
      <span>Дом, баня и купель по предварительной брони</span>
      <h2>Запланируйте отдых<br /><em>в Доме на Южной.</em></h2>
      <Link href="/booking" className="circle-link magnetic">Узнать<br />свободные<br />даты <ArrowUpRight /></Link>
    </section>
  );
}
