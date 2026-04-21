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
      className="block w-full rounded-2xl overflow-hidden transition-all duration-250 hover:scale-[0.992] active:scale-[0.985]"
      style={{ 
        backgroundColor: "var(--tg-theme-secondary-bg-color)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)"
      }}
      aria-label={`Select ${restaurant.name}`}
    >
      {/* Restaurant Image */}
      <div className="relative w-full h-48 overflow-hidden">
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
        ) : (
          /* Placeholder (shown when no image or image fails to load) */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: "var(--tg-theme-secondary-bg-color)",
              color: "var(--tg-theme-accent-text-color)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8l-3 3m9-3V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3m9-9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2m-2 4l2 2m-7-3l2 2M9 9V4a2 2 0 0 1 2-2h2"/>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-2.5">
        {/* Name */}
        <h2
          className="text-lg font-medium leading-snug"
          style={{ color: "var(--tg-theme-text-color)" }}
        >
          {restaurant.name}
        </h2>

        {/* Description */}
        {restaurant.description && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {restaurant.description}
          </p>
        )}

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {restaurant.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--tg-theme-accent-text-color) 12%, transparent)",
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
