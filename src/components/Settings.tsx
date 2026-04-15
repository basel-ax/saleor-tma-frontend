import { type FC } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

interface SettingsProps {
  className?: string;
}

export const Settings: FC<SettingsProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  
  return (
    <div className={`p-4 rounded-tg ${className}`} style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" 
          style={{ color: 'var(--tg-theme-hint-color)' }}>
        {t('settings')}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--tg-theme-text-color)' }}>
            {t('language')}
          </span>
          <LanguageSwitcher className="w-32" />
        </div>
      </div>
    </div>
  );
};