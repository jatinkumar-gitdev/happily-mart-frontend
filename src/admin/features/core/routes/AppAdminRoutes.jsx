import React, { lazy, Suspense, useEffect } from "react";
import { useAdminStore } from "../../../../store/adminStore";
import AdminLoader from "../components/AdminLoader";

// Lazy load the actual admin routes
const AdminAppRoutes = lazy(() => import("./index"));

const AppAdminRoutes = () => {
  const { initializeAuth } = useAdminStore();

  useEffect(() => {
    // Initialize admin auth state when app loads
    initializeAuth();
  }, []);

  return (
    <Suspense fallback={<AdminLoader />}>
      <AdminAppRoutes />
    </Suspense>
  );
};

export default AppAdminRoutes;