"use client";

import Link from "next/link";
import {
  Users,
  Compass,
  Award,
  BookOpen,
  DollarSign,
  Building,
  Flag,
  Globe2,
  MapPin,
  Flame,
  ArrowUpRight,
} from "lucide-react";

export function QuickActions() {
  const quickLinks = [
    {
      title: "Đoàn Sinh",
      name: "members",
      icon: Users,
      desc: "Hồ sơ cá nhân, đẳng thứ & liên lạc",
      color: "#7D58D9",
    },
    {
      title: "5 Ngành",
      name: "sections",
      icon: Compass,
      desc: "Nhi, Ấu, Thiếu, Kha, Tráng",
      color: "#5CB856",
    },
    {
      title: "Đẳng Thứ",
      name: "rankings",
      icon: Award,
      desc: "Cấp bậc thăng tiến & yêu cầu",
      color: "#EDB55E",
    },
    {
      title: "Kinh Phí",
      name: "expenses",
      icon: DollarSign,
      desc: "Sổ thu chi & ngân sách trại",
      color: "#E01205",
    },
    {
      title: "Liên Đoàn",
      name: "groups",
      icon: Building,
      desc: "Quản lý các liên đoàn trực thuộc",
      color: "#881337",
    },
    {
      title: "Đoàn",
      name: "troops",
      icon: Flag,
      desc: "Chi tiết các đoàn chuyên ngành",
      color: "#F97316",
    },
    {
      title: "Tôn Giáo",
      name: "religions",
      icon: BookOpen,
      desc: "Danh mục tôn giáo đoàn sinh",
      color: "#7D58D9",
    },
    {
      title: "Châu",
      name: "councils",
      icon: Globe2,
      desc: "Cấp quản hạt lãnh thổ lớn",
      color: "#5CB856",
    },
    {
      title: "Đạo",
      name: "districts",
      icon: MapPin,
      desc: "Phân chia địa bàn hoạt động",
      color: "#EDB55E",
    },
    {
      title: "Đội / Bầy",
      name: "units",
      icon: Flame,
      desc: "Đội tuần sinh hoạt cơ sở",
      color: "#E01205",
    },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <h3 className="font-bold text-base text-foreground">
            Truy Cập Nhanh Cơ Sở Dữ Liệu
          </h3>
          <p className="text-xs text-muted-foreground">
            10 bảng dữ liệu chính của Hệ thống Quản lý Hướng Đạo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={`/cms/${item.name}`}
              className="group flex flex-col justify-between p-3 rounded-xl border border-border/50 bg-secondary/15 hover:bg-accent/40 hover:border-border transition-all duration-150"
            >
              <div className="flex items-start justify-between">
                <div
                  className="p-1.5 rounded-lg border shadow-2xs"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}30`,
                    color: item.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              <div className="mt-2.5">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors block">
                  {item.title}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {item.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
