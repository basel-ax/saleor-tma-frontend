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
import CartBadge from "../components/CartBadge";

const RestaurantsPage: FC = () => {
  const navigate = useNavigate();
  const isDifferentRestaurant = useCartStore((s) => s.isDifferentRestaurant);
  const clearCart = useCartStore((s) => s.clearCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRestaurant, setPendingRestaurant] = useState<Restaurant | null>(
    null,
  );

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
      <div className="page">
        <div
          className="flex items-center justify-between px-4 py-3 sticky top-0 z-40"
          style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
        >
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            🍽️ Restaurants
          </h1>
          <CartBadge />
        </div>
        {/* Search skeleton */}
        <div className="px-4 pb-3">
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>
        {/* Card skeletons */}
        <div className="page-content pt-0">
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
        </div>
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="page">
        <div className="flex items-center justify-between px-4 py-3">
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            🍽️ Restaurants
          </h1>
        </div>
        <ErrorState
          title="Couldn't load restaurants"
          message={
            (error as Error)?.message ||
            "Please check your connection and try again."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-40"
        style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
      >
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--tg-theme-text-color)" }}
        >
          🍽️ Restaurants
        </h1>
        <CartBadge />
      </div>

      {/* Search */}
      <div
        className="px-4 pb-3 sticky top-[52px] z-30"
        style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-3 h-11"
          style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
        >
          <svg
            width="16"
            height="16"
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
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--tg-theme-text-color)" }}
            aria-label="Search restaurants"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: "var(--tg-theme-hint-color)",
                color: "var(--tg-theme-secondary-bg-color)",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Restaurant list */}
      <div className="page-content pt-0">
        {filteredRestaurants.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon="🔍"
              title="No results found"
              description={`No restaurants match "${searchQuery}". Try a different search term.`}
              action={
                <button
                  className="tg-btn tg-btn-secondary"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              }
            />
          ) : (
            <EmptyState
              icon="🏪"
              title="No restaurants available"
              description="Check back later for new restaurants in your area."
              action={
                <button className="tg-btn" onClick={() => refetch()}>
                  Refresh
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
      </div>

      {/* Cart reset confirmation modal */}
      {pendingRestaurant && (
        <CartResetConfirmModal
          newRestaurantName={pendingRestaurant.name}
          onConfirm={handleConfirmSwitch}
          onCancel={handleCancelSwitch}
        />
      )}
    </div>
  );
};

export { RestaurantsPage };
export default RestaurantsPage;
