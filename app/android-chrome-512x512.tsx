import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'
 
export default function AndroidChrome512() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        }}
      >
        <div
          style={{
            fontSize: 320,
            fontWeight: 900,
            color: 'white',
            fontFamily: 'system-ui',
            letterSpacing: '-0.05em',
          }}
        >
          O
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
