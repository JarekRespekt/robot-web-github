# ROBOT - Task Management Frontend

ROBOT is a modern task management application built with Next.js 15, React 18, and TypeScript. This frontend provides a complete CRUD interface for managing tasks with real-time updates and a responsive Ukrainian-language interface.

## 🚀 How to Run

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Local Development

1. **Install dependencies:**
   ```bash
   cd apps/web
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=https://robot-api-app-cc4d4f828ab6.herokuapp.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## 🔧 Environment Variables

### Required Variables:
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_URL` - Frontend application URL

### Optional Variables:
- `NEXT_PUBLIC_APP_NAME` - Application name (default: ROBOT)
- `NEXT_PUBLIC_DEFAULT_LOCALE` - Default language (default: uk)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key for payments
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary integration

## 📡 API Integration

The frontend expects the following REST API endpoints:

### Tasks API
- `GET /api/tasks` - List tasks with search and pagination
  ```
  Query params: ?search=query&page=1&limit=10
  Response: { items: Task[], total: number, page?: number, limit?: number }
  ```

- `GET /api/tasks/:id` - Get single task
  ```
  Response: Task
  ```

- `POST /api/tasks` - Create new task
  ```
  Body: { title: string, description?: string }
  Response: Task
  ```

- `PUT /api/tasks/:id` - Update task
  ```
  Body: { title?: string, description?: string, status?: TaskStatus }
  Response: Task
  ```

- `DELETE /api/tasks/:id` - Delete task
  ```
  Response: { ok: boolean }
  ```

### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'done' | 'failed';
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

## 🛠 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with custom ROBOT theme
- **UI Components:** Radix UI primitives with custom styling
- **Forms:** React Hook Form with Zod validation
- **Data Fetching:** TanStack Query (React Query) with optimistic updates
- **Icons:** Lucide React
- **Notifications:** Custom toast system

## 🎨 Features

- ✅ **Task Management:** Full CRUD operations for tasks
- ✅ **Search & Pagination:** Real-time search with server-side pagination
- ✅ **Real-time Updates:** Optimistic updates with React Query
- ✅ **Form Validation:** Comprehensive validation with Zod schemas
- ✅ **Toast Notifications:** Success/error feedback system
- ✅ **Responsive Design:** Mobile-first responsive interface
- ✅ **Ukrainian Localization:** Complete Ukrainian language support
- ✅ **Accessibility:** ARIA labels and keyboard navigation
- ✅ **Error Handling:** Graceful error states with retry options

## 🧪 Development Tools

- **React Query Devtools:** Available in development mode (bottom-left corner)
- **TypeScript:** Strict type checking enabled
- **ESLint:** Code linting (warnings only during build)
- **Hot Reload:** Automatic reloading in development

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)