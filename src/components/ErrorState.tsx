import type { FC } from "react";
import { useLanguage } from "../context/LanguageContext";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: FC<ErrorStateProps> = ({
    title = "Something went wrong",
    message = "An unexpected error occurred. Please try again.",
    onRetry,
    className = "",
  }) => {
    const { t } = useLanguage();
    
    // Use translations if provided titles/messages match default values
    const localizedTitle = title === "Something went wrong" ? t('something_went_wrong') : title;
    const localizedMessage = message === "An unexpected error occurred. Please try again." ? t('unexpected_error') : message;
    const localizedOnRetry = onRetry ? t('try_again') : undefined;
    
    return (
      <div
        className={`flex flex-col items-center justify-center text-center py-16 px-8 ${className}`}
      >
        <div className="mb-4 text-5xl">⚠️</div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--tg-theme-text-color)" }}
        >
          {localizedTitle}
        </h3>
        <p
          className="text-sm mb-6 max-w-xs leading-relaxed"
          style={{ color: "var(--tg-theme-hint-color)" }}
        >
          {localizedMessage}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="tg-btn max-w-xs">
            {localizedOnRetry}
          </button>
        )}
      </div>
    );
  };

export default ErrorState;
