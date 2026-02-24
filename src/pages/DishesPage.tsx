import { type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDishes, fetchCategories, fetchRestaurants } from "../api";
import { useCartStore } from "../store/cartStore";
import type { Dish } from "../types";
import PageHeader from "../components/PageHeader";
import DishCard from "../components/DishCard";

import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const DishesPage: FC = () => {
  const { restaurantId, categoryId } = useParams<{
    restaurantId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();

  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());
  const cart = useCartStore((s) => s.cart);

  // ─── Fetch restaurant info ─────────────────────────────────────────────────
  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5,
  });
  const restaurant = restaurants?.find((r) => r.id === restaurantId);

  // ─── Fetch category info ───────────────────────────────────────────────────
  const { data: categories } = useQuery({
    queryKey: ["categories", restaurantId],
    queryFn: () => fetchCategories(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });
  const category = categories?.find((c) => c.id === categoryId);

  // ─── Fetch dishes ──────────────────────────────────────────────────────────
  const {
    data: dishes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dishes", restaurantId, categoryId],
    queryFn: () => fetchDishes(restaurantId!, categoryId!),
    enabled: !!restaurantId && !!categoryId,
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAddDish = (dish: Dish) => {
    addItem(dish, restaurant?.name ?? "");
    // Haptic feedback if available
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  };

  const handleIncrement = (dishId: string) => {
    incrementItem(dishId);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  const handleDecrement = (dishId: string) => {
    decrementItem(dishId);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  const formattedTotal =
    totalPrice > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: cart?.items[0]?.currency || "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(totalPrice)
      : null;

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page">
        <PageHeader title={category?.name ?? "Dishes"} showBack showCart />
        <div className="page-content">
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-tg"
                style={{
                  backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
              >
                <div className="skeleton flex-shrink-0 w-24 h-24 rounded-xl" />
                <div className="flex-1 flex flex-col gap-2 justify-between py-1">
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-5 w-16 rounded" />
                    <div className="skeleton w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="page">
        <PageHeader title={category?.name ?? "Dishes"} showBack />
        <ErrorState
          title="Couldn't load dishes"
          message={
            (error as Error)?.message ||
            "Please check your connection and try again."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!dishes || dishes.length === 0) {
    return (
      <div className="page">
        <PageHeader title={category?.name ?? "Dishes"} showBack showCart />
        <EmptyState
          icon="🍽️"
          title="No dishes available"
          description="This category doesn't have any dishes yet. Try another category."
          action={
            <button
              className="tg-btn tg-btn-secondary"
              onClick={() => navigate(`/restaurants/${restaurantId}`)}
            >
              Back to Menu
            </button>
          }
        />
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Header */}
      <PageHeader title={category?.name ?? "Dishes"} showBack showCart />

      {/* Category description */}
      {category?.description && (
        <div className="px-4 pb-3">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {category.description}
          </p>
        </div>
      )}

      {/* Dish count label */}
      <div className="px-4 pb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--tg-theme-hint-color)" }}
        >
          {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}
        </p>
      </div>

      {/* Dish list */}
      <div className="page-content pt-0">
        <div className="flex flex-col gap-3 animate-slide-up">
          {dishes.map((dish: Dish, index: number) => (
            <div
              key={dish.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 40}ms`,
                animationFillMode: "both",
              }}
            >
              <DishCard
                dish={dish}
                quantity={getItemQuantity(dish.id)}
                onAdd={handleAddDish}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart bar — shown when cart has items from this restaurant */}
      {totalItems > 0 && cart?.restaurantId === restaurantId && (
        <div className="bottom-bar animate-slide-up">
          <button
            onClick={() => navigate("/cart")}
            className="tg-btn flex items-center justify-between px-5"
            aria-label={`View cart — ${totalItems} items`}
          >
            {/* Left: item count badge */}
            <span
              className="min-w-[28px] h-7 rounded-lg flex items-center justify-center text-sm font-bold px-1"
              style={{
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
            >
              {totalItems}
            </span>

            {/* Center: label */}
            <span className="flex-1 text-center text-base font-semibold">
              View Cart
            </span>

            {/* Right: total price */}
            {formattedTotal && (
              <span className="text-sm font-bold opacity-90">
                {formattedTotal}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export { DishesPage };
export default DishesPage;
