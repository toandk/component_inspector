"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { initialize } from "../home/state";
import type { Node } from "../types/node";

interface TreeViewProps {
  node: Node;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  componentMap: Map<string, string[]>;
}

interface TreeNodeProps {
  node: Node;
  level: number;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  componentMap: Map<string, string[]>;
}

function TreeNode({
  node,
  level,
  selectedNodeId,
  onNodeSelect,
  componentMap,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  // Find component label for this node
  const componentLabel = Array.from(componentMap.entries()).find(
    ([_, nodeIds]) => nodeIds.includes(node.id)
  )?.[0];

  const getNodeIcon = (type: Node["type"]) => {
    switch (type) {
      case "Div":
        return "📦";
      case "Input":
        return "📝";
      case "Image":
        return "🖼️";
      case "Button":
        return "🔘";
      default:
        return "📦";
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-100 border-l-4 border-blue-500" : ""
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onNodeSelect(node.id)}
      >
        {hasChildren && (
          <button
            className="mr-1 p-1 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <span className="mr-2 text-sm">{getNodeIcon(node.type)}</span>
        <span className="text-sm font-medium text-gray-700">{node.name}</span>
        <span className="ml-2 text-xs text-gray-500">({node.type})</span>
        {componentLabel && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
            {componentLabel}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              componentMap={componentMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({
  node,
  selectedNodeId,
  onNodeSelect,
  componentMap,
}: TreeViewProps) {
  return (
    <div>
      <TreeNode
        key={node.id}
        node={node}
        level={0}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        componentMap={componentMap}
      />
      <div className="mt-4 p-2">
        <button
          onClick={() => initialize()}
          className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
        >
          Generate mock data
        </button>
      </div>
    </div>
  );
}
