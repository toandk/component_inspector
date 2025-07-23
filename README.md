## FE Coding Test

There is a node data structured as a tree, where each node in the tree has the following properties:

```
 type Node = {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'Div' | 'Input' | 'Image' | 'Button';
  width: number;
  height: number;
  display?: string;
  text?: string;
  background?: string;
  color?: string;
  border?: string;
  children: Node[];
}
```

Here, x, y, width, and height represent the absolute bounding rectangle of the node on the canvas, x and y marking the position of the top-left point.

## Requirements

 Show a list of element in nodes as a tree view. Can toggle to open and close nodes
 UI to Preview the nodes, corresponding to the x, y, width, height and the css properties of that node. UI renders the correct type of node, there are 4 types: Div, Image, Input and Button. When clicking on nodes in the tree from 1, the selected node should be highlighted and vice versa.

 Indicate which nodes can be components of each other and you can add the letters C1, C2,... in the tree view to know that those nodes should be a component. It would be better if the nodes are the same component so that the code can be reused.
 Create a CSS Inspector tool. The experience should be similar to the CSS inspector panel in Chrome DevTools. If the css changes, the nodes data should be updated and the preview should reflect. New styles can be added even if they are not yet in the data node.
React and typescript are required. Recommended not to use any UI Framework Can use CSS Module or Tailwind). You can mock nodes data for testing.
UI Example:
FE Coding Test 2
