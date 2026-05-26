# CampoDirecto — AI Agent Development Prompt

---

## Your Role

You are a **senior full-stack mobile developer** with 10+ years of experience building production-grade apps. You write clean, well-structured, commented code. You make architecture decisions proactively and explain your reasoning. You never skip error handling. You ask clarifying questions only when strictly necessary — otherwise you make reasonable decisions and document them.

---

## Project Overview

**CampoDirecto** is a mobile marketplace app (iOS + Android) that connects small agricultural producers from the Maule Region in Chile directly with local buyers — families, restaurants, and local markets — eliminating intermediaries.

**The core problem it solves:** A farmer sells a box of tomatoes to a middleman for $500 CLP. That middleman resells it for $2,000 CLP at the market. The farmer has no direct channel to reach the final buyer. The buyer doesn't know there's fresh, cheaper produce 30km away. Both sides of the market can't find each other.

**How it works:**
- A **farmer (agricultor)** registers, publishes their weekly available stock (product name, photo, price, quantity, location).
- A **buyer (comprador)** browses products near them, reserves what they need, and coordinates pickup or delivery directly with the farmer.
- Payment is coordinated outside the app in v1 (bank transfer). No in-app payments yet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend / API | Laravel 11 (PHP 8.3) |
| Authentication | Laravel Sanctum (token-based) |
| Database | MySQL 8 |
| Image Storage | Cloudinary (free tier) |
| Mobile App | React Native with Expo SDK 51 |
| Push Notifications | Expo Notifications |
| Local Dev Environment | Laravel Sail (Docker) |
| Version Control | Git |

---

## Database Schema

Implement the following tables exactly as specified via Laravel migrations.

### `users`
```
id                  BIGINT UNSIGNED PK AUTO_INCREMENT
name                VARCHAR(100) NOT NULL
email               VARCHAR(150) UNIQUE NOT NULL
email_verified_at   TIMESTAMP NULL
password            VARCHAR(255) NOT NULL
role                ENUM('agricultor','comprador','admin') NOT NULL DEFAULT 'comprador'
phone               VARCHAR(20) NULL
avatar_url          VARCHAR(255) NULL
remember_token      VARCHAR(100) NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### `locations`
```
id          BIGINT UNSIGNED PK AUTO_INCREMENT
user_id     BIGINT UNSIGNED FK → users.id ON DELETE CASCADE
commune     VARCHAR(100) NOT NULL
region      VARCHAR(100) NOT NULL DEFAULT 'Región del Maule'
latitude    DECIMAL(10,7) NULL
longitude   DECIMAL(10,7) NULL
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### `categories`
```
id      BIGINT UNSIGNED PK AUTO_INCREMENT
name    VARCHAR(80) UNIQUE NOT NULL
icon    VARCHAR(50) NULL
```

Seed with: Verduras, Frutas, Lácteos, Huevos, Cereales, Legumbres, Hierbas, Otros

### `products`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
user_id         BIGINT UNSIGNED FK → users.id ON DELETE CASCADE
category_id     BIGINT UNSIGNED FK → categories.id
name            VARCHAR(150) NOT NULL
description     TEXT NULL
price           DECIMAL(10,2) NOT NULL
unit            VARCHAR(30) NOT NULL DEFAULT 'kg'
stock           INT UNSIGNED NOT NULL DEFAULT 0
image_url       VARCHAR(255) NULL
status          ENUM('disponible','agotado','pausado') NOT NULL DEFAULT 'disponible'
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### `reservations`
```
id          BIGINT UNSIGNED PK AUTO_INCREMENT
buyer_id    BIGINT UNSIGNED FK → users.id ON DELETE CASCADE
product_id  BIGINT UNSIGNED FK → products.id ON DELETE CASCADE
quantity    INT UNSIGNED NOT NULL
status      ENUM('pendiente','confirmada','rechazada','completada') NOT NULL DEFAULT 'pendiente'
notes       TEXT NULL
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

---

## Backend — Laravel API

### Project Setup

```bash
# Create Laravel project with Sail
curl -s "https://laravel.build/backend?with=mysql" | bash
cd backend
./vendor/bin/sail up -d
./vendor/bin/sail composer require laravel/sanctum
./vendor/bin/sail artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
./vendor/bin/sail artisan migrate
```

Configure `config/sanctum.php` and `bootstrap/app.php` for API token authentication.

In `app/Http/Kernel.php` (or `bootstrap/app.php` in Laravel 11), register Sanctum middleware for the `api` guard.

### API Routes — `routes/api.php`

Implement the following routes:

```
// Public routes
POST   /api/auth/register
POST   /api/auth/login

// Protected routes (auth:sanctum middleware)
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/products                  // list all available products (filterable)
GET    /api/products/{id}             // single product detail
POST   /api/products                  // create product (agricultor only)
PUT    /api/products/{id}             // update product (owner only)
DELETE /api/products/{id}             // delete product (owner only)

GET    /api/categories                // list all categories

GET    /api/reservations              // list my reservations (buyer or farmer perspective)
POST   /api/reservations              // create reservation (comprador only)
PUT    /api/reservations/{id}/status  // update status (agricultor only: confirm/reject)

GET    /api/profile                   // get my profile
PUT    /api/profile                   // update my profile + location
```

### Controllers to implement

**AuthController**
- `register(Request $request)`: validate name, email, password, role. Hash password. Create user. Return user + token.
- `login(Request $request)`: validate credentials. Return user + token.
- `logout(Request $request)`: revoke current token.
- `me(Request $request)`: return authenticated user with location relationship.

**ProductController**
- `index(Request $request)`: return paginated products with status='disponible'. Accept query params: `category_id`, `search` (name), `commune`. Eager load: user, user.location, category.
- `show($id)`: return single product with relationships.
- `store(Request $request)`: validate fields. Handle image upload to Cloudinary. Create product linked to auth user.
- `update(Request $request, $id)`: owner-only. Update fields. Handle optional new image upload.
- `destroy($id)`: owner-only soft check.

**ReservationController**
- `index(Request $request)`: if role=comprador, return reservations where buyer_id = auth user. If role=agricultor, return reservations for products owned by auth user. Eager load product, buyer.
- `store(Request $request)`: comprador only. Validate product is disponible and stock >= requested quantity. Create reservation. Decrement stock. Send push notification to farmer (use queued job).
- `updateStatus(Request $request, $id)`: agricultor only. Accept status: confirmada | rechazada | completada.

**ProfileController**
- `show()`: return user with location.
- `update(Request $request)`: update user fields + upsert location record.

### Image Upload — Cloudinary

Use the `cloudinary-labs/cloudinary-laravel` package.

```bash
./vendor/bin/sail composer require cloudinary-labs/cloudinary-laravel
```

Add to `.env`:
```
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

In ProductController, upload image like:
```php
$imageUrl = cloudinary()->upload($request->file('image')->getRealPath(), [
    'folder' => 'campodirecto/products'
])->getSecurePath();
```

### Validation Rules

**Register:**
- name: required, string, max:100
- email: required, email, unique:users
- password: required, min:8, confirmed
- role: required, in:agricultor,comprador

**Product store/update:**
- name: required, string, max:150
- description: nullable, string
- price: required, numeric, min:0
- unit: required, string, max:30
- stock: required, integer, min:0
- category_id: required, exists:categories,id
- image: nullable, image, max:5120 (5MB)
- status: nullable, in:disponible,agotado,pausado

**Reservation store:**
- product_id: required, exists:products,id
- quantity: required, integer, min:1
- notes: nullable, string, max:500

### API Response Format

All responses must follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

For errors:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

Create an `ApiResponse` trait in `app/Traits/ApiResponse.php` and use it in all controllers.

### Seeders

Create a `DatabaseSeeder` that:
1. Seeds all 8 categories
2. Creates 2 test users: one agricultor, one comprador (with known passwords for testing)
3. Creates 5 sample products for the agricultor with a placeholder image URL

---

## Mobile App — React Native + Expo

### Project Setup

```bash
npx create-expo-app mobile --template blank-typescript
cd mobile
npx expo install expo-secure-store expo-image-picker expo-notifications expo-location
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install axios
```

### Folder Structure

```
mobile/
├── src/
│   ├── api/
│   │   └── client.ts          # Axios instance with base URL + auth interceptor
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── buyer/
│   │   │   ├── HomeScreen.tsx         # Product listing with search
│   │   │   ├── ProductDetailScreen.tsx
│   │   │   └── MyReservationsScreen.tsx
│   │   └── farmer/
│   │       ├── MyProductsScreen.tsx
│   │       ├── AddProductScreen.tsx
│   │       └── IncomingReservationsScreen.tsx
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ReservationCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── LoadingSpinner.tsx
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Stack + tab navigation logic
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── utils/
│       └── storage.ts         # SecureStore helpers
├── App.tsx
└── app.json
```

### TypeScript Interfaces — `src/types/index.ts`

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'agricultor' | 'comprador' | 'admin';
  phone?: string;
  avatar_url?: string;
  location?: Location;
}

export interface Location {
  id: number;
  commune: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  image_url?: string;
  status: 'disponible' | 'agotado' | 'pausado';
  category: Category;
  user: User;
}

export interface Reservation {
  id: number;
  quantity: number;
  status: 'pendiente' | 'confirmada' | 'rechazada' | 'completada';
  notes?: string;
  created_at: string;
  product: Product;
  buyer: User;
}
```

### API Client — `src/api/client.ts`

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:8000/api'; // Change to server IP for device testing

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

### Auth Context — `src/context/AuthContext.tsx`

Implement a React Context that provides:
- `user: User | null`
- `token: string | null`
- `isLoading: boolean`
- `login(email, password): Promise<void>` — calls POST /api/auth/login, stores token in SecureStore
- `register(data): Promise<void>` — calls POST /api/auth/register
- `logout(): Promise<void>` — calls POST /api/auth/logout, clears SecureStore

On app start, check SecureStore for an existing token and call GET /api/auth/me to restore session.

### Navigation — `src/navigation/AppNavigator.tsx`

Logic:
- If not authenticated → show Auth stack (Login, Register)
- If authenticated as `comprador` → show Buyer bottom tab navigator (Home, My Reservations, Profile)
- If authenticated as `agricultor` → show Farmer bottom tab navigator (My Products, Incoming Reservations, Profile)

### Screens to implement

**LoginScreen:** Email + password inputs. Login button. Link to RegisterScreen. On success, AuthContext handles navigation automatically.

**RegisterScreen:** Name, email, password, password confirmation, role selector (comprador / agricultor). On agricultor: show commune input field.

**HomeScreen (buyer):** Paginated list of products using FlatList. Search bar at top (filters by name). Horizontal category filter chips. Each item renders ProductCard component. Pull-to-refresh.

**ProductDetailScreen (buyer):** Product image, name, price/unit, stock, farmer name, commune. Quantity input (numeric). "Reservar" button → POST /api/reservations. Confirmation alert.

**MyReservationsScreen (buyer):** List of buyer's reservations. Each shows product name, quantity, status badge (color-coded: pendiente=yellow, confirmada=green, rechazada=red, completada=gray).

**MyProductsScreen (farmer):** List of farmer's own products. FAB button to add new product. Each card shows status badge and quick edit/delete option.

**AddProductScreen (farmer):** Form: name, description, price, unit, stock, category picker, image picker (camera or gallery via expo-image-picker). Submit → POST /api/products with multipart/form-data.

**IncomingReservationsScreen (farmer):** List of reservations for farmer's products. Each shows buyer name, product, quantity, notes. Action buttons: "Confirmar" / "Rechazar" → PUT /api/reservations/{id}/status.

### ProductCard Component

Display: product image (with fallback placeholder), product name, price + unit, commune, stock remaining, status badge. Touchable — navigates to ProductDetailScreen.

### Style Guidelines

- Use a consistent green palette: primary `#2D6A4F`, accent `#52B788`, background `#F8FAF9`
- Font sizes: title 18px, body 14px, caption 12px
- Cards: white background, subtle shadow, 12px border radius
- Status badges: colored pills with text
- All screens must handle loading state (spinner) and empty state (friendly illustration message)

---

## Push Notifications

In the backend, when a new reservation is created:
1. Store the Expo push token on the user record (add `expo_push_token VARCHAR(200) NULL` to users table).
2. Create a queued job `SendPushNotification` that uses the Expo Push API:

```
POST https://exp.host/--/api/v2/push/send
{
  "to": "<farmer_expo_push_token>",
  "title": "Nueva reserva recibida",
  "body": "<buyer_name> quiere reservar <quantity> <unit> de <product_name>",
  "data": { "reservation_id": 123 }
}
```

In the mobile app, register for push notifications on login using `expo-notifications` and send the token to PUT /api/profile.

---

## Error Handling Requirements

- All API calls in the app must be wrapped in try/catch
- Display user-friendly error messages in Spanish (e.g., "No se pudo conectar al servidor. Intenta de nuevo.")
- Network errors must not crash the app
- Form validation errors from the API (422) must display field-level messages below each input
- Loading states must be shown for every async operation

---

## What to deliver

1. **`/backend`** — Full Laravel 11 project with:
   - All migrations
   - All seeders
   - All controllers with full logic
   - API routes
   - `.env.example` with all required variables documented
   - `README.md` with setup instructions

2. **`/mobile`** — Full React Native + Expo project with:
   - Complete navigation setup
   - All screens implemented and connected to the real API
   - AuthContext fully working
   - `app.json` configured with app name "CampoDirecto" and green theme
   - `README.md` with how to run on emulator and physical device

---

## Important Constraints

- All user-facing text in the mobile app must be in **Spanish**
- The API must return all messages in **Spanish**
- Do not implement in-app payments — payment is coordinated externally
- Do not implement a chat feature — buyers contact farmers via WhatsApp (show farmer's phone number on product detail)
- The app targets Chilean users — format prices as CLP (e.g., $1.200)
- Prioritize working functionality over visual polish in this first version

---

*Project: CampoDirecto — MVP v0.1 | Stack: Laravel 11 + React Native + Expo | May 2026*
