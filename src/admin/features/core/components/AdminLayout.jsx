import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../auth/hooks/useAdminAuth';
import adminAxios from '../utils/adminAxios';
import AdminLoader from './AdminLoader';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false); // Default to false since auth is handled by route
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout, adminUser, isAdminAuthenticated } = useAdminAuth(); // Removed verifyAdminAuth

  // Show loader when location changes
  useEffect(() => {
    if (location.pathname) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Show loader for 500ms when navigating between routes
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Fetch admin notifications
  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  const fetchAdminNotifications = async () => {
    try {
      // In a real implementation, this would fetch actual admin notifications
      const mockNotifications = [
        {
          id: 1,
          title: 'New User Registration',
          message: 'A new user has registered on the platform',
          time: '2 hours ago',
          isRead: false
        },
        {
          id: 2,
          title: 'Report Submitted',
          message: 'A user has submitted a report that requires attention',
          time: '5 hours ago',
          isRead: false
        },
        {
          id: 3,
          title: 'System Alert',
          message: 'Server maintenance scheduled for tonight',
          time: '1 day ago',
          isRead: true
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Posts', path: '/admin/posts', icon: '📝' },
    { name: 'Deals', path: '/admin/deals', icon: '🤝' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
    { name: 'Reports', path: '/admin/reports', icon: '🚩' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-xl">🔒</span>
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <button 
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <nav className="mt-6 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-gray-700 text-white border-l-4 border-blue-500' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-left text-red-400 hover:bg-red-900 hover:text-red-100 rounded-lg transition-colors flex items-center"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow">
          <div className="flex items-center">
            <button 
              className="lg:hidden text-gray-500 mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                            {!notification.isRead && (
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {adminUser?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Main content area with loader */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <AdminLoader />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;