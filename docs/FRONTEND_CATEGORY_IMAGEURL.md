# Frontend Integration Guide: Category `imageUrl` Field

## Overview

The `Category` type now includes an `imageUrl` field for displaying category images in your UI.

## GraphQL Query

Update your GraphQL query to include the `imageUrl` field:

```graphql
query RestaurantCategories($restaurantId: ID!) {
  restaurantCategories(restaurantId: $restaurantId) {
    id
    name
    imageUrl  # NEW FIELD
  }
}
```

## TypeScript Type

Update your TypeScript interface to include `imageUrl`:

```typescript
interface Category {
  id: string;
  restaurantId?: string;
  name: string;
  imageUrl?: string;  // NEW FIELD
}
```

## Response Example

```json
{
  "data": {
    "restaurantCategories": [
      {
        "id": "Q29sbGVjdGlvbjox",
        "name": "Pizzas",
        "imageUrl": "https://cdn.example.com/images/pizzas.jpg"
      },
      {
        "id": "Q29sbGVjdGlvbjoy",
        "name": "Nigiri",
        "imageUrl": "https://cdn.example.com/images/nigiri.jpg"
      }
    ]
  }
}
```

## Usage in React/TSX Component

```tsx
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="category-card">
      {category.imageUrl ? (
        <img 
          src={category.imageUrl} 
          alt={category.name}
          className="category-image"
        />
      ) : (
        <div className="category-placeholder">
          <span>{category.name.charAt(0)}</span>
        </div>
      )}
      <h3>{category.name}</h3>
    </div>
  );
}
```

## Important Notes

1. **`imageUrl` is optional** - Categories may not have images, so always handle the empty case
2. **Use placeholder images** - When `imageUrl` is empty or undefined, display a placeholder
3. **Image caching** - Consider caching category images locally to reduce network calls
4. **Fallback initials** - A common pattern is showing the first letter of the category name in a colored circle

## Backend Endpoint

- **URL**: `https://saleor-tma-backend.live-nature.net/graphql`
- **Required Header**: `X-Telegram-Init-Data` (Telegram authentication)

## Example API Call

```bash
curl -X POST https://saleor-tma-backend.live-nature.net/graphql \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <your-init-data>" \
  -d '{
    "query": "query { restaurantCategories(restaurantId: \"Q29sbGVjdGlvbjo0\") { id name imageUrl } }"
  }'
```
