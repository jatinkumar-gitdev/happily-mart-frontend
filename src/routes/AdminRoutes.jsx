import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminDealsManagement from '../components/admin/AdminDealsManagement';
import AdminDealDetails from '../components/admin/AdminDealDetails';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminPrivateRoute from './AdminPrivateRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminPrivateRoute>
          <AdminLayout />
        </AdminPrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="deals" element={<AdminDealsManagement />} />
        <Route path="deals/:id" element={<AdminDealDetails />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;