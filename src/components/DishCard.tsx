import type { FC } from "react";
import type { Dish } from "../types";
import QuantityStepper from "./QuantityStepper";

interface DishCardProps {
  dish: Dish;
  quantity: number;
  onAdd: (dish: Dish) => void;
  onIncrement: (dishId: string) => void;
  onDecrement: (dishId: string) => void;
}

export const DishCard: FC<DishCardProps> = ({
  dish,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: dish.currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(dish.price);

  return (
    <div
      className="flex gap-3 p-3 rounded-tg animate-fade-in"
      style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
    >
      {/* Dish Image */}
      <div
        className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden"
        style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
      >
        {dish.imageUrl ? (
          <>
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const placeholder =
                  target.nextElementSibling as HTMLElement | null;
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
            {/* Fallback placeholder — hidden until image fails */}
            <div
              className="absolute inset-0 items-center justify-center text-3xl"
              style={{
                display: "none",
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
              }}
            >
              🍴
            </div>
          </>
        ) : (
          /* No image URL — show placeholder immediately */
          <div
            className="w-full h-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
            🍴
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="min-w-0">
          {/* Name */}
          <h3
            className="text-sm font-semibold leading-tight mb-0.5 line-clamp-2"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {dish.name}
          </h3>

          {/* Description */}
          <p
            className="text-xs leading-snug line-clamp-2"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {dish.description}
          </p>
        </div>

        {/* Price + Controls */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {formattedPrice}
          </span>

          {quantity === 0 ? (
            /* Add button — shown when dish not in cart */
            <button
              onClick={() => onAdd(dish)}
              aria-label={`Add ${dish.name} to cart`}
              className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg transition-all duration-150 active:scale-90"
              style={{
                backgroundColor: "var(--tg-theme-button-color)",
                color: "var(--tg-theme-button-text-color)",
              }}
            >
              +
            </button>
          ) : (
            /* Stepper — shown when dish is in cart */
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => onIncrement(dish.id)}
              onDecrement={() => onDecrement(dish.id)}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
