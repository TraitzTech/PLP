import { UserEditClient, AdminUser } from "@/components/admin/user-edit-client";

// SSG for static export
export async function generateStaticParams() {
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

// Server-side data fetch (mock)
async function getUserById(id: string): Promise<AdminUser> {
    return {
        id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+237 6XX XXX XXX",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        userType: "customer",
        status: "active",
        verified: true,
        location: "Yaoundé, Cameroon",
        bio: "Travel enthusiast and property investor.",
        joinedDate: "2023-06-15",
        sendWelcomeEmail: false,
    };
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const data = await getUserById(params.id);
    return <UserEditClient initialData={data} />;
}