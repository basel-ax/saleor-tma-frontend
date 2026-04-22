import { useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDishes, fetchCategories, fetchRestaurants } from "../api";
import { useCartStore } from "../store/cartStore";
import type { Dish } from "../types";
import AppLayout from "../components/AppLayout";
import DishCard from "../components/DishCard";

import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useLanguage } from "../context/LanguageContext";

const DishesPage: FC = () => {
  const { restaurantId, categoryId } = useParams<{
    restaurantId: string;
    categoryId: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <AppLayout
        title={category?.name ?? "Dishes"}
        icon="🍽️"
        showBack
        showCart
        settingsOpen={settingsOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSettingsClose={() => setSettingsOpen(false)}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-tg overflow-hidden"
              style={{
                backgroundColor: "var(--tg-theme-secondary-bg-color)",
              }}
            >
              <div className="aspect-[4/3] skeleton" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="flex items-center justify-between mt-2">
                  <div className="skeleton h-4 w-12 rounded" />
                  <div className="skeleton w-8 h-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <AppLayout
        title={category?.name ?? "Dishes"}
        icon="🍽️"
        showBack
        settingsOpen={settingsOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSettingsClose={() => setSettingsOpen(false)}
      >
        <ErrorState
          title="Couldn't load dishes"
          message={
            (error as Error)?.message ||
            "Please check your connection and try again."
          }
          onRetry={() => refetch()}
        />
      </AppLayout>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!dishes || dishes.length === 0) {
    return (
      <AppLayout
        title={category?.name ?? "Dishes"}
        icon="🍽️"
        showBack
        showCart
        settingsOpen={settingsOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSettingsClose={() => setSettingsOpen(false)}
      >
        <EmptyState
          icon="🍽️"
          title={t('no_dishes_available')}
          description={t('no_dishes_description')}
          action={
            <button
              className="tg-btn tg-btn-secondary"
              onClick={() => navigate(`/restaurants/${restaurantId}`)}
            >
              {t('back_to_menu')}
            </button>
          }
        />
      </AppLayout>
    );
  }

// ─── Main render ───────────────────────────────────────────────────────────
  return (
    <AppLayout
      title={category?.name ?? t('dishes_title')}
      icon="🍽️"
      showBack
      showCart
      settingsOpen={settingsOpen}
      onSettingsOpen={() => setSettingsOpen(true)}
      onSettingsClose={() => setSettingsOpen(false)}
    >
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

      <div className="px-4 pb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--tg-theme-hint-color)" }}
        >
          {t('dishes_section_label', dishes.length)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-slide-up">
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

      {totalItems > 0 && cart?.restaurantId === restaurantId && (
        <div className="bottom-bar animate-slide-up">
          <button
            onClick={() => navigate("/cart")}
            className="tg-btn flex items-center justify-between px-5 py-3"
            style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.1)" }}
            aria-label={`View cart — ${totalItems} items`}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              >
                {totalItems}
              </span>
              <span className="text-base font-semibold">
                {t('cart_title')}
              </span>
            </div>

            {formattedTotal && (
              <span className="text-base font-bold">
                {formattedTotal}
              </span>
            )}
          </button>
        </div>
      )}
    </AppLayout>
  );
};

export { DishesPage };
export default DishesPage;
