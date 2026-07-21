"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";

const links = [
  ["Дом", "/about"],
  ["Галерея", "/gallery"],
  ["Услуги", "/amenities"],
  ["Цены", "/prices"],
  ["Отзывы", "/reviews"],
  ["Расположение", "/location"],
  ["Контакты", "/contact"]
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("dom-na-yuzhnoy-loaded")) {
        setLoaded(true);
        return;
      }
    } catch {
      setLoaded(true);
      return;
    }
    const timer = setTimeout(() => {
      setLoaded(true);
      try {
        window.sessionStorage.setItem("dom-na-yuzhnoy-loaded", "true");
      } catch {
        // The loader is decorative; blocked storage must not affect navigation.
      }
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence>
        {!loaded && (
          <motion.div className="loader" exit={{ y: "-100%" }} transition={{ duration: .9, ease: [0.76, 0, 0.24, 1] }}>
            <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }}>
              <Logo variant="light" className="loader-logo" priority />
            </motion.div>
            <div className="loader-line"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1 }} /></div>
            <small>Готовим всё к вашему приезду</small>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="contact-bar">
        <div className="contact-bar-inner">
          <a href="tel:+375296479387"><Phone /> <span>+375 29 647-93-87</span></a>
          <SocialLinks className="header-socials" />
        </div>
      </div>
      <header className="nav-shell">
        <Link href="/" className="brand" aria-label="Дом на Южной — главная">
          <Logo variant="light" className="nav-logo" priority />
        </Link>
        <nav className="desktop-nav">
          {links.map(([label, href]) => <Link prefetch key={href} className={pathname === href ? "active" : ""} href={href}>{label}</Link>)}
        </nav>
        <Link href="/booking" className="reserve magnetic">Забронировать <ArrowUpRight size={14} /></Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Закрыть меню" : "Открыть меню"}>{open ? <X /> : <Menu />}</button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="menu-panel" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: .7, ease: [0.76, 0, 0.24, 1] }}>
            <div className="menu-index">МЕНЮ / 09</div>
            <div className="menu-links">
              {[["Главная", "/"], ...links, ["Бронирование", "/booking"]].map(([label, href], i) => (
                <motion.div key={href} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .15 + i * .05 }}>
                  <Link href={href} onClick={() => setOpen(false)}><sup>0{i + 1}</sup>{label}</Link>
                </motion.div>
              ))}
            </div>
            <p>Борисов, ул. Южная, 12А<br />Около 70 км от Минска</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .28 }}>
        {children}
      </motion.main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div><Logo variant="light" className="footer-logo" /><p>Уютный дом для отдыха<br />с близкими людьми.</p></div>
        <div><small>Разделы</small>{links.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}</div>
        <div><small>Бронирование</small><a href="tel:+375296479387">+375 29 647-93-87</a><SocialLinks className="footer-socials" /></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Дом на Южной</span><span>Борисов · Южная улица, 12А</span><span>Круглосуточно · По предварительной брони</span></div>
    </footer>
  );
}
