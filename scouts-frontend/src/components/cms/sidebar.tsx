"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTableList } from "@/hooks/use-introspection";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Database, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resetApolloClient } from "@/lib/apollo/client";

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 240;
const STORAGE_KEY = "cms-sidebar-width";

function getStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_WIDTH;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const n = parseInt(stored, 10);
    if (!isNaN(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
  }
  return DEFAULT_WIDTH;
}

export function Sidebar() {
  const { tables, loading } = useTableList();
  const pathname = usePathname();
  const router = useRouter();
  // Lazy init from localStorage — avoids setState in useEffect (rerender-lazy-state-init)
  const [width, setWidth] = useState(() => getStoredWidth());
  const isDragging = useRef(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    resetApolloClient();
    router.push("/login");
    router.refresh();
  }, [router]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Persist width
      setWidth((w) => {
        localStorage.setItem(STORAGE_KEY, String(w));
        return w;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <aside
      className="shrink-0 border-r border-border/40 bg-card/60 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 select-none transition-[width] duration-300 ease-out z-40"
      style={{ width }}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <span className="font-bold tracking-tight text-foreground/90">CMS Dashboard</span>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))
            : tables.map((table) => {
                const href = `/cms/${table.name}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={table.name}
                    href={href}
                    className={cn(
                      "flex items-center px-4 py-2.5 rounded-lg text-sm capitalize transition-all duration-200 relative group overflow-hidden",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full" />
                    )}
                    {table.name}
                  </Link>
                );
              })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t border-border/40 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-10 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">{signingOut ? "Signing out…" : "Sign out"}</span>
        </Button>
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize group z-50 hover:bg-primary/50"
      >
        <div className="absolute right-0 top-0 h-full w-px bg-border/40 group-hover:bg-primary transition-colors" />
      </div>
    </aside>
  );
}

/** Re-export width constants for use in layout */
export { DEFAULT_WIDTH, STORAGE_KEY, MIN_WIDTH, MAX_WIDTH };
