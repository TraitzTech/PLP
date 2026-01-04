import { AgentClientEditClient, AgentClient } from "@/components/dashboard/agent/client-edit-client";

// SSG params for static export
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Server-side fetch (mock)
async function getClientById(id: string): Promise<AgentClient> {
    return {
        id,
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie.dubois@email.com",
        phone: "+237 6XX XXX XXX",
        avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
        location: "Yaoundé, Cameroun",
        bio: "Cliente VIP, voyage fréquemment pour affaires",
        status: "active",
        budget: "500000",
        preferredProperties: ["Villa de Luxe", "Suite Executive", "Propriété avec Piscine"],
        notes: "Client VIP, préfère les propriétés de luxe avec vue. Voyage souvent en famille.",
        joinedDate: "2023-08-15",
    };
}

export default async function EditClientPage({ params }: { params: { id: string } }) {
    const data = await getClientById(params.id);
    return <AgentClientEditClient initialData={data} />;
}