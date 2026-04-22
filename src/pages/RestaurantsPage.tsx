// ─── Restaurants Page ─────────────────────────────────────────────────────────
// Main page showing all available restaurants. Supports search/filter and
// handles the single-restaurant cart switch confirmation flow.

import { useState, useMemo, useCallback, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRestaurants } from "../api";
import { useCartStore } from "../store/cartStore";
import type { Restaurant } from "../types";
import RestaurantCard from "../components/RestaurantCard";
import CartResetConfirmModal from "../components/CartResetConfirmModal";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import AppLayout from "../components/AppLayout";
import { useLanguage } from "../context/LanguageContext";

const RestaurantsPage: FC = () => {
  const navigate = useNavigate();
  const isDifferentRestaurant = useCartStore((s) => s.isDifferentRestaurant);
  const clearCart = useCartStore((s) => s.clearCart);
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRestaurant, setPendingRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────
  const {
    data: restaurants,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  // ─── Filtered list ──────────────────────────────────────────────────────────
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [restaurants, searchQuery]);

  // ─── Navigation logic ────────────────────────────────────────────────────────
  const handleSelectRestaurant = useCallback(
    (restaurant: Restaurant) => {
      console.log("restaurant_selected", {
        restaurantId: restaurant.id,
        name: restaurant.name,
      });

      if (isDifferentRestaurant(restaurant.id)) {
        // Cart has items from a different restaurant — show confirmation
        setPendingRestaurant(restaurant);
      } else {
        // Cart is empty or same restaurant — navigate directly
        navigate(`/restaurants/${restaurant.id}`);
      }
    },
    [isDifferentRestaurant, navigate],
  );

  const handleConfirmSwitch = useCallback(() => {
    if (!pendingRestaurant) return;
    clearCart();
    navigate(`/restaurants/${pendingRestaurant.id}`);
    setPendingRestaurant(null);
  }, [clearCart, navigate, pendingRestaurant]);

  const handleCancelSwitch = useCallback(() => {
    setPendingRestaurant(null);
  }, []);

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout
        title={t('restaurants_title')}
        icon="🍽️"
        showCart
        settingsOpen={settingsOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSettingsClose={() => setSettingsOpen(false)}
      >
        <div className="px-4 pb-3">
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-tg overflow-hidden">
              <div className="skeleton h-44 w-full" />
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
              >
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <AppLayout
        title={t('restaurants_title')}
        icon="🍽️"
        settingsOpen={settingsOpen}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSettingsClose={() => setSettingsOpen(false)}
      >
        <ErrorState
          title={t('something_went_wrong')}
          message={
            (error as Error)?.message ||
            t('unexpected_error')
          }
          onRetry={() => refetch()}
        />
      </AppLayout>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <AppLayout
      title={t('restaurants_title')}
      icon="🍽️"
      showCart
      settingsOpen={settingsOpen}
      onSettingsOpen={() => setSettingsOpen(true)}
      onSettingsClose={() => setSettingsOpen(false)}
    >
      {/* Search */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 rounded-xl px-3 h-12 border transition-all duration-200"
          style={{ 
            backgroundColor: "var(--tg-theme-secondary-bg-color)",
            borderColor: "var(--tg-theme-secondary-bg-color)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--tg-theme-hint-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-base outline-none"
            style={{ color: "var(--tg-theme-text-color)" }}
            aria-label="Search restaurants"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label={t('clear_search')}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 hover:scale-110 active:scale-90"
              style={{
                backgroundColor: "var(--tg-theme-hint-color)",
                color: "var(--tg-theme-secondary-bg-color)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {{/* Restaurant list */}}
      {filteredRestaurants.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon="🔍"
            title={t('no_results_found')}
            description={t('no_results_description', searchQuery)}
            action={
              <button
                className="tg-btn tg-btn-secondary"
                onClick={() => setSearchQuery("")}
              >
                {t('clear_search')}
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="🏪"
            title={t('no_restaurants_available')}
            description={t('no_restaurants_description')}
            action={
              <button className="tg-btn" onClick={() => refetch()}>
                {t('refresh')}
              </button>
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-3 animate-slide-up">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={handleSelectRestaurant}
            />
          ))}
        </div>
      )}

      {{/* Cart reset confirmation modal */}}
      {pendingRestaurant && (
        <CartResetConfirmModal
          newRestaurantName={pendingRestaurant.name}
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />
      )}
    </AppLayout>
  );
};

export { RestaurantsPage };
export default RestaurantsPage;