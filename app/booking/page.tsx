import { BookingClient } from "@/components/BookingClient";
export const metadata = { title: "Бронирование и свободные даты", description: "Проверьте доступность Дома на Южной и забронируйте дом, баню или комплекс бани с купелью." };
export default function Booking() { return <div className="booking-page private-booking"><BookingClient /></div>; }
