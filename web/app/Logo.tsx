import { useId } from "react";

/* The seal mark — a circular badge chosen from four logo directions
   explored on a design canvas: enset-green ground, a bold "h", the
   tibeb band (saffron over berbere) curving along the bottom like a
   stamp. Colors are fixed rather than theme-reactive, like any
   pictorial brand mark (the old CSS-gradient .brand-mark shifted with
   the theme; a logo shouldn't). See app/icon.svg for the favicon/
   app-icon version — same shape, but a system font for the "h" since
   browser chrome can't load next/font's Bricolage Grotesque. */
export function Logo({ size = 26 }: { size?: number }) {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="brand-mark"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#1F5B3E" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="79" width="100" height="10" fill="#D4901A" />
        <rect x="0" y="89" width="100" height="11" fill="#A83418" />
      </g>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="var(--f-display)"
        fontWeight={800}
        fontSize={50}
        fill="#F2EFE6"
      >
        h
      </text>
    </svg>
  );
}
