import { forwardRef } from "react";
import type { SVGProps } from "react";

export interface WolfIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Wolf Icon (Biểu tượng con Sói / Đầu Sói - Cub Scouts) designed in Lucide icon style.
 * Matches Lucide 24x24 grid, 2px stroke, round caps/joins.
 * Features signature wolf characteristics:
 * - Upright pointed ears
 * - Dynamic cheek fur tufts (lông má đặc trưng của sói)
 * - Sharp, alert eyes (mắt mở)
 * - Defined muzzle and nose
 */
export const WolfIcon = forwardRef<SVGSVGElement, WolfIconProps>(
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        role="img"
        aria-label="Con Sói (Wolf)"
        {...props}
      >
        {/* Left Ear */}
        <path d="M8 5 4 2l1.5 6.5" />
        {/* Right Ear */}
        <path d="M16 5 20 2l-1.5 6.5" />
        {/* Crown of Head */}
        <path d="M8 5c1.2-.6 2.6-.9 4-.9s2.8.3 4 .9" />
        {/* Left Cheek Fur Tufts */}
        <path d="M5.5 8.5 3 12l2.5 1L4 16l4.5 3.5" />
        {/* Right Cheek Fur Tufts */}
        <path d="M18.5 8.5 21 12l-2.5 1 1.5 3L15.5 19.5" />
        {/* Chin */}
        <path d="M8.5 19.5 12 22l3.5-2.5" />
        {/* Eyes (sharp, alert) */}
        <path d="M7.5 11l2 .5" />
        <path d="M16.5 11l-2 .5" />
        {/* Nose Bridge / Muzzle */}
        <path d="M10.5 13.5 12 15.5l1.5-2" />
        {/* Nose */}
        <path d="M11 17.5h2" />
      </svg>
    );
  },
);

WolfIcon.displayName = "WolfIcon";

export const Wolf = WolfIcon;
