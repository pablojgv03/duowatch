import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0d0d1a 0%, #120820 50%, #1a0a2e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow de fondo */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: 200,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Tarjetas de película a la izquierda */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
          }}
        >
          {/* Tarjeta de atrás */}
          <div
            style={{
              width: 160,
              height: 240,
              borderRadius: 16,
              background: 'linear-gradient(160deg, #4c1d95 0%, #7e22ce 60%, #a855f7 100%)',
              position: 'absolute',
              left: 30,
              top: 20,
              transform: 'rotate(6deg)',
              boxShadow: '0 20px 60px rgba(124,58,237,0.4)',
              opacity: 0.7,
            }}
          />
          {/* Tarjeta de delante */}
          <div
            style={{
              width: 160,
              height: 240,
              borderRadius: 16,
              background: 'linear-gradient(160deg, #6d28d9 0%, #9333ea 60%, #d946ef 100%)',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(217,70,239,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Icono cine */}
            <div
              style={{
                fontSize: 60,
                opacity: 0.4,
              }}
            >
              🎬
            </div>
          </div>
        </div>

        {/* Contenido principal centrado-derecha */}
        <div
          style={{
            marginLeft: 280,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Título DuoWatch */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            DuoWatch
          </div>

          {/* Línea degradada bajo el título */}
          <div
            style={{
              width: 280,
              height: 4,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #7c3aed, #d946ef)',
              marginBottom: 24,
            }}
          />

          {/* Subtítulo */}
          <div
            style={{
              fontSize: 30,
              color: '#cbd5e1',
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: 560,
              marginBottom: 40,
            }}
          >
            Encuentra películas para ver juntos
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 22,
              color: '#a78bfa',
              fontWeight: 500,
            }}
          >
            duowatch-frontend.vercel.app
          </div>
        </div>

        {/* Crédito autor abajo derecha */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            right: 40,
            fontSize: 18,
            color: '#64748b',
            fontWeight: 400,
          }}
        >
          by Pablo Gomez Villen
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
