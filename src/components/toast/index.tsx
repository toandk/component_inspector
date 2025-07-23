"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {message}
    </div>
  );
}
