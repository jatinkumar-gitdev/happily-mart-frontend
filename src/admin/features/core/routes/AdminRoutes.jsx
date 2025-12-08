import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import Dashboard from '../../dashboard/pages/Dashboard';
import AdminLogin from '../../auth/pages/AdminLogin';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<div>Users Management</div>} />
        <Route path="posts" element={<div>Posts Management</div>} />
        <Route path="deals" element={<div>Deals Management</div>} />
        <Route path="analytics" element={<div>Advanced Analytics</div>} />
        <Route path="reports" element={<div>Reports</div>} />
        <Route path="settings" element={<div>Settings</div>} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;