import { ReviewWriteClient } from "@/components/bookings/review-write-client";

// Provide params for SSG/export
export async function generateStaticParams() {
    return [{ id: "BK001" }, { id: "BK002" }, { id: "BK003" }];
}

// Server-side mock fetch by booking id
async function getBookingById(id: string) {
    return {
        id,
        property: {
            id: "1",
            title: "Luxury Ocean View Villa",
            location: "Malibu, California",
            image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
        },
        checkIn: "2024-02-15",
        checkOut: "2024-02-20",
        status: "completed" as const,
    };
}

export default async function WriteReviewPage({ params }: { params: { id: string } }) {
    const booking = await getBookingById(params.id);
    return <ReviewWriteClient booking={booking} />;
}