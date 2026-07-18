import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Ownzo - Community Marketplace'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #1B4332 100%)',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.1,
          }}
        >
          <div
            style={{
              fontSize: 600,
              fontWeight: 900,
              color: 'white',
            }}
          >
            O
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 50,
                fontWeight: 900,
                color: 'white',
              }}
            >
              O
            </div>
            <div
              style={{
                fontSize: 70,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.03em',
              }}
            >
              Ownzo
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: 20,
              maxWidth: 900,
            }}
          >
            Buy & Sell within your community
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            Safe, local, and sustainable marketplace
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 40,
              padding: '16px 32px',
              borderRadius: 50,
              background: 'rgba(249, 115, 22, 0.2)',
              border: '2px solid rgba(249, 115, 22, 0.5)',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#F97316',
              }}
            >
              10K+ Active Users
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
