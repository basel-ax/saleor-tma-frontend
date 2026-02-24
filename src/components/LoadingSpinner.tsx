import type { FC } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        inline-block rounded-full
        border-[var(--tg-theme-secondary-bg-color)]
        border-t-[var(--tg-theme-button-color)]
        animate-spin
        ${sizeMap[size]}
        ${className}
      `}
    />
  );
};

export default LoadingSpinner;
