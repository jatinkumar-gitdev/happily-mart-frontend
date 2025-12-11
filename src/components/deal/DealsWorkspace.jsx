import React from "react";
import { FiRefreshCw, FiTrendingUp, FiAward } from "react-icons/fi";
import { useDealsWorkspace } from "../../api/deals/useDeals";
import { useQueryClient } from "@tanstack/react-query";
import { showSuccess } from "../../utils/toast";

const DealsWorkspace = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useDealsWorkspace();
  const workspace = data?.dealsWorkspace;
  const badges = data?.badges;

  const handleRefresh = () => {
    queryClient.invalidateQueries(["dealsWorkspace"]);
    showSuccess("Workspace refreshed");
  };

  // Get badge display info
  const getBadgeInfo = (level) => {
    const badgeInfo = {
      10: { title: "Silver Creator", color: "bg-gray-200", icon: "🥈" },
      20: { title: "Gold Creator", color: "bg-yellow-200", icon: "🥇" },
      50: { title: "Platinum Creator", color: "bg-cyan-200", icon: "💎" },
      100: { title: "Diamond Creator", color: "bg-blue-200", icon: "✨" },
      150: { title: "Elite Creator", color: "bg-purple-200", icon: "👑" },
    };
    return badgeInfo[level] || { title: "Unknown", color: "bg-gray-100", icon: "⭐" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deals Workspace
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your deals history and achievements
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Deals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {workspace?.totalDeals || 0}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-sky-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Won Deals</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {workspace?.wonDeals || 0}
              </p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Failed Deals</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {workspace?.failedDeals || 0}
              </p>
            </div>
            <span className="text-4xl">❌</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Deals</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                {workspace?.pendingDeals || 0}
              </p>
            </div>
            <span className="text-4xl">⏳</span>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      {workspace && workspace.totalDeals > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-sky-200 dark:border-gray-600 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Success Rate
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(workspace.wonDeals / workspace.totalDeals) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {((workspace.wonDeals / workspace.totalDeals) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FiAward className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h3>
        </div>

        {badges?.earnedBadges && badges.earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {badges.earnedBadges.map((badge) => {
              const badgeInfo = getBadgeInfo(badge.level);
              return (
                <div
                  key={badge.level}
                  className={`${badgeInfo.color} rounded-lg p-4 text-center relative overflow-hidden`}
                >
                  <div className="text-4xl mb-2">{badgeInfo.icon}</div>
                  <p className="text-sm font-bold text-gray-900">{badge.level}+</p>
                  <p className="text-xs text-gray-700 mt-1">{badgeInfo.title}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No badges earned yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Win 10 deals to earn your first badge!
            </p>
          </div>
        )}
      </div>

      {/* Deal History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Deal History
        </h3>

        {workspace?.history && workspace.history.length > 0 ? (
          <div className="space-y-4">
            {workspace.history.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    item.result === "Won"
                      ? "bg-green-100 text-green-600"
                      : item.result === "Failed"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {item.result === "Won" && "✅"}
                  {item.result === "Failed" && "❌"}
                  {item.result === "Pending" && "⏳"}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.postTitle}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.postCategory} • {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.result}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No deal history yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsWorkspace;
