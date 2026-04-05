# LifeOS (Frontend + NestJS Backend)

## Stack
- Frontend: React + Vite + Tailwind
- Backend: NestJS + Swagger + JWT Auth + Prisma ORM
- Data: PostgreSQL (`DATABASE_URL`)

## 1) Frontend ishga tushirish
```bash
npm install
npm run dev
```
Frontend default: `http://localhost:5173`

## 2) Backend ishga tushirish (NestJS)
```bash
npm run backend:install
cp backend/.env.example backend/.env
npm run backend:prisma:migrate
npm run backend:dev
```
Backend default: `http://localhost:4000`

PostgreSQL default env:
- user: `postgres`
- password: `codenur`
- db: `lifeos`
- connection string: `postgresql://postgres:codenur@localhost:5432/lifeos?schema=public`

Swagger:
- `http://localhost:4000/docs`
- Swagger Basic Auth bilan himoyalangan (`SWAGGER_USERNAME` / `SWAGGER_PASSWORD`)
- Tag bo'yicha filter mavjud, `Auth` bo'limi tepada chiqadi.

Ixtiyoriy backend env (`backend/.env.example`):
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN` (default `1d`)
- `JWT_REFRESH_EXPIRES_IN` (masalan `7d`)
- `GOOGLE_CLIENT_ID` (`Google OAuth Web Client ID`)
- `SWAGGER_USERNAME`
- `SWAGGER_PASSWORD`
- `CORS_ORIGINS` (`,` bilan ajratilgan ro'yxat)
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`

## 3) API ulanish
Frontend API base URL:
```env
VITE_API_BASE_URL=http://localhost:4000/api
```
`.env.example` ichida default qiymat bor.
Google auth uchun qo'shimcha:
```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```
Bu qiymat backenddagi `GOOGLE_CLIENT_ID` bilan bir xil bo'lishi kerak.

## 4) Auth oqimi
- Email: `user@example.com`
- Password: `123456`
- Demo user roli: `admin`

Yoki `/auth` sahifasidan yangi account ochsa bo'ladi.

Login/Register javobida:
- `accessToken`
- `refreshToken`

Access token bilan barcha himoyalangan API chaqiriladi:
- `Authorization: Bearer <accessToken>`

Access token eskirsa:
- `POST /api/auth/token` (yoki alias: `POST /api/token`)
- body: `{ "refreshToken": "<refreshToken>" }`

Parollar backendda `bcrypt` hash holatda saqlanadi (plaintext saqlanmaydi).

## 5) Asosiy endpointlar
- `GET /api/state` (protected)
- `GET /api/public/content` (public, landing/catalog content)
- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)
- `POST /api/auth/google` (public, Google ID token)
- `POST /api/auth/token` (public, refresh)
- `GET /api/admin/users` (protected, admin only)
- `POST /api/uploads/image` (protected, multipart `image`)
- `POST /api/goals` (protected)
- `POST /api/habits` (protected)
- `POST /api/books` (protected)
- `POST /api/assistant/messages` (protected)
- `PATCH /api/settings/language` (protected)

Register payload maydonlari:
- `firstName`
- `lastName`
- `email`
- `phone` (`+998XXXXXXXXX`)
- `address`
- `region`
- `city`
- `district`
- `profession`
- `password`

To'liq ro'yxat Swagger’da.

## 6) Xavfsizlik
- `helmet` xavfsizlik headerlari yoqilgan.
- Global va auth endpointlar uchun alohida rate-limit yoqilgan.
- Access token guard token payloadini user holati bilan tekshiradi (`tokenVersion`, email).
- `x-powered-by` o'chirilgan.

## 7) Google Auth sozlash
1. Google Cloud Console'da `OAuth 2.0 Client ID` yarating (`Web application`).
2. `Authorized JavaScript origins` ga frontend origin qo'shing:
   - `http://localhost:5173`
3. Olingan Client ID ni ikkala joyga bir xil kiriting:
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - root `.env` → `VITE_GOOGLE_CLIENT_ID=...`
4. Backend va frontend serverni restart qiling.
