import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'DuoWatch',
      applicationCategory: 'EntertainmentApplication',
      description: 'Plataforma social para descubrir películas y series para ver juntos',
      url: 'https://duowatch-frontend.vercel.app',
      author: { '@type': 'Person', name: 'Pablo Gomez Villen' },
      operatingSystem: 'Web',
    },
    {
      '@type': 'Person',
      name: 'Pablo Gomez Villen',
      url: 'https://duowatch-frontend.vercel.app',
      jobTitle: 'Full Stack Developer',
      knowsAbout: ['Next.js', 'NestJS', 'TypeScript', 'React', 'PostgreSQL'],
    },
  ],
};

export const metadata: Metadata = {
  title: {
    template: '%s | DuoWatch',
    default: 'DuoWatch — Encuentra películas para ver juntos',
  },
  description:
    'DuoWatch es la plataforma social para descubrir películas y series que queréis ver juntos. Haz match con tus amigos, comparte listas y encuentra qué ver esta noche.',
  keywords: [
    'DuoWatch',
    'Pablo Gomez Villen',
    'películas para ver juntos',
    'series para ver juntos',
    'match películas',
    'recomendaciones películas',
    'plataforma social cine',
    'ver películas con amigos',
  ],
  authors: [{ name: 'Pablo Gomez Villen' }],
  creator: 'Pablo Gomez Villen',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  openGraph: {
    title: 'DuoWatch — Encuentra películas para ver juntos',
    description:
      'DuoWatch es la plataforma social para descubrir películas y series que queréis ver juntos. Haz match con tus amigos y encuentra qué ver esta noche.',
    type: 'website',
    siteName: 'DuoWatch',
    url: 'https://duowatch-frontend.vercel.app',
    locale: 'es_ES',
    images: [
      {
        url: 'https://duowatch-frontend.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'DuoWatch — Encuentra películas para ver juntos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@pablogomezvillen',
    title: 'DuoWatch — Encuentra películas para ver juntos',
    description:
      'Plataforma social para descubrir películas y series para ver juntos. Haz match con tus amigos.',
    images: ['https://duowatch-frontend.vercel.app/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
