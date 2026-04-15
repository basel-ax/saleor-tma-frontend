// ─── Checkout Page ────────────────────────────────────────────────────────────
// Handles delivery location (GPS or Google Maps link), order comment, and
// submits the order to the backend.

import { useState, useCallback, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { createOrder } from "../api";
import type { DeliveryLocationInput, OrderItemInput, CartItem } from "../types";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLanguage } from "../context/LanguageContext";

type DeliveryMode = "geolocation" | "maps-link" | null;

const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const { t } = useLanguage();

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(null);
  const [location, setLocation] = useState<DeliveryLocationInput | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [comment, setComment] = useState("");

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapsUrlError, setMapsUrlError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Early return if no cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Checkout" showBack />
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add items to your cart before checking out."
          action={
            <button className="tg-btn" onClick={() => navigate("/")}>
              Browse Restaurants
            </button>
          }
        />
      </div>
    );
  }

  const currency = cart.items[0]?.currency ?? "USD";
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  // Extract coordinates from Google Maps URL
  const extractCoordinatesFromMapsUrl = (url: string): { latitude: number; longitude: number } | null => {
    try {
      // Handle common Google Maps URL formats
      const urlObj = new URL(url);
      
      // Pattern 1: https://maps.google.com/?q=latitude,longitude
      if (urlObj.hostname.includes('google.com') || urlObj.hostname.includes('maps.google.com')) {
        const query = urlObj.searchParams.get('q');
        if (query) {
          const coords = query.split(',').map(Number);
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            return { latitude: coords[0], longitude: coords[1] };
          }
        }
      }
      
      // Pattern 2: https://www.google.com/maps/search/latitude,longitude
      if (urlObj.pathname.startsWith('/maps/search/')) {
        const query = urlObj.pathname.substring(15); // Remove '/maps/search/'
        const coords = query.split(',').map(Number);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          return { latitude: coords[0], longitude: coords[1] };
        }
      }
      
      // Pattern 3: Handle @latitude,longitude in path
      if (urlObj.pathname.includes('@')) {
        const atIndex = urlObj.pathname.indexOf('@');
        const afterAt = urlObj.pathname.substring(atIndex + 1);
        const coordPart = afterAt.split('/')[0]; // Get part before first slash
        const coords = coordPart.split(',').map(Number);
        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          return { latitude: coords[0], longitude: coords[1] };
        }
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  // ─── Geolocation ─────────────────────────────────────────────────────────────
  const handleRequestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError(
        "Geolocation is not supported by your browser. Please use the Google Maps link option.",
      );
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: DeliveryLocationInput = {
          address: "Current Location", // Default address for geolocation
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setDeliveryMode("geolocation");
        setGeoLoading(false);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(
          "success",
        );
      },
      (err) => {
        setGeoLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError(
              "Location access was denied. Please allow location access or use the Google Maps link option.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError(
              "Location information is unavailable. Please try the Google Maps link option.",
            );
            break;
          case err.TIMEOUT:
            setGeoError(
              "Location request timed out. Please try again or use the Google Maps link option.",
            );
            break;
          default:
            setGeoError(
              "Failed to get your location. Please try the Google Maps link option.",
            );
        }
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, []);

  // ─── Maps link handler ────────────────────────────────────────────────────────
  const handleMapsUrlChange = (url: string) => {
    setGoogleMapsUrl(url);
    const coords = extractCoordinatesFromMapsUrl(url);
    if (url.trim() && !coords) {
      setMapsUrlError("Please enter a valid Google Maps link with coordinates.");
    } else {
      setMapsUrlError(null);
      if (coords) {
        setLocation({
          address: "Location from Google Maps", // Default address for maps link
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setDeliveryMode("maps-link");
      } else {
        setLocation(null);
        setDeliveryMode(null);
      }
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  // Simple boolean — no IIFE needed
  const isFormValid =
    deliveryMode === "geolocation"
      ? location !== null
      : deliveryMode === "maps-link"
        ? location !== null
        : false;

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (!cart || !isFormValid) return;

    setSubmitLoading(true);
    setSubmitError(null);

    // Prepare order items with notes (empty for now)
    const orderItems: OrderItemInput[] = cart.items.map((item) => ({
      dishId: item.dishId,
      quantity: item.quantity,
      notes: "", // Notes could be added as a UI field in the future
    }));

    const payload = {
      restaurantId: cart.restaurantId,
      items: orderItems,
      deliveryLocation: location!, // Non-null due to isFormValid check
      customerNote: comment.trim() || undefined,
    };

    console.log("checkout_submit", {
      restaurantId: cart.restaurantId,
      itemCount: cart.items.length,
    });

    try {
      const result = await createOrder(payload);
      console.log("checkout_success", { orderId: result.orderId });
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      clearCart();
      navigate("/order-success", {
        state: { orderId: result.orderId },
        replace: true,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.";
      setSubmitError(message);
      console.log("checkout_failure", { error: message });
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setSubmitLoading(false);
    }
  }, [
    cart,
    isFormValid,
    deliveryMode,
    location,
    comment,
    clearCart,
    navigate,
  ]);

  return (
    <div className="page">
       {/* Header */}
       <PageHeader title={t('checkout_title')} showBack />

      <div className="page-content">
         {/* ── Order summary ── */}
         <section className="mb-4">
           <h2
             className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
             style={{ color: "var(--tg-theme-hint-color)" }}
           >
             {t('order_summary')}
           </h2>
          <div
            className="rounded-tg overflow-hidden"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
            <div className="p-4 space-y-2">
              {/* Restaurant */}
              <div className="flex items-center gap-3 pb-2 border-b" style={{ borderColor: "var(--tg-theme-bg-color)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--tg-theme-bg-color)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                  </svg>
                </div>
                <span className="text-base font-semibold" style={{ color: "var(--tg-theme-text-color)" }}>
                  {cart.restaurantName}
                </span>
              </div>

              {/* Items */}
              {cart.items.map((item: CartItem) => (
                <div
                  key={item.dishId}
                  className="flex items-center justify-between gap-2"
                >
                  <span
                    className="text-sm flex-1 truncate"
                    style={{ color: "var(--tg-theme-hint-color)" }}
                  >
                    {item.name}
                    <span className="font-medium"> × {item.quantity}</span>
                  </span>
                  <span
                    className="text-sm font-medium flex-shrink-0"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Divider + total */}
              <div
                className="border-t pt-2"
                style={{ borderColor: "var(--tg-theme-bg-color)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-base font-bold"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

         {/* ── Delivery Location ── */}
         <section className="mb-4">
           <h2
             className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
             style={{ color: "var(--tg-theme-hint-color)" }}
           >
             {t('delivery_location')}{" "}
             <span style={{ color: "var(--tg-theme-destructive-text-color)" }}>
               {t('delivery_location_required')}
             </span>
           </h2>

          <div
            className="rounded-tg overflow-hidden"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
               {/* ── Option 1: Geolocation ── */}
               <div
                 className="p-4 border-b"
                 style={{ borderColor: "var(--tg-theme-bg-color)" }}
               >
<div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--tg-theme-bg-color)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                   <div className="flex-1 min-w-0">
                     <p
                       className="text-sm font-semibold"
                       style={{ color: "var(--tg-theme-text-color)" }}
                     >
                       {t('use_my_location')}
                     </p>
                     <p
                       className="text-xs mt-0.5"
                       style={{ color: "var(--tg-theme-hint-color)" }}
                     >
                       {t('use_my_location_hint')}
                     </p>
                   </div>
                 </div>

               {/* Geolocation status */}
               {deliveryMode === "geolocation" && location && (
                 <div
                   className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                   style={{ backgroundColor: "rgba(52, 199, 89, 0.12)" }}
                 >
                   <span className="text-sm">✅</span>
                   <div>
                     <p
                       className="text-xs font-semibold"
                       style={{ color: "#34c759" }}
                     >
                       {t('location_detected')}
                     </p>
                     <p
                       className="text-xs font-mono"
                       style={{ color: "var(--tg-theme-hint-color)" }}
                     >
                       {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                     </p>
                   </div>
                   <button
                     onClick={() => {
                       setLocation(null);
                       setDeliveryMode(null);
                     }}
                     className="ml-auto text-xs px-2 py-1 rounded-lg"
                     style={{
                       backgroundColor: "var(--tg-theme-secondary-bg-color)",
                       color: "var(--tg-theme-hint-color)",
                     }}
                   >
                     {t('clear')}
                   </button>
                 </div>
               )}

              {geoError && (
                <div
                  className="flex items-start gap-2 px-3 py-2 rounded-xl mb-3"
                  style={{ backgroundColor: "rgba(229, 57, 53, 0.1)" }}
                >
                  <span className="text-sm flex-shrink-0">⚠️</span>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: "var(--tg-theme-destructive-text-color)" }}
                  >
                    {geoError}
                  </p>
                </div>
              )}

              <button
                onClick={handleRequestGeolocation}
                disabled={
                  geoLoading ||
                  (deliveryMode === "geolocation" && location !== null)
                }
                className="tg-btn py-2.5 text-sm"
                style={
                  deliveryMode === "geolocation" && location
                    ? {
                        backgroundColor: "rgba(52, 199, 89, 0.15)",
                        color: "#34c759",
                      }
                    : {}
                }
              >
                {geoLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Detecting location…
                  </span>
                ) : deliveryMode === "geolocation" && location ? (
                  "✓ Location set"
                ) : (
                  "Detect My Location"
                )}
              </button>
            </div>

            {/* ── Divider label ── */}
            <div className="flex items-center gap-3 px-4 py-2">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--tg-theme-hint-color)" }}
              >
                OR
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
              />
            </div>

               {/* ── Option 2: Google Maps link ── */}
               <div className="p-4">
<div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--tg-theme-bg-color)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--tg-theme-text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                        <line x1="9" y1="3" x2="9" y2="18" />
                        <line x1="15" y1="6" x2="15" y2="21" />
                      </svg>
                    </div>
                   <div className="flex-1 min-w-0">
                     <p
                       className="text-sm font-semibold"
                       style={{ color: "var(--tg-theme-text-color)" }}
                     >
                       {t('paste_google_maps_link')}
                     </p>
                     <p
                       className="text-xs mt-0.5"
                       style={{ color: "var(--tg-theme-hint-color)" }}
                     >
                       {t('paste_google_maps_link_hint')}
                     </p>
                   </div>
                 </div>

               <div
                 className={`flex items-center gap-2 rounded-xl px-3 h-11 border transition-colors ${
                   mapsUrlError
                     ? "border-[var(--tg-theme-destructive-text-color)]"
                     : deliveryMode === "maps-link" &&
                       !mapsUrlError &&
                       googleMapsUrl
                     ? "border-[#34c759]"
                     : "border-transparent"
                 }`}
                 style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
               >
                 <svg
                   width="16"
                   height="16"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="var(--tg-theme-hint-color)"
                   strokeWidth="2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   className="flex-shrink-0"
                   aria-hidden="true"
                 >
                   <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                   <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                 </svg>
                 <input
                   type="url"
                   placeholder={t('paste_google_maps_link')}
                   value={googleMapsUrl}
                   onChange={(e) => handleMapsUrlChange(e.target.value)}
                   className="flex-1 bg-transparent text-sm outline-none"
                   style={{ color: "var(--tg-theme-text-color)" }}
                   aria-label="Google Maps URL"
                   aria-describedby={mapsUrlError ? "maps-url-error" : undefined}
                   aria-invalid={!!mapsUrlError}
                 />
                 {googleMapsUrl && (
                   <button
                     onClick={() => {
                       setGoogleMapsUrl("");
                       setMapsUrlError(null);
                       if (deliveryMode === "maps-link") setDeliveryMode(null);
                     }}
                     aria-label="Clear URL"
                     className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                     style={{
                       backgroundColor: "var(--tg-theme-hint-color)",
                       color: "var(--tg-theme-bg-color)",
                     }}
                   >
                     ×
                   </button>
                 )}
               </div>

              {mapsUrlError && (
                <p
                  id="maps-url-error"
                  className="text-xs mt-1.5 px-1"
                  style={{ color: "var(--tg-theme-destructive-text-color)" }}
                >
                  {mapsUrlError}
                </p>
              )}

              {deliveryMode === "maps-link" &&
                !mapsUrlError &&
                googleMapsUrl && (
                  <p
                    className="text-xs mt-1.5 px-1"
                    style={{ color: "#34c759" }}
                  >
                    ✓ Valid Google Maps link
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* ── Comment ── */}
        <section className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            Comment <span className="normal-case font-normal">(optional)</span>
          </h2>
          <div
            className="rounded-tg overflow-hidden"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
            <textarea
              placeholder="Any special instructions for your order…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full p-4 bg-transparent text-sm resize-none outline-none leading-relaxed"
              style={{ color: "var(--tg-theme-text-color)" }}
              aria-label="Order comment"
            />
            {comment.length > 0 && (
              <div
                className="px-4 pb-2 text-right text-xs"
                style={{ color: "var(--tg-theme-hint-color)" }}
              >
                {comment.length}/500
              </div>
            )}
          </div>
        </section>

        {/* ── Submit error ── */}
        {submitError && (
          <div
            className="mb-4 px-4 py-3 rounded-tg flex items-start gap-2 animate-fade-in"
            style={{ backgroundColor: "rgba(229, 57, 53, 0.1)" }}
          >
            <span className="flex-shrink-0">⚠️</span>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "var(--tg-theme-destructive-text-color)" }}
              >
                Order failed
              </p>
              <p
                className="text-xs leading-snug"
                style={{ color: "var(--tg-theme-hint-color)" }}
              >
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Bottom spacer for fixed bar */}
        <div className="h-4" />
      </div>

      {/* ── Place Order CTA ── */}
      <div className="bottom-bar">
        {!isFormValid && (
          <p
            className="text-xs text-center mb-2"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            Please provide a delivery location to continue
          </p>
        )}
        <button
          onClick={handlePlaceOrder}
          disabled={!isFormValid || submitLoading}
          className="tg-btn flex items-center justify-center gap-2"
          aria-label="Place order"
          aria-busy={submitLoading}
        >
          {submitLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Placing Order…
            </>
          ) : (
            <>Place Order — {formatPrice(totalPrice)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;