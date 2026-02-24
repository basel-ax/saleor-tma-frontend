// ─── App Router ───────────────────────────────────────────────────────────────
// Sets up React Router v6 with all routes and integrates Telegram BackButton.

import { useEffect, type FC } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import RestaurantsPage from './pages/RestaurantsPage';
import CategoriesPage from './pages/CategoriesPage';
import DishesPage from './pages/DishesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// ─── Telegram BackButton sync ─────────────────────────────────────────────────
// Shows/hides the native Telegram back button based on the current route.
// The root route "/" hides the button; all other routes show it.

const TelegramBackButtonSync: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isRoot = location.pathname === '/';

    if (isRoot) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
    }

    const handleBack = () => {
      navigate(-1);
    };

    tg.BackButton.onClick(handleBack);

    return () => {
      tg.BackButton?.offClick(handleBack);
    };
  }, [location.pathname, navigate]);

  return null;
};

// ─── App ─────────────────────────────────────────────────────────────────────

const AppRoutes: FC = () => {
  return (
    <>
      <TelegramBackButtonSync />
      <Routes>
        {/* Main page — restaurant list */}
        <Route path="/" element={<RestaurantsPage />} />

        {/* Restaurant categories */}
        <Route path="/restaurants/:restaurantId" element={<CategoriesPage />} />

        {/* Dishes inside a category */}
        <Route
          path="/restaurants/:restaurantId/categories/:categoryId"
          element={<DishesPage />}
        />

        {/* Cart */}
        <Route path="/cart" element={<CartPage />} />

        {/* Checkout */}
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Order success */}
        <Route path="/order-success" element={<OrderSuccessPage />} />

        {/* Fallback — redirect to home */}
        <Route path="*" element={<RestaurantsPage />} />
      </Routes>
    </>
  );
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
