"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { getStackNodes, initialize } from "../home/state";
import type { Node } from "../types/node";
import { useSelector } from "@legendapp/state/react";

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
  expandedNodeIds: Set<string>; // Pass the expandedNodeIds set down
  toggleExpand: (nodeId: string) => void;
}

function TreeNode({
  node,
  level,
  selectedNodeId,
  onNodeSelect,
  componentMap,
  expandedNodeIds,
  toggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;
  const isNodeExpanded = expandedNodeIds.has(node.id); // Determine expanded state for *this* node

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
          isSelected ? "bg-blue-100" : ""
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onNodeSelect(node.id)}
      >
        {hasChildren && (
          <button
            className="mr-1 p-1 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
          >
            {isNodeExpanded ? (
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

      {hasChildren && isNodeExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              componentMap={componentMap}
              expandedNodeIds={expandedNodeIds} // Pass the set down to children
              toggleExpand={toggleExpand}
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
  const stackNodes = useSelector(getStackNodes);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const treeRef = useRef<HTMLDivElement>(null);

  const getAllSelectableNodes = useCallback(
    (currentNode: Node, expandedIds: Set<string>): Node[] => {
      let nodes: Node[] = [currentNode];
      if (expandedIds.has(currentNode.id) && currentNode.children.length > 0) {
        currentNode.children.forEach((child) => {
          nodes = nodes.concat(getAllSelectableNodes(child, expandedIds));
        });
      }
      return nodes;
    },
    []
  );

  useEffect(() => {
    const initialExpandedNodes = new Set<string>();
    const expandAll = (currentNode: Node) => {
      initialExpandedNodes.add(currentNode.id);
      currentNode.children.forEach((child) => expandAll(child));
    };
    expandAll(node);
    setExpandedNodeIds(initialExpandedNodes);
  }, [node]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodeIds((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Do not handle keyboard events if the target is an input field
      if (event.target instanceof HTMLInputElement) {
        return;
      }

      const selectableNodes = getAllSelectableNodes(node, expandedNodeIds);
      const currentIndex = selectableNodes.findIndex(
        (n) => n.id === selectedNodeId
      );

      switch (event.key) {
        case "ArrowUp":
          if (currentIndex > 0) {
            onNodeSelect(selectableNodes[currentIndex - 1].id);
            event.preventDefault();
          }
          break;
        case "ArrowDown":
          if (currentIndex < selectableNodes.length - 1) {
            onNodeSelect(selectableNodes[currentIndex + 1].id);
            event.preventDefault();
          }
          break;
        case "ArrowLeft":
          if (selectedNodeId) {
            const currentNode = selectableNodes[currentIndex];
            if (
              currentNode &&
              currentNode.children.length > 0 &&
              expandedNodeIds.has(currentNode.id)
            ) {
              toggleExpand(currentNode.id);
              event.preventDefault();
            }
          }
          break;
        case "ArrowRight":
          if (selectedNodeId) {
            const currentNode = selectableNodes[currentIndex];
            if (
              currentNode &&
              currentNode.children.length > 0 &&
              !expandedNodeIds.has(currentNode.id)
            ) {
              toggleExpand(currentNode.id);
              event.preventDefault();
            }
          }
          break;
        default:
          break;
      }
    },
    [
      node,
      selectedNodeId,
      onNodeSelect,
      expandedNodeIds,
      getAllSelectableNodes,
      toggleExpand,
    ]
  );

  useEffect(() => {
    const treeElement = treeRef.current;
    if (treeElement) {
      treeElement.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (treeElement) {
        treeElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [handleKeyDown]);

  return (
    <div ref={treeRef} tabIndex={0} className="focus:outline-none">
      <TreeNode
        key={node.id}
        node={node}
        level={0}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
        componentMap={componentMap}
        expandedNodeIds={expandedNodeIds} // Pass the set to the root node
        toggleExpand={toggleExpand}
      />
      {/* {stackNodes.length === 1 && (
        <div className="mt-4 p-2">
          <button
            onClick={() => initialize()}
            className="w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          >
            Generate mock data
          </button>
        </div>
      )} */}
    </div>
  );
}
