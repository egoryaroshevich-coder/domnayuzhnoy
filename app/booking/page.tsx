import { BookingClient } from "@/components/BookingClient";
export const metadata = { title: "Бронирование и свободные даты", description: "Проверьте доступность Дома на Южной по календарю владельца и отправьте частную заявку с датами, количеством гостей и пожеланиями." };
export default function Booking() { return <div className="booking-page private-booking"><BookingClient /></div>; }
