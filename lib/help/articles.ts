export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  category: 'Getting Started' | 'Account & KYC' | 'Listings' | 'Payments';
  content: string; // markdown-like content
};

export const helpArticles: HelpArticle[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started with Property Listing Portal',
    summary: 'Create your account, set your preferences, and explore properties quickly.',
    updatedAt: '2025-11-15',
    category: 'Getting Started',
    content:
      'Welcome to Property Listing Portal! This guide helps you get up and running in minutes.\n\n1. Sign up using your email and phone number.\n2. Choose your role: Customer for browsing or Agent to list properties.\n3. Complete your profile details so we can personalize your experience.\n\nTip: Use the floating Support button at the bottom-right if you need assistance at any time.'
  },
  {
    slug: 'verify-agent-kyc',
    title: 'Verify Your Agent Account (KYC)',
    summary: 'Submit address and ID documents to get verified and start listing properties.',
    updatedAt: '2025-11-28',
    category: 'Account & KYC',
    content:
      'To list properties, agents must complete Know Your Customer (KYC) verification.\n\n- Provide your address, city, region/state, and country.\n- Upload clear images or PDFs of your identification documents (up to 4 files).\n- Submit the form and wait for admin review. You will be notified upon verification.\n\nNote: Make sure your documents are readable and valid.'
  },
  {
    slug: 'manage-listings',
    title: 'Manage Your Property Listings',
    summary: 'Create, edit, and optimize your listings to attract more bookings.',
    updatedAt: '2025-10-09',
    category: 'Listings',
    content:
      'From your Agent Dashboard, navigate to Properties to create and manage listings.\n\n1. Click "New Property" and fill in details like title, description, and location.\n2. Add high-quality photos and relevant amenities to boost visibility.\n3. Publish and monitor performance from the dashboard analytics.'
  },
  {
    slug: 'payments-and-billing',
    title: 'Payments and Billing',
    summary: 'Understand how payments work, subscription options, and invoices.',
    updatedAt: '2025-09-21',
    category: 'Payments',
    content:
      'We support secure payments and subscriptions. Visit Dashboard > Billing for your plan and invoices.\n\n- Choose a subscription for advanced features.\n- Download invoices for your records.\n- Contact support for billing questions from the Support button.'
  }
];

export function findArticle(slug: string) {
  return helpArticles.find((a) => a.slug === slug);
}
