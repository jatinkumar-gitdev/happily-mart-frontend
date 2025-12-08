import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Dashboard from '../../dashboard/pages/Dashboard';
import AdminLogin from '../../auth/pages/AdminLogin';
import PrivateAdminRoute from './PrivateAdminRoute';
import AdminLoader from '../components/AdminLoader';

// Lazy load admin pages
const UsersManagement = lazy(() => import('../../users/pages/UsersManagement'));
const PostsManagement = lazy(() => import('../../posts/pages/PostsManagement'));
const DealsManagement = lazy(() => import('../../deals/pages/DealsManagement'));
const AdvancedAnalytics = lazy(() => import('../../analytics/pages/AdvancedAnalytics'));
const Reports = lazy(() => import('../../reports/pages/Reports'));
const Settings = lazy(() => import('../../settings/pages/Settings'));

// Loading fallback component
const AdminRouteLoader = () => <AdminLoader />;

const AdminAppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <PrivateAdminRoute>
            <AdminLayout />
          </PrivateAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route 
          path="users" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <UsersManagement />
            </Suspense>
          } 
        />
        <Route 
          path="posts" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <PostsManagement />
            </Suspense>
          } 
        />
        <Route 
          path="deals" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <DealsManagement />
            </Suspense>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <AdvancedAnalytics />
            </Suspense>
          } 
        />
        <Route 
          path="reports" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <Reports />
            </Suspense>
          } 
        />
        <Route 
          path="settings" 
          element={
            <Suspense fallback={<AdminRouteLoader />}>
              <Settings />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminAppRoutes;