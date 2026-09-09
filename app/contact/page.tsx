"use client";

import { ArrowUpRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { SocialLinks } from "@/components/SocialLinks";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="contact-page">
      <section className="contact-intro">
        <span>Контакты / 07</span>
        <h1>Связь<br />и <em>бронирование.</em></h1>
        <p>Чтобы узнать свободные даты, стоимость и условия отдыха, свяжитесь с владельцами Дома на Южной по телефону, через Инстаграм или ТикТок.</p>
        <div>
          <a href="tel:+375296479387">+375 29 647-93-87 <ArrowUpRight /></a>
          <SocialLinks className="contact-socials" />
        </div>
      </section>
      <section className="contact-form">
        {sent ? (
          <div className="form-success">
            <span>✓</span>
            <h2>Готово.</h2>
            <p>Форма заполнена. Для отправки сообщения владельцам свяжитесь с ними по телефону или через официальные социальные сети.</p>
            <button onClick={() => setSent(false)}>Отправить ещё одно сообщение</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="field"><label>Ваше имя</label><input required placeholder="Как к вам обращаться?" /></div>
            <div className="field"><label>Электронная почта</label><input required type="email" placeholder="вашадрес@почта.рф" /></div>
            <div className="field"><label>Телефон / мессенджер</label><input placeholder="+375 29 000-00-00" /></div>
            <div className="field">
              <label>Формат поездки</label>
              <select>
                <option>Уединённый отдых</option>
                <option>Баня</option>
                <option>Баня с купелью</option>
                <option>Отдых для пары</option>
                <option>Семейная встреча</option>
                <option>День рождения</option>
                <option>Свадьба / камерное торжество</option>
                <option>Камерное торжество</option>
                <option>Отдых с питомцем</option>
                <option>Долгосрочная аренда</option>
              </select>
            </div>
            <div className="field"><label>Ваше сообщение</label><textarea required rows={4} placeholder="Расскажите, что вы задумали..." /></div>
            <button className="send">Подготовить обращение <ArrowUpRight /></button>
          </form>
        )}
      </section>
    </div>
  );
}
