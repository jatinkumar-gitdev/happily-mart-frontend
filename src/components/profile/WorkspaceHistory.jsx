import { useState } from "react";
import { FiPackage, FiCalendar, FiChevronDown, FiFilter } from "react-icons/fi";
import MyDeals from "../deal/MyDeals";
import DealHistory from "../deal/DealHistory";

const WorkspaceHistory = ({ user }) => {
  const [activeTab, setActiveTab] = useState("deals");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("deals")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "deals"
              ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiPackage />
            My Deals
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCalendar />
            Deal History
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "deals" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <MyDeals />
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <DealHistory />
        </div>
      )}
    </div>
  );
};

export default WorkspaceHistory;