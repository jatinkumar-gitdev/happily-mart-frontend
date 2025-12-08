import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "../store/authStore";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Home from "../pages/Home";
import AdminLoader from "../admin/features/core/components/AdminLoader";

// Lazy load pages for code splitting
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPasswordPage = lazy(() =>
  import("../pages/auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const ReactivateAccountPage = lazy(() =>
  import("../pages/auth/ReactivateAccountPage")
);
const Feed = lazy(() => import("../pages/Feed"));
const Profile = lazy(() => import("../pages/Profile"));
const Favorites = lazy(() => import("../pages/Favorites"));
const Subscription = lazy(() => import("../pages/Subscription"));
const PaymentHistory = lazy(() => import("../pages/PaymentHistory"));
const Deals = lazy(() => import("../pages/Deals"));
const AdminRoutes = lazy(() => import("../admin/features/core/routes/AppAdminRoutes"));

// Loading fallback component
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Admin routes - must come before catch-all routes */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminLoader />}>
            <AdminRoutes />
          </Suspense>
        }
      />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<RouteLoader />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Suspense fallback={<RouteLoader />}>
              <Signup />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <Suspense fallback={<RouteLoader />}>
              <ForgotPasswordPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <Suspense fallback={<RouteLoader />}>
              <ResetPasswordPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/reactivate-account"
        element={
          <PublicRoute>
            <Suspense fallback={<RouteLoader />}>
              <ReactivateAccountPage />
            </Suspense>
          </PublicRoute>
        }
      />
      {/* Feed is public but requires login for interactions */}
      <Route
        path="/feed"
        element={
          <Suspense fallback={<RouteLoader />}>
            <Feed />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <Suspense fallback={<RouteLoader />}>
            <Home />
          </Suspense>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      
      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <Profile />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <Favorites />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <Subscription />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-history"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <PaymentHistory />
            </Suspense>
          </PrivateRoute>
        }
      />
      <Route
        path="/deals"
        element={
          <PrivateRoute>
            <Suspense fallback={<RouteLoader />}>
              <Deals />
            </Suspense>
          </PrivateRoute>
        }
      />
      
      {/* Catch-all route for 404 - must be last */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                404
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Page not found
              </p>
              <Navigate to="/feed" replace />
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;