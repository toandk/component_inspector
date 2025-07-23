import { observable } from "@legendapp/state";
import type { Node } from "../../../types/node";

export interface StyleProperty {
  propertyKey: string;
  value: string;
  label: string;
}

export const cssInspectorState = observable({
  styles: [] as StyleProperty[],
  newPropertyKey: "",
  newPropertyValue: "",
  selectedNode: null as Node | null,
  filteredPropertySuggestions: [] as StyleProperty[],
  isShowingSuggestions: false,
});

export const cssPropertySuggestions: StyleProperty[] = [
  { propertyKey: "background", value: "", label: "background" },
  { propertyKey: "border", value: "", label: "border" },
  { propertyKey: "color", value: "", label: "color" },
  { propertyKey: "display", value: "", label: "display" },
  { propertyKey: "display", value: "block", label: "display: block" },
  { propertyKey: "display", value: "contents", label: "display: contents" },
  { propertyKey: "display", value: "flex", label: "display: flex" },
  { propertyKey: "display", value: "flow", label: "display: flow" },
  { propertyKey: "display", value: "flow-root", label: "display: flow-root" },
  { propertyKey: "display", value: "grid", label: "display: grid" },
  { propertyKey: "display", value: "inline", label: "display: inline" },
  {
    propertyKey: "display",
    value: "inline-block",
    label: "display: inline-block",
  },
  {
    propertyKey: "display",
    value: "inline-flex",
    label: "display: inline-flex",
  },
  {
    propertyKey: "display",
    value: "inline-grid",
    label: "display: inline-grid",
  },
  {
    propertyKey: "display",
    value: "inline-table",
    label: "display: inline-table",
  },
  { propertyKey: "display", value: "list-item", label: "display: list-item" },
  { propertyKey: "display", value: "math", label: "display: math" },
  { propertyKey: "height", value: "", label: "height" },
  { propertyKey: "text", value: "", label: "text" },
  { propertyKey: "width", value: "", label: "width" },
  { propertyKey: "x", value: "", label: "x" },
  { propertyKey: "y", value: "", label: "y" },
];
