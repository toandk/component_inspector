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

  const handleFigmaImport = (importedNodes: Node) => {
    setNodes(importedNodes);
    showToast("Figma nodes imported successfully!");
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
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 flex-row">
          {stackNodes.length > 1 && (
            <button onClick={() => popStackNode()}>
              <ArrowLeft />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-800">Elements Tree</h2>
        </div>

        {/* Figma Import Section */}
        {/* <div className="p-4 border-b border-gray-200">
          <FigmaImporter onNodesImported={handleFigmaImport} />
        </div> */}
        <div className="flex-1 overflow-auto">
          <TreeView
            node={nodes}
            componentMap={componentMap}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
          />
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
