"use client";

import Link from "next/link";
import { Sparkles, UserPlus, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoutEmblem } from "@/components/ui/scout-emblem";

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card/80 to-accent/20 p-6 md:p-8 shadow-sm">
      {/* Background ambient decorative glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <ScoutEmblem className="h-4 w-4" />
              Scouts Management
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Sparkles className="h-3 w-3" />
              Châm ngôn: Sắp Sẵn
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              • Niên khóa 2026
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Bảng Điều Hành Hướng Đạo
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hệ thống quản lý thống nhất các Ngành sinh hoạt (Nhi, Ấu, Thiếu,
            Kha, Tráng), tổ chức đơn vị từ Châu, Đạo đến Đội, cùng cơ sở dữ liệu
            đoàn sinh và kinh phí.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap md:flex-col lg:flex-row gap-2.5 shrink-0">
          <Button
            asChild
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            <Link href="/cms/members">
              <UserPlus className="h-4 w-4" />
              Quản lý Đoàn sinh
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 border-border/70 hover:bg-accent/40"
          >
            <Link href="/cms/sections">
              <FileSpreadsheet className="h-4 w-4" />5 Ngành Sinh Hoạt
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
