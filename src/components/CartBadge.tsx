import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

interface CartBadgeProps {
  className?: string;
}

export const CartBadge: FC<CartBadgeProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());

  if (totalItems === 0) return null;

  return (
    <button
      aria-label={`Cart — ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
      onClick={() => navigate("/cart")}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 active:scale-90 ${className}`}
      style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
    >
      {/* Cart icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--tg-theme-button-color)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {/* Badge count */}
      <span
        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[11px] font-bold flex items-center justify-center px-1 leading-none"
        style={{
          backgroundColor: "var(--tg-theme-button-color)",
          color: "var(--tg-theme-button-text-color)",
        }}
      >
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </button>
  );
};

export default CartBadge;
