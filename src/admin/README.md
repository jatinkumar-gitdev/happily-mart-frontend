# Admin Panel Structure

This document outlines the organized structure for the admin panel.

## File Structure

```
src/admin/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── dashboard/
│   │   ├── components/
│   │   └── pages/
│   ├── deals/
│   │   ├── components/
│   │   └── pages/
│   ├── users/
│   │   ├── components/
│   │   └── pages/
│   ├── posts/
│   │   ├── components/
│   │   └── pages/
│   ├── analytics/
│   │   ├── components/
│   │   └── pages/
│   ├── reports/
│   │   └── pages/
│   ├── settings/
│   │   ├── components/
│   │   └── pages/
│   └── core/
│       ├── components/
│       ├── hooks/
│       ├── routes/
│       └── utils/
└── services/
```

## API Organization

### 1. Service Layer (`src/services/admin.service.js`)

Centralized API service functions grouped by functionality:

- `adminAuthAPI` - Authentication endpoints
- `adminUserAPI` - User management endpoints
- `adminPostAPI` - Post management endpoints
- `adminDealAPI` - Deal management endpoints
- `adminAnalyticsAPI` - Analytics endpoints

### 2. Hook Layer (`src/admin/features/core/hooks/useAdminAPI.js`)

React Query hooks for data fetching and mutations:

- Auth: `useAdminLogin`, `useAdminLogout`, `useAdminProfile`
- Users: `useAdminUsers`, `useAdminUserById`, `useUpdateAdminUser`, `useDeactivateAdminUser`
- Posts: `useAdminPosts`, `useAdminPostById`, `useUpdateAdminPostStatus`
- Deals: `useAdminDeals`, `useAdminDealById`, `useUpdateAdminDealStatus`, `useCloseAdminDeal`
- Analytics: `useAdminDealAnalytics`, `useAdminRecentActivity`

### 3. Utilities

- `adminAxios.js` - Dedicated axios instance with admin-specific interceptors (`src/admin/features/core/utils/adminAxios.js`)
- `adminCookieManager.js` - Centralized cookie management for admin tokens

## Usage Examples

### Using Service Functions Directly

```javascript
import { adminUserAPI } from "../../../services/admin.service";

// Fetch all users
const response = await adminUserAPI.getAllUsers({ page: 1, limit: 10 });

// Update a user
await adminUserAPI.updateUser(userId, userData);
```

### Using React Query Hooks

```javascript
import { useAdminUsers } from "../features/core/hooks/useAdminAPI";

// In a component
const { data, isLoading, error } = useAdminUsers({ page: 1, limit: 10 });

// Using mutations
import { useUpdateAdminUser } from "../features/core/hooks/useAdminAPI";

const updateMutation = useUpdateAdminUser();
updateMutation.mutate({ id: userId, data: userData });
```

## Authentication Flow

1. Admin logs in via `adminAuthAPI.login()`
2. Access token is stored in secure cookie via `adminCookieManager`
3. All subsequent requests include the token via axios interceptors
4. Token refresh is handled automatically when receiving 401 responses
5. Logout clears all admin tokens and redirects to login page

## Benefits of This Structure

1. **Separation of Concerns**: Clear distinction between services, hooks, and components
2. **Reusability**: Service functions can be used anywhere, hooks provide React integration
3. **Consistent Error Handling**: Centralized in axios interceptors
4. **Automatic Caching**: Provided by React Query
5. **Type Safety**: Easy to add TypeScript interfaces
6. **Maintainability**: Changes to API endpoints only need to be made in one place