# CampoDirecto Backend Setup Guide

## Overview

This is a Laravel 11 backend API for CampoDirecto, a Chilean agricultural marketplace connecting farmers (agricultores) with buyers (compradores).

## Architecture

- **Role-based access**: Two main user types (agricultor, comprador)
- **API Authentication**: Laravel Sanctum
- **Image Storage**: Cloudinary
- **Database**: MySQL 8

## Installation Steps

### Prerequisites

- Docker Engine >= 20.10
- Docker Compose >= 2.0
- PHP >= 8.3 (for development)
- Composer >= 2.0 (for development)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Update Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
APP_NAME=CampoDirecto
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=America/Santiago
APP_LOCALE=es
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=campodirecto
DB_USERNAME=sail
DB_PASSWORD=password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Run Docker Containers

```bash
./vendor/bin/sail up -d
```

### Step 4: Install Dependencies

```bash
./vendor/bin/sail composer install
```

### Step 5: Generate Application Key

```bash
./vendor/bin/sail artisan key:generate
```

### Step 6: Run Migrations

```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

This will:
- Create all database tables
- Seed 8 categories (Verduras, Frutas, Lácteos, Huevos, Cereales, Legumbres, Hierbas, Otros)
- Create 1 agricultor user (Juan Pérez)
- Create 1 comprador user (María González)
- Create 5 sample products
- Create 1 sample reservation

### Step 7: Start the Server

```bash
./vendor/bin/sail artisan serve
```

The API will be available at: `http://localhost:8000`

## Test Credentials

### Agricultor Account

- **Email**: `juan@agricultor.cl`
- **Password**: `password`

### Comprador Account

- **Email**: `maria@comprador.cl`
- **Password**: `password`

## API Authentication Flow

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro",
    "email": "pedro@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "comprador"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@agricultor.cl",
    "password": "password"
  }'
```

Response includes `token` for subsequent requests:

```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "1|abcdef123456..."
  },
  "message": "Inicio de sesión exitoso"
}
```

### Protected Requests

Include the token in Authorization header:

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer 1|abcdef123456..."
```

## API Endpoints Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List all categories | Yes |

### Products

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/products` | List products (filterable) | Yes | All |
| POST | `/api/products` | Create product | Yes | Agricultor |
| GET | `/api/products/{id}` | Get product details | No | All |
| PUT | `/api/products/{id}` | Update product | Yes | Owner |
| DELETE | `/api/products/{id}` | Delete product | Yes | Owner |

**Query Parameters for GET /api/products:**
- `category_id` - Filter by category
- `search` - Search by product name
- `commune` - Filter by commune

### Reservations

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/reservations` | List reservations | Yes | All |
| POST | `/api/reservations` | Create reservation | Yes | Comprador |
| PUT | `/api/reservations/{id}/status` | Update status | Yes | Agricultor |

### Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile` | Get profile | Yes |
| PUT | `/api/profile` | Update profile | Yes |

## Database Entities

### User

```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@agricultor.cl",
  "role": "agricultor",
  "phone": "+56912345678",
  "avatar_url": null,
  "location": {
    "id": 1,
    "commune": "Talca",
    "region": "Región del Maule",
    "latitude": -33.431793,
    "longitude": -70.652166
  }
}
```

### Product

```json
{
  "id": 1,
  "name": "Tomates frescos",
  "description": "Tomates cultivados orgánicamente...",
  "price": 1500.00,
  "unit": "kg",
  "stock": 50,
  "status": "disponible",
  "image_url": "https://cloudinary_url...",
  "category": {...},
  "user": {...}
}
```

### Reservation

```json
{
  "id": 1,
  "quantity": 2,
  "status": "pendiente",
  "notes": "Entrega en Talca el próximo martes",
  "product": {...},
  "buyer": {...}
}
```

## Cloudinary Configuration

### Sign Up

1. Create a free Cloudinary account at https://cloudinary.com
2. Go to Dashboard → Credentials
3. Copy your credentials to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Upload Example

Images are automatically uploaded to `campodirecto/products` folder.

### Image Transformations

Images are automatically optimized with:
- Format auto-detection
- Quality auto-optimization
- Responsive sizing

## Running Tests

```bash
./vendor/bin/sail phpunit
```

## Troubleshooting

### Docker not running

```bash
# Start Docker daemon
sudo systemctl start docker
```

### Permissions issues

```bash
# Fix permissions
chmod -R 775 storage bootstrap/cache
```

### Migration errors

```bash
# Refresh database
./vendor/bin/sail artisan migrate:fresh --seed
```

### Cloudinary upload errors

1. Verify Cloudinary credentials in `.env`
2. Check Cloudinary dashboard for API key status
3. Ensure Cloudinary account is active

## Development

### Clear Cache

```bash
./vendor/bin/sail artisan cache:clear
./vendor/bin/sail artisan config:clear
./vendor/bin/sail artisan route:clear
./vendor/bin/sail artisan view:clear
```

### List Routes

```bash
./vendor/bin/sail artisan route:list
```

### Database Tinker

```bash
./vendor/bin/sail artisan tinker
```

## Production Deployment

### Environment

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your_production_key
```

### Optimize

```bash
./vendor/bin/sail artisan config:cache
./vendor/bin/sail artisan route:cache
./vendor/bin/sail artisan view:cache
```

## License

MIT License - See LICENSE file for details
