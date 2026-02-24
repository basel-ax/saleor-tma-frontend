import type { FC } from "react";
import type { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

export const RestaurantCard: FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(restaurant)}
      className="w-full text-left rounded-tg overflow-hidden transition-all duration-150 active:scale-[0.98] active:opacity-80"
      style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
      aria-label={`Select ${restaurant.name}`}
    >
      {/* Restaurant Image */}
      <div
        className="relative w-full h-44 overflow-hidden"
        style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
      >
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const placeholder =
                target.nextElementSibling as HTMLElement | null;
              if (placeholder) placeholder.style.display = "flex";
            }}
          />
        ) : null}
        {/* Placeholder (shown when no image or image fails to load) */}
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          style={{
            display: restaurant.imageUrl ? "none" : "flex",
            backgroundColor: "var(--tg-theme-secondary-bg-color)",
          }}
        >
          🍽️
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Name */}
        <h2
          className="text-base font-semibold leading-tight mb-1 truncate"
          style={{ color: "var(--tg-theme-text-color)" }}
        >
          {restaurant.name}
        </h2>

        {/* Description */}
        {restaurant.description && (
          <p
            className="text-sm leading-snug line-clamp-2 mb-2"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {restaurant.description}
          </p>
        )}

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: "var(--tg-theme-bg-color)",
                  color: "var(--tg-theme-accent-text-color)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};

export default RestaurantCard;
