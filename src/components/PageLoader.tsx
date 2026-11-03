"use client";

import { usePathname } from "next/navigation";

/** How long the loader stays up (draw + hold), before it fades out. Keep in sync with globals.css. */
export const LOADER_MS = 2600;

/**
 * Full-screen intro shown on the first load of the public site: a building
 * elevation draws itself in line by line, like a sheet being drafted, then the
 * overlay fades away. Pure CSS timing, so it also clears without JavaScript.
 * The root layout persists across client navigations, so it plays once per load.
 */

type Line = { d: string; at: number; kind?: "dim" | "glass" | "thin" };

// Elevation of a two-storey house with a cantilevered upper volume (viewBox 0 0 240 170).
const LINES: Line[] = [
  // ground
  { d: "M8 140 H232", at: 0 },
  // lower volume
  { d: "M40 140 V80 H160 V140", at: 0.15 },
  // upper, cantilevered volume and its column
  { d: "M70 80 V40 H204 V80 H160", at: 0.4 },
  { d: "M198 80 V140", at: 0.65, kind: "thin" },
  // ground-floor glazing with mullions, and the door
  { d: "M52 140 V94 H104 V140", at: 0.75 },
  { d: "M69.3 94 V140 M86.6 94 V140", at: 0.95, kind: "thin" },
  { d: "M122 140 V100 H144 V140", at: 0.9 },
  // upper ribbon window with mullions
  { d: "M82 52 H192 V68 H82 Z", at: 1.0 },
  { d: "M104 52 V68 M126 52 V68 M148 52 V68 M170 52 V68", at: 1.2, kind: "thin" },
  // roof parapet
  { d: "M66 40 H208", at: 1.1, kind: "thin" },
  // dimension lines
  { d: "M70 24 H204 M70 19 V29 M204 19 V29", at: 1.35, kind: "dim" },
  { d: "M24 40 V140 M19 40 H29 M19 140 H29", at: 1.45, kind: "dim" },
];

// Glass panes that wash in once the frames are drawn.
const GLASS = ["M52 94 H104 V140 H52 Z", "M82 52 H192 V68 H82 Z"];

export function PageLoader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="page-loader" aria-hidden>
      <div className="page-loader-sheet">
        <svg viewBox="0 0 240 160" className="page-loader-drawing">
          {GLASS.map((d) => (
            <path key={d} d={d} className="pl-glass" />
          ))}
          {LINES.map((l) => (
            <path
              key={l.d}
              d={l.d}
              pathLength={1}
              className={`pl-ln${l.kind ? ` pl-${l.kind}` : ""}`}
              style={{ ["--at" as string]: `${l.at}s` }}
            />
          ))}
          <text x="137" y="17" className="pl-dim-label">
            13.40
          </text>
          <text x="14" y="90" className="pl-dim-label" transform="rotate(-90 14 90)">
            10.00
          </text>
        </svg>
        <p className="page-loader-name">Fatih Škrijelj</p>
        <p className="page-loader-role">Architecture &amp; Interior Design</p>
      </div>
    </div>
  );
}
