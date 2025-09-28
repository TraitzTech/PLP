import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { PropertyDetailsWrapper } from '@/components/properties/property-details-wrapper';

// Mock property data
const mockProperty = {
    id: '1',
    title: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    price: 1200,
    priceUnit: 'night',
    rating: 4.9,
    reviews: 127,
    images: [
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
        'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
        'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
        'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    ],
    amenities: ['Ocean View', 'Private Pool', 'Spa', 'WiFi', 'Parking', 'Kitchen'],
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    description: 'Experience luxury living in this stunning oceanfront villa. With panoramic views of the Pacific Ocean, this property offers the perfect blend of comfort and elegance. The spacious interior features high-end finishes, while the outdoor area includes a private pool and direct beach access.',
    host: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        rating: 4.8,
        reviews: 89,
        joinedYear: 2019,
    },
    rules: [
        'Check-in: 3:00 PM - 10:00 PM',
        'Check-out: 11:00 AM',
        'No smoking',
        'No pets allowed',
        'No parties or events',
    ],
    coordinates: { lat: 34.0259, lng: -118.7798 },
};

const similarProperties = [
    {
        id: '2',
        title: 'Modern Downtown Apartment',
        location: 'New York, NY',
        price: 350,
        priceUnit: 'night',
        rating: 4.7,
        reviews: 89,
        images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
        amenities: ['City View', 'Gym', 'Concierge', 'WiFi'],
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
    },
    {
        id: '3',
        title: 'Cozy Mountain Cabin',
        location: 'Aspen, Colorado',
        price: 280,
        priceUnit: 'night',
        rating: 4.8,
        reviews: 156,
        images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
        amenities: ['Mountain View', 'Fireplace', 'Hot Tub', 'Hiking'],
        type: 'cabin',
        bedrooms: 3,
        bathrooms: 2,
        area: 1800,
    },
];

const reviews = [
    {
        id: 1,
        user: 'Michael Chen',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        rating: 5,
        date: '2024-01-15',
        comment: 'Absolutely stunning property! The ocean views are breathtaking and the amenities are top-notch. Sarah was an excellent host.',
    },
    {
        id: 2,
        user: 'Emma Rodriguez',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        rating: 5,
        date: '2024-01-10',
        comment: 'Perfect getaway spot. The villa is exactly as described and the location is unbeatable. Highly recommend!',
    },
];

export async function generateStaticParams() {
    // Return array of property IDs for static generation
    return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
    ];
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
    // In a real app, you would fetch property data based on params.id
    // For now, we'll use the mock data

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
                <PropertyDetailsWrapper
                    property={mockProperty}
                    similarProperties={similarProperties}
                    reviews={reviews}
                />
            </div>

            <Footer />
        </div>
    );
}