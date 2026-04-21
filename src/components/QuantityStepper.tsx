import type { FC } from "react";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export const QuantityStepper: FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = "md",
  className = "",
}) => {
  const isSmall = size === "sm";

  const btnBase = `
    flex items-center justify-center rounded-xl font-semibold
    transition-all duration-200 active:scale-95 select-none
    ${isSmall ? "w-9 h-9 text-lg" : "w-11 h-11 text-xl"}
  `;

  const countClass = `
    font-medium tabular-nums text-center select-none
    ${isSmall ? "w-8 text-base" : "w-10 text-lg"}
  `;

  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decrement */}
      <button
        aria-label="Decrease quantity"
        disabled={quantity <= min}
        onClick={(e) => {
          e.stopPropagation();
          if (quantity > min) onDecrement();
        }}
        className={`${btnBase} disabled:opacity-40`}
        style={{
          backgroundColor: "var(--tg-theme-secondary-bg-color)",
          color: "var(--tg-theme-button-color)",
        }}
      >
        −
      </button>

      {/* Count */}
      <span
        className={countClass}
        style={{ color: "var(--tg-theme-text-color)" }}
      >
        {quantity}
      </span>

      {/* Increment */}
      <button
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={(e) => {
          e.stopPropagation();
          if (quantity < max) onIncrement();
        }}
        className={`${btnBase} disabled:opacity-40`}
        style={{
          backgroundColor: "var(--tg-theme-button-color)",
          color: "var(--tg-theme-button-text-color)",
        }}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;
