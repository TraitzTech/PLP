import { AgentPropertyEditClient, AgentProperty } from "@/components/dashboard/agent/property-edit-client";

// Provide params for SSG/export
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Server-side mock fetch
async function getAgentPropertyById(id: string): Promise<AgentProperty> {
    return {
        id,
        title: "Luxury Villa Bastos",
        description: "Villa de luxe située dans le quartier prestigieux de Bastos...",
        address: "123 Avenue de l'Indépendance",
        city: "yaounde",
        region: "centre",
        country: "Cameroun",
        zipCode: "00237",
        type: "villa",
        category: "luxury",
        bedrooms: 4,
        bathrooms: 3,
        area: 320,
        maxGuests: 8,
        basePrice: 480000,
        priceUnit: "night",
        cleaningFee: 25000,
        securityDeposit: 100000,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        amenities: ["WiFi Gratuit", "Climatisation", "Piscine", "Parking", "Cuisine Équipée"],
        houseRules: "Pas de fête, pas d'animaux, pas de fumée",
        images: [
            "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
        ],
        status: "active",
        featured: true,
    };
}

export default async function EditAgentPropertyPage({ params }: { params: { id: string } }) {
    const data = await getAgentPropertyById(params.id);
    return <AgentPropertyEditClient initialData={data} />;
}