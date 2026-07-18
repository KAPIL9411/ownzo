import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /profile/edit
Disallow: /settings/

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://ownzo.in'}/sitemap.xml`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
