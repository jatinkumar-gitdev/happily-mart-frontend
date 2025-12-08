import React from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";

const AdminAuthTest = () => {
  const { 
    adminUser, 
    isAdminAuthenticated, 
    isLoading,
    verifyAdminAuth,
    initializeAuth
  } = useAdminAuth();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Admin Auth State Test</h3>
      <div className="space-y-2">
        <p><strong>Is Authenticated:</strong> {isAdminAuthenticated ? "Yes" : "No"}</p>
        <p><strong>Is Loading:</strong> {isLoading ? "Yes" : "No"}</p>
        <p><strong>User:</strong> {adminUser ? adminUser.email : "None"}</p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={verifyAdminAuth}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verify Auth
          </button>
          <button 
            onClick={initializeAuth}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Initialize Auth
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthTest;