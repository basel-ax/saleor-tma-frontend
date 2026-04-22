import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import AppLayout from "../components/AppLayout";
import QuantityStepper from "../components/QuantityStepper";
import EmptyState from "../components/EmptyState";
import { useLanguage } from "../context/LanguageContext";

const CartPage: FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [settingsOpen, setSettingsOpen] = useState(false);

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
       <AppLayout
         title={t('cart_title')}
         icon="🛒"
         showBack
         settingsOpen={settingsOpen}
         onSettingsOpen={() => setSettingsOpen(true)}
         onSettingsClose={() => setSettingsOpen(false)}
       >
         <EmptyState
           icon="🛒"
           title={t('cart_empty_title')}
           description={t('cart_empty_description')}
           action={
             <button className="tg-btn" onClick={() => navigate("/")}>
               {t('browse_restaurants')}
             </button>
           }
         />
       </AppLayout>
     );
   }

return (
    <AppLayout
      title={t('cart_title')}
      icon="🛒"
      showBack
      settingsOpen={settingsOpen}
      onSettingsOpen={() => setSettingsOpen(true)}
      onSettingsClose={() => setSettingsOpen(false)}
    >
      {/* Restaurant label */}
      <div
        className="mx-4 mb-4 mt-2 px-4 py-3 rounded-tg flex items-center gap-3"
        style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
      >
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
          </svg>
        </div>
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-0.5"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {t('ordering_from')}
          </p>
          <p
            className="text-base font-semibold truncate"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {cart.restaurantName}
          </p>
        </div>
      </div>

      {/* Item list */}
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
                      {formatPrice(item.price)} {t('each')}
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
                    size="md"
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
            {t('order_summary')}
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
              {t('total')}
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
            {totalItems} {totalItems === 1 ? t('item') : t('items')}
          </p>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="bottom-bar">
        <button
          onClick={() => navigate("/checkout")}
          className="tg-btn flex items-center justify-between px-5"
          aria-label="Proceed to checkout"
        >
          <span className="text-base font-semibold flex-1 text-center">
            {t('proceed_to_checkout')}
          </span>
          <span className="text-sm font-bold opacity-90">
            {formatPrice(totalPrice)}
          </span>
        </button>
      </div>
    </AppLayout>
  );
};

export { CartPage };
export default CartPage;
