"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTableList } from "@/hooks/use-introspection";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { ScoutEmblem } from "@/components/ui/scout-emblem";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resetApolloClient } from "@/lib/apollo/client";
import { translateTableName } from "@/lib/i18n/cms";
import { Separator } from "@/components/ui/separator";
import type { TableMeta } from "@/lib/graphql/types";

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 240;
const STORAGE_KEY = "cms-sidebar-width";

interface MenuGroup {
  key: string;
  title: string;
  tables: string[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    key: "org",
    title: "Hệ thống tổ chức",
    tables: ["councils", "districts", "groups", "troops", "units"],
  },
  {
    key: "rankings",
    title: "Ngành & Đẳng thứ",
    tables: ["sections", "rankings"],
  },
  {
    key: "management",
    title: "Thành viên & Dữ liệu",
    tables: ["members", "expenses", "religions"],
  },
];

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
  // Initialize with DEFAULT_WIDTH to match SSR and avoid hydration mismatch
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const [signingOut, setSigningOut] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    org: true,
    rankings: true,
    management: true,
    other: true,
  });

  const toggleGroup = useCallback((key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  }, []);

  const currentTable = useMemo(() => {
    if (!pathname) return "";
    return (
      pathname
        .replace(/^\/cms\//, "")
        .split("/")[0]
        ?.toLowerCase() ?? ""
    );
  }, [pathname]);

  const groupedData = useMemo(() => {
    const tableMap = new Map(tables.map((t) => [t.name.toLowerCase(), t]));
    const result: { key: string; title: string; items: TableMeta[] }[] = [];

    for (const group of MENU_GROUPS) {
      const groupItems: TableMeta[] = [];
      for (const name of group.tables) {
        const table = tableMap.get(name.toLowerCase());
        if (table) {
          groupItems.push(table);
          tableMap.delete(name.toLowerCase());
        }
      }
      if (groupItems.length > 0) {
        result.push({
          key: group.key,
          title: group.title,
          items: groupItems,
        });
      }
    }

    // Any remaining tables not in the predefined groups
    if (tableMap.size > 0) {
      result.push({
        key: "other",
        title: "Khác",
        items: Array.from(tableMap.values()),
      });
    }

    return result;
  }, [tables]);

  useEffect(() => {
    // Read from localStorage after initial render via rAF to avoid hydration mismatch
    const stored = getStoredWidth();
    if (stored !== DEFAULT_WIDTH) {
      window.requestAnimationFrame(() => setWidth(stored));
    }
  }, []);

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

  const isDashboardActive = pathname === "/cms";

  return (
    <aside
      className="shrink-0 border-r border-border/40 bg-card/60 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 select-none transition-[width] duration-300 ease-out z-40"
      style={{ width }}
    >
      {/* Top Brand Header with Scouts Management */}
      <Link
        href="/cms"
        className="flex items-center gap-3 px-5 py-4 border-b border-border/40 hover:bg-accent/40 transition-colors group"
      >
        <div className="shrink-0 group-hover:scale-105 transition-transform">
          <ScoutEmblem className="h-8 w-8 drop-shadow-xs" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold tracking-tight text-foreground/90 text-sm truncate">
            Scouts Management
          </span>
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            Quản Lý Hướng Đạo
          </span>
        </div>
      </Link>

      {/* Quick Color Palette Accent Strip */}
      <ScrollArea className="flex-1">
        <nav className="p-3">
          {/* Top Overview / Dashboard Link */}
          <div className="mb-2">
            <Link
              href="/cms"
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative group",
                isDashboardActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {isDashboardActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full" />
              )}
              <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">Tổng quan</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                Live
              </span>
            </Link>
          </div>

          <Separator className="bg-border/40 my-2" />
          {loading ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-28 rounded-md" />
                <div className="space-y-1 pt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                      key={`g1-${i}`}
                      className="h-8 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-24 rounded-md" />
                <div className="space-y-1 pt-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton
                      key={`g2-${i}`}
                      className="h-8 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded-md" />
                <div className="space-y-1 pt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton
                      key={`g3-${i}`}
                      className="h-8 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            groupedData.map((group, groupIndex) => {
              const isOpen =
                (Boolean(currentTable) &&
                  group.items.some(
                    (item) => item.name.toLowerCase() === currentTable,
                  )) ||
                (openGroups[group.key] ?? true);
              return (
                <div key={group.key}>
                  {groupIndex > 0 && (
                    <Separator className="bg-border/40 my-2.5" />
                  )}
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs font-semibold text-muted-foreground/80 hover:text-foreground rounded-md hover:bg-accent/40 transition-colors select-none cursor-pointer group"
                    >
                      <span className="truncate">{group.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/60 group-hover:text-foreground",
                          !isOpen && "-rotate-90",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-200 ease-in-out",
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0 pointer-events-none",
                      )}
                    >
                      <div className="overflow-hidden space-y-0.5">
                        {group.items.map((table) => {
                          const href = `/cms/${table.name}`;
                          const isActive = pathname === href;
                          return (
                            <Link
                              key={table.name}
                              href={href}
                              className={cn(
                                "flex items-center px-4 py-2 rounded-lg text-sm capitalize transition-all duration-200 relative group overflow-hidden",
                                isActive
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                              )}
                            >
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full" />
                              )}
                              {translateTableName(table.name)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
          <span className="font-medium">
            {signingOut ? "Signing out…" : "Sign out"}
          </span>
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
