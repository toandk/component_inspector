import { observable } from "@legendapp/state";
import type { Node } from "../../types/node";
import { mockNodes } from "@/lib/mock-data";

export const state = observable({
  nodes: {} as Node, // This will be initialized with mockNodes
  selectedNodeId: null as string | null,
  toastMessage: "" as string,
  isToastVisible: false as boolean,
  componentMap: new Map<string, string[]>() as Map<string, string[]>,
  stackNodes: [] as Node[],
  activeTab: "css-inspector" as "css-inspector" | "components",
  leftPanelTab: "element-tree" as "element-tree" | "figma-importer",
  highlightedComponentId: null as string | null,
});
