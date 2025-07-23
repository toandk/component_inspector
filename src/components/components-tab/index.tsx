"use client";

import React from "react";
import { useSelector } from "@legendapp/state/react";
import {
  getComponentList,
  getHighlightedComponentId,
  setHighlightedComponentId,
  setSelectedNodeId,
  findNodeById,
  getNodes,
} from "../../home/state";
import { isComponentExpanded, toggleComponentExpanded } from "./state";

export function ComponentsTab() {
  const components = useSelector(getComponentList);
  const highlightedComponentId = useSelector(getHighlightedComponentId);
  const nodes = useSelector(getNodes);

  const handleComponentClick = (componentId: string) => {
    // Toggle expansion instead of just highlighting
    toggleComponentExpanded(componentId);

    // Toggle highlighting - if already highlighted, unhighlight
    if (highlightedComponentId === componentId) {
      setHighlightedComponentId(null);
    } else {
      setHighlightedComponentId(componentId);
    }
  };

  const handleInstanceClick = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent component click
    setSelectedNodeId(nodeId);
  };

  if (components.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No components detected. Components are created when similar structures
        appear multiple times in the design.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="text-sm text-gray-600 mb-4">
        {components.length} component{components.length !== 1 ? "s" : ""}{" "}
        detected
      </div>

      {components.map((component, index) => {
        const isExpanded = useSelector(() => isComponentExpanded(component.id));

        return (
          <div key={component.id} className="border rounded-lg overflow-hidden">
            <div
              className={`p-3 cursor-pointer transition-colors ${
                highlightedComponentId === component.id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleComponentClick(component.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {component.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {component.instances} instances
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-blue-600 hover:text-blue-800">
                    {highlightedComponentId === component.id ? "Hide" : "View"}
                  </div>
                  <div
                    className={`transform transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="bg-gray-50 border-t">
                {component.nodeIds.map((nodeId, instanceIndex) => {
                  const node = findNodeById(nodes, nodeId);
                  if (!node) return null;

                  return (
                    <div
                      key={nodeId}
                      className="px-4 py-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                      onClick={(e) => handleInstanceClick(nodeId, e)}
                    >
                      <div className="w-5 h-5 bg-white border rounded flex items-center justify-center text-xs text-gray-600">
                        {instanceIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">
                          {node.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {node.type} • {node.width}×{node.height}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600">Select</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
