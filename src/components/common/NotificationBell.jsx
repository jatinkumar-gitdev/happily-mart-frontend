import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";
import {
  FiBell,
  FiX,
  FiCheck,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiGift,
  FiAlertCircle,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";

const getNotificationIcon = (type) => {
  const icons = {
    order: FiPackage,
    cart: FiShoppingCart,
    payment: FiDollarSign,
    deal: FiGift,
    alert: FiAlertCircle,
    info: FiInfo,
  };
  const Icon = icons[type] || FiBell;
  return <Icon className="text-lg" />;
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const getNotificationUrl = (notification) => {
  if (notification.url) return notification.url;

  switch (notification.type) {
    case "order":
      return notification.orderId ? `/orders/${notification.orderId}` : "/orders";
    case "deal":
      return notification.dealId ? `/deals/${notification.dealId}` : "/deals";
    case "payment":
      return "/wallet";
    default:
      return null;
  }
};

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasMore,
    page,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    const url = getNotificationUrl(notification);
    if (url) {
      setIsOpen(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    e.preventDefault();
    await deleteNotification(notificationId);
  };

  const renderNotification = (notification) => {
    const url = getNotificationUrl(notification);
    const content = (
      <div
        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
          !notification.isRead ? "bg-blue-50" : ""
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              !notification.isRead ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
              {notification.message || notification.body}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {getTimeAgo(notification.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
            <button
              onClick={(e) => handleDelete(e, notification._id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete notification"
            >
              <FiTrash2 className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    );

    if (url) {
      return (
        <Link key={notification._id} to={url} className="block">
          {content}
        </Link>
      );
    }

    return <div key={notification._id}>{content}</div>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FiCheck className="text-sm" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell className="text-4xl mx-auto text-gray-300 mb-2" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map(renderNotification)}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="w-full p-3 text-center text-sm text-blue-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 text-center border-t border-gray-200 flex-shrink-0">
              <Link
                to="/notifications"
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
