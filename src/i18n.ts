// ─── Translation File ────────────────────────────────────────────────────────────
// All translatable strings for the application
// Structure: { [locale]: { [key]: string } }

export const translations = {
  en: {
    // Common
    app_name: "Food Order",
    back: "Back",
    cart: "Cart",
    settings: "Settings",
    language: "Language",
    english: "English",
    russian: "Russian",
    save: "Save",
    cancel: "Cancel",
    location_detected: "Location detected",
    clear: "Clear",
    something_went_wrong: "Something went wrong",
    unexpected_error: "An unexpected error occurred. Please try again.",
    try_again: "Try Again",
    // Navigation
    back_to_restaurants: "Back to Restaurants",
    back_to_menu: "Back to Menu",
    your_order: "Your Order",
    // RestaurantsPage
    restaurants_title: "Restaurants",
    search_placeholder: "Search restaurants...",
    clear_search: "Clear Search",
    no_results_found: "No results found",
    no_results_description: (searchQuery: string) => 
      `No restaurants match "${searchQuery}". Try a different search term.`,
    no_restaurants_available: "No restaurants available",
    no_restaurants_description: "Check back later for new restaurants in your area.",
    refresh: "Refresh",
    // CategoriesPage
    categories_title: "Menu",
    categories_section_label: "Categories",
    no_categories_yet: "No categories yet",
    no_categories_description: "This restaurant hasn't added any menu categories yet. Check back later.",
    // DishesPage
    dishes_title: "Dishes",
    dishes_section_label: (count: number) => 
      `${count} ${count === 1 ? "dish" : "dishes"}`,
    no_dishes_available: "No dishes available",
    no_dishes_description: "This category doesn't have any dishes yet. Try another category.",
    // CartPage
    cart_title: "Cart",
    cart_empty_title: "Your cart is empty",
    cart_empty_description: "Add some dishes from a restaurant to get started.",
    browse_restaurants: "Browse Restaurants",
    ordering_from: "Ordering from",
    order_summary: "Order Summary",
    item: "item",
    items: "items",
    proceed_to_checkout: "Proceed to Checkout",
    // CheckoutPage
    checkout_title: "Checkout",
    delivery_location: "Delivery Location",
    delivery_location_required: "*",
    use_my_location: "Use my current location",
    use_my_location_hint: "Automatically detect your GPS coordinates",
    paste_google_maps_link: "Paste a Google Maps link",
    paste_google_maps_link_hint: "Share the location from the Google Maps app",
    or: "OR",
    comment: "Comment",
    comment_optional: "(optional)",
    comment_placeholder: "Any special instructions for your order…",
    order_failed: "Order failed",
    placing_order: "Placing Order…",
    place_order: "Place Order",
    please_provide_delivery_location: "Please provide a delivery location to continue",
    // OrderSuccessPage
    order_success_title: "Order Placed!",
    order_success_description: 
      "Your order has been received and is being prepared. We'll notify you when it's on its way.",
    order_id: "Order ID",
    whats_next: "What's next",
    preparing_food: "Restaurant is preparing your food",
    pickup: "A delivery rider will pick it up",
    delivery: "Your order will arrive at your location",
    order_more_food: "Order More Food",
    // Modals and Toasts
    cart_reset_confirm_title: "Reset Cart?",
    cart_reset_confirm_description: 
      "You already have items in your cart from another restaurant. Switching to a new restaurant will clear your cart.",
    cart_reset_confirm_cancel: "Keep Current Cart",
    cart_reset_confirm_continue: "Switch Restaurant",
  },
  ru: {
    // Common
    app_name: "Заказ еды",
    back: "Назад",
    cart: "Корзина",
    settings: "Настройки",
    language: "Язык",
    english: "Английский",
    russian: "Русский",
    save: "Сохранить",
    cancel: "Отмена",
    location_detected: "Местоположение определено",
    clear: "Очистить",
    something_went_wrong: "Что-то пошло не так",
    unexpected_error: "Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.",
    try_again: "Попробовать снова",
    // Navigation
    back_to_restaurants: "Назад к ресторанам",
    back_to_menu: "Назад в меню",
    your_order: "Ваш заказ",
    // RestaurantsPage
    restaurants_title: "Рестораны",
    search_placeholder: "Поиск ресторанов...",
    clear_search: "Очистить поиск",
    no_results_found: "Результаты не найдены",
    no_results_description: (searchQuery: string) => 
      `Рестораны, соответствующие "${searchQuery}", не найдены. Попробуйте другой запрос.`,
    no_restaurants_available: "Рестораны недоступны",
    no_restaurants_description: "Проверьте позже появление новых ресторанов в вашем районе.",
    refresh: "Обновить",
    // CategoriesPage
    categories_title: "Меню",
    categories_section_label: "Категории",
    no_categories_yet: "Категории пока отсутствуют",
    no_categories_description: 
      "В этом ресторане еще нет добавленных меню категорий. Проверьте позже.",
    // DishesPage
    dishes_title: "Блюда",
    dishes_section_label: (count: number) => 
      `${count} ${count === 1 ? "блюдо" : "блюда"}`,
    no_dishes_available: "Блюда недоступны",
    no_dishes_description: "В этой категории пока нет блюд. Попробуйте другую категорию.",
    // CartPage
    cart_title: "Корзина",
    cart_empty_title: "Ваша корзина пуста",
    cart_empty_description: "Добавьте блюда из ресторана, чтобы начать.",
    browse_restaurants: "Посмотреть рестораны",
    ordering_from: "Заказ из",
    order_summary: "Сводка заказа",
    item: "товар",
    items: "товаров",
    proceed_to_checkout: "Оформить заказ",
    // CheckoutPage
    checkout_title: "Оформление заказа",
    delivery_location: "Место доставки",
    delivery_location_required: "*",
    use_my_location: "Использовать мое местоположение",
    use_my_location_hint: "Автоматически определить ваши GPS координаты",
    paste_google_maps_link: "Вставьте ссылку на Google Maps",
    paste_google_maps_link_hint: "Поделитесь местоположением из приложения Google Maps",
    or: "ИЛИ",
    comment: "Комментарий",
    comment_optional: "(необязательно)",
    comment_placeholder: "Любые специальные инструкции для вашего заказа…",
    order_failed: "Заказ не удался",
    placing_order: "Оформление заказа…",
    place_order: "Оформить заказ",
    please_provide_delivery_location: "Пожалуйста, укажите место доставки для продолжения",
    // OrderSuccessPage
    order_success_title: "Заказ оформлен!",
    order_success_description: 
      "Ваш заказ принят и готовится. Мы уведомим вас, когда он будет в пути.",
    order_id: "Номер заказа",
    whats_next: "Что дальше",
    preparing_food: "Ресторан готовит вашу еду",
    pickup: "Курьер заберет заказ",
    delivery: "Ваш заказ будет доставлен по вашему адресу",
    order_more_food: "Заказать еще еду",
    // Modals and Toasts
    cart_reset_confirm_title: "Сбросить корзину?",
    cart_reset_confirm_description: 
      "В вашей корзине уже есть товары из другого ресторана. Переход к новому ресторану очистит вашу корзину.",
    cart_reset_confirm_cancel: "Оставить текущую корзину",
    cart_reset_confirm_continue: "Перейти к ресторану",
  }
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = keyof typeof translations['en'];