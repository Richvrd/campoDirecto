# CampoDirecto — AGENTS.md

## Commands

```bash
# Backend (Laravel)
cd backend && ./vendor/bin/sail up -d
./vendor/bin/sail composer install
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail artisan serve

# Mobile (React Native)
cd mobile && npm install
npx expo start
```

## Directories

- `/backend` — Laravel 11 API (PHP 8.3, MySQL, Cloudinary)
- `/mobile` — React Native + Expo SDK 51 (TypeScript)

## Tech Constraints

- Backend: Laravel Sanctum auth, MySQL 8, Cloudinary images
- Mobile: Expo notifications, SecureStore for tokens
- All user-facing text in **Spanish**
- Price format: CLP (e.g., $1.200)

## API Base URL

Mobile: `http://localhost:8000/api` (change to server IP for physical device testing)

## Database Schema

Key tables: `users` (role enum), `products`, `reservations`, `categories`, `locations`

## Role-Based Navigation

- `comprador`: Home → My Reservations → Profile tabs
- `agricultor`: My Products → Incoming Reservations → Profile tabs

## Push Notifications

When reservation created → queued job sends Expo push notification to farmer

## Style Guide

Primary green: `#2D6A4F`, Accent: `#52B788`, Background: `#F8FAF9`
