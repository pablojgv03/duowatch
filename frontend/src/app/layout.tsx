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

export const metadata: Metadata = {
  title: 'DuoWatch — Find Movies to Watch Together',
  description: 'The social platform for discovering movies and shows to watch with your favorite people. Match, share, and watch together.',
  openGraph: {
    title: 'DuoWatch',
    description: 'Find movies and shows to watch with friends.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
