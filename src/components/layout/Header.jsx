import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiShoppingBag,
  FiChevronDown,
  FiMenu,
} from "react-icons/fi";
import { PiHandshake } from "react-icons/pi";
import { MdHistoryEdu } from "react-icons/md";
import { FaOpencart } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../../services/payment.service";
import { postService } from "../../services/post.service";
import Button from "../common/Button";
import { getAvatarUrl } from "../../utils/avatarUtils";

const Header = ({ onToggleSidebar = () => {} }) => {
  const { logout, user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const getHeaderTitle = () => {
    const pathname = location.pathname;
    const routeTitleMap = {
      "/": "Home",
      "/feed": "Requirements",
      "/explore": "Explore",
      "/popular": "Popular Products",
      "/authors": "Top Authors",
      "/favorites": "Favorites",
      "/contact": "Contact",
      "/profile": "Profile",
      "/deals": "My Deals",
    };
    return routeTitleMap[pathname] || "Happily Mart";
  };

  const { data: paymentHistory } = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () => paymentService.getPaymentHistory(),
    enabled: isAuthenticated,
  });

  const { data: favoritePosts } = useQuery({
    queryKey: ["favoritePosts", { page: 1, limit: 1 }],
    queryFn: () => postService.getFavoritePosts({ page: 1, limit: 1 }),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    const { setTheme } = useThemeStore.getState();
    setTheme("light");
    navigate("/feed");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <>
      <header className="bg-[#fff] dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Open sidebar"
          >
            <FiMenu className="text-xl text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {getHeaderTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle - Always visible */}
          <button
            onClick={handleThemeToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            type="button"
          >
            {theme === "light" ? (
              <FiMoon className="text-lg sm:text-xl text-gray-600 dark:text-gray-400" />
            ) : (
              <FiSun className="text-lg sm:text-xl text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => navigate("/favorites")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="Favorites"
            >
              <FaOpencart className="text-lg sm:text-xl text-gray-600 dark:text-gray-400" />
              {favoritePosts?.total > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-yellow-400 text-gray-900 text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {favoritePosts.total > 99 ? "99+" : favoritePosts.total}
                </span>
              )}
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => navigate("/deals")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="My Deals"
            >
              <PiHandshake className="text-lg sm:text-xl text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => navigate("/payment-history")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
              title="Purchase History"
            >
              <MdHistoryEdu className="text-lg sm:text-3xl text-gray-600 dark:text-gray-400" />
              {paymentHistory?.payments &&
                paymentHistory.payments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {paymentHistory.payments.length}
                  </span>
                )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 dark:bg-sky-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className={`text-white text-sm font-semibold ${
                      user?.avatar
                        ? "hidden"
                        : "flex items-center justify-center w-full h-full"
                    }`}
                  >
                    {getInitials(user?.name)}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
                <FiChevronDown className="text-gray-600 dark:text-gray-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <FiUser className="text-lg" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/deals");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <PiHandshake className="text-lg" />
                    <span>My Deals</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate("/payment-history");
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <FiShoppingBag className="text-lg" />
                    <span>Payment History</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <FiLogOut className="text-lg" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => navigate("/login")}
                variant="secondary"
                className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-500 hover:bg-sky-600"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
