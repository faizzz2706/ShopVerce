# ShopVerse API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/verify-email` | Verify email with token |
| GET | `/auth/me` | Get current user |

## Products

| Method | Endpoint | Query Params |
|--------|----------|--------------|
| GET | `/products` | `page`, `limit`, `search`, `category`, `sort`, `minPrice`, `maxPrice`, `rating`, `featured`, `bestSeller`, `newArrival` |
| GET | `/products/:slug` | Product details + related |
| GET | `/products/featured` | Featured products |
| GET | `/products/best-sellers` | Best sellers |
| GET | `/products/new-arrivals` | New arrivals |
| GET | `/products/recently-viewed` | Auth required |

## Cart

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/cart` | `?couponCode=WELCOME10` |
| POST | `/cart/items` | `{ productId, quantity }` |
| PATCH | `/cart/items/:itemId` | `{ quantity, savedForLater }` |
| DELETE | `/cart/items/:itemId` | Remove item |
| POST | `/cart/coupon/validate` | `{ code }` |

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List user orders |
| GET | `/orders/:id` | Order details |
| POST | `/orders` | Create order |
| PATCH | `/orders/:id/cancel` | Cancel order |
| POST | `/orders/:id/return` | Request return |
| GET | `/orders/:id/invoice` | Get invoice data |

## Admin (ADMIN role required)

| Method | Endpoint |
|--------|----------|
| GET | `/admin/dashboard` |
| GET/POST/PATCH/DELETE | `/admin/products` |
| GET/PATCH | `/admin/orders` |
| GET/PATCH | `/admin/users` |
| GET/PATCH | `/admin/reviews` |
| GET/POST | `/admin/coupons` |
| GET/POST | `/admin/banners` |

## Response Format

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasMore": true
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```
