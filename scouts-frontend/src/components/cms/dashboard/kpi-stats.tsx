"use client";

import Link from "next/link";
import { Users, Layers, Building2, Wallet, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiStatsProps {
  loading?: boolean;
  memberCount: number;
  sectionCount: number;
  unitCounts: {
    councils: number;
    districts: number;
    groups: number;
    troops: number;
    units: number;
  };
  expenseTotal: number;
}

export function KpiStats({
  loading = false,
  memberCount = 0,
  sectionCount = 5,
  unitCounts = {
    councils: 0,
    districts: 0,
    groups: 0,
    troops: 0,
    units: 0,
  },
  expenseTotal = 0,
}: KpiStatsProps) {
  const totalUnits = unitCounts.groups + unitCounts.troops + unitCounts.units;

  const stats = [
    {
      title: "Tổng Đoàn Sinh & Huynh Trưởng",
      value: `${memberCount.toLocaleString("vi-VN")}`,
      unit: "người",
      subtitle:
        memberCount > 0
          ? "Đang sinh hoạt trong cơ sở dữ liệu"
          : "Chưa có dữ liệu đoàn sinh",
      badge: memberCount > 0 ? "CSDL thực tế" : "Chưa có hồ sơ",
      icon: Users,
      color: "#7D58D9",
      bgGradient: "from-[#7D58D9]/10 to-[#7D58D9]/5",
      borderColor: "border-[#7D58D9]/20",
      href: "/cms/members",
    },
    {
      title: "5 Ngành Hướng Đạo",
      value: `${sectionCount}`,
      unit: "ngành",
      subtitle: "Nhi • Ấu • Thiếu • Kha • Tráng",
      badge: "Đầy đủ 5 ngành",
      icon: Layers,
      color: "#5CB856",
      bgGradient: "from-[#5CB856]/10 to-[#5CB856]/5",
      borderColor: "border-[#5CB856]/20",
      href: "/cms/sections",
    },
    {
      title: "Đơn Vị Sinh Hoạt Cơ Sở",
      value: `${totalUnits}`,
      unit: "đơn vị",
      subtitle: `${unitCounts.groups} Liên đoàn • ${unitCounts.troops} Đoàn • ${unitCounts.units} Đội`,
      badge: `${unitCounts.councils} Châu • ${unitCounts.districts} Đạo`,
      icon: Building2,
      color: "#EDB55E",
      bgGradient: "from-[#EDB55E]/15 to-[#EDB55E]/5",
      borderColor: "border-[#EDB55E]/25",
      href: "/cms/troops",
    },
    {
      title: "Kinh Phí & Ngân Sách",
      value:
        expenseTotal >= 1000000
          ? `${(expenseTotal / 1000000).toFixed(1)} tr`
          : `${expenseTotal.toLocaleString("vi-VN")}`,
      unit: "VNĐ",
      subtitle:
        expenseTotal > 0
          ? "Tổng chi phí hoạt động đã ghi nhận"
          : "Chưa ghi nhận khoản chi",
      badge: expenseTotal > 0 ? "Đã ghi nhận" : "0 khoản chi",
      icon: Wallet,
      color: "#E01205",
      bgGradient: "from-[#E01205]/10 to-[#E01205]/5",
      borderColor: "border-[#E01205]/20",
      href: "/cms/expenses",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-card p-5 space-y-4"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className={`group relative overflow-hidden rounded-xl border ${item.borderColor} bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            {/* Top right gradient accent */}
            <div
              className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${item.bgGradient} blur-xl group-hover:scale-125 transition-transform`}
            />

            <div className="relative z-10 flex items-start justify-between">
              <div
                className="p-2.5 rounded-xl border border-border/50 shadow-xs"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span className="flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="hidden group-hover:inline mr-1">Chi tiết</span>
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {item.value}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.unit}
                  </span>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full border shadow-2xs truncate"
                  style={{
                    backgroundColor: `${item.color}12`,
                    borderColor: `${item.color}30`,
                    color: item.color,
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground/80 truncate">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {item.subtitle}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
