import type { ReactNode } from "react";

/**
 * The software Fatih works with, each drawn as a small technical sketch of
 * what the tool does. Lines are drawn in when the sheet scrolls into view.
 */

type Tool = {
  name: string;
  use: string;
  drawing: ReactNode;
};

// Every stroke uses pathLength=1 so the CSS can draw it from 0 to 1.
const L = (d: string, dashed = false) => (
  <path d={d} pathLength={1} className={dashed ? "ln ln-guide" : "ln"} />
);

const TOOLS: Tool[] = [
  {
    name: "AutoCAD",
    use: "2D drafting",
    drawing: (
      <>
        {L("M12 50 L12 12 L50 50 Z")}
        {L("M18 44 L18 27 L35 44 Z")}
        {L("M12 57 H50")}
        {L("M12 54 V60")}
        {L("M50 54 V60")}
        {L("M6 50 H56", true)}
      </>
    ),
  },
  {
    name: "Revit",
    use: "BIM modelling",
    drawing: (
      <>
        {L("M32 6 L54 18 L54 46 L32 58 L10 46 L10 18 Z")}
        {L("M10 18 L32 30 L54 18")}
        {L("M32 30 V58")}
        {L("M10 27.5 L32 39.5 L54 27.5")}
        {L("M10 37 L32 49 L54 37")}
      </>
    ),
  },
  {
    name: "ArchiCAD",
    use: "Plans & sections",
    drawing: (
      <>
        {L("M8 8 H56 V56 H8 Z")}
        {L("M30 8 V30")}
        {L("M30 40 V56")}
        {L("M8 32 H20")}
        {L("M30 30 H40")}
        {L("M40 30 A10 10 0 0 1 30 40")}
        {L("M38 56 H50")}
        {L("M38 52 H50")}
        {L("M2 32 H62", true)}
      </>
    ),
  },
  {
    name: "SketchUp",
    use: "Massing",
    drawing: (
      <>
        {L("M12 30 L32 20 L52 30 L52 48 L32 58 L12 48 Z")}
        {L("M12 30 L32 40 L52 30")}
        {L("M32 40 V58")}
        {L("M32 30 V4")}
        {L("M26 10 L32 4 L38 10")}
        {L("M12 30 L32 40 L52 30 L32 20 Z", true)}
      </>
    ),
  },
  {
    name: "Rhino",
    use: "Free-form surfaces",
    drawing: (
      <>
        {L("M6 50 C18 6 44 60 58 14")}
        {L("M6 50 L18 6 L44 60 L58 14", true)}
        {L("M15 3 H21 V9 H15 Z")}
        {L("M41 57 H47 V63 H41 Z")}
        {L("M3 47 H9 V53 H3 Z")}
        {L("M55 11 H61 V17 H55 Z")}
      </>
    ),
  },
  {
    name: "V-Ray",
    use: "Photoreal rendering",
    drawing: (
      <>
        {L("M10 38 A16 16 0 1 0 42 38 A16 16 0 1 0 10 38")}
        {L("M17 47 A16 8 0 0 0 42 34")}
        {L("M48 12 A4 4 0 1 0 56 12 A4 4 0 1 0 48 12")}
        {L("M52 2 V5")}
        {L("M62 12 H59")}
        {L("M59 5 L57 7")}
        {L("M48 16 L36 27", true)}
        {L("M8 60 H48", true)}
      </>
    ),
  },
  {
    name: "Lumion",
    use: "Scenes & landscape",
    drawing: (
      <>
        {L("M4 54 H60")}
        {L("M18 54 V38")}
        {L("M8 30 A10 10 0 1 0 28 30 A10 10 0 1 0 8 30")}
        {L("M34 54 V38 L45 29 L56 38 V54")}
        {L("M42 54 V45 H48 V54")}
        {L("M46 12 A5 5 0 1 0 56 12 A5 5 0 1 0 46 12")}
      </>
    ),
  },
  {
    name: "Photoshop",
    use: "Post-production",
    drawing: (
      <>
        {L("M24 6 H58 V34 H24 Z", true)}
        {L("M16 14 H50 V42 H16 Z")}
        {L("M6 24 H40 V54 H6 Z")}
        {L("M10 48 L19 37 L25 43 L30 38 L36 48")}
        {L("M27 31 A3 3 0 1 0 33 31 A3 3 0 1 0 27 31")}
      </>
    ),
  },
  {
    name: "Illustrator",
    use: "Diagrams & boards",
    drawing: (
      <>
        {L("M8 54 C8 30 24 16 42 16")}
        {L("M8 54 V32", true)}
        {L("M30 16 H54", true)}
        {L("M5 51 H11 V57 H5 Z")}
        {L("M39 13 H45 V19 H39 Z")}
        {L("M54 13 A3 3 0 1 0 54 19 A3 3 0 1 0 54 13")}
        {L("M8 29 A3 3 0 1 0 8 35 A3 3 0 1 0 8 29")}
      </>
    ),
  },
];

export function ToolSheet() {
  return (
    <ol className="tool-sheet" data-reveal>
      {TOOLS.map((tool, i) => (
        <li
          key={tool.name}
          className="tool-cell"
          style={{ ["--n" as string]: i }}
        >
          <span className="tool-no">T-{String(i + 1).padStart(2, "0")}</span>
          <svg viewBox="0 0 64 64" aria-hidden className="tool-drawing">
            {tool.drawing}
          </svg>
          <span className="tool-name">{tool.name}</span>
          <span className="tool-use">{tool.use}</span>
        </li>
      ))}
    </ol>
  );
}
