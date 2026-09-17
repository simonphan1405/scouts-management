"use client";

import {
  Sidebar,
  DEFAULT_WIDTH,
  STORAGE_KEY,
  MIN_WIDTH,
  MAX_WIDTH,
} from "@/components/cms/sidebar";
import { useEffect, useState } from "react";

function getInitialSidebarWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const n = parseInt(stored, 10);
    if (!isNaN(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
  }
  return DEFAULT_WIDTH;
}

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  // Initialize with DEFAULT_WIDTH to match SSR and avoid hydration mismatch
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);

  // Subscribe to sidebar resize via ResizeObserver (external system — useEffect is correct here)
  useEffect(() => {
    const initial = getInitialSidebarWidth();
    if (initial !== DEFAULT_WIDTH) {
      window.requestAnimationFrame(() => setSidebarWidth(initial));
    }

    const sidebar = document.querySelector("aside");
    if (!sidebar) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
          setSidebarWidth(w);
        }
      }
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        className="flex-1 p-6 overflow-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
