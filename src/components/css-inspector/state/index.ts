import {
  cssInspectorState,
  StyleProperty,
  cssPropertySuggestions,
} from "./state";

// Actions
export function initializeCssInspectorState(selectedNode: any | null) {
  if (selectedNode) {
    const nodeStyles: StyleProperty[] = [
      {
        propertyKey: "x",
        value: selectedNode.x.toString(),
        label: "X Position",
      },
      {
        propertyKey: "y",
        value: selectedNode.y.toString(),
        label: "Y Position",
      },
      {
        propertyKey: "width",
        value: selectedNode.width.toString(),
        label: "Width",
      },
      {
        propertyKey: "height",
        value: selectedNode.height.toString(),
        label: "Height",
      },
      {
        propertyKey: "background",
        value: selectedNode.background || "",
        label: "Background",
      },
      { propertyKey: "color", value: selectedNode.color || "", label: "Color" },
      {
        propertyKey: "border",
        value: selectedNode.border || "",
        label: "Border",
      },
      {
        propertyKey: "borderRadius",
        value: selectedNode.borderRadius || "",
        label: "Border Radius",
      },
      {
        propertyKey: "display",
        value: selectedNode.display || "",
        label: "Display",
      },
      {
        propertyKey: "text",
        value: selectedNode.text || "",
        label: "Text Content",
      },
    ];
    cssInspectorState.styles.set(nodeStyles);
  } else {
    cssInspectorState.styles.set([]);
  }
}

export function syncNodeChanges(selectedNode: any | null) {
  if (!selectedNode) return;

  // Update existing styles with current node values
  cssInspectorState.styles.set((prev) =>
    prev.map((style) => {
      switch (style.propertyKey) {
        case "x":
          return { ...style, value: selectedNode.x.toString() };
        case "y":
          return { ...style, value: selectedNode.y.toString() };
        case "width":
          return { ...style, value: selectedNode.width.toString() };
        case "height":
          return { ...style, value: selectedNode.height.toString() };
        case "background":
          return { ...style, value: selectedNode.background || "" };
        case "color":
          return { ...style, value: selectedNode.color || "" };
        case "border":
          return { ...style, value: selectedNode.border || "" };
        case "borderRadius":
          return { ...style, value: selectedNode.borderRadius || "" };
        case "display":
          return { ...style, value: selectedNode.display || "" };
        case "text":
          return { ...style, value: selectedNode.text || "" };
        default:
          return style;
      }
    })
  );
}

export function updateStyle(key: string, value: string) {
  cssInspectorState.styles.set((prev) =>
    prev.map((style) =>
      style.propertyKey === key ? { ...style, value } : style
    )
  );
}

export function addActivelyEditingProperty(key: string) {
  const currentSet = cssInspectorState.activelyEditingProperties.get();
  const newSet = new Set(currentSet);
  newSet.add(key);
  cssInspectorState.activelyEditingProperties.set(newSet);
}

export function removeActivelyEditingProperty(key: string) {
  const currentSet = cssInspectorState.activelyEditingProperties.get();
  const newSet = new Set(currentSet);
  newSet.delete(key);
  cssInspectorState.activelyEditingProperties.set(newSet);
}

export function clearActivelyEditingProperties() {
  cssInspectorState.activelyEditingProperties.set(new Set());
}

export function addProperty(newProperty: StyleProperty) {
  cssInspectorState.styles.set((prev) => [...prev, newProperty]);
}

export function removeProperty(key: string) {
  cssInspectorState.styles.set((prev) =>
    prev.filter((style) => style.propertyKey !== key)
  );
}

export function setNewPropertyKey(key: string) {
  cssInspectorState.newPropertyKey.set(key);
}

export function setNewPropertyKeyAndFilterSuggestions(key: string) {
  cssInspectorState.newPropertyKey.set(key);
  const filtered = cssPropertySuggestions.filter((s) =>
    s.label.toLowerCase().includes(key.toLowerCase())
  );
  cssInspectorState.filteredPropertySuggestions.set(filtered);
  cssInspectorState.isShowingSuggestions.set(true);
}

export function selectSuggestedProperty(property: StyleProperty) {
  cssInspectorState.newPropertyKey.set(property.propertyKey);
  cssInspectorState.newPropertyValue.set(property.value);
  cssInspectorState.isShowingSuggestions.set(false);
}

export function setIsShowingSuggestions(isShowing: boolean) {
  cssInspectorState.isShowingSuggestions.set(isShowing);
}

export function setNewPropertyValue(value: string) {
  cssInspectorState.newPropertyValue.set(value);
}

export function resetNewPropertyFields() {
  cssInspectorState.newPropertyKey.set("");
  cssInspectorState.newPropertyValue.set("");
}

export function setSelectedNode(node: any | null) {
  cssInspectorState.selectedNode.set(node);
}

// Selectors
export function getStyles() {
  return cssInspectorState.styles.get();
}

export function getNewPropertyKey() {
  return cssInspectorState.newPropertyKey.get();
}

export function getFilteredPropertySuggestions() {
  return cssInspectorState.filteredPropertySuggestions.get();
}

export function getIsShowingSuggestions() {
  return cssInspectorState.isShowingSuggestions.get();
}

export function getNewPropertyValue() {
  return cssInspectorState.newPropertyValue.get();
}

export function getSelectedNode() {
  return cssInspectorState.selectedNode.get();
}

export function getActivelyEditingProperties() {
  return cssInspectorState.activelyEditingProperties.get();
}
