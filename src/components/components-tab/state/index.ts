import { state } from "./state";

// Selectors
export function getExpandedComponentIds() {
  return state.expandedComponentIds.get();
}

export function isComponentExpanded(componentId: string) {
  return state.expandedComponentIds.get().includes(componentId);
}

export function getExpandedComponentId() {
  const expandedIds = state.expandedComponentIds.get();
  return expandedIds.length > 0 ? expandedIds[0] : null;
}

// Actions
export function toggleComponentExpanded(componentId: string) {
  const expandedIds = state.expandedComponentIds.get();
  if (expandedIds.includes(componentId)) {
    // If this component is expanded, collapse it
    state.expandedComponentIds.set([]);
  } else {
    // Expand this component and collapse all others
    state.expandedComponentIds.set([componentId]);
  }
}

export function setComponentExpanded(componentId: string, expanded: boolean) {
  if (expanded) {
    // Expand this component and collapse all others
    state.expandedComponentIds.set([componentId]);
  } else {
    // Collapse this component
    state.expandedComponentIds.set([]);
  }
}
