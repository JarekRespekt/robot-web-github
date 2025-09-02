# ROBOT Level 1 UI — Telegram login, menu (ua/pl/en), delivery & locations, design tokens

## Summary

Повна реалізація ROBOT 2.0 Admin Panel - Level 1 з Telegram логіном, багатомовним управлінням меню (ua/pl/en), налаштуваннями доставки та локацій. Включено цифрові токени дизайну, Cloudinary інтеграцію для фото, та сучасний UI з shadcn/ui компонентами. Система підтримує оптимістичні оновлення, валідацію форм та responsive дизайн.

## Scope / Routes

- **`/login`** → alias redirect to `/auth-group/login`
- **`/(auth-group)/login`** — Telegram authentication widget
- **`/menu`** — Головна сторінка меню з категоріями (drag&drop) та таблицею страв
- **`/menu/item/new`** — Форма створення нової страви з i18n полями
- **`/menu/item/[id]`** — Редагування страви (route exists, view/edit functionality)
- **`/settings/delivery`** — Налаштування методів доставки та тарифів
- **`/settings/locations`** — Управління локаціями (адреса, години, контакти)

## Tech Notes

- **State Management**: React Query (TanStack Query) для caching і optimistic updates
- **Forms**: React Hook Form + Zod для валідації, robust error handling
- **UI Components**: shadcn/ui з кастомними ROBOT design tokens
- **Styling**: Tailwind CSS v4 з глобальними токенами в `globals.css`
- **i18n**: Multi-language support (ua/pl/en) з dedicated utilities
- **Image Upload**: Cloudinary signed uploads через `/media/sign-upload` API
- **API Client**: Unified client (`robot-api.ts`) з Bearer auth та error handling
- **Design Tokens**: Defined in `tailwind.config.js` та mapped в CSS variables:
  - `--robot-primary: #CB5544` (ROBOT Red)
  - `--robot-surface: #FFF7EA` (Warm Paper)  
  - `--robot-ink: #062430` (Deep Ink)
  - `--radius-robot-*`, `--shadow-card`

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://robot-api-app-cc4d4f828ab6.herokuapp.com

# Telegram Authentication  
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=robot_admin_bot

# Cloudinary Media Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=deeuxruyd
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=robot_admin_uploads

# Optional Application Settings
NEXT_PUBLIC_APP_NAME=ROBOT
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=https://admin.robot.io
```

## How to Run Locally

1. **Install dependencies**:
```bash
cd apps/web
yarn install
```

2. **Environment setup**:
```bash
cp .env.example .env.local
# Update .env.local with your values
```

3. **Start development server**:
```bash
yarn dev
```

4. **Build for production**:
```bash
yarn build
```

## Smoke Test

1. **Authentication**: 
   - Open `/login` → redirects to `/auth-group/login`
   - Telegram widget loads and functional
   - After auth stores JWT token, redirects to `/menu`

2. **Menu Management**:
   - `/menu` shows categories sidebar (drag&drop reordering works)
   - Select category → items table updates
   - Search categories and items functional
   - Toggle item availability via switch
   - "Додати страву" button navigates to `/menu/item/new`

3. **Item Creation**:
   - `/menu/item/new` форма з ua/pl/en полями
   - Image uploader working with Cloudinary
   - Form validation з Zod schemas  
   - Success toast + redirect after creation

4. **Settings Pages**:
   - `/settings/delivery` — toggle delivery methods, set fees
   - `/settings/locations` — edit address, hours, contacts
   - Changes save with loading states and toast feedback

5. **UI/UX**:
   - Design tokens applied throughout
   - Loading states on buttons during mutations
   - Success/error toasts appear correctly
   - Responsive design works on mobile/tablet

## Known Limitations

- Category creation/editing modal needs implementation (placeholder handlers in CategorySidebar)
- Item deletion requires confirmation dialog (currently uses browser confirm)
- No user permissions/roles system yet
- Bulk operations for items not implemented
- Advanced search/filtering features pending

## Next Steps (Level 2)

- Implement category CRUD modals and forms
- Add bulk item operations (enable/disable, delete)  
- User management and role-based permissions
- Advanced analytics dashboard
- Order management integration
- Multi-location support enhancements
- Performance optimizations and caching strategies

## Screenshots / GIFs

_[User will add screenshots and demo GIFs here]_

- [ ] Login page with Telegram widget
- [ ] Menu page with categories and items
- [ ] Item creation form with i18n inputs
- [ ] Settings pages (delivery & locations)
- [ ] Mobile responsive views

## Checklist (Definition of Done)

- [x] **Authentication**: Telegram login widget integration
- [x] **Menu Management**: Categories with drag&drop, items CRUD
- [x] **Multi-language**: ua/pl/en support throughout
- [x] **Forms**: Validation with Zod, proper error handling
- [x] **File Upload**: Cloudinary integration for item photos
- [x] **Settings**: Delivery methods and location management
- [x] **Design System**: ROBOT design tokens applied consistently
- [x] **State Management**: React Query with optimistic updates
- [x] **UI/UX**: Loading states, toasts, responsive design
- [x] **API Integration**: Unified client with error handling
- [x] **Build**: Successful production build without errors
- [x] **Code Quality**: ESLint/TypeScript clean, proper typing
- [x] **Environment**: All required env vars documented
- [x] **Routing**: All specified routes implemented and functional