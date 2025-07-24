"use client";

import React, { useState, useEffect } from "react";
import {
  fetchFigmaFile,
  convertFigmaToNodes,
  extractFileIdFromUrl,
  saveNodesToJson,
} from "@/lib/figma-converter";
import type { Node } from "../../types/node";

interface FigmaImporterProps {
  onNodesImported?: (nodes: Node) => void;
}

const FIGMA_ACCESS_TOKEN_KEY = "figma_access_token";
const FIGMA_URL_KEY = "figma_url";

export function FigmaImporter({ onNodesImported }: FigmaImporterProps) {
  const [figmaUrl, setFigmaUrl] = useState(
    "https://www.figma.com/file/toTAFBJUPniZap9EPmhHWg/Untitled?node-id=0-8&t=2iL6qNo8pnxyGgus-4"
  );
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedNodes, setExtractedNodes] = useState<Node | null>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem(FIGMA_ACCESS_TOKEN_KEY);
    const savedUrl = localStorage.getItem(FIGMA_URL_KEY);

    if (savedToken) {
      setAccessToken(savedToken);
    }
    if (savedUrl) {
      setFigmaUrl(savedUrl);
    }
  }, []);

  // Save access token to localStorage whenever it changes
  const handleAccessTokenChange = (newToken: string) => {
    setAccessToken(newToken);
    if (newToken) {
      localStorage.setItem(FIGMA_ACCESS_TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(FIGMA_ACCESS_TOKEN_KEY);
    }
  };

  // Save Figma URL to localStorage whenever it changes
  const handleFigmaUrlChange = (newUrl: string) => {
    setFigmaUrl(newUrl);
    if (newUrl) {
      localStorage.setItem(FIGMA_URL_KEY, newUrl);
    } else {
      localStorage.removeItem(FIGMA_URL_KEY);
    }
  };

  const handleImport = async () => {
    if (!figmaUrl || !accessToken) {
      setError("Please provide both Figma URL and access token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract file ID from URL
      const fileId = extractFileIdFromUrl(figmaUrl);

      // Fetch Figma file data
      const figmaData = await fetchFigmaFile(fileId, accessToken);

      // Convert to Node structure
      const nodes = convertFigmaToNodes(figmaData);
      console.log("extractedNodes", nodes);

      setExtractedNodes(nodes);

      // Notify parent component
      if (onNodesImported) {
        onNodesImported(nodes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToJson = () => {
    if (extractedNodes) {
      saveNodesToJson(extractedNodes, "figma-nodes.json");
    }
  };

  const handleLoadIntoApp = () => {
    if (extractedNodes && onNodesImported) {
      onNodesImported(extractedNodes);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Import from Figma
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="figma-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Figma URL
          </label>
          <input
            id="figma-url"
            type="text"
            value={figmaUrl}
            onChange={(e) => handleFigmaUrlChange(e.target.value)}
            placeholder="https://www.figma.com/file/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="access-token"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Figma Access Token
          </label>
          <input
            id="access-token"
            type="password"
            value={accessToken}
            onChange={(e) => handleAccessTokenChange(e.target.value)}
            placeholder="Your Figma personal access token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your token from{" "}
            <a
              href="https://www.figma.com/developers/api#access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Figma Settings
            </a>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={isLoading || !figmaUrl || !accessToken}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Importing..." : "Import from Figma"}
        </button>

        {extractedNodes && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Import Successful!
            </h4>
            <p className="text-sm text-green-600 mb-3">
              Extracted {extractedNodes.children?.length || 0} top-level nodes
              from "{extractedNodes.name}"
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleSaveToJson}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Save as JSON
              </button>

              <button
                onClick={handleLoadIntoApp}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Load into App
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
