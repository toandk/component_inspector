export type Node = {
  id: string;
  x: number;
  y: number;
  name: string;
  type: "Div" | "Input" | "Image" | "Button";
  width: number;
  height: number;
  display?: string;
  text?: string;
  background?: string;
  color?: string;
  border?: string;
  borderRadius?: string;
  children: Node[];
};

export type ComponentInfo = {
  componentId: string;
  nodes: Node[];
  signature: string;
};
