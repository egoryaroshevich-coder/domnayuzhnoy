import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты Дома на Южной в Борисове: основной телефон, официальные страницы в Инстаграм и ТикТок, форма запроса свободных дат."
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
