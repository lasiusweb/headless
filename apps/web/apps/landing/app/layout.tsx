import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'KN Biosciences - Empowering Indian Agriculture',
    template: '%s | KN Biosciences',
  },
  description: 'Your trusted partner for quality agricultural products. Choose your portal: B2B for dealers & distributors, or B2C for farmers. Quality inputs for every stakeholder in the agricultural value chain.',
  keywords: [
    'agricultural products India',
    'agri inputs',
    'fertilizers',
    'pesticides',
    'seeds',
    'KN Biosciences',
    'agriculture',
    'farming',
    'dealer portal',
    'B2B agriculture',
    'B2C agriculture',
  ],
  authors: [{ name: 'KN Biosciences', url: 'https://knbiosciences.in' }],
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
    url: 'https://knbiosciences.in',
    siteName: 'KN Biosciences',
    title: 'KN Biosciences - Empowering Indian Agriculture',
    description: 'Quality agricultural products for dealers and farmers',
    images: [
      {
        url: 'https://knbiosciences.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KN Biosciences - Agricultural Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KN Biosciences - Empowering Indian Agriculture',
    description: 'Quality agricultural products for dealers and farmers',
    images: ['https://knbiosciences.in/twitter-image.jpg'],
    creator: '@KNBiosciences',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://knbiosciences.in',
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
              url: 'https://knbiosciences.in',
              logo: 'https://knbiosciences.in/logo.png',
              description: 'Quality agricultural products for dealers and farmers',
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
