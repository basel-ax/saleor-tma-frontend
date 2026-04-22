import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CartBadge } from './CartBadge';

interface NatureFooterProps {
  onSettingsClick?: () => void;
  className?: string;
}

const SettingsIcon: FC<{ color: string }> = ({ color }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 5a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19 9.4a1.65 1.65 0 0 0-1.51 1H19.4a1.65 1.65 0 0 0 1-1.51z" />
  </svg>
);

export const NatureFooter: FC<NatureFooterProps> = ({ 
  onSettingsClick, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());

  const handleSettingsClick = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    onSettingsClick?.();
  };

  const handleAdminClick = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    navigate('/admin');
  };

  return (
    <footer className={`app-footer ${className}`}>
      <div className="footer-decoration" />
      
      <div className="footer-content">
<div className="footer-item" onClick={handleAdminClick}>
           <div className="footer-icon-btn">
             <svg
               width="20"
               height="20"
               viewBox="0 0 24 24"
               fill="none"
               stroke="var(--nature-pine)"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               aria-hidden="true"
             >
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
             </svg>
           </div>
           <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Admin</span>
         </div>

         <div className="footer-item" onClick={handleSettingsClick}>
           <div className="footer-icon-btn">
             <SettingsIcon color="var(--nature-pine)" />
           </div>
           <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Settings</span>
         </div>

        <div className="footer-item">
          <LanguageSwitcher className="w-full" />
        </div>

        {totalItems > 0 && (
          <div className="footer-item" onClick={() => navigate('/cart')}>
            <div className="footer-icon-btn">
              <CartBadge />
            </div>
            <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Cart</span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default NatureFooter;