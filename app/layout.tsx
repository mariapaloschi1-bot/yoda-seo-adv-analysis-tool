import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Yoda's Organic-Paid Analysis | SEO & PPC Strategy Tool",
  description: "Analyze organic rankings vs paid competition. Discover where to invest in PPC and where SEO dominates. May the Force guide your budget.",
  icons: {
    icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%232dd4bf'/%3e%3ctext x='50' y='50' font-family='Arial, sans-serif' font-size='80' font-weight='bold' fill='%230f172a' text-anchor='middle' dominant-baseline='central'%3eY%3c/text%3e%3c/svg%3e"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="bg-slate-900 text-slate-200">{children}</body>
    </html>
  )
}
