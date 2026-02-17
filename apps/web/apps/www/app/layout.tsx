import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'KN Biosciences - Premium Agricultural Products for Dealers & Distributors',
    template: '%s | KN Biosciences',
  },
  description: 'Wholesale platform for agricultural products. Access exclusive dealer pricing, bulk ordering tools, and comprehensive product catalogs for fertilizers, pesticides, and growth enhancers.',
  keywords: [
    'agricultural products',
    'fertilizers wholesale',
    'pesticides dealer',
    'farm inputs',
    'KN Biosciences',
    'B2B agriculture',
    'dealer portal',
    'distributor network',
  ],
  authors: [{ name: 'KN Biosciences', url: 'https://www.knbiosciences.in' }],
  creator: 'KN Biosciences Pvt Ltd',
  publisher: 'KN Biosciences Pvt Ltd',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.knbiosciences.in',
    siteName: 'KN Biosciences B2B Portal',
    title: 'KN Biosciences - B2B Dealer Portal',
    description: 'Wholesale platform for agricultural products with exclusive dealer pricing',
    images: [
      {
        url: 'https://www.knbiosciences.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KN Biosciences Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KN Biosciences - B2B Dealer Portal',
    description: 'Wholesale platform for agricultural products',
    images: ['https://www.knbiosciences.in/twitter-image.jpg'],
    creator: '@KNBiosciences',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://www.knbiosciences.in',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#16a34a" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'KN Biosciences',
              url: 'https://www.knbiosciences.in',
              logo: 'https://www.knbiosciences.in/logo.png',
              description: 'Premium agricultural products for dealers and distributors',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-123-456-7890',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
