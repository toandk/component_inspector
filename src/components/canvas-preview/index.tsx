"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { useSelector } from "@legendapp/state/react";

import type { Node } from "../../types/node";
import {
  getZoom,
  zoomIn,
  zoomOut,
  resetCanvas,
  setZoom,
  getPan,
  getIsDragging,
  updatePan,
  setIsDragging,
  initialize,
} from "./state";

interface CanvasPreviewProps {
  node: Node;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Record<string, any>) => void;
  highlightedComponentId?: string | null;
  componentMap?: Map<string, string[]>;
}

interface NodeRendererProps {
  node: Node;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  rootNode: Node; // Add root node for hierarchy traversal
  onNodeUpdate?: (nodeId: string, updates: Record<string, any>) => void;
  isChildNode?: boolean; // Track if this is a child node for relative positioning
  highlightedComponentId?: string | null;
  componentMap?: Map<string, string[]>;
}

// Helper function to check if a point is inside a node's bounds
// accounting for the node's absolute position in the canvas
function isPointInNode(
  x: number,
  y: number,
  node: Node,
  nodeAbsoluteX: number,
  nodeAbsoluteY: number
): boolean {
  return (
    x >= nodeAbsoluteX &&
    x <= nodeAbsoluteX + node.width &&
    y >= nodeAbsoluteY &&
    y <= nodeAbsoluteY + node.height
  );
}

// Helper function to find all nodes at a given position (including nested ones)
function findNodesAtPosition(x: number, y: number, node: Node): Node[] {
  const nodesAtPosition: Node[] = [];

  function traverse(
    currentNode: Node,
    parentAbsoluteX: number = 0,
    parentAbsoluteY: number = 0
  ) {
    // Calculate absolute position by adding parent's absolute position to current node's relative position
    const nodeAbsoluteX = parentAbsoluteX + currentNode.x;
    const nodeAbsoluteY = parentAbsoluteY + currentNode.y;

    if (isPointInNode(x, y, currentNode, nodeAbsoluteX, nodeAbsoluteY)) {
      nodesAtPosition.push(currentNode);
    }

    // Traverse children with this node's absolute position as their parent coordinates
    currentNode.children.forEach((child) =>
      traverse(child, nodeAbsoluteX, nodeAbsoluteY)
    );
  }

  traverse(node);
  return nodesAtPosition;
}

// Helper function to get the hierarchy path from root to a specific node
function getNodeHierarchyPath(targetNodeId: string, rootNode: Node): Node[] {
  const path: Node[] = [];

  function findPath(currentNode: Node): boolean {
    path.push(currentNode);

    if (currentNode.id === targetNodeId) {
      return true;
    }

    for (const child of currentNode.children) {
      if (findPath(child)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  findPath(rootNode);
  return path;
}

function NodeRenderer({
  node,
  selectedNodeId,
  onNodeSelect,
  rootNode,
  onNodeUpdate,
  isChildNode = false,
  highlightedComponentId,
  componentMap,
}: NodeRendererProps) {
  const zoom = useSelector(getZoom);
  const pan = useSelector(getPan);
  const isSelected = selectedNodeId === node.id;

  // Determine if this node should be highlighted based on component highlighting
  const isHighlighted = (() => {
    if (!highlightedComponentId || !componentMap) return false;

    // Find which component this node belongs to
    let nodeComponentId: string | null = null;
    componentMap.forEach((nodeIds, componentId) => {
      if (nodeIds.includes(node.id)) {
        nodeComponentId = componentId;
      }
    });

    // Highlight if this node belongs to the highlighted component
    return highlightedComponentId && nodeComponentId === highlightedComponentId;
  })();

  const baseStyles: React.CSSProperties = {
    position: "absolute",
    // For child nodes, use relative positioning within parent
    // For root-level nodes, use absolute positioning in canvas
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    background: node.background || "transparent",
    color: node.color || "#000000",
    border: node.border || "none",
    borderRadius: node.borderRadius || "0",
    display: node.display || "block",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const selectedStyles: React.CSSProperties = isSelected
    ? {
        outline: "1px solid #3b82f6",
        outlineOffset: "1px",
      }
    : {};

  const highlightedStyles: React.CSSProperties = isHighlighted
    ? {
        outline: "3px solid #f59e0b",
        outlineOffset: "2px",
        boxShadow: "0 0 0 1px #f59e0b, 0 4px 12px rgba(245, 158, 11, 0.3)",
      }
    : {};

  const combinedStyles = {
    ...baseStyles,
    ...selectedStyles,
    ...highlightedStyles,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelect(node.id);
  };

  // Handle double-click to select deeper nodes when multiple nodes are at the same position
  // Similar to Figma's behavior - cycles through nodes at the click position from deepest to shallowest
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Get click position relative to the canvas (accounting for zoom and pan)
    const containerRect = e.currentTarget
      .closest("[data-canvas-container]")
      ?.getBoundingClientRect();

    if (!containerRect) return;

    // Calculate the actual position in the canvas coordinate system
    const canvasX = (e.clientX - containerRect.left - pan.x) / zoom;
    const canvasY = (e.clientY - containerRect.top - pan.y) / zoom;

    // Find all nodes at this position
    const nodesAtPosition = findNodesAtPosition(canvasX, canvasY, rootNode);

    if (nodesAtPosition.length <= 1) {
      // If only one node or no nodes, just select the current one
      onNodeSelect(node.id);
      return;
    }

    // Sort nodes by depth (deepest first)
    // We can determine depth by the length of hierarchy path
    const nodesByDepth = nodesAtPosition
      .map((n) => ({
        node: n,
        depth: getNodeHierarchyPath(n.id, rootNode).length,
      }))
      .sort((a, b) => b.depth - a.depth);

    // Find current selection in the list
    const currentIndex = nodesByDepth.findIndex(
      (item) => item.node.id === selectedNodeId
    );

    let nextIndex: number;
    if (currentIndex === -1) {
      // No current selection or current selection not in this stack, select the deepest
      nextIndex = 0;
    } else {
      // Select the next deeper node, or wrap to shallowest if at deepest
      nextIndex = (currentIndex + 1) % nodesByDepth.length;
    }

    onNodeSelect(nodesByDepth[nextIndex].node.id);
  };

  const renderNodeContent = () => {
    // If the node has children, render as a container div regardless of type
    // This allows proper hierarchical rendering
    if (node.children.length > 0) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {node.text && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                zIndex: 0,
                pointerEvents: "none", // Allow clicks to pass through to children
              }}
            >
              {node.text}
            </div>
          )}
        </div>
      );
    }

    // For leaf nodes, render according to their type
    switch (node.type) {
      case "Input":
        return (
          <input
            type="text"
            value={node.text || ""}
            placeholder="Input field"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "inherit",
              padding: "8px",
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onChange={(e) => {
              e.stopPropagation();
              if (onNodeUpdate) {
                onNodeUpdate(node.id, { text: e.target.value });
              }
            }}
          />
        );
      case "Button":
        return (
          <button
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            {node.text || "Button"}
          </button>
        );
      case "Image":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src="/img_thumb.png"
              alt="Default image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = "none";
                const fallbackDiv = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallbackDiv) {
                  fallbackDiv.style.display = "flex";
                }
              }}
            />
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#666",
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "#f5f5f5",
              }}
            >
              🖼️ Image
            </div>
          </div>
        );
      case "Div":
      default:
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: node.text ? "center" : "flex-start",
              justifyContent: node.text ? "center" : "flex-start",
              fontSize: "14px",
              padding: node.text ? "0" : "4px",
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            {node.text || ""}
          </div>
        );
    }
  };

  return (
    <>
      <div style={combinedStyles}>
        {renderNodeContent()}
        {/* Render children inside the parent container */}
        {node.children.map((child) => (
          <NodeRenderer
            key={child.id}
            node={child}
            selectedNodeId={selectedNodeId}
            onNodeSelect={onNodeSelect}
            rootNode={rootNode}
            onNodeUpdate={onNodeUpdate}
            isChildNode={true}
            highlightedComponentId={highlightedComponentId}
            componentMap={componentMap}
          />
        ))}
      </div>
    </>
  );
}

export function CanvasPreview({
  node,
  selectedNodeId,
  onNodeSelect,
  onNodeUpdate,
  highlightedComponentId,
  componentMap,
}: CanvasPreviewProps) {
  const zoom = useSelector(getZoom);
  const pan = useSelector(getPan);
  const isDragging = useSelector(getIsDragging);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const isPanningRef = useRef(false);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomFactor = 0.025;

        if (delta < 0) {
          // Zoom in
          const newZoom = zoom + zoomFactor;
          setZoom(newZoom);
        } else {
          // Zoom out
          const newZoom = zoom - zoomFactor;
          setZoom(newZoom);
        }
      }
    },
    [zoom]
  );

  // Handle mouse drag for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Check if we're clicking on a node element or its children
      const clickedElement = e.target as HTMLElement;
      const isClickingOnNode = clickedElement.closest("[data-node-element]");

      if (!isClickingOnNode) {
        e.preventDefault();
        e.stopPropagation();
        isPanningRef.current = true;
        setIsDragging(true);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        // Deselect any selected node when starting to pan
        onNodeSelect("");
      }
    },
    [onNodeSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && lastMousePosRef.current && isPanningRef.current) {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePosRef.current.x;
        const deltaY = e.clientY - lastMousePosRef.current.y;

        updatePan(deltaX, deltaY);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsDragging(false);
      lastMousePosRef.current = null;
    }
  }, []);

  // Handle touch gestures for pinch-to-zoom and pan
  const touchStartRef = useRef<{
    distance: number;
    zoom: number;
    touches: number;
    lastPos?: { x: number; y: number };
  } | null>(null);

  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two finger pinch-to-zoom
        e.preventDefault();
        const distance = getDistance(e.touches);
        touchStartRef.current = { distance, zoom, touches: 2 };
      } else if (e.touches.length === 1) {
        // Single finger pan - check if touching a node
        const touch = e.touches[0];
        const target = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        ) as HTMLElement;
        const isOnNode = target?.closest("[data-node-element]");

        if (!isOnNode) {
          touchStartRef.current = {
            distance: 0,
            zoom,
            touches: 1,
            lastPos: { x: touch.clientX, y: touch.clientY },
          };
        }
      }
    },
    [zoom]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2 && touchStartRef.current.touches === 2) {
      // Pinch-to-zoom
      e.preventDefault();
      const distance = getDistance(e.touches);
      const scale = distance / touchStartRef.current.distance;
      const newZoom = touchStartRef.current.zoom * scale;
      setZoom(newZoom);
    } else if (
      e.touches.length === 1 &&
      touchStartRef.current.touches === 1 &&
      touchStartRef.current.lastPos
    ) {
      // Single finger pan
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.lastPos.x;
      const deltaY = touch.clientY - touchStartRef.current.lastPos.y;

      updatePan(deltaX, deltaY);
      touchStartRef.current.lastPos = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Initialize canvas position to center the root node
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      // Account for margins and borders in the calculation
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      initialize(node.width, node.height, containerWidth, containerHeight);
    }
  }, [node.width, node.height]);

  // Handle container resize to re-center
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        initialize(node.width, node.height, width, height);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [node.width, node.height]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events - attach to document for better tracking
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Wheel events
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Touch events
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div
      ref={containerRef}
      data-canvas-container="true"
      className={`relative w-full h-full bg-gray-100 border border-gray-300 overflow-hidden select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Zoomable and pannable content */}
      <div
        ref={contentRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <div data-node-element="true">
          <NodeRenderer
            key={node.id}
            node={node}
            selectedNodeId={selectedNodeId}
            onNodeSelect={onNodeSelect}
            rootNode={node}
            onNodeUpdate={onNodeUpdate}
            isChildNode={false}
            highlightedComponentId={highlightedComponentId}
            componentMap={componentMap}
          />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
        {/* Zoom level indicator */}
        <div className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          {Math.round(zoom * 100)}%
        </div>

        {/* Zoom buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={zoomIn}
            className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 shadow-sm flex items-center justify-center text-gray-700 font-medium transition-colors"
            title="Zoom In (Ctrl + Mouse Wheel)"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 shadow-sm flex items-center justify-center text-gray-700 font-medium transition-colors"
            title="Zoom Out (Ctrl + Mouse Wheel)"
          >
            −
          </button>
          <button
            onClick={resetCanvas}
            className="w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 shadow-sm flex items-center justify-center text-gray-700 text-xs font-medium transition-colors"
            title="Reset Zoom & Pan (100%)"
          >
            ⌂
          </button>
        </div>
      </div>

      {/* Pan instructions overlay (only when not dragging) */}
      {!isDragging && (
        <div className="absolute bottom-4 left-8 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-75 pointer-events-none">
          Drag to pan • Ctrl+scroll to zoom • Pinch to zoom
        </div>
      )}
    </div>
  );
}
