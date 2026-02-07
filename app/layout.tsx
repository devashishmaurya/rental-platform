import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { KeycloakProvider } from '@/lib/auth/keycloak'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { generateMetadata as generateDefaultMetadata } from '@/lib/seo/metadata'
import { generateStructuredData } from '@/lib/seo/metadata'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = generateDefaultMetadata({
  title: 'Rental Platform | Renting the way it should be',
  description: 'The destination for finding, advertising, and managing rental property',
  ogType: 'website',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = generateStructuredData('WebSite')

  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <KeycloakProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </KeycloakProvider>
      </body>
    </html>
  )
}
