import { type FC } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SettingsProps {
  className?: string;
}

export const Settings: FC<SettingsProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 rounded-tg ${className}`} style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" 
          style={{ color: 'var(--tg-theme-hint-color)' }}>
        Settings
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
            Language
          </span>
          <LanguageSwitcher className="w-32" />
        </div>
      </div>
    </div>
  );
};