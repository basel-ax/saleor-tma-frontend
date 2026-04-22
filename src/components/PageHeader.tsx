import type { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import CartBadge from "./CartBadge";

interface PageHeaderProps {
  title: string;
  icon?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
  showCart?: boolean;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  icon,
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
    <header className={`app-header ${className}`}>
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
      >
        <div className="flex items-center gap-3">
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
          
          {icon && (
            <span className="text-xl" role="img" aria-hidden="true">
              {icon}
            </span>
          )}
          
          <h1
            className="text-lg font-bold truncate"
            style={{ color: "var(--tg-theme-text-color)" }}
          >
            {title}
          </h1>
</div>

        {rightElement ? (
          <div className="flex-shrink-0">{rightElement}</div>
        ) : showCart ? (
          <CartBadge />
        ) : null}
      </div>
      
      <div className="header-decoration">
        <div className="header-mountain-left" />
        <div className="header-mountain-right" />
        <div className="header-grass" />
      </div>
    </header>
  );
};

export default PageHeader;
