import { type FC, useState } from 'react';
import { Settings } from './Settings';

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
  const [hovered, setHovered] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className={`${className} w-full max-w-full rounded-tg-lg border-t border-t-[var(--tg-theme-bg-color)]`}
          style={{
            backgroundColor: 'var(--tg-theme-bg-color)',
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease-out',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="p-4 space-y-6">
            {/* Handle */}
            <div className="flex justify-center">
              <div className="w-12 h-0.5 rounded bg-tg-hint-color/50" />
            </div>
            
            {/* Settings Content */}
            <Settings className="mb-6" />
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