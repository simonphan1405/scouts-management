"use client";

import Link from "next/link";
import { useState } from "react";
import {
  SCOUT_SECTIONS_LIST,
  type ScoutSectionInfo,
} from "@/lib/constants/scout-theme";
import {
  Sun,
  Sparkles,
  Compass,
  Mountain,
  ShieldCheck,
  ChevronRight,
  Award,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Match specific scout section icons
const SECTION_ICONS = {
  nhi: Sun, // Chim non / Mặt trời buổi sớm
  au: Sparkles, // Sói con / Mắt mở - Tai thính
  thieu: Compass, // La bàn / Rừng xanh / Sắp sẵn
  kha: Mountain, // Khám phá / Vượt đỉnh núi cao
  trang: ShieldCheck, // Phụng sự / Trách nhiệm xã hội
};

// Realistic demonstration member distribution per section
const SECTION_STATS: Record<
  string,
  { members: number; units: number; percentage: number }
> = {
  nhi: { members: 18, units: 3, percentage: 12 },
  au: { members: 38, units: 6, percentage: 27 },
  thieu: { members: 46, units: 8, percentage: 32 },
  kha: { members: 24, units: 4, percentage: 17 },
  trang: { members: 16, units: 3, percentage: 12 },
};

export function SectionsGrid() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>5 Ngành Hướng Đạo Việt Nam</span>
            <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-accent border border-border/60">
              5 Ngành Sinh Hoạt
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Link href="/cms/sections">
              Quản lý danh mục Ngành
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {SCOUT_SECTIONS_LIST.map((section: ScoutSectionInfo) => {
          const Icon = SECTION_ICONS[section.key] || Compass;
          const stats = SECTION_STATS[section.key] ?? {
            members: 20,
            units: 4,
            percentage: 20,
          };
          const isSelected = selectedKey === section.key;

          return (
            <div
              key={section.key}
              onClick={() => setSelectedKey(isSelected ? null : section.key)}
              className={`group relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                isSelected ? "ring-2 shadow-md" : "hover:border-foreground/30"
              }`}
              style={{
                borderColor: isSelected ? section.color : `${section.color}40`,
                boxShadow: isSelected
                  ? `0 0 0 2px ${section.color}`
                  : undefined,
              }}
            >
              {/* Top Accent Bar with section color */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
                style={{ backgroundColor: section.color }}
              />

              {/* Ambient Glow */}
              <div
                className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: section.color }}
              />

              <div className="space-y-3">
                {/* Header with Icon & Age */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div
                    className="p-2.5 rounded-xl border shadow-xs transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${section.color}15`,
                      borderColor: `${section.color}35`,
                      color: section.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${section.color}12`,
                      borderColor: `${section.color}30`,
                      color: section.color,
                    }}
                  >
                    {section.ageRange}
                  </span>
                </div>

                {/* Section Title & Motto */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-extrabold text-base tracking-tight text-foreground">
                      {section.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic font-medium">
                    {section.englishName}
                  </p>
                </div>

                {/* Motto Pill */}
                <div
                  className="rounded-lg p-2 border text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${section.color}0c`,
                    borderColor: `${section.color}25`,
                    color: section.color,
                  }}
                >
                  <span className="block text-[9px] uppercase tracking-wider opacity-75 font-normal">
                    Châm ngôn
                  </span>
                  &ldquo;{section.motto}&rdquo;
                </div>

                {/* Member count & progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Đoàn sinh
                    </span>
                    <span className="font-bold text-foreground">
                      {stats.members}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({stats.percentage}%)
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.percentage * 2.5}%`,
                        backgroundColor: section.color,
                      }}
                    />
                  </div>
                </div>

                {/* Ranks badge summary */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <Award className="h-3 w-3" /> Đẳng thứ tiêu biểu:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {section.rankings.slice(0, 2).map((rank) => (
                      <span
                        key={rank}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 text-foreground/80 border border-border/50 truncate max-w-full"
                      >
                        {rank}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="pt-4 mt-3 border-t border-border/40">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-7 px-2 text-xs font-medium hover:bg-secondary"
                >
                  <Link href="/cms/members">
                    <span>Xem danh sách</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
