import React, { useState, useEffect } from "react";
import adminAxios from "../../core/utils/adminAxios";
import { showError } from "../../../../utils/toast";

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState({
    totalDeals: 0,
    successRate: 0,
    failRate: 0,
    completionRate: 0,
    avgResponseTime: 0,
    chronicNonUpdateCount: 0,
    penaltiesApplied: 0,
    dealsByMonth: [],
    statusBreakdown: {},
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("/admin/analytics/deals", {
        params: { timeRange },
      });
      setAnalytics(response.data);
    } catch (error) {
      showError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const formatPercentage = (num) => {
    return (num || 0).toFixed(1) + "%";
  };

  const formatTime = (hours) => {
    if (!hours) return "N/A";
    if (hours < 1) return Math.round(hours * 60) + " min";
    if (hours < 24) return hours.toFixed(1) + " hrs";
    return (hours / 24).toFixed(1) + " days";
  };

  const getMaxValue = (data) => {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map((d) => d.count || 0), 1);
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      red: "bg-red-50 text-red-600",
      yellow: "bg-yellow-50 text-yellow-600",
      purple: "bg-purple-50 text-purple-600",
      gray: "bg-gray-50 text-gray-600",
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <div className="flex space-x-2">
            {[
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "90d", label: "90 Days" },
              { value: "all", label: "All Time" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deals"
          value={formatNumber(analytics.totalDeals)}
          subtitle="In selected period"
          icon="🤝"
          color="blue"
        />
        <StatCard
          title="Success Rate"
          value={formatPercentage(analytics.successRate)}
          subtitle="Completed successfully"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Fail Rate"
          value={formatPercentage(analytics.failRate)}
          subtitle="Failed deals"
          icon="❌"
          color="red"
        />
        <StatCard
          title="Completion Rate"
          value={formatPercentage(analytics.completionRate)}
          subtitle="Success + Fail / Total"
          icon="📊"
          color="purple"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Avg Response Time"
          value={formatTime(analytics.avgResponseTime)}
          subtitle="Time to first status update"
          icon="⏱️"
          color="yellow"
        />
        <StatCard
          title="Chronic Non-Updates"
          value={formatNumber(analytics.chronicNonUpdateCount)}
          subtitle="Deals without updates > 7 days"
          icon="⚠️"
          color="red"
        />
        <StatCard
          title="Penalties Applied"
          value={formatNumber(analytics.penaltiesApplied)}
          subtitle="Total penalties issued"
          icon="🔒"
          color="gray"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analytics.statusBreakdown || {}).map(([status, count]) => {
            const colors = {
              Contacted: "bg-blue-100 text-blue-800 border-blue-200",
              Ongoing: "bg-yellow-100 text-yellow-800 border-yellow-200",
              Success: "bg-green-100 text-green-800 border-green-200",
              Fail: "bg-red-100 text-red-800 border-red-200",
              Closed: "bg-gray-100 text-gray-800 border-gray-200",
            };
            return (
              <div
                key={status}
                className={`p-4 rounded-lg border ${colors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
              >
                <p className="text-sm font-medium">{status}</p>
                <p className="text-2xl font-bold">{formatNumber(count)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deals by Month Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Deals Trend</h2>
        {analytics.dealsByMonth && analytics.dealsByMonth.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-64">
              {analytics.dealsByMonth.map((item, index) => {
                const maxVal = getMaxValue(analytics.dealsByMonth);
                const height = ((item.count || 0) / maxVal) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <span className="text-xs text-gray-600 mb-1">{item.count || 0}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {item.month || item._id || `Month ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No trend data available for the selected period</p>
          </div>
        )}
      </div>

      {/* Rate Comparison Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">
                {formatPercentage(analytics.successRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(analytics.successRate || 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Fail Rate</span>
              <span className="font-medium text-red-600">
                {formatPercentage(analytics.failRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(analytics.failRate || 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium text-purple-600">
                {formatPercentage(analytics.completionRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(analytics.completionRate || 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Ongoing Deals</span>
              <span className="font-medium text-yellow-600">
                {formatPercentage(100 - (analytics.completionRate || 0))}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-yellow-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100 - (analytics.completionRate || 0), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
