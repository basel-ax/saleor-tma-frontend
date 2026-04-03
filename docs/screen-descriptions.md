# Saleor TMA Frontend - Screen Descriptions

This document describes each screen in the application, the functions called, and the events that trigger them.

## Navigation
- [Restaurants](#restaurants)
- [Categories](#categories)
- [Dishes](#dishes)
- [Cart](#cart)
- [Checkout](#checkout)
- [Order Success](#order-success)

---

## Restaurants Page

Main page showing all available restaurants. Supports search/filter and handles the single-restaurant cart switch confirmation flow.

### Functions and Events

#### Data Fetching
- **useQuery** with queryKey `['restaurants']` and queryFn `fetchRestaurants`
- *Event:* On component mount and when refetch is called (via pull-to-refresh or manual retry)

#### handleSelectRestaurant
- Called when a restaurant card is clicked.
- *Event:* `onClick` on RestaurantCard component
- Logic: Checks if the selected restaurant is different from the current cart's restaurant. If so, shows a confirmation modal; otherwise, navigates to the categories page.

#### handleConfirmSwitch
- Called when the user confirms switching to a new restaurant (after cart reset confirmation).
- *Event:* `onClick` on the confirm button in CartResetConfirmModal
- Logic: Clears the cart, navigates to the selected restaurant's categories page, and resets pendingRestaurant state.

#### handleCancelSwitch
- Called when the user cancels the restaurant switch.
- *Event:* `onClick` on the cancel button in CartResetConfirmModal
- Logic: Resets pendingRestaurant state to null.

#### setSearchQuery
- Updates the search query state.
- *Event:* `onChange` on the search input

#### clear search (button)
- Called when the clear search button is clicked.
- *Event:* `onClick` on the clear search button (visible when searchQuery is not empty)
- Logic: Sets searchQuery to empty string.

#### refetch (from useQuery)
- Called when the refresh button is clicked in the empty state (when no restaurants are available).
- *Event:* `onClick` on the refresh button in EmptyState

---

## Categories Page

Lists all menu categories for a given restaurant.

### Functions and Events

#### useQuery for restaurants
- Fetches all restaurants to get the current restaurant's name for the header.
- *Event:* On component mount (with staleTime set to 5 minutes)

#### useQuery for categories
- Fetches categories for the given restaurantId.
- *Event:* On component mount and when restaurantId changes

#### Category button click
- Navigates to the dishes page for the selected category.
- *Event:* `onClick` on each category button
- Logic: Uses navigate to go to `/restaurants/:restaurantId/categories/:categoryId`

---

## Dishes Page

Shows all dishes in a given category for a restaurant. Allows adding items to the cart.

### Functions and Events

#### useQuery for restaurants
- Fetches all restaurants to get the current restaurant's name and currency.
- *Event:* On component mount (with staleTime 5 minutes)

#### useQuery for categories
- Fetches categories for the restaurant to get the current category's name and description.
- *Event:* On component mount (with staleTime 5 minutes)

#### useQuery for dishes
- Fetches dishes for the given restaurantId and categoryId.
- *Event:* On component mount and when restaurantId or categoryId changes

#### handleAddDish
- Called when the user adds a dish to the cart.
- *Event:* `onAdd` prop of DishCard (triggered by the "+" button in DishCard)
- Logic: Calls addItem from cartStore with the dish and restaurant name, then triggers light haptic feedback.

#### handleIncrement
- Called when the user increments the quantity of a dish in the cart.
- *Event:* `onIncrement` prop of DishCard (stepper's "+" button)
- Logic: Calls incrementItem from cartStore and triggers selection changed haptic feedback.

#### handleDecrement
- Called when the user decrements the quantity of a dish in the cart.
- *Event:* `onDecrement` prop of DishCard (stepper's "-" button)
- Logic: Calls decrementItem from cartStore and triggers selection changed haptic feedback.

#### Floating cart bar
- Shown when the cart has items from the current restaurant.
- *Event:* `onClick` navigates to `/cart`
- Logic: Shows a button at the bottom that allows the user to view the cart.

---

## Cart Page

Displays the items in the cart, allows modifying quantities, removing items, and proceeding to checkout.

### Functions and Events

#### handleIncrement (in cart)
- Called when the user increments the quantity of an item in the cart.
- *Event:* `onClick` on the "+" button of QuantityStepper for a cart item
- Logic: Calls incrementItem from cartStore and triggers selection changed haptic feedback.

#### handleDecrement (in cart)
- Called when the user decrements the quantity of an item in the cart.
- *Event:* `onClick` on the "-" button of QuantityStepper for a cart item
- Logic: Calls decrementItem from cartStore and triggers selection changed haptic feedback.

#### handleRemove
- Called when the user removes an item from the cart.
- *Event:* `onClick` on the remove button (trash icon) for a cart item
- Logic: Calls removeItem from cartStore and triggers warning haptic feedback.

#### Checkout button
- Called when the user proceeds to checkout.
- *Event:* `onClick` on the checkout button in the bottom bar
- Logic: Navigates to `/checkout`

---

## Checkout Page

Handles delivery location (GPS or Google Maps link), order comment, and submits the order to the backend.

### Functions and Events

#### handleRequestGeolocation
- Called when the user clicks "Detect My Location".
- *Event:* `onClick` on the geolocation button
- Logic: Requests the user's current position via navigator.geolocation. On success, sets location and deliveryMode to 'geolocation'. On error, sets an appropriate error message.

#### handleMapsUrlChange
- Called when the user pastes or changes the Google Maps URL.
- *Event:* `onChange` on the URL input
- Logic: Extracts coordinates from the URL. If valid, sets location and deliveryMode to 'maps-link'. If invalid, shows an error.

#### handlePlaceOrder
- Called when the user submits the order.
- *Event:* `onClick` on the "Place Order" button (when form is valid and not submitting)
- Logic: Validates the form, prepares the order payload, calls createOrder from api, then on success clears the cart and navigates to order success page with the orderId. On error, shows an error message.

#### Clear location (geolocation)
- Called when the user clicks "Clear" after setting location via geolocation.
- *Event:* `onClick` on the clear button in the geolocation success state
- Logic: Resets location and deliveryMode to null.

#### Clear Google Maps URL
- Called when the user clicks the "×" button in the Google Maps URL input.
- *Event:* `onClick` on the clear button
- Logic: Clears the Google Maps URL, resets error, and if in maps-link mode, resets deliveryMode and location.

---

## Order Success Page

Shows a success message after an order is placed and allows the user to return to the restaurants page.

### Functions and Events

#### useEffect (redirect if no orderId)
- Redirects to the home page if the page is accessed without an orderId in the state.
- *Event:* On component mount and when orderId changes
- Logic: Sets a timeout to navigate to "/" after 3 seconds if orderId is falsy.

#### handleBackToRestaurants
- Called when the user clicks "Order More Food".
- *Event:* `onClick` on the button
- Logic: Navigates to the home page ("/") with replace: true.
