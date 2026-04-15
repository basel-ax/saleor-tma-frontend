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
import { useLanguage } from "../context/LanguageContext";

const CategoriesPage: FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-tg overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
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
          title={t('no_categories_yet')}
          description={t('no_categories_description')}
          action={
            <button
              className="tg-btn tg-btn-secondary"
              onClick={() => navigate("/")}
            >
              {t('back_to_restaurants')}
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
       <PageHeader title={restaurant?.name ?? t('categories_title')} showBack showCart />

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
           {t('categories_section_label')}
         </p>
       </div>

      {/* Category list - 2 column grid */}
      <div className="page-content pt-0 animate-slide-up">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {categories.map((category: Category, index: number) => (
            <button
              key={category.id}
              onClick={() =>
                navigate(
                  `/restaurants/${restaurantId}/categories/${category.id}`,
                )
              }
              className="text-left rounded-tg overflow-hidden transition-all duration-150 active:scale-[0.98] active:opacity-80 animate-fade-in cursor-pointer"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
                animationDelay: `${index * 40}ms`,
                animationFillMode: "both",
              }}
              aria-label={`Browse ${category.name}`}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-tg">
                {category.imageUrl ? (
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
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    display: category.imageUrl ? "none" : "flex",
                    backgroundColor: "var(--tg-theme-bg-color)",
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-hint-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l-9 9h5l3 9V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4l3-9h5z"/>
                  </svg>
                </div>
              </div>
              <div className="p-3">
                <h3
                  className="text-base font-semibold leading-tight mb-1 truncate"
                  style={{ color: "var(--tg-theme-text-color)" }}
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: "var(--tg-theme-hint-color)" }}
                  >
                    {category.description}
                  </p>
                )}
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
