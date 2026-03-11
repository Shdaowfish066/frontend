import React from 'react';

export function BrandMark({ compact = false, align = 'left' }) {
  const isCentered = align === 'center';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: isCentered ? 'center' : 'flex-start',
        gap: compact ? 10 : 14,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: compact ? 36 : 52,
          height: compact ? 36 : 52,
          borderRadius: compact ? 12 : 18,
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          background: 'radial-gradient(circle at 30% 30%, #8B7BFF 0%, #5B4DDA 45%, #111827 100%)',
          boxShadow: '0 14px 36px rgba(91,77,218,0.28)',
          border: '1px solid rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: compact ? 6 : 8,
            borderRadius: compact ? 10 : 14,
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        />
        <span
          style={{
            position: 'relative',
            color: '#F8FAFC',
            fontSize: compact ? 18 : 28,
            fontWeight: 800,
            letterSpacing: '-0.06em',
            lineHeight: 1,
          }}
        >
          N
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCentered ? 'center' : 'flex-start' }}>
        <div
          style={{
            color: '#F8FAFC',
            fontSize: compact ? 18 : 28,
            fontWeight: 800,
            letterSpacing: compact ? '-0.04em' : '-0.06em',
            lineHeight: 1,
          }}
        >
          Nebula
        </div>
        {!compact && (
          <div
            style={{
              marginTop: 6,
              color: '#94A3B8',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Campus Pulse Network
          </div>
        )}
      </div>
    </div>
  );
}