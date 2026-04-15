import { type FC } from 'react';
import { Settings } from './Settings';
import { useLanguage } from '../context/LanguageContext';

interface SettingsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SettingsBottomSheet: FC<SettingsBottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        style={{ animationDuration: '200ms' }}
      >
        {/* Modal Content */}
        <div 
          className={`${className} w-full max-w-full rounded-tg-lg border-t animate-slide-up`}
          style={{
            backgroundColor: 'var(--tg-theme-bg-color)',
            borderColor: 'var(--tg-theme-secondary-bg-color)',
            animationDuration: '300ms',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-1 rounded-full" style={{ backgroundColor: 'var(--tg-theme-hint-color)', opacity: 0.4 }} />
            </div>
            
            <div className="flex items-center justify-between">
              <h2 
                className="text-lg font-bold"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                {t('settings')}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
                aria-label="Close settings"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <Settings />
          </div>
          
          {/* Spacer for safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
      
      {/* Prevent scroll on body when modal is open */}
      <div className="fixed inset-0 pointer-events-none" />
    </>
  );
};