import { observable } from "@legendapp/state";
import type { Node } from "../../../types/node";

export interface StyleProperty {
  propertyKey: string;
  value: string;
  label: string;
  enabled: boolean; // Add enabled/disabled state
}

export interface EditingState {
  isEditing: boolean;
  field: "key" | "value" | null;
  tempValue: string;
}

export const cssInspectorState = observable({
  styles: [] as StyleProperty[],
  newPropertyKey: "",
  newPropertyValue: "",
  selectedNode: null as Node | null,
  filteredPropertySuggestions: [] as StyleProperty[],
  isShowingSuggestions: false,
  activelyEditingProperties: new Set<string>(), // Track which properties are being actively edited
  editingStates: new Map<string, EditingState>(), // Track inline editing state for each property
  insertLineIndex: -1, // Track where new property should be inserted
});

// Enhanced property suggestions with common CSS values
export const cssPropertySuggestions: StyleProperty[] = [
  { propertyKey: "background", value: "", label: "background", enabled: true },
  // {
  //   propertyKey: "background-color",
  //   value: "",
  //   label: "background-color",
  //   enabled: true,
  // },
  { propertyKey: "border", value: "", label: "border", enabled: true },
  {
    propertyKey: "border-radius",
    value: "",
    label: "border-radius",
    enabled: true,
  },
  { propertyKey: "color", value: "", label: "color", enabled: true },
  { propertyKey: "display", value: "", label: "display", enabled: true },
  {
    propertyKey: "display",
    value: "block",
    label: "display: block",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "contents",
    label: "display: contents",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "flex",
    label: "display: flex",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "flow",
    label: "display: flow",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "flow-root",
    label: "display: flow-root",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "grid",
    label: "display: grid",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "inline",
    label: "display: inline",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "inline-block",
    label: "display: inline-block",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "inline-flex",
    label: "display: inline-flex",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "inline-grid",
    label: "display: inline-grid",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "inline-table",
    label: "display: inline-table",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "list-item",
    label: "display: list-item",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "math",
    label: "display: math",
    enabled: true,
  },
  {
    propertyKey: "display",
    value: "none",
    label: "display: none",
    enabled: true,
  },
  // { propertyKey: "position", value: "", label: "position", enabled: true },
  // {
  //   propertyKey: "position",
  //   value: "relative",
  //   label: "position: relative",
  //   enabled: true,
  // },
  // {
  //   propertyKey: "position",
  //   value: "absolute",
  //   label: "position: absolute",
  //   enabled: true,
  // },
  // {
  //   propertyKey: "position",
  //   value: "fixed",
  //   label: "position: fixed",
  //   enabled: true,
  // },
  // {
  //   propertyKey: "position",
  //   value: "sticky",
  //   label: "position: sticky",
  //   enabled: true,
  // },
  // { propertyKey: "margin", value: "", label: "margin", enabled: true },
  // { propertyKey: "padding", value: "", label: "padding", enabled: true },
  // { propertyKey: "font-size", value: "", label: "font-size", enabled: true },
  // {
  //   propertyKey: "font-weight",
  //   value: "",
  //   label: "font-weight",
  //   enabled: true,
  // },
  // { propertyKey: "text-align", value: "", label: "text-align", enabled: true },
  // { propertyKey: "opacity", value: "", label: "opacity", enabled: true },
  // { propertyKey: "z-index", value: "", label: "z-index", enabled: true },
  { propertyKey: "height", value: "", label: "height", enabled: true },
  { propertyKey: "width", value: "", label: "width", enabled: true },
  // { propertyKey: "max-width", value: "", label: "max-width", enabled: true },
  // { propertyKey: "min-width", value: "", label: "min-width", enabled: true },
  // { propertyKey: "max-height", value: "", label: "max-height", enabled: true },
  // { propertyKey: "min-height", value: "", label: "min-height", enabled: true },
  { propertyKey: "x", value: "", label: "x", enabled: true },
  { propertyKey: "y", value: "", label: "y", enabled: true },
];

// Common CSS values for autocomplete
export const cssValueSuggestions: Record<string, string[]> = {
  display: [
    "block",
    "inline",
    "flex",
    "grid",
    "none",
    "inline-block",
    "inline-flex",
    "inline-grid",
  ],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  "text-align": ["left", "center", "right", "justify"],
  "font-weight": [
    "normal",
    "bold",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
  "align-items": ["flex-start", "flex-end", "center", "baseline", "stretch"],
  "justify-content": [
    "flex-start",
    "flex-end",
    "center",
    "space-between",
    "space-around",
    "space-evenly",
  ],
  "flex-direction": ["row", "column", "row-reverse", "column-reverse"],
  overflow: ["visible", "hidden", "scroll", "auto"],
  cursor: ["pointer", "default", "text", "wait", "crosshair", "not-allowed"],
};
