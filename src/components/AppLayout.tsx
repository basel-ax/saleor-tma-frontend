import type { FC } from 'react';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { NatureFooter } from './NatureFooter';
import { SettingsBottomSheet } from './SettingsBottomSheet';

interface AppLayoutProps {
  title: string;
  icon?: string;
  showBack?: boolean;
  onBack?: () => void;
  showCart?: boolean;
  children: ReactNode;
  settingsOpen?: boolean;
  onSettingsOpen?: () => void;
  onSettingsClose?: () => void;
}

export const AppLayout: FC<AppLayoutProps> = ({
  title,
  icon,
  showBack,
  onBack,
  showCart,
  children,
  settingsOpen,
  onSettingsOpen,
  onSettingsClose,
}) => {
  const handleSettingsClick = () => {
    onSettingsOpen?.();
  };

  return (
    <div className="page">
      <PageHeader
        title={title}
        icon={icon}
        showBack={showBack}
        onBack={onBack}
        showCart={showCart}
      />
      <div
        className="page-content"
        style={{
          paddingTop: 'calc(80px + env(safe-area-inset-top))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </div>
      <NatureFooter onSettingsClick={handleSettingsClick} />
      {settingsOpen && (
        <SettingsBottomSheet
          isOpen={settingsOpen}
          onClose={onSettingsClose ?? (() => {})}
        />
      )}
    </div>
  );
};

export default AppLayout;