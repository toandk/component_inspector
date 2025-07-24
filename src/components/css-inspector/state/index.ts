import {
  cssInspectorState,
  StyleProperty,
  cssPropertySuggestions,
  cssValueSuggestions,
  EditingState,
} from "./state";

// Actions
export function initializeCssInspectorState(selectedNode: any | null) {
  if (selectedNode) {
    const nodeStyles: StyleProperty[] = [
      {
        propertyKey: "x",
        value: selectedNode.x.toString(),
        label: "X Position",
        enabled: true,
      },
      {
        propertyKey: "y",
        value: selectedNode.y.toString(),
        label: "Y Position",
        enabled: true,
      },
      {
        propertyKey: "width",
        value: selectedNode.width.toString(),
        label: "Width",
        enabled: true,
      },
      {
        propertyKey: "height",
        value: selectedNode.height.toString(),
        label: "Height",
        enabled: true,
      },
      {
        propertyKey: "background",
        value: selectedNode.background || "",
        label: "Background",
        enabled: selectedNode.background ? true : false,
      },
      {
        propertyKey: "color",
        value: selectedNode.color || "",
        label: "Color",
        enabled: selectedNode.color ? true : false,
      },
      {
        propertyKey: "border",
        value: selectedNode.border || "",
        label: "Border",
        enabled: selectedNode.border ? true : false,
      },
      {
        propertyKey: "border-radius",
        value: selectedNode.borderRadius || "",
        label: "Border Radius",
        enabled: selectedNode.borderRadius ? true : false,
      },
      {
        propertyKey: "display",
        value: selectedNode.display || "",
        label: "Display",
        enabled: selectedNode.display ? true : false,
      },
      {
        propertyKey: "text",
        value: selectedNode.text || "",
        label: "Text Content",
        enabled: selectedNode.text ? true : false,
      },
    ];
    cssInspectorState.styles.set(nodeStyles);
  } else {
    cssInspectorState.styles.set([]);
  }
  // Clear editing states when initializing
  cssInspectorState.editingStates.set(new Map());
  cssInspectorState.insertLineIndex.set(-1);
}

export function syncNodeChanges(selectedNode: any | null) {
  if (!selectedNode) return;

  // Update existing styles with current node values, but preserve disabled style values
  cssInspectorState.styles.set((prev) =>
    prev.map((style) => {
      // If style is disabled and has a value, keep the existing value
      if (!style.enabled && style.value !== "") {
        return style;
      }

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
        case "border-radius":
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

export function toggleStyleEnabled(key: string) {
  cssInspectorState.styles.set((prev) =>
    prev.map((style) =>
      style.propertyKey === key ? { ...style, enabled: !style.enabled } : style
    )
  );
}

export function updateStyleProperty(
  key: string,
  newKey: string,
  value: string
) {
  cssInspectorState.styles.set((prev) =>
    prev.map((style) =>
      style.propertyKey === key
        ? { ...style, propertyKey: newKey, value, label: newKey }
        : style
    )
  );
}

// Inline editing functions
export function startEditing(propertyKey: string, field: "key" | "value") {
  const currentStates = cssInspectorState.editingStates.get();
  const currentValue =
    field === "key"
      ? propertyKey
      : cssInspectorState.styles
          .get()
          .find((s) => s.propertyKey === propertyKey)?.value || "";

  const newStates = new Map(currentStates);
  newStates.set(propertyKey, {
    isEditing: true,
    field,
    tempValue: currentValue,
  });
  cssInspectorState.editingStates.set(newStates);
}

export function stopEditing(propertyKey: string) {
  const currentStates = cssInspectorState.editingStates.get();
  const newStates = new Map(currentStates);
  newStates.delete(propertyKey);
  cssInspectorState.editingStates.set(newStates);
}

export function updateEditingValue(propertyKey: string, value: string) {
  const currentStates = cssInspectorState.editingStates.get();
  const currentState = currentStates.get(propertyKey);
  if (currentState) {
    const newStates = new Map(currentStates);
    newStates.set(propertyKey, { ...currentState, tempValue: value });
    cssInspectorState.editingStates.set(newStates);
  }
}

export function commitEdit(propertyKey: string) {
  const currentStates = cssInspectorState.editingStates.get();
  const editingState = currentStates.get(propertyKey);

  if (editingState) {
    if (editingState.field === "key") {
      // Update property key
      updateStyleProperty(
        propertyKey,
        editingState.tempValue,
        cssInspectorState.styles
          .get()
          .find((s) => s.propertyKey === propertyKey)?.value || ""
      );
    } else if (editingState.field === "value") {
      // Update property value
      updateStyle(propertyKey, editingState.tempValue);
    }
    stopEditing(propertyKey);
  }
}

export function setInsertLineIndex(index: number) {
  cssInspectorState.insertLineIndex.set(index);
}

export function addPropertyAtIndex(property: StyleProperty, index: number) {
  cssInspectorState.styles.set((prev) => {
    const newStyles = [...prev];
    newStyles.splice(index, 0, property);
    return newStyles;
  });
  cssInspectorState.insertLineIndex.set(-1);
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

export function getValueSuggestions(propertyKey: string, input: string = "") {
  const suggestions = cssValueSuggestions[propertyKey] || [];
  if (!input) return suggestions;
  return suggestions.filter((value) =>
    value.toLowerCase().includes(input.toLowerCase())
  );
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

export function getEditingStates() {
  return cssInspectorState.editingStates.get();
}

export function getInsertLineIndex() {
  return cssInspectorState.insertLineIndex.get();
}
