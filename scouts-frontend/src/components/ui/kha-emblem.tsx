import { forwardRef } from "react";
import type { SVGProps } from "react";

export interface KhaEmblemProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Authentic Vietnamese Scout Venture Section Emblem (Huy hiệu Ngành Kha Hướng Đạo Việt Nam).
 * Faithfully matches official kha.jpg insignia with expanded diamond frame:
 * - Outer rotated square / diamond boundary (khung hình thoi mở rộng, thoáng đãng)
 * - 4 cardinal directional arrows (4 mũi tên Khai Phá: Đông - Tây - Nam - Bắc)
 * - Central rounded capsule with 3 tiers
 * - Stylized "Khả" characters (chữ Khả cách điệu gồm bộ khẩu và nét móc)
 * Rendered using currentColor for dynamic theme integration.
 */
export const KhaEmblem = forwardRef<SVGSVGElement, KhaEmblemProps>(
  ({ className, size = 24, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        role="img"
        aria-label="Huy hiệu Ngành Kha Hướng Đạo"
        {...props}
      >
        {/* Expanded Outer Diamond Frame */}
        <path d="M12 1 23 12 12 23 1 12Z" strokeWidth="1.4" />

        {/* 4 Directional Arrows (Khai Phá / Look Wide) */}
        {/* Top Arrow */}
        <path d="M12 6.8V5.3" strokeWidth="1.5" />
        <polygon
          points="12,4.4 10.6,6.0 13.4,6.0"
          fill="currentColor"
          stroke="none"
        />

        {/* Bottom Arrow */}
        <path d="M12 17.2v1.5" strokeWidth="1.5" />
        <polygon
          points="12,19.6 10.6,18.0 13.4,18.0"
          fill="currentColor"
          stroke="none"
        />

        {/* Left Arrow */}
        <path d="M8.6 12H7.1" strokeWidth="1.5" />
        <polygon
          points="6.1,12 7.6,10.6 7.6,13.4"
          fill="currentColor"
          stroke="none"
        />

        {/* Right Arrow */}
        <path d="M15.4 12h1.5" strokeWidth="1.5" />
        <polygon
          points="17.9,12 16.4,10.6 16.4,13.4"
          fill="currentColor"
          stroke="none"
        />

        {/* Central Rounded Capsule */}
        <rect
          x="8.6"
          y="6.8"
          width="6.8"
          height="10.4"
          rx="1.2"
          strokeWidth="1.4"
        />

        {/* Horizontal Dividers (3 Tiers) */}
        <line x1="8.6" y1="9.4" x2="15.4" y2="9.4" strokeWidth="1.4" />
        <line x1="8.6" y1="13.3" x2="15.4" y2="13.3" strokeWidth="1.4" />

        {/* Middle Tier: Chữ Khả (Square dot & hook) */}
        <rect
          x="9.9"
          y="10.8"
          width="1"
          height="1"
          fill="currentColor"
          stroke="none"
        />
        <path d="M13 9.4v2.6a1 1 0 0 1-1.9 0v-.4" strokeWidth="1.2" />

        {/* Bottom Tier: Chữ Khả (Square dot & hook) */}
        <rect
          x="9.9"
          y="14.7"
          width="1"
          height="1"
          fill="currentColor"
          stroke="none"
        />
        <path d="M13 13.3v2.6a1 1 0 0 1-1.9 0v-.4" strokeWidth="1.2" />
      </svg>
    );
  },
);

KhaEmblem.displayName = "KhaEmblem";

export const KhaIcon = KhaEmblem;
