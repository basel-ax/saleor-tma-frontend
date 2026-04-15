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
      className="flex flex-col w-full rounded-tg overflow-hidden shadow-tg transition-all duration-200 hover:shadow-tg-lg animate-fade-in cursor-pointer"
      style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-tg">
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
            <div
              className="absolute inset-0 items-center justify-center"
              style={{
                display: "none",
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l-9 9h5l3 9V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4l3-9h5z"/>
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l-9 9h5l3 9V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4l3-9h5z"/>
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3
            className="text-sm sm:text-base font-semibold leading-tight line-clamp-2"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {dish.name}
          </h3>

          <p
            className="text-xs sm:text-sm leading-snug line-clamp-2 mt-1"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {dish.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <span
            className="text-base sm:text-lg font-bold"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {formattedPrice}
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => onAdd(dish)}
              aria-label={`Add ${dish.name} to cart`}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--tg-theme-button-color)",
                color: "var(--tg-theme-button-text-color)",
              }}
            >
              +
            </button>
          ) : (
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
