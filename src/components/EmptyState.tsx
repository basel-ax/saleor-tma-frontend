import type { FC, ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = "",
  }) => {
    const { t } = useLanguage();
    
    // Use translations if provided titles/messages match default values from our pages
    const localizedTitle = title;
    const localizedDescription = description;
    // Note: We don't translate the action as it's usually a button with its own translated text
    
    return (
      <div
        className={`flex flex-col items-center justify-center text-center py-16 px-8 ${className}`}
      >
        {icon && <div className="mb-4 text-5xl opacity-60">{icon}</div>}
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--tg-theme-text-color)" }}
        >
          {localizedTitle}
        </h3>
        {localizedDescription && (
          <p
            className="text-sm mb-6 max-w-xs leading-relaxed"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            {localizedDescription}
          </p>
        )}
        {action && <div className="w-full max-w-xs">{action}</div>}
      </div>
    );
  };

export default EmptyState;
