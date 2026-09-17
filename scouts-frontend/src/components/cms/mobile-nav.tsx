"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ScoutEmblem } from "@/components/ui/scout-emblem";
import { Button } from "@/components/ui/button";
import { translateTableName } from "@/lib/i18n";

interface MobileNavContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Automatically close mobile nav when route changes (render-time state adjustment)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <MobileNavContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav(): MobileNavContextType {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error("useMobileNav must be used within a MobileNavProvider");
  }
  return context;
}

/**
 * MobileHeader renders at the top of the viewport only on screens smaller than md (<768px).
 * It features a hamburger toggle button, the Scout emblem logo, the active page title,
 * and quick access indicators.
 */
export function MobileHeader() {
  const { isOpen, toggle } = useMobileNav();
  const pathname = usePathname();

  // Determine current page title
  const currentTitle = React.useMemo(() => {
    if (!pathname || pathname === "/portal") {
      return "Tổng quan";
    }
    const table = pathname.replace(/^\/portal\//, "").split("/")[0];
    return translateTableName(table);
  }, [pathname]);

  return (
    <header className="sticky top-0 left-0 right-0 h-14 z-30 flex md:hidden items-center justify-between px-3.5 bg-card/85 backdrop-blur-xl border-b border-border/50 select-none shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-9 w-9 rounded-xl hover:bg-accent/80 active:scale-95 transition-all text-foreground"
          aria-label={isOpen ? "Đóng menu" : "Mở menu điều hướng"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link
          href="/portal"
          className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity"
        >
          <div className="shrink-0">
            <ScoutEmblem className="h-6 w-6 drop-shadow-2xs" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs tracking-tight text-foreground truncate">
              Scouts Management
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              {currentTitle}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
          Live
        </span>
      </div>
    </header>
  );
}
