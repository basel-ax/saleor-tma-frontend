import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import PageHeader from "../components/PageHeader";
import QuantityStepper from "../components/QuantityStepper";
import EmptyState from "../components/EmptyState";

const CartPage: FC = () => {
  const navigate = useNavigate();

  const cart = useCartStore((s) => s.cart);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const currency = cart?.items[0]?.currency ?? "USD";

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const handleIncrement = (dishId: string) => {
    incrementItem(dishId);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  const handleDecrement = (dishId: string) => {
    decrementItem(dishId);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  const handleRemove = (dishId: string) => {
    removeItem(dishId);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("warning");
  };

  // ─── Empty cart ──────────────────────────────────────────────────────────────
  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Cart" showBack />
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add some dishes from a restaurant to get started."
          action={
            <button className="tg-btn" onClick={() => navigate("/")}>
              Browse Restaurants
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <PageHeader title="Cart" showBack />

      {/* Restaurant label */}
      <div
        className="mx-4 mb-3 px-3 py-2 rounded-tg flex items-center gap-2"
        style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
      >
        <span className="text-lg">🏪</span>
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-0.5"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            Ordering from
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {cart.restaurantName}
          </p>
        </div>
      </div>

      {/* Item list */}
      <div className="page-content pt-0">
        <div className="flex flex-col gap-3 animate-slide-up">
          {cart.items.map((item) => (
            <div
              key={item.dishId}
              className="rounded-tg overflow-hidden animate-fade-in"
              style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
            >
              <div className="flex gap-3 p-3">
                {/* Item image */}
                <div
                  className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden"
                  style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
                >
                  {item.imageUrl ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
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
                        className="absolute inset-0 items-center justify-center text-2xl"
                        style={{
                          display: "none",
                          backgroundColor: "var(--tg-theme-secondary-bg-color)",
                        }}
                      >
                        🍴
                      </div>
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: "var(--tg-theme-secondary-bg-color)",
                      }}
                    >
                      🍴
                    </div>
                  )}
                </div>

                {/* Item details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold leading-tight line-clamp-2"
                      style={{ color: "var(--tg-theme-text-color)" }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        className="text-xs mt-0.5 line-clamp-1"
                        style={{ color: "var(--tg-theme-hint-color)" }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price + stepper */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span
                        className="text-xs"
                        style={{ color: "var(--tg-theme-hint-color)" }}
                      >
                        {formatPrice(item.price)} each
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--tg-theme-text-color)" }}
                      >
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <QuantityStepper
                      quantity={item.quantity}
                      onIncrement={() => handleIncrement(item.dishId)}
                      onDecrement={() => handleDecrement(item.dishId)}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.dishId)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="flex-shrink-0 self-start w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
                  style={{
                    backgroundColor: "var(--tg-theme-bg-color)",
                    color: "var(--tg-theme-destructive-text-color)",
                  }}
                  title="Remove item"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div
          className="mt-4 rounded-tg overflow-hidden"
          style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
        >
          <div className="p-4 space-y-2.5">
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--tg-theme-hint-color)" }}
            >
              Order Summary
            </h3>

            {/* Item subtotals */}
            {cart.items.map((item) => (
              <div
                key={item.dishId}
                className="flex items-center justify-between gap-2"
              >
                <span
                  className="text-sm flex-1 truncate"
                  style={{ color: "var(--tg-theme-hint-color)" }}
                >
                  {item.name}{" "}
                  <span className="font-medium">× {item.quantity}</span>
                </span>
                <span
                  className="text-sm font-medium flex-shrink-0"
                  style={{ color: "var(--tg-theme-text-color)" }}
                >
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}

            {/* Divider */}
            <div
              className="border-t my-2"
              style={{ borderColor: "var(--tg-theme-bg-color)" }}
            />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span
                className="text-base font-bold"
                style={{ color: "var(--tg-theme-text-color)" }}
              >
                Total
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "var(--tg-theme-text-color)" }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Item count hint */}
            <p
              className="text-xs text-right"
              style={{ color: "var(--tg-theme-hint-color)" }}
            >
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {/* Bottom spacer for fixed bar */}
        <div className="h-4" />
      </div>

      {/* Checkout CTA */}
      <div className="bottom-bar">
        <button
          onClick={() => navigate("/checkout")}
          className="tg-btn flex items-center justify-between px-5"
          aria-label="Proceed to checkout"
        >
          <span className="text-base font-semibold flex-1 text-center">
            Proceed to Checkout
          </span>
          <span className="text-sm font-bold opacity-90 flex-shrink-0">
            {formatPrice(totalPrice)}
          </span>
        </button>
      </div>
    </div>
  );
};

export { CartPage };
export default CartPage;
