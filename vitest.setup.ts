import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Mock ResizeObserver for framer-motion and DOM components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: ({
        children,
        className,
        style,
        onClick,
      }: React.HTMLAttributes<HTMLDivElement>) =>
        React.createElement("div", { className, style, onClick }, children),
      span: ({
        children,
        className,
        style,
      }: React.HTMLAttributes<HTMLSpanElement>) =>
        React.createElement("span", { className, style }, children),
    },
  };
});
