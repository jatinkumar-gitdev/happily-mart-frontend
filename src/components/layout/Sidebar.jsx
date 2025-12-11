import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiCompass,
  FiBox,
  FiUsers,
  FiSend,
  FiStar,
  FiX,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";
import { PiHandshake } from "react-icons/pi";
import { MdDynamicFeed } from "react-icons/md";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { useAuthStore } from "../../store/authStore";

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: FiHome,
    },
    {
      to: "/explore",
      label: "Explore",
      icon: FiCompass,
    },
    {
      to: "/popular",
      label: "Popular Products",
      icon: FiBox,
    },
    {
      to: "/authors",
      label: "Top Authors",
      icon: FiUsers,
    },
    {
      to: "/feed",
      label: "Requirements",
      icon: MdDynamicFeed,
    },
    {
      to: "/contact",
      label: "Contact",
      icon: FiSend,
    },
  ];

  if (isAuthenticated) {
    navItems.splice(1, 0, {
      to: "/favorites",
      label: "Favorites",
      icon: FiStar,
    });
    navItems.splice(2, 0, {
      to: "/deals",
      label: "My Deals",
      icon: PiHandshake,
    });
    navItems.splice(3, 0, {
      to: "/subscription",
      label: "Subscription",
      icon: FiCreditCard,
    });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:fixed lg:block lg:transform-none`}
    >
      <div className="h-full bg-[--primary] dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        {/* Logo */}
        <div className="p-5 lg:p-7  dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineLightningBolt className="text-2xl dark:text-sky-500 text-white" />
            <h2 className="text-lg font-bold text-white dark:text-white">
              Happily Mart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg dark:hover:bg-gray-700 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <TbLayoutSidebarLeftCollapse className="text-3xl text-white dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium"
                      : "text-white dark:text-gray-300 hover:text-[--primary] hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {typeof IconComponent === "function" ? (
                  <IconComponent className="text-xl" />
                ) : (
                  <IconComponent className="text-xl" />
                )}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 text-xs text-white dark:text-gray-400 mb-2">
            <a
              href="/terms"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Terms
            </a>
            <span>•</span>
            <a
              href="/privacy"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Privacy
            </a>
            <span>•</span>
            <a
              href="/help"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Help
            </a>
          </div>
          <p className="text-xs text-white dark:text-gray-500">
            Copyright 2025 by Happily Mart, Inc.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;