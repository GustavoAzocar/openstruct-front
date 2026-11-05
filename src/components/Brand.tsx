import { useId } from 'react';

export function Mark({
  className = '',
  monochrome = false,
}: {
  className?: string;
  monochrome?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`brand-mark ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <mask id={`o-${id}`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="28" fill="black" />
          <path d="M69 -3 78 2 62 28 54 23Z" fill="black" />
        </mask>
      </defs>
      <g mask={`url(#o-${id})`}>
        <path
          d="M34 2H70Q75 2 80 7L94 21Q99 26 99 33V68Q99 75 94 80L80 94Q75 99 68 99H33Q26 99 21 94L6 79Q1 74 1 67V33Q1 26 6 21L22 6Q27 2 34 2Z"
          fill="currentColor"
        />
        {!monochrome && <path d="m62 24 37 13V27L79 6Z" fill="black" opacity=".17" />}
      </g>
    </svg>
  );
}

export function Brand({
  className = '',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={`brand ${className}`} aria-label="OpenStruct">
      <Mark />
      {!compact && (
        <span className="brand-word" aria-hidden="true">
          PENSTRUCT
        </span>
      )}
    </span>
  );
}

export function AppGlyph({ kind, className = '' }: { kind: string; className?: string }) {
  return (
    <svg
      className={`app-glyph ${className}`}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === 'beam' ? (
        <>
          <path d="M19 39h82v42H19zM19 50h82M19 70h82M27 81v12m66-12v12M14 93h26m40 0h26" />
          <path d="M41 23v13m19-13v13m19-13v13" />
        </>
      ) : kind === 'column' ? (
        <>
          <path d="M40 21h40v78H40zM32 99h56M50 25v70m20-70v70M40 42h40M40 60h40M40 78h40" />
          <path d="m30 29 10-8 10 8m20 0 10-8 10 8" />
        </>
      ) : kind === 'footing' ? (
        <>
          <path d="M49 19h22v42l26 22v16H23V83l26-22zM23 83h74M34 91h52M49 42h22" />
          <path d="M17 107h86M29 107l-5 7m20-7-5 7m20-7-5 7m20-7-5 7m20-7-5 7" />
        </>
      ) : kind === 'frame' ? (
        <>
          <path d="m25 36 43-18 30 20v50l-43 18-30-20zM25 36l30 20 43-18M55 56v50M68 18v50l30 20M25 86l43-18" />
          <path d="M55 81 98 63M25 61l30 20" />
        </>
      ) : (
        <>
          <path d="M23 17h28v25h47v22L51 90v13H23zM51 42v48M51 53h34v7L51 79" />
          <path d="M32 26v68m9-68v68" />
        </>
      )}
    </svg>
  );
}
