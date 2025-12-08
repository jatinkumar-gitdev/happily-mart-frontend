import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiFileText, FiTrendingUp, FiRefreshCw, FiActivity, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import adminAxios from '../../core/utils/adminAxios';
import DealStatusTag from '../../../../components/deal/DealStatusTag';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const response = await adminAxios.get(`/admin/analytics/deals?range=${timeRange}`);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    }
  }, [timeRange]);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await adminAxios.get('/admin/analytics/activity?limit=20');
      if (response.data.success) {
        setActivity(response.data.activity);
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchActivity()]);
    setLoading(false);
  }, [fetchAnalytics, fetchActivity]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const formatStatusCounts = (statusCounts) => {
    if (!statusCounts) return [];
    const colorMap = {
      'Contacted': '#3b82f6',
      'Ongoing': '#f59e0b',
      'Success': '#10b981',
      'Fail': '#ef4444',
      'Closed': '#6b7280'
    };
    return statusCounts.map(item => ({
      status: item._id,
      count: item.count,
      color: colorMap[item._id] || '#6b7280'
    }));
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', change, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ value, max, color = '#3b82f6' }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deal': return '🤝';
      case 'post': return '📝';
      case 'user': return '👤';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusDistribution = formatStatusCounts(analytics?.statusCounts);
  const maxStatusCount = statusDistribution.length > 0 
    ? Math.max(...statusDistribution.map(i => i.count)) 
    : 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {['all', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Deals" 
          value={analytics?.totalDeals || 0} 
          icon={FiTrendingUp}
          color="blue"
        />
        <StatCard 
          title="Success Rate" 
          value={`${analytics?.successRate || 0}%`} 
          icon={FiActivity}
          color="green"
          subtitle={`Fail Rate: ${analytics?.failRate || 0}%`}
        />
        <StatCard 
          title="Completion Rate" 
          value={`${analytics?.completionRate || 0}%`} 
          icon={FiFileText}
          color="purple"
        />
        <StatCard 
          title="Chronic Non-Updates" 
          value={analytics?.chronicNonUpdateCount || 0} 
          icon={FiAlertTriangle}
          color="red"
          subtitle={`Penalties: ${analytics?.totalPenaltiesApplied || 0} credits`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Avg Response Time" 
          value={`${analytics?.avgResponseTime || 0} days`} 
          icon={FiActivity}
          color="yellow"
        />
        <StatCard 
          title="Avg Penalty/Deal" 
          value={`${analytics?.avgPenaltyPerDeal || 0}`} 
          icon={FiDollarSign}
          color="orange"
          subtitle="Credits per deal"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Deal Status Distribution</h2>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48 rounded-full border-8 border-blue-500 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">{analytics?.totalDeals || 0}</p>
                <p className="text-gray-500 text-sm">Total Deals</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium w-12 text-right">{item.count}</span>
                  <ProgressBar 
                    value={item.count} 
                    max={maxStatusCount}
                    color={item.color}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Deal Trends</h2>
          {analytics?.dealsByMonth && analytics.dealsByMonth.length > 0 ? (
            <div className="h-64 flex items-end justify-between px-4 space-x-2">
              {analytics.dealsByMonth.map((item, index) => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthLabel = monthNames[item._id.month - 1];
                const maxCount = Math.max(...analytics.dealsByMonth.map(m => m.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                const successHeight = item.count > 0 ? (item.successful / item.count) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="flex items-end justify-center w-full h-48 relative">
                      <div 
                        className="w-full max-w-[40px] bg-blue-200 rounded-t relative overflow-hidden"
                        style={{ height: `${height}%` }}
                      >
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-green-500"
                          style={{ height: `${successHeight}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 mt-2">{monthLabel}</span>
                    <span className="text-xs text-gray-400">{item.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No monthly data available
            </div>
          )}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
              <span className="text-sm">Total Deals</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Successful</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <span className="text-sm text-gray-500">{activity.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activity.length > 0 ? (
                activity.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getActivityIcon(item.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.type === 'deal' && `Deal: ${item.dealId || 'N/A'}`}
                        {item.type === 'post' && `Post: ${item.title}`}
                        {item.type === 'user' && `User: ${item.name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.type === 'deal' && item.title}
                        {item.type === 'post' && item.author}
                        {item.type === 'user' && item.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type === 'deal' && item.participants && (
                        <div>
                          <div>Unlocker: {item.participants.unlocker || 'N/A'}</div>
                          <div>Author: {item.participants.author || 'N/A'}</div>
                        </div>
                      )}
                      {item.type === 'post' && item.author}
                      {item.type === 'user' && (item.companyName || '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.type === 'deal' && item.status && (
                        <DealStatusTag status={item.status} size="xs" />
                      )}
                      {item.type === 'post' && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                      {item.type === 'user' && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.role}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {analytics?.recentDeals && analytics.recentDeals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.recentDeals.slice(0, 6).map((deal, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {deal.post?.title || 'Unknown Post'}
                  </h3>
                  <DealStatusTag status={deal.status} size="xs" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Unlocker: {deal.unlocker?.name || 'N/A'}</div>
                  <div>Author: {deal.author?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-400">
                    {formatTimeAgo(deal.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
