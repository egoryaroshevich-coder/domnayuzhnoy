import type { Metadata } from "next";
import { BookingBand, PageHero } from "@/components/UI";
import { ReviewsClient, ReviewsData } from "@/components/ReviewsClient";
import reviews from "@/data/reviews.json";

export const metadata: Metadata = {
  title: "Отзывы гостей",
  description: "Отзывы гостей, рейтинг и впечатления об отдыхе в Доме на Южной в Борисове из Яндекс Карт, Instagram и Kufar Путешествий."
};

export default function ReviewsPage() {
  const reviewData = reviews as ReviewsData;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: "Дом на Южной",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewData.rating,
      ratingCount: reviewData.ratingCount,
      reviewCount: reviewData.reviewCount,
      bestRating: 5
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHero
        eyebrow="Отзывы / 06"
        title="Дом, в который хочется вернуться."
        text="Ниже доступны отзывы наших гостей."
        image="/images/album/album-36.jpg"
      />
      <ReviewsClient data={reviewData} />
      <BookingBand />
    </>
  );
}
