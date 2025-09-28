import { PropertyEditClient } from "@/components/admin/property-edit-client";

// Mock IDs for SSG export
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Mock fetch by id (server-side)
async function getPropertyById(id: string) {
    // Replace with real fetch in the future
    return {
        id,
        title: "Luxury Ocean View Villa",
        description: "Experience luxury living in this stunning oceanfront villa...",
        location: "Malibu, California",
        price: 720000,
        priceUnit: "night",
        type: "villa",
        bedrooms: 4,
        bathrooms: 3,
        area: 3200,
        maxGuests: 8,
        status: "active" as const,
        featured: true,
        owner: "Sarah Johnson",
        ownerId: "2",
        amenities: ["Ocean View", "Private Pool", "Spa", "WiFi"],
        images: ["https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"],
    };
}

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
    const data = await getPropertyById(params.id);
    return <PropertyEditClient initialData={data} />;
}