#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration
const FIGMA_URL =
  "https://www.figma.com/file/toTAFBJUPniZap9EPmhHWg/Untitled?node-id=0-8&t=2iL6qNo8pnxyGgus-4";
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN || ""; // Set this environment variable

// Helper function to convert RGB to hex
function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Map Figma node types to our Node types
function mapFigmaTypeToNodeType(figmaType) {
  const typeMap = {
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
function convertFigmaNodeToNode(figmaNode, parentX = 0, parentY = 0) {
  const boundingBox = figmaNode.absoluteBoundingBox || {
    x: parentX,
    y: parentY,
    width: 100,
    height: 100,
  };

  // Calculate relative position within parent
  const relativeX = boundingBox.x - parentX;
  const relativeY = boundingBox.y - parentY;

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

  // Convert children recursively - pass this node's absolute position as parent coordinates
  const children = [];
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
    x: relativeX,
    y: relativeY,
    width: boundingBox.width,
    height: boundingBox.height,
    background,
    border,
    borderRadius: figmaNode.cornerRadius || figmaNode.rectangleCornerRadii,
    text: figmaNode.characters,
    children,
  };
}

// Extract file ID from Figma URL
function extractFileIdFromUrl(figmaUrl) {
  const match = figmaUrl.match(/\/file\/([a-zA-Z0-9]+)/);
  if (!match) {
    throw new Error("Invalid Figma URL");
  }
  return match[1];
}

// Fetch Figma file data
async function fetchFigmaFile(fileId, accessToken) {
  const fetch = (await import("node-fetch")).default;

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

// Main execution
async function main() {
  try {
    if (!FIGMA_ACCESS_TOKEN) {
      console.error("Please set FIGMA_ACCESS_TOKEN environment variable");
      console.error(
        "You can get your token from: https://www.figma.com/developers/api#access-tokens"
      );
      process.exit(1);
    }

    console.log("Extracting Figma file...");

    // Extract file ID from URL
    const fileId = extractFileIdFromUrl(FIGMA_URL);
    console.log(`File ID: ${fileId}`);

    // Fetch Figma file data
    const figmaData = await fetchFigmaFile(fileId, FIGMA_ACCESS_TOKEN);
    console.log(`Fetched file: ${figmaData.name}`);
    console.log(figmaData);

    // Convert to Node structure
    const nodes = convertFigmaNodeToNode(figmaData.document);
    console.log(`Converted ${nodes.children?.length || 0} top-level nodes`);

    // Save to JSON file
    const outputPath = path.join(__dirname, "../figma-nodes.json");
    fs.writeFileSync(outputPath, JSON.stringify(nodes, null, 2));

    console.log(`✅ Successfully saved nodes to: ${outputPath}`);
    console.log(`📊 Stats:`);
    console.log(`   - Root node: ${nodes.name}`);
    console.log(`   - Type: ${nodes.type}`);
    console.log(`   - Children: ${nodes.children?.length || 0}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  extractFileIdFromUrl,
  fetchFigmaFile,
  convertFigmaNodeToNode,
  rgbToHex,
  mapFigmaTypeToNodeType,
};
