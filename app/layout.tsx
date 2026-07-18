import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/frontend/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ownzo - Your Campus Marketplace',
    template: '%s | Ownzo'
  },
  description: 'Buy and sell with your college community. Safe, fast, and trusted marketplace for students.',
  keywords: ['marketplace', 'college', 'buy', 'sell', 'students', 'campus', 'secondhand', 'used items'],
  authors: [{ name: 'Ownzo Team' }],
  creator: 'Ownzo',
  publisher: 'Ownzo',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ownzo.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://ownzo.in',
    title: 'Ownzo - Your Campus Marketplace',
    description: 'Buy and sell with your college community. Safe, fast, and trusted marketplace for students.',
    siteName: 'Ownzo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ownzo - Campus Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ownzo - Your Campus Marketplace',
    description: 'Buy and sell with your college community. Safe, fast, and trusted marketplace for students.',
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
    // yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
    // yahoo: 'YOUR_YAHOO_VERIFICATION_CODE',
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
