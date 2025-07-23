import { state } from "./state";

// Initialize function to center the root node in the canvas
export function initialize(
  rootNodeWidth: number,
  rootNodeHeight: number,
  containerWidth: number,
  containerHeight: number
) {
  // Calculate the center position accounting for the root node dimensions
  const centerX = (containerWidth - rootNodeWidth) / 2;
  const centerY = (containerHeight - rootNodeHeight) / 2;

  const initialPosition = { x: centerX, y: centerY };
  state.initialPan.set(initialPosition);
  state.pan.set(initialPosition);
  state.zoom.set(1);
}

// Selectors
export function getZoom() {
  return state.zoom.get();
}

export function getMinZoom() {
  return state.minZoom.get();
}

export function getMaxZoom() {
  return state.maxZoom.get();
}

export function getZoomStep() {
  return state.zoomStep.get();
}

export function getPan() {
  return state.pan.get();
}

export function getIsDragging() {
  return state.isDragging.get();
}

// Actions
export function setZoom(zoom: number) {
  const minZoom = state.minZoom.get();
  const maxZoom = state.maxZoom.get();
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  state.zoom.set(clampedZoom);
}

export function zoomIn() {
  const currentZoom = state.zoom.get();
  const zoomStep = state.zoomStep.get();
  const maxZoom = state.maxZoom.get();
  const newZoom = Math.min(currentZoom + zoomStep, maxZoom);
  state.zoom.set(newZoom);
}

export function zoomOut() {
  const currentZoom = state.zoom.get();
  const zoomStep = state.zoomStep.get();
  const minZoom = state.minZoom.get();
  const newZoom = Math.max(currentZoom - zoomStep, minZoom);
  state.zoom.set(newZoom);
}

export function resetZoom() {
  state.zoom.set(1);
}

export function setPan(x: number, y: number) {
  state.pan.set({ x, y });
}

export function updatePan(deltaX: number, deltaY: number) {
  const currentPan = state.pan.get();
  state.pan.set({
    x: currentPan.x + deltaX,
    y: currentPan.y + deltaY,
  });
}

export function resetPan() {
  state.pan.set({ x: 0, y: 0 });
}

export function setIsDragging(isDragging: boolean) {
  state.isDragging.set(isDragging);
}

export function resetCanvas() {
  state.zoom.set(1);
  // Get the stored initial pan position (centered position)
  const initialPan = state.initialPan.get();
  state.pan.set(initialPan);
}
