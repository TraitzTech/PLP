import { AgentPropertyDetailClient, AgentPropertyDetails } from "@/components/dashboard/agent/property-detail-client";

// SSG params for static export
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Mock server-side fetch by id
async function getAgentPropertyDetailsById(id: string): Promise<{
    property: AgentPropertyDetails;
    recentBookings: {
        id: string;
        client: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        status: "confirmed" | "completed" | "pending" | "cancelled";
        amount: number;
    }[];
    reviews: {
        id: number;
        client: string;
        avatar: string;
        rating: number;
        date: string;
        comment: string;
    }[];
}> {
    const property: AgentPropertyDetails = {
        id,
        title: "Luxury Villa Bastos",
        description:
            "Villa de luxe située dans le quartier prestigieux de Bastos avec vue panoramique sur la ville. Cette propriété exceptionnelle offre tout le confort moderne avec des finitions haut de gamme.",
        location: "Bastos, Yaoundé",
        address: "123 Avenue de l'Indépendance, Bastos",
        price: 480000,
        priceUnit: "night",
        rating: 4.9,
        reviews: 127,
        images: [
            "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
            "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg",
        ],
        amenities: ["WiFi Gratuit", "Climatisation", "Piscine", "Parking", "Cuisine Équipée", "Sécurité 24h/24"],
        type: "villa",
        bedrooms: 4,
        bathrooms: 3,
        area: 320,
        maxGuests: 8,
        status: "active",
        featured: true,
        totalBookings: 45,
        totalRevenue: 21600000,
        occupancyRate: 85,
        averageStay: 4.2,
        houseRules: ["Arrivée: 15:00 - 22:00", "Départ: 11:00", "Pas de fumée", "Pas d'animaux", "Pas de fêtes"],
    };

    const recentBookings = [
        {
            id: "1",
            client: "Marie Dubois",
            checkIn: "2024-02-20",
            checkOut: "2024-02-25",
            guests: 4,
            status: "confirmed" as const,
            amount: 2400000,
        },
        {
            id: "2",
            client: "Jean-Paul Kamga",
            checkIn: "2024-02-15",
            checkOut: "2024-02-18",
            guests: 2,
            status: "completed" as const,
            amount: 1440000,
        },
    ];

    const reviews = [
        {
            id: 1,
            client: "Marie Dubois",
            avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
            rating: 5,
            date: "2024-01-15",
            comment:
                "Villa absolument magnifique! La vue est à couper le souffle et les équipements sont de première qualité.",
        },
        {
            id: 2,
            client: "Jean-Paul Kamga",
            avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
            rating: 5,
            date: "2024-01-10",
            comment:
                "Séjour parfait. La villa correspond exactement à la description et l'emplacement est imbattable.",
        },
    ];

    return { property, recentBookings, reviews };
}

export default async function AgentPropertyDetailPage({ params }: { params: { id: string } }) {
    const { property, recentBookings, reviews } = await getAgentPropertyDetailsById(params.id);
    return <AgentPropertyDetailClient property={property} recentBookings={recentBookings} reviews={reviews} />;
}