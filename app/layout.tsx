import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/frontend/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ownzo - Community Marketplace',
    template: '%s | Ownzo'
  },
  description: 'Buy and sell within your community. Safe, local, and sustainable marketplace for everyone.',
  keywords: ['marketplace', 'community', 'buy', 'sell', 'local', 'secondhand', 'sustainable', 'peer-to-peer'],
  authors: [{ name: 'Ownzo Team' }],
  creator: 'Ownzo',
  publisher: 'Ownzo',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ownzo.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://ownzo.vercel.app',
    title: 'Ownzo - Community Marketplace',
    description: 'Buy and sell within your community. Safe, local, and sustainable.',
    siteName: 'Ownzo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ownzo - Community Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ownzo - Community Marketplace',
    description: 'Buy and sell within your community. Safe, local, and sustainable.',
    images: ['/og-image.png'],
    creator: '@ownzo',
  },
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
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#1B4332',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
