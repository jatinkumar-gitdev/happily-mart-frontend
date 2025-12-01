import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuthStore } from "../store/authStore";
import Loader from "../components/common/Loader";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Home from "../pages/Home";

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

// Loading fallback component
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <Loader />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
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
      <Route path="/" element={<Navigate to="/home" replace />} />
      {/* Catch-all route for 404 */}
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
    </Routes>
  );
};

export default AppRoutes;
