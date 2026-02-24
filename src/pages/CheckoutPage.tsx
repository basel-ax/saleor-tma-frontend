// ─── Checkout Page ────────────────────────────────────────────────────────────
// Handles delivery location (GPS or Google Maps link), order comment, and
// submits the order to the backend.

import { useState, useCallback, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { createOrder } from "../api";
import type { DeliveryLocation } from "../types";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

type DeliveryMode = "geolocation" | "maps-link" | null;

const GOOGLE_MAPS_URL_REGEX =
  /^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|goo\.gl\/maps|maps\.app\.goo\.gl)\S*/i;

function isValidGoogleMapsUrl(url: string): boolean {
  return GOOGLE_MAPS_URL_REGEX.test(url.trim());
}

export const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const cart = useCartStore((s) => s.cart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);

  // ─── Form state ─────────────────────────────────────────────────────────────
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(null);
  const [location, setLocation] = useState<DeliveryLocation | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [comment, setComment] = useState("");

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapsUrlError, setMapsUrlError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currency = cart?.items[0]?.currency ?? "USD";
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

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
        const loc: DeliveryLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
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
    if (url.trim() && !isValidGoogleMapsUrl(url)) {
      setMapsUrlError("Please enter a valid Google Maps link.");
    } else {
      setMapsUrlError(null);
    }
    if (url.trim()) {
      setDeliveryMode("maps-link");
    } else {
      setDeliveryMode(null);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  // Simple boolean — no IIFE needed
  const isFormValid =
    deliveryMode === "geolocation"
      ? location !== null
      : deliveryMode === "maps-link"
        ? isValidGoogleMapsUrl(googleMapsUrl)
        : false;

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (!cart || !isFormValid) return;

    setSubmitLoading(true);
    setSubmitError(null);

    const payload = {
      restaurantId: cart.restaurantId,
      items: cart.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
      })),
      deliveryLocation: deliveryMode === "geolocation" ? location : null,
      googleMapsUrl: deliveryMode === "maps-link" ? googleMapsUrl.trim() : null,
      comment: comment.trim() || null,
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
    googleMapsUrl,
    comment,
    clearCart,
    navigate,
  ]);

  // ─── Guard: no cart ───────────────────────────────────────────────────────────
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

  return (
    <div className="page">
      {/* Header */}
      <PageHeader title="Checkout" showBack />

      <div className="page-content">
        {/* ── Order summary ── */}
        <section className="mb-4">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
            style={{ color: "var(--tg-theme-hint-color)" }}
          >
            Your Order
          </h2>
          <div
            className="rounded-tg overflow-hidden"
            style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
          >
            <div className="p-4 space-y-2">
              {/* Restaurant */}
              <div
                className="flex items-center gap-2 pb-2 border-b"
                style={{ borderColor: "var(--tg-theme-bg-color)" }}
              >
                <span className="text-base">🏪</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--tg-theme-text-color)" }}
                >
                  {cart.restaurantName}
                </span>
              </div>

              {/* Items */}
              {cart.items.map((item) => (
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
            Delivery Location{" "}
            <span style={{ color: "var(--tg-theme-destructive-text-color)" }}>
              *
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
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
                >
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    Use my current location
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--tg-theme-hint-color)" }}
                  >
                    Automatically detect your GPS coordinates
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
                      Location detected
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "var(--tg-theme-hint-color)" }}
                    >
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
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
                    Clear
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
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: "var(--tg-theme-bg-color)" }}
                >
                  🗺️
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--tg-theme-text-color)" }}
                  >
                    Paste a Google Maps link
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--tg-theme-hint-color)" }}
                  >
                    Share the location from the Google Maps app
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
                  placeholder="https://maps.google.com/?q=..."
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
