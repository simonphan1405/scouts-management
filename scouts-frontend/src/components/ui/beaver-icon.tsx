import { forwardRef } from "react";
import type { SVGProps } from "react";

export interface BeaverIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Beaver Icon (Biểu tượng con Hải ly) designed in Lucide icon style.
 * Matches Lucide 24x24 grid, 2px stroke, round caps/joins.
 * Features signature beaver characteristics:
 * - Round ears
 * - Chubby cheeks
 * - Expressive eyes & nose
 * - Characteristic beaver buck teeth (răng cửa hải ly)
 * - Subtle whiskers
 */
export const BeaverIcon = forwardRef<SVGSVGElement, BeaverIconProps>(
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
        aria-label="Con Hải Ly (Beaver)"
        {...props}
      >
        {/* Round beaver ears */}
        <path d="M4.5 7.5A2.5 2.5 0 0 1 8 5c.6 0 1.2.2 1.7.6" />
        <path d="M19.5 7.5A2.5 2.5 0 0 0 16 5c-.6 0-1.2.2-1.7.6" />

        {/* Top of head */}
        <path d="M9.7 5.6C10.4 5.2 11.2 5 12 5s1.6.2 2.3.6" />

        {/* Chubby beaver cheeks & face contour */}
        <path d="M4.5 7.5C3.2 9.5 2.5 12 2.5 14.5c0 4 3.5 6.5 9.5 6.5s9.5-2.5 9.5-6.5c0-2.5-.7-5-2-7" />

        {/* Eyes */}
        <path d="M8 11.5v.5" />
        <path d="M16 11.5v.5" />

        {/* Nose */}
        <path d="M11 13.5h2l-1 1.2z" />

        {/* Snout / Muzzle curve */}
        <path d="M7.5 15.5c1.2-.8 2.7-1.2 4.5-1.2s3.3.4 4.5 1.2" />

        {/* Signature Beaver Buck Teeth */}
        <path d="M10 16.5v3h4v-3" />
        <path d="M12 16.5v3" />

        {/* Whiskers */}
        <path d="M4 14.5h2" />
        <path d="M4 16.5h2.5" />
        <path d="M20 14.5h-2" />
        <path d="M20 16.5h-2.5" />
      </svg>
    );
  },
);

BeaverIcon.displayName = "BeaverIcon";

export const Beaver = BeaverIcon;
