import { state } from "./state";
import { findSimilarComponents, generateRandomMockData } from "../../lib/utils";
import type { Node } from "../../types/node";
import { computed } from "@legendapp/state";

export function initialize(mockNodes: Node = generateRandomMockData()) {
  state.nodes.set(mockNodes);
  state.selectedNodeId.set(null);
  state.toastMessage.set("");
  state.isToastVisible.set(false);
  state.componentMap.set(findSimilarComponents(mockNodes));
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

export function getSelectedNode() {
  const selectedNodeId = state.selectedNodeId.get();
  const nodes = state.nodes.get();
  return selectedNodeId ? findNodeById(nodes, selectedNodeId) : null;
}

// Actions
export function setSelectedNodeId(id: string | null) {
  state.selectedNodeId.set(id);
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
