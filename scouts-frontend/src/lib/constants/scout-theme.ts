export interface ScoutSectionInfo {
  key: "nhi" | "au" | "thieu" | "kha" | "trang";
  name: string;
  englishName: string;
  ageRange: string;
  motto: string; // Châm ngôn
  color: string; // User-requested primary hex color
  tailwindColor: string;
  accentBg: string;
  badgeBg: string;
  borderClass: string;
  textClass: string;
  description: string;
  rankings: string[];
}

/**
 * 6-Color pattern extracted directly from the user's reference image:
 * #E01205 (Red), #EDB55E (Amber/Yellow), #7D58D9 (Scout Purple),
 * #D6C3DF (Lavender), #E1E1E1 (Platinum), #5CB856 (Green)
 */
export const REFERENCE_PALETTE = {
  red: "#E01205",
  amber: "#EDB55E",
  purple: "#7D58D9",
  lavender: "#D6C3DF",
  platinum: "#E1E1E1",
  green: "#5CB856",
} as const;

export const PALETTE_STRIP = [
  { name: "Tráng Red", hex: "#E01205" },
  { name: "Ấu Amber", hex: "#EDB55E" },
  { name: "Scout Royal Purple", hex: "#7D58D9" },
  { name: "Soft Lilac", hex: "#D6C3DF" },
  { name: "Silver Mist", hex: "#E1E1E1" },
  { name: "Thiếu Emerald", hex: "#5CB856" },
];

/**
 * 5 Scout Sections with user-requested colors:
 * - Nhi: Orange (#F97316 / #EA580C)
 * - Ấu: Yellow (#EDB55E / #EAB308)
 * - Kha: Burgundy (#881337 / #800020)
 * - Thiếu: Green (#5CB856 / #16A34A)
 * - Tráng: Red (#E01205 / #DC2626)
 */
export const SCOUT_SECTIONS: Record<string, ScoutSectionInfo> = {
  nhi: {
    key: "nhi",
    name: "Ngành Nhi",
    englishName: "Beavers / Joey Scouts",
    ageRange: "5 - 7 tuổi",
    motto: "Chia sẻ (Sharing)",
    color: "#F97316", // Orange
    tailwindColor: "orange",
    accentBg: "bg-orange-500/10 dark:bg-orange-500/15",
    badgeBg:
      "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
    borderClass: "border-orange-500/30 hover:border-orange-500/60",
    textClass: "text-orange-600 dark:text-orange-400",
    description:
      "Chim non, rèn luyện sự hồn nhiên, tinh thần ngoan ngoãn và tình yêu thương gia đình.",
    rankings: [
      "Chim Non Khởi Đầu",
      "Chim Non Siêng Năng",
      "Chim Non Trưởng Thành",
    ],
  },
  au: {
    key: "au",
    name: "Ngành Ấu",
    englishName: "Cub Scouts",
    ageRange: "7 - 11 tuổi",
    motto: "Gắng Sức (Do Your Best)",
    color: "#EDB55E", // Yellow / Golden Amber from reference
    tailwindColor: "amber",
    accentBg: "bg-amber-400/10 dark:bg-amber-400/15",
    badgeBg:
      "bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-400/30",
    borderClass: "border-amber-400/30 hover:border-amber-400/60",
    textClass: "text-amber-600 dark:text-amber-400",
    description:
      "Sói con theo bước Chân Rừng (Mowgli), học cách tự lập, vâng lời và phát triển kỹ năng cơ bản.",
    rankings: [
      "Sói Con Nhập Bầy",
      "Mắt Mở (Một Sao)",
      "Tai Thính (Hai Sao)",
      "Sói Đầu Đàn",
    ],
  },
  thieu: {
    key: "thieu",
    name: "Ngành Thiếu",
    englishName: "Scouts",
    ageRange: "11 - 15 tuổi",
    motto: "Sắp Sẵn (Be Prepared)",
    color: "#5CB856", // Green from reference
    tailwindColor: "emerald",
    accentBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    badgeBg:
      "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    borderClass: "border-emerald-500/30 hover:border-emerald-500/60",
    textClass: "text-emerald-600 dark:text-emerald-400",
    description:
      "Học làm việc theo hàng đội, rèn luyện tinh thần thám hiểm, nút dây, cắm trại và vượt thử thách.",
    rankings: ["Tân Sinh", "Hạng Nhì", "Hạng Nhất", "Hướng Đạo Vạn Năng"],
  },
  kha: {
    key: "kha",
    name: "Ngành Kha",
    englishName: "Venture Scouts",
    ageRange: "15 - 18 tuổi",
    motto: "Khai Phá (Look Wide)",
    color: "#881337", // Burgundy (đỏ bầm / huyết dụ)
    tailwindColor: "rose",
    accentBg: "bg-rose-900/15 dark:bg-rose-950/40",
    badgeBg:
      "bg-rose-900/20 text-rose-800 dark:text-rose-200 border-rose-900/30",
    borderClass: "border-rose-900/30 hover:border-rose-800/60",
    textClass: "text-[#881337] dark:text-rose-300",
    description:
      "Dấn thân khám phá những chân trời mới, phát triển năng lực lãnh đạo, định hướng nghề nghiệp và tự chủ.",
    rankings: [
      "Kha Tân Sinh",
      "Kha Dấn Thân",
      "Kha Khai Phá",
      "Kha Trưởng Thành",
    ],
  },
  trang: {
    key: "trang",
    name: "Ngành Tráng",
    englishName: "Rover Scouts",
    ageRange: "18 - 25+ tuổi",
    motto: "Giúp Ích (Service)",
    color: "#E01205", // Red from reference
    tailwindColor: "red",
    accentBg: "bg-red-500/10 dark:bg-red-500/15",
    badgeBg: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
    borderClass: "border-red-500/30 hover:border-red-500/60",
    textClass: "text-red-600 dark:text-red-400",
    description:
      "Phụng sự xã hội, làm gương và dìu dắt thế hệ trẻ, chuẩn bị bước vào cuộc sống trưởng thành với trách nhiệm cao.",
    rankings: [
      "Tráng Sinh Dự Bị",
      "Tráng Sinh Lên Đường",
      "Tráng Sinh Phụng Sự",
    ],
  },
};

export const SCOUT_SECTIONS_LIST = Object.values(SCOUT_SECTIONS);
