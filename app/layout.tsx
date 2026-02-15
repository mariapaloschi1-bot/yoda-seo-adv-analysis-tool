import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Yoda's Organic-Paid Analysis",
  description: 'Analizza la competizione paid e ottimizza il budget pubblicitario',
  keywords: 'SEO, PPC, Google Ads, keyword analysis, bidding, competition',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
