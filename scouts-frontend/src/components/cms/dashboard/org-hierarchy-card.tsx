"use client";

import Link from "next/link";
import {
  Globe2,
  MapPin,
  Building,
  Flag,
  Users2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export function OrgHierarchyCard() {
  const levels = [
    {
      level: "Cấp 1",
      table: "councils",
      name: "Châu",
      english: "Councils",
      desc: "Vùng quản hạt lãnh thổ cao nhất",
      count: "2 Châu",
      icon: Globe2,
      color: "#7D58D9",
      href: "/cms/councils",
    },
    {
      level: "Cấp 2",
      table: "districts",
      name: "Đạo",
      english: "Districts",
      desc: "Khu vực trực thuộc Châu",
      count: "6 Đạo",
      icon: MapPin,
      color: "#5CB856",
      href: "/cms/districts",
    },
    {
      level: "Cấp 3",
      table: "groups",
      name: "Liên đoàn",
      english: "Scout Groups",
      desc: "Cụm các đoàn đa ngành sinh hoạt",
      count: "18 Liên đoàn",
      icon: Building,
      color: "#EDB55E",
      href: "/cms/groups",
    },
    {
      level: "Cấp 4",
      table: "troops",
      name: "Đoàn",
      english: "Troops / Packs",
      desc: "Tổ chức theo từng ngành cụ thể",
      count: "42 Đoàn",
      icon: Flag,
      color: "#881337",
      href: "/cms/troops",
    },
    {
      level: "Cấp 5",
      table: "units",
      name: "Đội / Bầy",
      english: "Patrols / Sixes",
      desc: "Hàng đội tự trị nòng cốt",
      count: "96 Đội",
      icon: Users2,
      color: "#E01205",
      href: "/cms/units",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Sơ Đồ Hệ Thống Tổ Chức Hướng Đạo</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mô hình cấu trúc 5 tầng từ Châu quản hạt đến từng Đội tự trị của
            phong trào Hướng Đạo.
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground w-fit">
          5 Cấp Điều Hành
        </span>
      </div>

      {/* Horizontal Flow Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {levels.map((lvl, index) => {
          const Icon = lvl.icon;
          return (
            <div key={lvl.table} className="relative group">
              <Link
                href={lvl.href}
                className="block h-full rounded-xl border border-border/50 bg-secondary/20 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lvl.level}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg border shadow-2xs"
                    style={{
                      backgroundColor: `${lvl.color}15`,
                      borderColor: `${lvl.color}35`,
                      color: lvl.color,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                      {lvl.name}
                    </h4>
                    <span className="text-[11px] text-muted-foreground block">
                      {lvl.english}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {lvl.desc}
                </p>

                <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground/80">{lvl.count}</span>
                  <span className="text-primary text-[11px] font-medium flex items-center">
                    Xem bảng <ArrowRight className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
