export interface Tool {
  name: string;
  icon: string;
}

const USER_TOOLS = [
  "AutoCAD",
  "Revit",
  "ArchiCAD",
  "SketchUp",
  "Rhino",
  "V-Ray",
  "Lumion",
  "Photoshop",
  "Illustrator",
] as const;

function getToolByName(toolName: string): Tool | null {
  const normalizedToolName = toolName.trim();
  const toolMap: Record<string, Tool> = {
    "AutoCAD": { name: "AutoCAD", icon: "🔲" },
    "Revit": { name: "Revit", icon: "🏗️" },
    "ArchiCAD": { name: "ArchiCAD", icon: "📐" },
    "SketchUp": { name: "SketchUp", icon: "🏠" },
    "Rhino": { name: "Rhino", icon: "🦒" },
    "V-Ray": { name: "V-Ray", icon: "✨" },
    "Lumion": { name: "Lumion", icon: "🌅" },
    "Photoshop": { name: "Photoshop", icon: "🖼️" },
    "Illustrator": { name: "Illustrator", icon: "✒️" },
  };
  return toolMap[normalizedToolName] || null;
}

function generateTools(): Tool[] {
  const shuffledTools = [...USER_TOOLS].sort(() => Math.random() - 0.5);
  const selectedTools = shuffledTools.slice(0, Math.ceil(USER_TOOLS.length * 0.7));

  return selectedTools.map((toolName) => getToolByName(toolName)).filter((tool): tool is Tool => tool !== null);
}

export const TOOLS = generateTools();

export function getToolEmoji(toolName: string): string {
  const tool = getToolByName(toolName);
  return tool ? tool.icon : "🛠️";
}

export function getRandomToolEmoji(): string {
  const tools = generateTools();
  return tools[Math.floor(Math.random() * tools.length)].icon;
}