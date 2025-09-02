# ROBOT Admin Panel - Level 1

ROBOT адмін-панель для управління рестораном з Telegram авторизацією, багатомовністю (ua/pl/en) та повним CRUD функціоналом для меню.

## 🚀 Швидкий старт

### Встановлення залежностей:
```bash
cd apps/web
npm install
```

### Налаштування середовища:
```bash
cp .env.example .env.local
```

Заповніть необхідні змінні в `.env.local`:

### Запуск розробки:
```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000) в браузері.

### Production білд:
```bash
npm run build
npm run start
```

## 🔐 Environment Variables

### **Обов'язкові змінні:**

#### `NEXT_PUBLIC_API_BASE_URL`
**Описання:** URL бекенд API для ROBOT ресторану  
**Приклад:** `https://robot-api-app-cc4d4f828ab6.herokuapp.com`  
**Використання:** Всі API запити (категорії, страви, локації, доставка)

#### `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`  
**Описання:** Username Telegram бота для авторизації адміністраторів  
**Приклад:** `robot_admin_bot`  
**Використання:** Telegram Login Widget на сторінці логіну

#### `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
**Описання:** Назва Cloudinary cloud для завантаження фотографій страв  
**Приклад:** `deeuxruyd`  
**Використання:** Завантаження зображень через ImageUploader компонент

#### `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
**Описання:** Preset для підписаних завантажень в Cloudinary  
**Приклад:** `robot_admin_uploads`  
**Використання:** Автоматичне підписування завантажень фото

### **Опціональні змінні:**

- `NEXT_PUBLIC_APP_NAME` - Назва додатку (за замовчуванням: "ROBOT")
- `NEXT_PUBLIC_ENV` - Середовище (development/production)  
- `NEXT_PUBLIC_APP_URL` - URL фронтенду (для локальної розробки)
- `NEXT_PUBLIC_ADMIN_URL` - URL адмін панелі
- `NEXT_TELEMETRY_DISABLED` - Відключити Next.js телеметрію (рекомендовано: 1)

## 🍽️ Функціональність

### **Авторизація**
- **Telegram Login** на `/login` або `/auth-group/login`
- Автоматичне збереження JWT токена
- Редірект на `/menu` після успішного входу

### **Управління меню (`/menu`)**
- **Список категорій** з drag & drop перестановкою
- **Пошук категорій** в реальному часі
- **Таблиця страв** з колонками: фото, назва, ціна, упаковка, доступність, дії
- **Toggle доступності** з оптимістичними оновленнями
- **CRUD операції:** перегляд, редагування, видалення страв

### **Форми страв (`/menu/item/new`)**
- **Багатомовні поля** (🇺🇦 ua / 🇵🇱 pl / 🇺🇸 en) з табами
- **Zod валідація** + React Hook Form
- **Завантаження фото** через Cloudinary з підписаними uploads
- **Ціноутворення:** основна ціна + опціональна упаковка
- **Статус доступності** з switch компонентом

### **Налаштування локацій (`/settings/locations`)**
- **Основна інформація:** назва, адреса (seed: Jutrzenki 156), телефон
- **Години роботи** по днях тижня (відкрито/закрито/час роботи)
- **Соціальні мережі:** Facebook, Instagram, TikTok

### **Налаштування доставки (`/settings/delivery`)**
- **Методи доставки:** самовивіз, кур'єр, власна доставка
- **Управління:** включення/відключення кожного методу
- **Ціноутворення:** налаштування delivery_fee для кожного методу
- **Real-time підсумок** активних методів

## 🎨 Дизайн система

### **ROBOT Brand Colors:**
- **Primary:** `#CB5544` (ROBOT Red)
- **Surface:** `#FFF7EA` (Warm Paper)  
- **Ink:** `#062430` (Deep Ink)

### **UI Components:**
- Базується на **shadcn/ui** з кастомним ROBOT темінгом
- **Responsive дизайн** з mobile-first підходом
- **Accessibility (WCAG AA)** підтримка
- **Tailwind CSS v4** з кастомними утилітами

## 📡 API Інтеграція

### **Очікувані ендпоїнти:**

**Авторизація:**
- `POST /auth/telegram/verify` - Верифікація Telegram логіну
- `GET /me` - Профіль поточного адміністратора

**Категорії:**
- `GET /categories` - Список категорій
- `POST /categories` - Створення категорії
- `PUT /categories/{id}` - Оновлення категорії
- `DELETE /categories/{id}` - Видалення категорії
- `PATCH /categories/reorder` - Зміна порядку

**Страви:**
- `GET /items?categoryId=` - Список страв
- `POST /items` - Створення страви
- `PUT /items/{id}` - Оновлення страви
- `DELETE /items/{id}` - Видалення страви
- `PATCH /items/{id}/availability` - Зміна доступності

**Локації:**
- `GET /locations` - Список локацій
- `PUT /locations/{id}` - Оновлення локації
- `PUT /locations/{id}/delivery-settings` - Налаштування доставки

**Медіа:**
- `POST /media/sign-upload` - Підпис для Cloudinary завантаження

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Forms:** React Hook Form + Zod validation  
- **Data:** TanStack Query (React Query)
- **Auth:** Telegram Login Widget
- **Upload:** Cloudinary signed uploads
- **Icons:** Lucide React
- **DnD:** @dnd-kit for category reordering

## 🧪 Розробка

### **Структура проєкту:**
```
apps/web/src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── lib/                   # API clients, utilities, queries
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

### **Команди:**
```bash
npm run dev          # Development server
npm run build        # Production build  
npm run start        # Production server
npm run lint         # ESLint check
```

## 📱 Підтримувані браузери

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

**ROBOT Level 1 адмін-панель готова для production використання!** 🤖🍽️