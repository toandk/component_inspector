import { state } from "./state";
import { findSimilarComponents, generateRandomMockData } from "../../lib/utils";
import type { Node } from "../../types/node";
import { computed } from "@legendapp/state";

export function initialize(mockNodes: Node = generateRandomMockData()) {
  setNodes(mockNodes);
  state.stackNodes.set([mockNodes]);
}

// Selectors
export function getNodes() {
  return state.nodes.get();
}

export function getSelectedNodeId() {
  return state.selectedNodeId.get();
}

export function getToastMessage() {
  return state.toastMessage.get();
}

export function getIsToastVisible() {
  return state.isToastVisible.get();
}

export function getComponentMap() {
  return state.componentMap.get();
}

export function getComponentList() {
  const componentMap = state.componentMap.get();
  const components: Array<{
    id: string;
    name: string;
    instances: number;
    nodeIds: string[];
  }> = [];

  componentMap.forEach((nodeIds, componentId) => {
    // Get the first node to determine the component name
    const nodes = state.nodes.get();
    const firstNode = findNodeById(nodes, nodeIds[0]);
    const componentName = firstNode?.name || `Component ${componentId}`;

    components.push({
      id: componentId,
      name: componentName,
      instances: nodeIds.length,
      nodeIds: nodeIds,
    });
  });

  return components.sort((a, b) => a.name.localeCompare(b.name));
}

export function getSelectedNode() {
  const selectedNodeId = state.selectedNodeId.get();
  const nodes = state.nodes.get();
  return selectedNodeId ? findNodeById(nodes, selectedNodeId) : null;
}

export function getStackNodes() {
  return state.stackNodes.get();
}

export function getActiveTab() {
  return state.activeTab.get();
}

export function getHighlightedComponentId() {
  return state.highlightedComponentId.get();
}

// Actions
export function setNodes(nodes: Node) {
  state.nodes.set(nodes);
  state.selectedNodeId.set(null);
  state.toastMessage.set("");
  state.isToastVisible.set(false);
  state.componentMap.set(findSimilarComponents(nodes));
}

export function setSelectedNodeId(id: string | null) {
  state.selectedNodeId.set(id);
}

export function pushStackNode(node: Node) {
  setNodes(node);
  state.stackNodes.set([...state.stackNodes.get(), node]);
}

export function popStackNode() {
  const stackNodes = state.stackNodes.get();
  if (stackNodes.length > 1) {
    setNodes(stackNodes[stackNodes.length - 2]);
    state.stackNodes.set(stackNodes.slice(0, -1));
  }
}

export function updateNodeById(
  node: Node,
  id: string,
  updates: Record<string, string>
): Node {
  if (node.id === id) {
    return { ...node, ...updates };
  }
  return {
    ...node,
    children: node.children.map((child) => updateNodeById(child, id, updates)),
  };
}

export function handleUpdateNode(
  nodeId: string,
  updates: Record<string, string>
) {
  state.nodes.set((prevNodes) => updateNodeById(prevNodes, nodeId, updates));
}

export function findNodeById(node: Node, id: string): Node | null {
  if (node.id === id) return node;
  for (const childNode of node.children) {
    if (childNode.id === id) return childNode;
    const found = findNodeById(childNode, id);
    if (found) return found;
  }
  return null;
}

export function showToast(message: string) {
  state.toastMessage.set(message);
  state.isToastVisible.set(true);
}

export function hideToast() {
  state.isToastVisible.set(false);
  state.toastMessage.set("");
}

export function setActiveTab(tab: "css-inspector" | "components") {
  state.activeTab.set(tab);
}

export function setHighlightedComponentId(componentId: string | null) {
  state.highlightedComponentId.set(componentId);
}
