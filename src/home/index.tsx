"use client";

import { useEffect } from "react";
import { useSelector } from "@legendapp/state/react";
import { TreeView } from "../components/tree-view";
import { CanvasPreview } from "../components/canvas-preview";
import { CSSInspector } from "@/components/css-inspector";
import { Toast } from "../components/toast";
import { mockNodes } from "../lib/mock-data";
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
} from "./state";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  useEffect(() => {
    initialize(mockNodes);
  }, []);

  const nodes = useSelector(getNodes);
  const selectedNodeId = useSelector(getSelectedNodeId);
  const toastMessage = useSelector(getToastMessage);
  const isToastVisible = useSelector(getIsToastVisible);
  const componentMap = useSelector(getComponentMap);
  const selectedNode = useSelector(getSelectedNode);
  const stackNodes = useSelector(getStackNodes);

  if (!nodes.children) return null;

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
        <div className="flex-1 overflow-auto bg-gray-50">
          <CanvasPreview
            node={nodes}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
          />
        </div>
      </div>

      {/* CSS Inspector Panel */}
      <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">CSS Inspector</h2>
        </div>
        <div className="flex-1 overflow-auto">
          <CSSInspector
            selectedNode={selectedNode}
            onStyleUpdate={handleUpdateNode}
            onShowToast={showToast}
            onConfirmOverride={async (message: string) => {
              return window.confirm(message);
            }}
          />
        </div>
      </div>
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
    </div>
  );
}
