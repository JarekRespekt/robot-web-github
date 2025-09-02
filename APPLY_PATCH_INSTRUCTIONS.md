# 📦 ROBOT Foundation Patch - Application Instructions

## 🚀 How to Apply the Git Patch

### 1. **Download the Patch File**
Save the `robot-foundation-changes.patch` file to your local repository root.

### 2. **Apply the Patch**
```bash
cd /path/to/your/robot-repo
git apply robot-foundation-changes.patch
```

### 3. **Install Dependencies**
```bash
cd apps/web
npm install
```

### 4. **Test the Build**
```bash
# Test production build
npm run build

# Test development server  
npm run dev
```

### 5. **Create Feature Branch & Commit**
```bash
git checkout -b feature/foundation-api-client
git add .
git commit -m "feat: ROBOT frontend foundation with API client and React Query integration

- Add Next.js 15 + TypeScript + Tailwind CSS v4 setup
- Implement unified API client with error handling & timeouts  
- Add React Query hooks for Task CRUD operations
- Create ROBOT brand theme (#CB5544 primary color)
- Build responsive layout with Ukrainian localization
- Add reusable UI components (Button, Badge, Card, StatusBadge)
- Implement homepage with ROBOT branding and feature showcase
- Configure environment variables for API integration
- Set up QueryProvider with optimized caching strategies
- Add comprehensive TypeScript types for Task model

Foundation ready for Phase 3: /tasks pages implementation"
```

### 6. **Push & Create PR**
```bash
git push origin feature/foundation-api-client
```

Then create a PR to `main` with the description from `ROBOT_FOUNDATION_SUMMARY.md`.

## ✅ **Verification Steps**

After applying the patch, verify:
- [ ] `npm run build` succeeds without errors
- [ ] `npm run dev` starts development server 
- [ ] Homepage loads with ROBOT branding at http://localhost:3000
- [ ] Environment variables are properly configured
- [ ] TypeScript compilation passes
- [ ] All new components render correctly

## 🎯 **What's Included**

The patch includes:
- **12 new files** (API client, components, types, utilities)
- **4 modified files** (layout, page, styles, package.json)  
- **Full TypeScript support** with strict mode
- **ROBOT brand theme** with #CB5544 primary color
- **Production-ready build** configuration

## 📋 **Next Phase Ready**

Once merged, ready for **Phase 3**: `/tasks` and `/tasks/[id]` pages with full CRUD functionality! 🚀