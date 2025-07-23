"use client";

import React from "react";
import { useSelector } from "@legendapp/state/react";
import { CSSInspector } from "../css-inspector";
import { ComponentsTab } from "../components-tab";
import {
  getActiveTab,
  setActiveTab,
  getSelectedNode,
  handleUpdateNode,
  showToast,
} from "../../home/state";
import type { Node } from "../../types/node";

export function RightPanel() {
  const activeTab = useSelector(getActiveTab);
  const selectedNode = useSelector(getSelectedNode);

  const tabs = [
    { id: "css-inspector" as const, label: "CSS Inspector" },
    { id: "components" as const, label: "Components" },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-300 flex flex-col">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "css-inspector" && (
          <CSSInspector
            selectedNode={selectedNode}
            onStyleUpdate={handleUpdateNode}
            onShowToast={showToast}
            onConfirmOverride={async (message: string) => {
              return window.confirm(message);
            }}
          />
        )}
        {activeTab === "components" && <ComponentsTab />}
      </div>
    </div>
  );
}
