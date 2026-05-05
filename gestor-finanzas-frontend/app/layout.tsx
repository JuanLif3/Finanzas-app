import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FinanceProvider } from '@/lib/finance-context'
import { RefreshProvider } from '@/hooks/useRefresh'
import { Header } from '@/components/finance/header'
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans'
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'FinanceFlow - Gestor Financiero Personal',
  description: 'Gestiona tus finanzas de forma inteligente con FinanceFlow.',
  generator: 'v0.app',
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="es" className="bg-background" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
      <RefreshProvider>
        <FinanceProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </FinanceProvider>
      </RefreshProvider>
      {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
      </html>
  )
}