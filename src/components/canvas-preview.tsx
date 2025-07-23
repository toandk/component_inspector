"use client";

import React from "react";

import type { Node } from "../types/node";

interface CanvasPreviewProps {
  node: Node;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

interface NodeRendererProps {
  node: Node;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

function NodeRenderer({
  node,
  selectedNodeId,
  onNodeSelect,
}: NodeRendererProps) {
  const isSelected = selectedNodeId === node.id;

  const baseStyles: React.CSSProperties = {
    position: "absolute",
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    background: node.background || "transparent",
    color: node.color || "#000000",
    border: node.border || "none",
    display: node.display || "block",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const selectedStyles: React.CSSProperties = isSelected
    ? {
        outline: "2px solid #3b82f6",
        outlineOffset: "2px",
      }
    : {};

  const combinedStyles = { ...baseStyles, ...selectedStyles };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelect(node.id);
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case "Input":
        return (
          <input
            type="text"
            placeholder={node.text || "Input field"}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "#666",
            }}
            onClick={handleClick}
          >
            🖼️ Image
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
          >
            {node.text || ""}
          </div>
        );
    }
  };

  return (
    <>
      <div style={combinedStyles}>{renderNodeContent()}</div>
      {node.children.map((child) => (
        <NodeRenderer
          key={child.id}
          node={child}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
        />
      ))}
    </>
  );
}

export function CanvasPreview({
  node,
  selectedNodeId,
  onNodeSelect,
}: CanvasPreviewProps) {
  return (
    <div className="relative w-full h-full min-h-[600px] bg-white m-4 border border-gray-300 rounded-lg overflow-auto">
      <NodeRenderer
        key={node.id}
        node={node}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
      />
    </div>
  );
}
