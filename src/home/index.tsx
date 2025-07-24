"use client";

import { useEffect } from "react";
import { useSelector } from "@legendapp/state/react";
import { TreeView } from "../components/tree-view";
import { CanvasPreview } from "../components/canvas-preview";
import { RightPanel } from "@/components/right-panel";
import { Toast } from "../components/toast";
import { FigmaImporter } from "../components/figma-importer";
import {
  loginUIData,
  mockNodes,
  mockNodesWithOverlap,
  mockNodes2,
} from "../lib/mock-data";
import {
  initialize,
  getNodes,
  getSelectedNodeId,
  getComponentMap,
  getSelectedNode,
  getToastMessage,
  getIsToastVisible,
  setSelectedNodeId,
  handleUpdateNode,
  showToast,
  hideToast,
  getStackNodes,
  popStackNode,
  setNodes,
  getHighlightedComponentId,
  getLeftPanelTab,
  setLeftPanelTab,
} from "./state";
import { ArrowLeft } from "lucide-react";
import type { Node } from "../types/node";

export default function Home() {
  useEffect(() => {
    initialize(loginUIData);
  }, []);

  const nodes = useSelector(getNodes);
  const selectedNodeId = useSelector(getSelectedNodeId);
  const toastMessage = useSelector(getToastMessage);
  const isToastVisible = useSelector(getIsToastVisible);
  const componentMap = useSelector(getComponentMap);
  const stackNodes = useSelector(getStackNodes);
  const highlightedComponentId = useSelector(getHighlightedComponentId);
  const leftPanelTab = useSelector(getLeftPanelTab);

  const handleFigmaImport = (importedNodes: Node) => {
    setNodes(importedNodes);
    showToast("Figma nodes imported successfully!");
    // Switch to Element Tree tab after successful import
    // setLeftPanelTab("element-tree");
  };

  if (!nodes.children)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <FigmaImporter onNodesImported={handleFigmaImport} />
      </div>
    );

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Tree View Panel */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 flex-row">
          {stackNodes.length > 1 && (
            <button onClick={() => popStackNode()}>
              <ArrowLeft />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-800">Left Panel</h2>
        </div>

        {/* Segmented Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setLeftPanelTab("element-tree")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                leftPanelTab === "element-tree"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Element Tree
            </button>
            <button
              onClick={() => setLeftPanelTab("figma-importer")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                leftPanelTab === "figma-importer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Figma Importer
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {leftPanelTab === "element-tree" ? (
            <TreeView
              node={nodes}
              componentMap={componentMap}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          ) : (
            <div className="p-4">
              <FigmaImporter onNodesImported={handleFigmaImport} />
            </div>
          )}
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            Canvas Preview
          </h2>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50">
          <CanvasPreview
            node={nodes}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeUpdate={handleUpdateNode}
            highlightedComponentId={highlightedComponentId}
            componentMap={componentMap}
          />
        </div>
      </div>

      {/* Right Panel with Tabs */}
      <RightPanel />
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
    </div>
  );
}
