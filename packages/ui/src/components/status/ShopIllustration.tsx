import { cn } from '../../cn';

interface ShopIllustrationProps {
  /** The mark on the hanging sign. */
  mark: '!' | '?';
  className?: string;
}

const AWNING_START = 60;
const STRIPE_WIDTH = 20;
const STRIPES = Array.from({ length: 8 }, (_, index) => AWNING_START + index * STRIPE_WIDTH);
const SHUTTER_SLATS = Array.from({ length: 7 }, (_, index) => 110 + index * 6);

/** A small kadai with its shutter half down and a sign swinging out front. Colours follow the theme. */
export function ShopIllustration({ mark, className }: ShopIllustrationProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" aria-hidden className={className}>
      <circle cx="140" cy="100" r="92" className="fill-brand-soft" />

      {/* Ground */}
      <path d="M24 178h232" strokeWidth="2" strokeLinecap="round" className="stroke-field" />

      {/* Building */}
      <path
        d="M66 40h148a6 6 0 0 1 6 6v132H60V46a6 6 0 0 1 6-6Z"
        strokeWidth="2"
        className="fill-surface stroke-line"
      />

      {/* Name board */}
      <path d="M66 40h148a6 6 0 0 1 6 6v22H60V46a6 6 0 0 1 6-6Z" className="fill-brand" />
      <text
        x="140"
        y="59"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        letterSpacing="4"
        className="fill-on-brand font-sans"
      >
        KADAI
      </text>

      {/* Doorway, seen under the half-closed shutter */}
      <rect x="84" y="104" width="112" height="74" className="fill-brand-strong" />

      {/* Shutter */}
      <rect x="84" y="104" width="112" height="46" className="fill-hover" />
      {SHUTTER_SLATS.map((y) => (
        <path key={y} d={`M84 ${y}h112`} strokeWidth="1.5" className="stroke-line" />
      ))}
      <rect x="84" y="147" width="112" height="5" className="fill-field" />
      <rect x="130" y="152" width="20" height="4" rx="2" className="fill-field" />

      {/* Awning */}
      {STRIPES.map((x, index) => (
        <path
          key={x}
          d={`M${x} 68h${STRIPE_WIDTH}v16a10 10 0 0 1-${STRIPE_WIDTH} 0Z`}
          className={index % 2 === 0 ? 'fill-brand' : 'fill-surface stroke-line'}
        />
      ))}

      {/* Crate of stock */}
      <rect x="28" y="150" width="26" height="28" rx="3" strokeWidth="2" className="fill-surface stroke-field" />
      <path d="M28 159h26M28 169h26" strokeWidth="2" className="stroke-field" />

      {/* Milk can */}
      <path
        d="M233 150h10v6l5 5v14a3 3 0 0 1-3 3h-14a3 3 0 0 1-3-3v-14l5-5v-6Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-surface stroke-field"
      />
      <path d="M228 164h20" strokeWidth="2" className="stroke-field" />

      {/* Hanging sign */}
      <g
        className="motion-safe:animate-sign-swing"
        style={{ transformOrigin: '140px 94px', transform: 'rotate(-4deg)' }}
      >
        <path d="M128 94v22M152 94v22" strokeWidth="2" strokeLinecap="round" className="stroke-ink" />
        <rect
          x="114"
          y="116"
          width="52"
          height="36"
          rx="6"
          strokeWidth="2.5"
          className={cn('fill-surface stroke-brand')}
        />
        <text x="140" y="142" textAnchor="middle" fontSize="24" fontWeight="700" className="fill-brand font-sans">
          {mark}
        </text>
      </g>
    </svg>
  );
}
