import type { Node } from "../types/node";

// Type definitions for Figma API responses
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a?: number;
    };
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a?: number;
    };
  }>;
  strokeWeight?: number;
  characters?: string;
  children?: FigmaNode[];
}

interface FigmaApiResponse {
  document: FigmaNode;
  components: Record<string, any>;
  schemaVersion: number;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Map Figma node types to our Node types
function mapFigmaTypeToNodeType(
  figmaType: string
): "Div" | "Input" | "Image" | "Button" {
  const typeMap: Record<string, "Div" | "Input" | "Image" | "Button"> = {
    FRAME: "Div",
    GROUP: "Div",
    RECTANGLE: "Div",
    TEXT: "Div",
    INSTANCE: "Button",
    COMPONENT: "Button",
    VECTOR: "Image",
    ELLIPSE: "Div",
    LINE: "Div",
    POLYGON: "Div",
    STAR: "Div",
    BOOLEAN_OPERATION: "Div",
  };

  return typeMap[figmaType] || "Div";
}

// Convert a Figma node to our Node structure
function convertFigmaNodeToNode(
  figmaNode: FigmaNode,
  parentX = 0,
  parentY = 0
): Node {
  const boundingBox = figmaNode.absoluteBoundingBox || {
    x: parentX,
    y: parentY,
    width: 100,
    height: 100,
  };

  // Extract background color from fills
  let background = undefined;
  if (figmaNode.fills && figmaNode.fills.length > 0) {
    const fill = figmaNode.fills[0];
    if (fill.type === "SOLID" && fill.color) {
      background = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
    }
  }

  // Extract border from strokes
  let border = undefined;
  if (
    figmaNode.strokes &&
    figmaNode.strokes.length > 0 &&
    figmaNode.strokeWeight
  ) {
    const stroke = figmaNode.strokes[0];
    if (stroke.type === "SOLID" && stroke.color) {
      const strokeColor = rgbToHex(
        stroke.color.r,
        stroke.color.g,
        stroke.color.b
      );
      border = `${figmaNode.strokeWeight}px solid ${strokeColor}`;
    }
  }

  // Convert children recursively
  const children: Node[] = [];
  if (figmaNode.children) {
    for (const child of figmaNode.children) {
      children.push(
        convertFigmaNodeToNode(child, boundingBox.x, boundingBox.y)
      );
    }
  }

  return {
    id: figmaNode.id,
    name: figmaNode.name,
    type: mapFigmaTypeToNodeType(figmaNode.type),
    x: boundingBox.x,
    y: boundingBox.y,
    width: boundingBox.width,
    height: boundingBox.height,
    background,
    border,
    text: figmaNode.characters,
    children,
  };
}

// Main function to convert Figma API response to Node structure
export function convertFigmaToNodes(figmaData: FigmaApiResponse): Node {
  return convertFigmaNodeToNode(figmaData.document);
}

// Function to fetch Figma file data (requires Figma API token)
export async function fetchFigmaFile(
  fileId: string,
  accessToken: string
): Promise<FigmaApiResponse> {
  const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
    headers: {
      "X-Figma-Token": accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
  }

  return response.json();
}

// Extract file ID from Figma URL
export function extractFileIdFromUrl(figmaUrl: string): string {
  const match = figmaUrl.match(/\/file\/([a-zA-Z0-9]+)/);
  if (!match) {
    throw new Error("Invalid Figma URL");
  }
  return match[1];
}

// Save nodes to JSON file
export function saveNodesToJson(
  nodes: Node,
  filename = "figma-nodes.json"
): void {
  const jsonString = JSON.stringify(nodes, null, 2);

  // Create a blob and download it
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
