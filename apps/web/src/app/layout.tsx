import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Edu Platforma - Premium e-learning za farmaciju',
  description:
    'Najnaprednija e-learning platforma u Hrvatskoj za farmaceutsku i zdravstvenu industriju',
  keywords: [
    'e-learning',
    'farmacija',
    'zdravstvo',
    'online edukacija',
    'farmakovigilanca',
    'CPD',
    'CME',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
