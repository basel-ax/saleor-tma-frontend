import { type FC } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { locale, setLocale, t } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as 'en' | 'ru');
  };

  return (
    <select
      value={locale}
      onChange={handleLanguageChange}
      className={`flex items-center gap-2 rounded-tg border px-2 py-1 text-sm ${className}`}
      style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        color: 'var(--tg-theme-text-color)',
      }}
      aria-label="Language switcher"
    >
      <option value="en">{t('english')}</option>
      <option value="ru">{t('russian')}</option>
    </select>
  );
};