import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ComponentInfo, Node } from "@/types/node";

const MAX_LEVELS = 10;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Advanced component detector class
class ComponentDetector {
  private componentCounter = 1;
  private components: Map<string, ComponentInfo> = new Map();
  private nodeToComponent: Map<string, string> = new Map();

  /**
   * Create signature for a node using pre-computed child signatures
   * More efficient than recursive approach
   */
  private createSignature(
    node: Node,
    childSignatures: string[],
    isRoot: boolean = true
  ): string {
    const nodeSignature = {
      type: node.type,
      // width: node.width,
      // height: node.height,
      display: node.display,
      // color: node.color,
      // border: node.border,
      // For component detection, ignore positioning, background, and text content at all levels
      // This allows components to be positioned differently and have different content
      // but still be recognized as the same structural pattern
    };

    // Use pre-computed child signatures (already sorted)
    return JSON.stringify({
      node: nodeSignature,
      children: childSignatures.sort(),
    });
  }

  /**
   * Single-pass traversal that builds signatures bottom-up
   */
  private collectSignatures(node: Node): string {
    // First, process all children to get their signatures
    const childSignatures: string[] = [];
    for (const child of node.children) {
      const childSignature = this.collectSignatures(child);
      childSignatures.push(childSignature);
    }

    // Create signature for current node using child signatures
    // For component detection, we want to ignore absolute positioning
    // and allow flexible styling at all levels
    const signature = this.createSignature(node, childSignatures, true);

    // Only consider nodes with children as potential components
    if (node.children.length > 0) {
      if (!this.components.has(signature)) {
        this.components.set(signature, {
          componentId: "",
          nodes: [],
          signature,
        });
      }
      this.components.get(signature)!.nodes.push(node);
    }

    return signature;
  }

  /**
   * Mark components that appear 2+ times
   */
  private markComponents(): void {
    this.components.forEach((componentInfo, signature) => {
      if (componentInfo.nodes.length >= 2) {
        const componentId = `C${this.componentCounter++}`;
        componentInfo.componentId = componentId;

        // Mark all nodes belonging to this component
        componentInfo.nodes.forEach((node) => {
          this.nodeToComponent.set(node.id, componentId);
        });
      }
    });
  }

  /**
   * Find and mark components in the tree
   * Now with optimized single-pass algorithm
   */
  public findComponents(rootNode: Node): {
    components: ComponentInfo[];
    nodeToComponentMap: Map<string, string>;
  } {
    // Reset state
    this.componentCounter = 1;
    this.components.clear();
    this.nodeToComponent.clear();

    // Single-pass collection with bottom-up signature building
    this.collectSignatures(rootNode);

    // Mark components
    this.markComponents();

    // Return results
    const validComponents = Array.from(this.components.values())
      .filter((comp) => comp.componentId !== "")
      .sort((a, b) => a.componentId.localeCompare(b.componentId));

    return {
      components: validComponents,
      nodeToComponentMap: this.nodeToComponent,
    };
  }
}

// Helper function to find similar components using the advanced detector
export const findSimilarComponents = (nodes: Node): Map<string, string[]> => {
  if (!nodes.children || nodes.children.length === 0)
    return new Map<string, string[]>();
  const detector = new ComponentDetector();
  const result = detector.findComponents(nodes);

  const componentMap = new Map<string, string[]>();

  result.components.forEach((component) => {
    const nodeIds = component.nodes.map((node) => node.id);
    componentMap.set(component.componentId, nodeIds);
  });

  return componentMap;
};

const getRandomId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

const getRandomCoord = (max: number) => Math.floor(Math.random() * max);
const getRandomSize = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomNodeType = (): Node["type"] => {
  const types: Node["type"][] = ["Div", "Input", "Image", "Button"];
  return types[Math.floor(Math.random() * types.length)];
};

const generateRandomNode = (
  parentId: string,
  parentX: number,
  parentY: number,
  parentWidth: number,
  parentHeight: number,
  level: number
): Node => {
  const type = getRandomNodeType();
  const width = getRandomSize(100, Math.min(parentWidth, 300));
  const height = getRandomSize(30, Math.min(parentHeight, 100));
  const x = getRandomCoord(parentWidth - width);
  const y = getRandomCoord(parentHeight - height);
  const divColors = ["white", "#FAFDF6", "#D8E2DC", "#F5EFED"];
  const buttonColors = ["#5D4E6D", "#2D2A32", "#23395B", "#0E1428"];
  const imageColors = ["white"];
  const inputColors = ["white", "#EDF2F4"];

  const node: Node = {
    id: getRandomId(type.toLowerCase()),
    name: `${type} ${getRandomSize(1, 10)}`,
    type,
    x: parentX + x,
    y: parentY + y,
    width,
    height,
    background:
      type === "Div"
        ? divColors[Math.floor(Math.random() * divColors.length)]
        : type === "Button"
        ? buttonColors[Math.floor(Math.random() * buttonColors.length)]
        : type === "Image"
        ? imageColors[Math.floor(Math.random() * imageColors.length)]
        : type === "Input"
        ? inputColors[Math.floor(Math.random() * inputColors.length)]
        : `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    border: "1px solid #f3f4f6",
    children: [],
  };

  if (type === "Button" || type === "Div" || type === "Input") {
    node.color =
      type === "Button"
        ? buttonColors[Math.floor(Math.random() * buttonColors.length)]
        : type === "Div"
        ? divColors[Math.floor(Math.random() * divColors.length)]
        : type === "Input"
        ? inputColors[Math.floor(Math.random() * inputColors.length)]
        : `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    if (type === "Button" || type === "Input") {
      node.text = `${type} ${Math.random().toString(36).substring(2, 5)}`;
    }
  }
  if (type === "Input") {
    node.color = "#000000";
    node.border = "1px solid #f3f4f6";
  }
  if (type === "Button") {
    node.color = "#ffffff";
  }

  // Recursively generate children with non-overlapping layout
  if (level < MAX_LEVELS && Math.random() > 0.3 && type !== "Input") {
    const numChildren = getRandomSize(1, 3);
    const padding = 10; // Minimum spacing between elements
    let currentX = padding;
    let currentY = padding;
    let rowHeight = 0;

    for (let i = 0; i < numChildren; i++) {
      const childType = getRandomNodeType();

      // Calculate available space
      const availableWidth = node.width - currentX - padding;
      const availableHeight = node.height - currentY - padding;

      // Generate reasonable child dimensions based on available space
      const maxChildWidth = Math.min(availableWidth, 300);
      const maxChildHeight = Math.min(availableHeight, 150);

      if (maxChildWidth < 50 || maxChildHeight < 30) {
        // Not enough space for another child
        break;
      }

      const childWidth = getRandomSize(50, maxChildWidth);
      const childHeight = getRandomSize(30, maxChildHeight);

      // Check if child fits in current row
      if (currentX + childWidth + padding > node.width) {
        // Move to next row
        currentX = padding;
        currentY += rowHeight + padding;
        rowHeight = 0;

        // Check if we have enough vertical space for new row
        if (currentY + childHeight + padding > node.height) {
          break;
        }
      }

      const childNode = generateRandomNode(
        node.id,
        node.x + currentX,
        node.y + currentY,
        childWidth,
        childHeight,
        level + 1
      );
      node.children.push(childNode);

      // Update positioning for next child
      currentX += childWidth + padding;
      rowHeight = Math.max(rowHeight, childHeight);
    }
  }

  return node;
};

const cloneNodeAndAdjustCoords = (
  node: Node,
  deltaX: number,
  deltaY: number,
  idPrefix: string
): Node => {
  const clonedNode: Node = {
    ...node,
    id: getRandomId(idPrefix), // Assign new unique ID
    x: node.x + deltaX, // Adjust absolute X coordinate
    y: node.y + deltaY, // Adjust absolute Y coordinate
    children: [], // Clear children, will be cloned recursively
  };

  for (const child of node.children) {
    clonedNode.children.push(
      cloneNodeAndAdjustCoords(child, deltaX, deltaY, idPrefix)
    );
  }

  return clonedNode;
};

export const generateRandomMockData = (): Node => {
  const rootWidth = getRandomSize(600, 1000);
  const rootHeight = getRandomSize(400, 800);

  const rootNode: Node = {
    id: getRandomId("root"),
    name: "Root",
    type: "Div",
    x: 0,
    y: 0,
    width: rootWidth,
    height: rootHeight,
    background: `white`,
    children: [],
  };

  const numRootChildren = getRandomSize(1, 3);
  for (let i = 0; i < numRootChildren; i++) {
    rootNode.children.push(
      generateRandomNode(rootNode.id, 0, 0, rootWidth, rootHeight, 1)
    );
  }

  const allNodes: Node[] = [];
  const collectAllNodes = (node: Node) => {
    allNodes.push(node);
    for (const child of node.children) {
      collectAllNodes(child);
    }
  };
  collectAllNodes(rootNode);

  const componentCandidates = allNodes.filter(
    (node) => node.children.length > 0 && node.id !== rootNode.id
  );

  if (componentCandidates.length > 0) {
    const componentToReuse =
      componentCandidates[
        Math.floor(Math.random() * componentCandidates.length)
      ];

    const numReuses = getRandomSize(1, 3);

    for (let i = 0; i < numReuses; i++) {
      const potentialParents = allNodes.filter(
        (node) =>
          node.type === "Div" &&
          node.children.length < 5 &&
          node.width > componentToReuse.width &&
          node.height > componentToReuse.height
      );

      if (potentialParents.length > 0) {
        const parentNode =
          potentialParents[Math.floor(Math.random() * potentialParents.length)];

        const offsetX = getRandomCoord(
          parentNode.width - componentToReuse.width
        );
        const offsetY = getRandomCoord(
          parentNode.height - componentToReuse.height
        );

        const deltaX = parentNode.x + offsetX - componentToReuse.x;
        const deltaY = parentNode.y + offsetY - componentToReuse.y;

        const clonedComponent = cloneNodeAndAdjustCoords(
          componentToReuse,
          deltaX,
          deltaY,
          `reused-${componentToReuse.type.toLowerCase()}`
        );

        parentNode.children.push(clonedComponent);
      }
    }
  }

  return rootNode;
};
