# LifeOS Texnik Topshiriq (TZ)

## 1) Loyiha Maqsadi
LifeOS — shaxsiy rivojlanish va mahsuldorlikka qaratilgan veb-ilova. Platforma foydalanuvchining maqsadlari, odatlari, sog‘ligi, o‘qish jarayoni, ko‘nikma rivoji va ijtimoiy aloqalarini bitta tizimda boshqaradi.

Asosiy maqsad:
- Kundalik intizomni oshirish
- Jarayonni raqamlar (progress, streak, soat, kaloriya) bilan kuzatish
- AI yordamida shaxsiy tavsiya berish
- Gamifikatsiya orqali motivatsiyani kuchaytirish

## 2) Texnik Stack
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Drizzle ORM
- Auth: JWT (access/refresh token)
- AI: OpenAI GPT API

## 3) Rol va Ruxsatlar
- `User`: o‘z ma’lumotlarini yaratish/o‘zgartirish/o‘chirish
- `Admin` (v2): kontent moderatsiyasi, tizim statistikasi, challenge boshqaruvi

MVP bosqichida asosiy e’tibor `User` roliga qaratiladi.

## 4) Sahifalar va Navigatsiya
Majburiy sahifalar:
- Dashboard
- Maqsadlar
- Odatlar
- Kitoblar
- Sog‘liq
- Mahorat
- Tarmoq
- AI Yordamchi
- Sozlamalar

Navigatsiya:
- Desktop: chap sidebar + yuqori utility bar
- Mobile: pastki tab bar + sahifa ichidagi sticky action buttonlar

## 5) Funksional Talablar (Modullar bo‘yicha)

### 5.1 Dashboard
- Kunlik umumiy holat: bugungi tasklar, odatlar, focus soat, suv, kaloriya
- 7 kunlik trend (mini grafiklar)
- Tezkor qo‘shish: maqsad, odat, kitob sessiyasi, focus sessiya
- “Bugungi prioritet 3 ta ish” bloki

### 5.2 Maqsadlar
- Darajalar: yillik, oylik, haftalik, kunlik
- Har bir maqsad uchun:
  - `title`, `description`, `period_type`, `start_date`, `end_date`
  - `target_value`, `current_value`, `status`
- Progress bar va foiz ko‘rinishi
- Goal breakdown: yillik -> oylik -> haftalik -> kunlik bog‘lanishi
- Muddatdan o‘tgan maqsadlar uchun ogohlantirish

### 5.3 Odatlar (40 kunlik murabbiy)
- Odat yaratish: nomi, tur (daily/weekly), trigger va reminder
- 40 kunlik tracking grid
- Streak hisoblash:
  - ketma-ket bajarilgan kunlar
  - eng uzun streak
- “Missed day” qoidasi:
  - 1 kun o‘tkazib yuborilsa streak sinadi (MVP)
- Odat bo‘yicha haftalik xulosa

### 5.4 Kitoblar
- Kitob kartasi: nom, muallif, jami sahifa, janr
- O‘qish sessiyasi qo‘shish: `pages_read`, `minutes_spent`, `note`
- Progress: o‘qilgan sahifa / jami sahifa
- Fikr-mulohaza: qisqa review va reyting (1-5)
- Jamoaviy rejim (v1.1): do‘stlar reviewlarini ko‘rish

### 5.5 AI Yordamchi
- Chat interfeys: foydalanuvchi savoli + AI javobi
- Kontekst:
  - maqsadlar
  - odatlar
  - oxirgi 7 kunlik faoliyat
- Prompt turlari:
  - kunlik reja tuzish
  - regressiya sababini tahlil
  - keyingi hafta uchun tavsiya
- Xavfsizlik:
  - API key faqat backendda saqlanadi
  - rate limit (foydalanuvchi/sutka)

### 5.6 Gamifikatsiya
- Coin tizimi:
  - odat bajarish, maqsadga erishish, focus sessiya uchun coin berish
- Level va XP (v1.1)
- Challenge lar (haftalik):
  - masalan, “7/7 suv normasi”
- Shop:
  - virtual itemlar
- Inventory:
  - sotib olingan itemlar ro‘yxati

### 5.7 Sog‘liq
- Kaloriya tracking (kunlik target + actual)
- Suv iste’moli (stakan/ml bo‘yicha)
- Uyqu monitoring (boshlanish, tugash, jami soat)
- Haftalik trend

### 5.8 Mahorat (Mastery)
- Skill yaratish: nomi, kategoriya, maqsad soat (`default: 4000`)
- Focus sessiya:
  - timer (pomodoro yoki custom)
  - sessiya oxirida log yozish
- Jami soat va qolgan soat hisoblash
- Skill bo‘yicha milestone (100, 500, 1000, ...)

### 5.9 Tarmoq
- Foydalanuvchi qidirish (`username`, `name`, `skill`)
- Follow/Connect
- Public profil:
  - umumiy stats (goal completion, streak, focus hours)
- Privacy sozlamalari:
  - profil ochiq/yopiq

### 5.10 Sozlamalar
- Profil tahriri
- Notification sozlamalari
- Til (UZ/EN, v1.1)
- Ma’lumot eksporti (CSV/JSON, v1.2)

## 6) UI/UX Talablari (Minimalistik Oq-Qora)

### 6.1 Dizayn Prinsiplari
- Vizual uslub: sof, tartibli, “distraction-free”
- Ranglar: oq-qora va kulrang tonalari
- Dekor minimum, kontent maksimum
- Har sahifada bitta asosiy CTA

### 6.2 Rang Palitrasi (Design Tokens)
- `--bg: #FFFFFF`
- `--bg-soft: #F5F5F5`
- `--text: #0A0A0A`
- `--text-muted: #525252`
- `--border: #E5E5E5`
- `--card: #FFFFFF`
- `--inverse-bg: #0A0A0A`
- `--inverse-text: #FFFFFF`

Accent rang ishlatilmaydi (MVP). Muhim holatlar faqat tonal kontrast bilan ajratiladi.

### 6.3 Tipografiya
- Tavsiya: `Space Grotesk` (sarlavha) + `IBM Plex Sans` (body)
- H1/H2/H3 ierarxiyasi aniq
- Matn o‘qilishi: `line-height` kamida `1.5`

### 6.4 Komponent Standartlari
- Border radius: `10px` (global)
- Border: `1px solid var(--border)`
- Shadow: minimal yoki yo‘q
- Tugmalar:
  - Primary: qora fon, oq matn
  - Secondary: oq fon, qora border
- Inputlar: balandlik bir xil, label doim ko‘rinadigan

### 6.5 Responsivlik
- Breakpointlar:
  - `sm: 640px`
  - `md: 768px`
  - `lg: 1024px`
  - `xl: 1280px`
- Mobile-first yondashuv
- 44px minimum touch target

### 6.6 Accessibility
- Kontrast WCAG AA ga mos
- Klaviatura navigatsiyasi (`tab`, `enter`, `esc`)
- `aria-label` va semantik HTML majburiy

## 7) Backend Arxitektura Talablari
- Layerlar:
  - `routes`
  - `controllers`
  - `services`
  - `repositories`
  - `validators`
- Har modul alohida papka ko‘rinishida bo‘lsin
- Xatolar uchun yagona `error handler`
- Request validatsiya: Zod yoki Joi

## 8) Database (PostgreSQL + Drizzle) Minimal Sxema
Asosiy jadvallar:
- `users`
- `goals`
- `goal_progress_logs`
- `habits`
- `habit_logs`
- `books`
- `book_sessions`
- `book_reviews`
- `health_logs`
- `skills`
- `focus_sessions`
- `coins_ledger`
- `shop_items`
- `inventory_items`
- `connections`
- `ai_messages`

Har jadval uchun:
- `id` (uuid)
- `created_at`, `updated_at`
- kerakli joylarda `user_id` foreign key

## 9) API Talablari (REST)
Namuna endpointlar:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard/summary`
- `CRUD /api/goals`
- `POST /api/habits/:id/check-in`
- `CRUD /api/books`
- `POST /api/books/:id/session`
- `CRUD /api/health/logs`
- `CRUD /api/skills`
- `POST /api/focus/start`
- `POST /api/focus/end`
- `POST /api/ai/chat`
- `GET /api/network/search`
- `POST /api/network/connect/:userId`

Talablar:
- Barcha private endpointlar JWT bilan himoyalangan
- Pagination: `page`, `limit`
- Filter/sort query param orqali

## 10) Xavfsizlik Talablari
- Parol hashing: `bcrypt`
- JWT refresh token rotation
- Rate limiting (`auth`, `ai/chat` endpointlarida qat’iy)
- Helmet + CORS whitelist
- SQL injectiondan himoya (ORM + validatsiya)

## 11) Performance Talablari
- Dashboard API javobi: `< 400ms` (cache bo‘lmaganda o‘rtacha)
- Lighthouse (frontend):
  - Performance: 85+
  - Accessibility: 90+
- Katta ro‘yxatlar uchun lazy loading/pagination

## 12) Loglash va Monitoring
- Backend structured logs (pino/winston)
- Error tracking (Sentry v1.1)
- Audit log (muhim user actionlar)

## 13) Test Talablari
- Frontend: unit test (React Testing Library)
- Backend: unit + integration (Jest/Supertest)
- Kamida:
  - auth flow testlari
  - goals/habits core business logic testlari
  - AI endpoint uchun mock test

## 14) MVP Chegarasi
MVP ichiga kiradi:
- Auth
- Dashboard
- Maqsadlar
- Odatlar
- Kitoblar (basic)
- Sog‘liq (basic)
- Mahorat (focus + hour tracking)
- AI Yordamchi (basic chat)
- Minimal gamifikatsiya (coin + oddiy challenge)

MVPdan keyin:
- Kengaytirilgan ijtimoiy feed
- Shop/inventory advanced
- Ko‘p tillilik to‘liq
- Admin panel

## 15) Qabul Mezonlari (Acceptance Criteria)
- Foydalanuvchi ro‘yxatdan o‘tib login qila oladi
- Har bir modulda kamida bitta CRUD ish jarayoni to‘liq ishlaydi
- Odat streaki to‘g‘ri hisoblanadi
- Focus sessiya yakunlanganda skill soati yangilanadi
- AI yordamchi foydalanuvchi konteksti asosida javob qaytaradi
- UI oq-qora minimalistik standartdan chiqmaydi
- Desktop va mobileda asosiy sahifalar buzilmasdan ishlaydi

## 16) Topshirish Natijalari
- `frontend/` (React + TS + Tailwind)
- `backend/` (Node + Express + Drizzle)
- `.env.example`
- `README` (ishga tushirish qo‘llanmasi)
- `TZ.md` (ushbu hujjat)
