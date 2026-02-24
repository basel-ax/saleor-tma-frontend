import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import CartBadge from "./CartBadge";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
  showCart?: boolean;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightElement,
  showCart = false,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`flex items-center gap-3 px-4 py-3 sticky top-0 z-40 ${className}`}
      style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
    >
      {/* Back Button */}
      {showBack && (
        <button
          aria-label="Go back"
          onClick={handleBack}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 active:scale-90"
          style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--tg-theme-text-color)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Title */}
      <h1
        className="flex-1 text-lg font-bold truncate"
        style={{ color: "var(--tg-theme-text-color)" }}
      >
        {title}
      </h1>

      {/* Right side: custom element OR cart badge */}
      {rightElement ? (
        <div className="flex-shrink-0">{rightElement}</div>
      ) : showCart ? (
        <CartBadge />
      ) : null}
    </header>
  );
};

export default PageHeader;
