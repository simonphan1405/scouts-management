import { forwardRef } from "react";
import type { SVGProps } from "react";

export interface RoverThumbstickProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

/**
 * Rover Thumbstick Icon (Biểu tượng Gậy Tráng Sinh / Gậy ngã ba ngón cái - Rover Scouts).
 * Inspired by the authentic Rover thumbstick walking staff:
 * - Natural wooden V-crook / fork at the top where the thumb rests (chỗ tì ngón cái)
 * - Sturdy hiking staff shaft extending downward
 * - Leather grip wraps where the hand holds the staff
 * - Lanyard loop (dây da đeo cổ tay) for balance and outdoor readiness
 * - Symbolizes the "crossroads of life" and the Rover journey of Service (Giúp Ích).
 */
export const RoverThumbstickIcon = forwardRef<
  SVGSVGElement,
  RoverThumbstickProps
>(({ className, size = 24, ...props }, ref) => {
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
      aria-label="Gậy Tráng Sinh (Rover Thumbstick)"
      {...props}
    >
      {/* Main wooden staff body and natural V-fork */}
      {/* Left branch continues taller, right branch forks out at ~35 degrees */}
      <path
        d="M9.5 22V11.2L6.8 3.8a1.2 1.2 0 0 1 2.2-.8l2.8 6.8c.4.8 1.6.8 2 0l3.6-5.4a1.2 1.2 0 0 1 2 1.3l-4.4 6V22a1.2 1.2 0 0 1-2.4 0Z"
        strokeWidth="1.75"
      />

      {/* Leather grip wrap bands (where the hand grips the staff below the fork) */}
      <line x1="9.8" y1="14" x2="14.2" y2="14" strokeWidth="1.4" />
      <line x1="9.8" y1="16.5" x2="14.2" y2="16.5" strokeWidth="1.4" />
      <line x1="9.8" y1="19" x2="14.2" y2="19" strokeWidth="1.4" />

      {/* Leather wrist lanyard loop on the side */}
      <path
        d="M9.5 13c-2.4.6-4.2 2.4-4.2 4.5s1.8 3.9 4.2 3.9"
        strokeWidth="1.4"
      />
    </svg>
  );
});

RoverThumbstickIcon.displayName = "RoverThumbstickIcon";

export const RoverThumbstick = RoverThumbstickIcon;
