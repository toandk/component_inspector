"use client";

import React, { useEffect } from "react";
import type { Node } from "../../types/node";
import {
  initializeCssInspectorState,
  updateStyle as updateStyleAction,
  addProperty as addPropertyAction,
  removeProperty as removePropertyAction,
  setNewPropertyKey,
  setNewPropertyValue,
  resetNewPropertyFields,
  getStyles,
  getNewPropertyKey,
  getNewPropertyValue,
  getSelectedNode,
  setSelectedNode,
  getFilteredPropertySuggestions,
  getIsShowingSuggestions,
  setNewPropertyKeyAndFilterSuggestions,
  selectSuggestedProperty,
  setIsShowingSuggestions,
} from "./state";
import { useSelector } from "@legendapp/state/react";
import { StyleProperty } from "./state/state";
import { getComponentMap, initialize, pushStackNode } from "@/home/state";
import { SquareArrowOutUpRight } from "lucide-react";

interface CSSInspectorProps {
  selectedNode: Node | null;
  onStyleUpdate: (nodeId: string, styles: Record<string, string>) => void;
  onShowToast: (message: string) => void;
  onConfirmOverride: (message: string) => Promise<boolean>;
}

export function CSSInspector({
  selectedNode,
  onStyleUpdate,
  onShowToast,
  onConfirmOverride,
}: CSSInspectorProps) {
  const styles = useSelector(getStyles);
  const newPropertyKey = useSelector(getNewPropertyKey);
  const newPropertyValue = useSelector(getNewPropertyValue);
  const currentSelectedNode = useSelector(getSelectedNode);
  const filteredPropertySuggestions = useSelector(
    getFilteredPropertySuggestions
  );
  const isShowingSuggestions = useSelector(getIsShowingSuggestions);
  const componentMap = useSelector(getComponentMap);

  const componentLabel = currentSelectedNode
    ? Array.from(componentMap.entries()).find(([, nodeIds]) =>
        nodeIds.includes(currentSelectedNode.id)
      )?.[0]
    : null;

  useEffect(() => {
    if (selectedNode?.id !== currentSelectedNode?.id) {
      setSelectedNode(selectedNode);
      initializeCssInspectorState(selectedNode);
    }
  }, [selectedNode, currentSelectedNode]);

  const handleStyleChange = (key: string, value: string) => {
    if (!currentSelectedNode) return;

    updateStyleAction(key, value);

    let processedValue: any = value;
    if (key === "x" || key === "y" || key === "width" || key === "height") {
      processedValue = Number.parseInt(value) || 0;
    }

    onStyleUpdate(currentSelectedNode.id, { [key]: processedValue });
  };

  const addNewProperty = async () => {
    if (!currentSelectedNode || !newPropertyKey || !newPropertyValue) return;

    const existingStyle = styles.find(
      (style) => style.propertyKey === newPropertyKey && style.value !== ""
    );

    if (existingStyle) {
      const shouldOverride = await onConfirmOverride(
        `Property "${newPropertyKey}" already exists. Do you want to override it?`
      );

      if (shouldOverride) {
        updateStyleAction(newPropertyKey, newPropertyValue);
        onStyleUpdate(currentSelectedNode.id, {
          [newPropertyKey]: newPropertyValue,
        });
        resetNewPropertyFields();
      }
      return;
    }

    const newStyle: StyleProperty = {
      propertyKey: newPropertyKey,
      value: newPropertyValue,
      label: newPropertyKey.charAt(0).toUpperCase() + newPropertyKey.slice(1),
    };

    addPropertyAction(newStyle);
    onStyleUpdate(currentSelectedNode.id, {
      [newPropertyKey]: newPropertyValue,
    });

    resetNewPropertyFields();
  };

  const handleRemoveProperty = (key: string) => {
    if (!currentSelectedNode) return;

    removePropertyAction(key);
    onStyleUpdate(currentSelectedNode.id, { [key]: "" });
  };

  const openComponentNode = () => {
    pushStackNode(currentSelectedNode);
  };

  if (!currentSelectedNode) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select an element to inspect its CSS properties</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">
          {currentSelectedNode.name} ({currentSelectedNode.type})
        </h3>
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          ID: {currentSelectedNode.id}
        </div>
      </div>
      {componentLabel && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 pb-1">Component</h4>
          <div className="flex flex-row gap-2 items-center text-xs text-gray-600 bg-blue-50 p-2 rounded">
            {componentLabel && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                {componentLabel}
              </span>
            )}
            <div onClick={openComponentNode}>
              <SquareArrowOutUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
          Properties
        </h4>

        {styles
          .filter((style) => style.value !== "")
          .map((style) => (
            <div key={style.propertyKey} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">
                  {style.label}
                </label>
                {!["x", "y", "width", "height"].includes(style.propertyKey) && (
                  <button
                    onClick={() => handleRemoveProperty(style.propertyKey)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                type={
                  ["x", "y", "width", "height"].includes(style.propertyKey)
                    ? "number"
                    : "text"
                }
                value={style.value}
                onChange={(e) =>
                  handleStyleChange(style.propertyKey, e.target.value)
                }
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Enter ${style.label.toLowerCase()}`}
              />
            </div>
          ))}

        <div className="border-t pt-3 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Add New Property
          </h4>
          <div className="space-y-2 relative">
            <input
              type="text"
              value={newPropertyKey}
              onChange={(e) =>
                setNewPropertyKeyAndFilterSuggestions(e.target.value)
              }
              onFocus={() =>
                setNewPropertyKeyAndFilterSuggestions(newPropertyKey)
              }
              onBlur={() =>
                setTimeout(() => setIsShowingSuggestions(false), 100)
              }
              placeholder="Property name (e.g., display)"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {isShowingSuggestions && filteredPropertySuggestions.length > 0 && (
              <div className="absolute z-10 bg-white border border-gray-300 mt-1 w-full rounded shadow-lg max-h-48 overflow-y-auto">
                {filteredPropertySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestedProperty(suggestion);
                    }}
                    className="px-2 py-1 text-xs cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion.label}
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={newPropertyValue}
              onChange={(e) => setNewPropertyValue(e.target.value)}
              placeholder="Property value (e.g., block)"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={addNewProperty}
              disabled={!newPropertyKey || !newPropertyValue}
              className="w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
