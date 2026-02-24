import { type FC, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface OrderSuccessState {
  orderId?: string;
}

export const OrderSuccessPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;
  const orderId = state?.orderId;

  // If user navigates here without an orderId (e.g. direct URL), redirect home
  useEffect(() => {
    if (!orderId) {
      const timer = setTimeout(() => navigate("/", { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [orderId, navigate]);

  const handleBackToRestaurants = () => {
    navigate("/", { replace: true });
  };

  return (
    <div
      className="page flex flex-col items-center justify-center min-h-screen px-6 text-center animate-fade-in"
      style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
    >
      {/* Success icon */}
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(52, 199, 89, 0.15)" }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34c759"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {/* Sparkle decorations */}
        <span
          className="absolute -top-1 -right-1 text-xl animate-pulse-soft"
          aria-hidden="true"
        >
          ✨
        </span>
        <span
          className="absolute -bottom-1 -left-2 text-lg animate-pulse-soft"
          style={{ animationDelay: "0.4s" }}
          aria-hidden="true"
        >
          🎉
        </span>
      </div>

      {/* Heading */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--tg-theme-text-color)" }}
      >
        Order Placed!
      </h1>
      <p
        className="text-base leading-relaxed mb-6 max-w-xs"
        style={{ color: "var(--tg-theme-hint-color)" }}
      >
        Your order has been received and is being prepared. We'll notify you
        when it's on its way.
      </p>

      {/* Order ID badge */}
      {orderId && (
        <div
          className="mb-8 px-5 py-3 rounded-tg animate-slide-up"
          style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            Order ID
          </p>
          <p
            className="text-base font-bold font-mono"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            #{orderId}
          </p>
        </div>
      )}

      {/* What's next info */}
      <div
        className="w-full max-w-sm rounded-tg overflow-hidden mb-8 animate-slide-up"
        style={{
          backgroundColor: "var(--tg-theme-secondary-bg-color)",
          animationDelay: "0.1s",
          animationFillMode: "both",
        }}
      >
        <div className="p-4 space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            What's next
          </p>

          {[
            { icon: "👨‍🍳", text: "Restaurant is preparing your food" },
            { icon: "🛵", text: "A delivery rider will pick it up" },
            { icon: "🏠", text: "Your order will arrive at your location" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
              >
                {icon}
              </div>
              <p
                className="text-sm leading-snug"
                style={{ color: "var(--tg-theme-text-color)" }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="w-full max-w-sm animate-slide-up"
        style={{ animationDelay: "0.2s", animationFillMode: "both" }}
      >
        <button
          onClick={handleBackToRestaurants}
          className="tg-btn"
          aria-label="Back to restaurants"
        >
          Order More Food
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
