import type { FC } from "react";

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
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-8 ${className}`}
    >
      <div className="mb-4 text-5xl">⚠️</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--tg-theme-text-color)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm mb-6 max-w-xs leading-relaxed"
        style={{ color: "var(--tg-theme-hint-color)" }}
      >
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="tg-btn max-w-xs">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
