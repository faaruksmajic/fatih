/**
 * The AF mark, redrawn from the original artwork (public/images/logo.png).
 * Thin strokes are lines so they can be thickened for small sizes, where the
 * hairlines of the original would vanish; the solid faces stay as drawn.
 *
 * line: hairline weight in artwork units (the artwork is ~980 units wide).
 * 6 matches the original; use ~14 around 50px wide and ~18 around 36px.
 */
export function AfMark({
  className,
  line = 6,
  title,
}: {
  className?: string;
  line?: number;
  title?: string;
}) {
  return (
    <svg
      viewBox="150 280 1000 660"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <g stroke="currentColor" strokeWidth={line} strokeLinecap="square" fill="none">
        {/* A: outer leg with its foot */}
        <polyline points="178,917 248,917 712,305" />
        {/* shared spine */}
        <line x1="712" y1="305" x2="712" y2="917" />
        {/* F: top arm */}
        <line x1="712" y1="460" x2="1110" y2="460" />
        {/* A: inner leg and plumb line under the wedge */}
        <line x1="640" y1="745" x2="709" y2="917" />
        <line x1="640" y1="745" x2="640" y2="917" />
      </g>
      {/* A: solid wedge */}
      <polygon points="552,526 640,405 640,747" />
      {/* F: solid stem and middle arm */}
      <rect x="712" y="595" width="50" height="325" />
      <polygon points="762,595 982,595 952,616 762,616" />
    </svg>
  );
}
