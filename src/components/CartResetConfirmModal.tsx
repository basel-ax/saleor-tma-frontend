import type { FC } from "react";
import { useLanguage } from "../context/LanguageContext";

interface CartResetConfirmModalProps {
  newRestaurantName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CartResetConfirmModal: FC<CartResetConfirmModalProps> = ({
  newRestaurantName,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5"
          style={{
            backgroundColor: "var(--tg-theme-hint-color)",
            opacity: 0.4,
          }}
        />

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
            🛒
          </div>
        </div>

         {/* Title */}
         <h2
           className="text-xl font-bold text-center mb-3"
           style={{ color: "var(--tg-theme-text-color)" }}
         >
           {t('cart_reset_confirm_title')}
         </h2>

         {/* Message */}
         <p
           className="text-sm text-center leading-relaxed mb-6"
           style={{ color: "var(--tg-theme-hint-color)" }}
         >
           {t('cart_reset_confirm_description', newRestaurantName)}
         </p>

         {/* Actions */}
         <div className="flex flex-col gap-3">
           {/* Continue — destructive action */}
           <button onClick={onConfirm} className="tg-btn tg-btn-destructive">
             {t('cart_reset_confirm_continue')}
           </button>

           {/* Cancel */}
           <button onClick={onCancel} className="tg-btn tg-btn-secondary">
             {t('cart_reset_confirm_cancel')}
           </button>
         </div>
      </div>
    </div>
  );
};

export default CartResetConfirmModal;
