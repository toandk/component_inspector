"use client";

import React, { useEffect, useState, useRef } from "react";
import type { Node } from "../../types/node";
import {
  initializeCssInspectorState,
  syncNodeChanges,
  updateStyle as updateStyleAction,
  addProperty as addPropertyAction,
  removeProperty as removePropertyAction,
  toggleStyleEnabled,
  startEditing,
  stopEditing,
  updateEditingValue,
  commitEdit,
  setInsertLineIndex,
  addPropertyAtIndex,
  getValueSuggestions,
  getStyles,
  getSelectedNode,
  setSelectedNode,
  getEditingStates,
  getInsertLineIndex,
} from "./state";
import { useSelector } from "@legendapp/state/react";
import { StyleProperty, cssPropertySuggestions } from "./state/state";
import { getComponentMap, pushStackNode } from "@/home/state";
import { SquareArrowOutUpRight } from "lucide-react";
import { isValidColor } from "@/lib/utils";

interface CSSInspectorProps {
  selectedNode: Node | null;
  onStyleUpdate: (nodeId: string, styles: Record<string, string>) => void;
  onShowToast: (message: string) => void;
  onConfirmOverride: (message: string) => Promise<boolean>;
}

interface ColorSquareProps {
  color: string;
}

function ColorSquare({ color }: ColorSquareProps) {
  return (
    <div
      className="inline-block w-3 h-3 mr-1 border border-gray-300 rounded-sm flex-shrink-0"
      style={{ backgroundColor: color }}
      title={`Color: ${color}`}
    />
  );
}

interface AutocompleteProps {
  suggestions: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

function Autocomplete({
  suggestions,
  onSelect,
  onClose,
  inputRef,
}: AutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, onClose]);

  // Scroll to selected item when selectedIndex changes
  useEffect(() => {
    if (containerRef.current) {
      const selectedElement = containerRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-gray-300 shadow-lg max-h-32 overflow-y-auto text-xs"
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion}
          className={`px-2 py-1 cursor-pointer ${
            index === selectedIndex
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}

interface StyleRowProps {
  style: StyleProperty;
  index: number;
  onStyleUpdate: (key: string, value: string, enabled: boolean) => void;
  onRemove: (key: string) => void;
}

function StyleRow({ style, index, onStyleUpdate, onRemove }: StyleRowProps) {
  const editingStates = useSelector(getEditingStates);
  const insertLineIndex = useSelector(getInsertLineIndex);
  const [showValueAutocomplete, setShowValueAutocomplete] = useState(false);
  const [valueSuggestions, setValueSuggestions] = useState<string[]>([]);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const editingState = editingStates.get(style.propertyKey);
  const isEditingKey = editingState?.field === "key";
  const isEditingValue = editingState?.field === "value";
  const isReadOnlyProperty = ["x", "y", "width", "height"].includes(
    style.propertyKey
  );

  const handleKeyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent container click
    startEditing(style.propertyKey, "key");
    setTimeout(() => keyInputRef.current?.focus(), 0);
  };

  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent container click
    startEditing(style.propertyKey, "value");
    setTimeout(() => valueInputRef.current?.focus(), 0);
  };

  const handleKeyEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditingValue(style.propertyKey, e.target.value);
  };

  const handleValueEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateEditingValue(style.propertyKey, value);

    // Show autocomplete for value
    const suggestions = getValueSuggestions(style.propertyKey, value);
    setValueSuggestions(suggestions);
    setShowValueAutocomplete(suggestions.length > 0 && value.length > 0);
  };

  const handleKeyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit(style.propertyKey);
      onStyleUpdate(
        editingState?.tempValue || style.propertyKey,
        style.value,
        style.enabled
      );
    } else if (e.key === "Escape") {
      stopEditing(style.propertyKey);
    }
  };

  const handleValueKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showValueAutocomplete) {
      commitEdit(style.propertyKey);
      onStyleUpdate(
        style.propertyKey,
        editingState?.tempValue || style.value,
        style.enabled
      );
    } else if (e.key === "Escape") {
      stopEditing(style.propertyKey);
      setShowValueAutocomplete(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (editingState) {
        commitEdit(style.propertyKey);
        onStyleUpdate(
          editingState.field === "key"
            ? editingState.tempValue
            : style.propertyKey,
          editingState.field === "value" ? editingState.tempValue : style.value,
          style.enabled
        );
      }
      setShowValueAutocomplete(false);
    }, 100);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event bubbling to container
    const newEnabledState = !style.enabled;
    toggleStyleEnabled(style.propertyKey);
    // For the parent update, send empty value when disabling, actual value when enabling
    onStyleUpdate(
      style.propertyKey,
      newEnabledState ? style.value : "",
      newEnabledState
    );
  };

  const handleLineEndClick = () => {
    console.log("handleLineEndClick", index);
    setInsertLineIndex(index + 1);
  };

  const handleValueAutocompleteSelect = (value: string) => {
    updateEditingValue(style.propertyKey, value);
    setShowValueAutocomplete(false);
    commitEdit(style.propertyKey);
    onStyleUpdate(style.propertyKey, value, style.enabled);
  };

  return (
    <>
      <div className="flex items-center py-1 hover:bg-gray-50 group text-xs">
        <input
          type="checkbox"
          checked={style.enabled}
          onChange={handleCheckboxChange}
          className="mr-2 w-3 h-3"
        />

        <div className="flex-1 flex items-center">
          {isEditingKey ? (
            <input
              ref={keyInputRef}
              type="text"
              value={editingState?.tempValue || ""}
              onChange={handleKeyEdit}
              onKeyDown={handleKeyKeyDown}
              onBlur={handleBlur}
              className="bg-transparent border-none outline-none text-blue-600 font-medium"
              style={{
                width: `${Math.max(
                  (editingState?.tempValue?.length || 0) * 8,
                  60
                )}px`,
              }}
            />
          ) : (
            <span
              onClick={handleKeyClick}
              className={`cursor-text hover:bg-blue-50 px-1 font-medium text-blue-600 ${
                style.enabled ? "" : "text-gray-400 line-through"
              }`}
            >
              {`${style.propertyKey}:`}
            </span>
          )}

          {/* <span className="text-gray-500">:</span> */}

          <div className="relative">
            {isEditingValue ? (
              <>
                <div className="flex items-center">
                  {(style.propertyKey === "background" ||
                    style.propertyKey === "color" ||
                    style.propertyKey === "background-color" ||
                    style.propertyKey === "border-color") &&
                    editingState?.tempValue &&
                    isValidColor(editingState.tempValue) && (
                      <ColorSquare color={editingState.tempValue} />
                    )}
                  <input
                    ref={valueInputRef}
                    type="text"
                    value={editingState?.tempValue || ""}
                    onChange={handleValueEdit}
                    onKeyDown={handleValueKeyDown}
                    onBlur={handleBlur}
                    className="bg-transparent border-none outline-none text-gray-800"
                    style={{
                      width: `${Math.max(
                        (editingState?.tempValue?.length ||
                          style.value.length ||
                          0) * 8,
                        60
                      )}px`,
                    }}
                  />
                </div>
                {showValueAutocomplete && (
                  <Autocomplete
                    suggestions={valueSuggestions}
                    onSelect={handleValueAutocompleteSelect}
                    onClose={() => setShowValueAutocomplete(false)}
                    inputRef={valueInputRef}
                  />
                )}
              </>
            ) : (
              <span
                onClick={handleValueClick}
                className={`cursor-text hover:bg-yellow-50 flex items-center ${
                  style.enabled ? "text-gray-800" : "text-gray-400 line-through"
                }`}
              >
                {(style.propertyKey === "background" ||
                  style.propertyKey === "color" ||
                  style.propertyKey === "background-color" ||
                  style.propertyKey === "border-color") &&
                  style.value &&
                  isValidColor(style.value) && (
                    <ColorSquare color={style.value} />
                  )}
                {style.value || (
                  <span className="text-gray-400 italic">empty</span>
                )}
              </span>
            )}
          </div>

          <span className="text-gray-500">;</span>

          <div
            className="invisible group-hover:visible cursor-text w-4 h-4 flex items-center justify-center"
            onClick={handleLineEndClick}
            title="Click to add new property"
          >
            <span className="text-gray-400 text-lg leading-none">+</span>
          </div>
        </div>

        {!isReadOnlyProperty && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent container click
              onRemove(style.propertyKey);
            }}
            className="opacity-0 group-hover:opacity-100 ml-2 text-red-500 hover:text-red-700 text-xs w-4 h-4 flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
}

interface NewPropertyRowProps {
  index: number;
}

function NewPropertyRow({ index }: NewPropertyRowProps) {
  const [propertyKey, setPropertyKey] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [showKeyAutocomplete, setShowKeyAutocomplete] = useState(false);
  const [showValueAutocomplete, setShowValueAutocomplete] = useState(false);
  const [keySuggestions, setKeySuggestions] = useState<string[]>([]);
  const [valueSuggestions, setValueSuggestions] = useState<string[]>([]);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  const currentSelectedNode = useSelector(getSelectedNode);
  const styles = useSelector(getStyles);

  useEffect(() => {
    keyInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the new property row
      if (!target.closest(".new-property-row")) {
        // Dismiss if both fields are empty or incomplete
        if (!propertyKey || !propertyValue) {
          console.log("dismiss new property row");
          setInsertLineIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [propertyKey, propertyValue]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPropertyKey(value);

    // Show autocomplete from cssPropertySuggestions
    const suggestions = cssPropertySuggestions
      .filter((prop) => prop.label.toLowerCase().includes(value.toLowerCase()))
      .map((prop) => prop.label)
      .sort();
    setKeySuggestions(suggestions);
    setShowKeyAutocomplete(suggestions.length > 0 && value.length > 0);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPropertyValue(value);

    const suggestions = getValueSuggestions(propertyKey, value);
    setValueSuggestions(suggestions);
    setShowValueAutocomplete(suggestions.length > 0 && value.length > 0);
  };

  const handleSubmit = () => {
    if (propertyKey && propertyValue && currentSelectedNode) {
      // Check if property already exists
      const existingProperty = styles.find(
        (style) => style.propertyKey === propertyKey
      );

      if (existingProperty) {
        // Update existing property's value and enable it
        updateStyleAction(propertyKey, propertyValue);
        if (!existingProperty.enabled) {
          toggleStyleEnabled(propertyKey);
        }
        // Close the new property row
        setInsertLineIndex(-1);
      } else {
        // Add new property
        const newProperty: StyleProperty = {
          propertyKey,
          value: propertyValue,
          label: propertyKey,
          enabled: true,
        };
        addPropertyAtIndex(newProperty, index);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: "key" | "value") => {
    if (e.key === "Enter" && !showKeyAutocomplete && !showValueAutocomplete) {
      if (field === "key" && propertyKey) {
        valueInputRef.current?.focus();
      } else if (field === "value" && propertyKey && propertyValue) {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setInsertLineIndex(-1);
    }
  };

  const handleKeyAutocompleteSelect = (selectedLabel: string) => {
    // Check if it's a key-value pair (contains ':')
    if (selectedLabel.includes(":")) {
      const [key, value] = selectedLabel.split(":").map((s) => s.trim());
      setPropertyKey(key);
      setPropertyValue(value);
      setShowKeyAutocomplete(false);
      // Auto-submit if both key and value are filled
      if (key && value) {
        setTimeout(() => {
          handleSubmit();
        }, 0);
      }
    } else {
      // Just a property name
      setPropertyKey(selectedLabel);
      setShowKeyAutocomplete(false);
      valueInputRef.current?.focus();
    }
  };

  const handleValueAutocompleteSelect = (value: string) => {
    setPropertyValue(value);
    setShowValueAutocomplete(false);
    if (propertyKey) {
      handleSubmit();
    }
  };

  return (
    <div className="new-property-row flex items-center py-1 bg-blue-50 border-l-2 border-blue-400 text-xs">
      <input type="checkbox" checked={true} disabled className="mr-2 w-3 h-3" />

      <div className="flex-1 flex items-center">
        <div className="relative">
          <input
            ref={keyInputRef}
            type="text"
            value={propertyKey}
            onChange={handleKeyChange}
            onKeyDown={(e) => handleKeyDown(e, "key")}
            placeholder="property"
            className="bg-transparent border-none outline-none text-blue-600 font-medium w-20"
          />
          {showKeyAutocomplete && (
            <Autocomplete
              suggestions={keySuggestions}
              onSelect={handleKeyAutocompleteSelect}
              onClose={() => setShowKeyAutocomplete(false)}
              inputRef={keyInputRef}
            />
          )}
        </div>

        <span className="text-gray-500">:</span>

        <div className="relative flex-1">
          <input
            ref={valueInputRef}
            type="text"
            value={propertyValue}
            onChange={handleValueChange}
            onKeyDown={(e) => handleKeyDown(e, "value")}
            placeholder="value"
            className="bg-transparent border-none outline-none text-gray-800 w-full"
          />
          {showValueAutocomplete && (
            <Autocomplete
              suggestions={valueSuggestions}
              onSelect={handleValueAutocompleteSelect}
              onClose={() => setShowValueAutocomplete(false)}
              inputRef={valueInputRef}
            />
          )}
        </div>

        <span className="text-gray-500">;</span>
      </div>
    </div>
  );
}

export function CSSInspector({
  selectedNode,
  onStyleUpdate,
  onShowToast,
  onConfirmOverride,
}: CSSInspectorProps) {
  const styles = useSelector(getStyles);
  const currentSelectedNode = useSelector(getSelectedNode);
  const insertLineIndex = useSelector(getInsertLineIndex);
  const componentMap = useSelector(getComponentMap);

  const componentLabel = currentSelectedNode
    ? Array.from(componentMap.entries()).find(([, nodeIds]) =>
        nodeIds.includes(currentSelectedNode.id)
      )?.[0]
    : null;

  // Show all styles that have values (including disabled ones with values)
  const visibleStyles = styles.filter((style) => style.value !== "");

  useEffect(() => {
    if (selectedNode?.id !== currentSelectedNode?.id) {
      setSelectedNode(selectedNode);
      initializeCssInspectorState(selectedNode);
    } else if (selectedNode && currentSelectedNode) {
      syncNodeChanges(selectedNode);
    }
  }, [selectedNode, currentSelectedNode]);

  const handleStyleUpdate = (key: string, value: string, enabled: boolean) => {
    if (!currentSelectedNode) return;

    let processedValue: any = enabled ? value : "";
    if (
      (key === "x" || key === "y" || key === "width" || key === "height") &&
      enabled
    ) {
      processedValue = Number.parseInt(value) || 0;
    }

    // Map CSS property names to node property names
    const nodePropertyKey = key === "border-radius" ? "borderRadius" : key;

    onStyleUpdate(currentSelectedNode.id, {
      [nodePropertyKey]: processedValue,
    });
  };

  const handleRemoveProperty = (key: string) => {
    if (!currentSelectedNode) return;
    removePropertyAction(key);
    // Map CSS property names to node property names
    const nodePropertyKey = key === "border-radius" ? "borderRadius" : key;
    onStyleUpdate(currentSelectedNode.id, { [nodePropertyKey]: "" });
  };

  const openComponentNode = () => {
    pushStackNode(currentSelectedNode);
  };

  const handleContainerClick = () => {
    console.log("handleContainerClick", visibleStyles.length);
    setInsertLineIndex(visibleStyles.length);
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
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
              {componentLabel}
            </span>
            <div
              onClick={openComponentNode}
              title="Click to view Component detail"
              className="cursor-pointer hover:bg-blue-100 p-1 rounded transition-colors"
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Styles</h4>

        <div
          className="bg-white border border-gray-200 rounded font-mono text-xs"
          // onClick={handleContainerClick}
        >
          <div className="p-2">
            {visibleStyles.map((style, index) => (
              <React.Fragment key={style.propertyKey}>
                {insertLineIndex === index && <NewPropertyRow index={index} />}
                <StyleRow
                  style={style}
                  index={index}
                  onStyleUpdate={handleStyleUpdate}
                  onRemove={handleRemoveProperty}
                />
              </React.Fragment>
            ))}

            {insertLineIndex === visibleStyles.length && (
              <NewPropertyRow index={visibleStyles.length} />
            )}

            {visibleStyles.length === 0 && insertLineIndex === -1 && (
              <div className="text-gray-400 italic py-2">
                Click here to add CSS properties
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
