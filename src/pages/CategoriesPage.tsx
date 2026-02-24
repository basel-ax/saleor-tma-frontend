// ─── Categories Page ──────────────────────────────────────────────────────────
// Lists all menu categories for a given restaurant.

import { type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchRestaurants } from "../api";
import type { Category } from "../types";
import PageHeader from "../components/PageHeader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const CategoriesPage: FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();

  // ─── Fetch restaurant info (for header name) ────────────────────────────────
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5,
  });

  const restaurant = restaurants?.find((r) => r.id === restaurantId);

  // ─── Fetch categories ───────────────────────────────────────────────────────
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories", restaurantId],
    queryFn: () => fetchCategories(restaurantId!),
    enabled: !!restaurantId,
  });

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page">
        <PageHeader title={restaurant?.name ?? "Menu"} showBack showCart />
        <div className="page-content">
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 w-full rounded-tg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="page">
        <PageHeader title={restaurant?.name ?? "Menu"} showBack />
        <ErrorState
          title="Couldn't load menu"
          message={
            (error as Error)?.message ||
            "Please check your connection and try again."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────────
  if (!categories || categories.length === 0) {
    return (
      <div className="page">
        <PageHeader title={restaurant?.name ?? "Menu"} showBack showCart />
        <EmptyState
          icon="📋"
          title="No categories yet"
          description="This restaurant hasn't added any menu categories yet. Check back later."
          action={
            <button
              className="tg-btn tg-btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Restaurants
            </button>
          }
        />
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Header */}
      <PageHeader title={restaurant?.name ?? "Menu"} showBack showCart />

      {/* Restaurant description (if any) */}
      {restaurant?.description && (
        <div className="px-4 pb-3">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {restaurant.description}
          </p>
        </div>
      )}

      {/* Restaurant tags */}
      {restaurant?.tags && restaurant.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
                color: "var(--tg-theme-accent-text-color)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Section label */}
      <div className="px-4 pb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--tg-theme-hint-color)" }}
        >
          Categories
        </p>
      </div>

      {/* Category list */}
      <div className="page-content pt-0 animate-slide-up">
        <div className="flex flex-col gap-2">
          {categories.map((category: Category, index: number) => (
            <button
              key={category.id}
              onClick={() =>
                navigate(
                  `/restaurants/${restaurantId}/categories/${category.id}`,
                )
              }
              className="w-full text-left rounded-tg overflow-hidden transition-all duration-150 active:scale-[0.98] active:opacity-80 animate-fade-in"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
                animationDelay: `${index * 40}ms`,
                animationFillMode: "both",
              }}
              aria-label={`Browse ${category.name}`}
            >
              <div className="flex items-center gap-3 p-3.5">
                {/* Category image or emoji placeholder */}
                <div
                  className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden"
                  style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
                >
                  {category.imageUrl ? (
                    <>
                      <img
                        src={category.imageUrl}
                        alt={category.name}
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
                        className="absolute inset-0 items-center justify-center text-2xl"
                        style={{
                          display: "none",
                          backgroundColor: "var(--tg-theme-bg-color)",
                        }}
                      >
                        🍴
                      </div>
                    </>
                  ) : (
                    /* No image URL — show placeholder immediately */
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
                    >
                      🍴
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold leading-tight mb-0.5 truncate"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    {category.name}
                  </h3>
                  {category.description && (
                    <p
                      className="text-sm line-clamp-1"
                      style={{ color: "var(--tg-theme-hint-color)" }}
                    >
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--tg-theme-hint-color)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { CategoriesPage };
export default CategoriesPage;
