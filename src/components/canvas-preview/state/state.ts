import { observable } from "@legendapp/state";

export const state = observable({
  zoom: 1,
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
  pan: {
    x: 0,
    y: 0,
  },
  initialPan: {
    x: 0,
    y: 0,
  },
  isDragging: false,
});
