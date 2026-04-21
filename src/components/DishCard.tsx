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
      className="flex flex-col w-full rounded-2xl overflow-hidden animate-fade-in"
      style={{ 
        backgroundColor: "var(--tg-theme-secondary-bg-color)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)"
      }}
    >
      <button
        onClick={() => onAdd(dish)}
        className="w-full text-left"
        aria-label={`Select ${dish.name}`}
      >
        <div className="aspect-[4/3] overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--tg-theme-bg-color)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l-9 9h5l3 9V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4l3-9h5z"/>
              </svg>
            </div>
          )}
        </div>
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 p-4">
        <div className="min-w-0">
          <h3
            className="text-sm sm:text-base font-medium leading-snug line-clamp-2"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {dish.name}
          </h3>

          {dish.description && (
            <p
              className="text-xs sm:text-sm leading-relaxed line-clamp-2 mt-1.5"
              style={{ color: "var(--tg-theme-hint-color)" }}
            >
              {dish.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span
            className="text-lg sm:text-xl font-semibold"
            style={{ color: "var(--tg-theme-button-color)" }}
          >
            {formattedPrice}
          </span>
        </div>

        <div className="flex items-center justify-center mt-3">
          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(dish);
              }}
              aria-label={`Add ${dish.name} to cart`}
              className="w-full py-3.5 px-5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98]"
              style={{
                backgroundColor: "var(--tg-theme-button-color)",
                color: "var(--tg-theme-button-text-color)",
              }}
            >
              Add to cart
            </button>
          ) : (
            <div className="w-full flex items-center justify-center">
              <QuantityStepper
                quantity={quantity}
                onIncrement={() => onIncrement(dish.id)}
                onDecrement={() => onDecrement(dish.id)}
                size="md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;
