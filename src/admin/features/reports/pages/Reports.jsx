import React, { useState, useEffect, useCallback } from 'react';
import { FiFlag, FiAlertTriangle, FiUsers, FiActivity, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import adminAxios from '../../core/utils/adminAxios';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('penalties');
  const [analytics, setAnalytics] = useState(null);
  const [chronicUsers, setChronicUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await adminAxios.get('/admin/analytics/deals');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
        
        const chronicDeals = response.data.analytics.recentDeals?.filter(
          deal => deal.chronicNonUpdate
        ) || [];
        
        const userMap = new Map();
        chronicDeals.forEach(deal => {
          const unlocker = deal.unlocker;
          if (unlocker) {
            const existing = userMap.get(unlocker._id);
            if (existing) {
              existing.count += 1;
              existing.deals.push(deal);
            } else {
              userMap.set(unlocker._id, {
                user: unlocker,
                count: 1,
                deals: [deal]
              });
            }
          }
        });
        
        setChronicUsers(Array.from(userMap.values()).sort((a, b) => b.count - a.count));
      }
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
      setError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const MetricCard = ({ title, value, icon: Icon, color = 'blue', description }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports & System Health</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Deals" 
          value={analytics?.totalDeals || 0}
          icon={FiActivity}
          color="blue"
        />
        <MetricCard 
          title="Success Rate" 
          value={`${analytics?.successRate || 0}%`}
          icon={FiCheckCircle}
          color="green"
        />
        <MetricCard 
          title="Fail Rate" 
          value={`${analytics?.failRate || 0}%`}
          icon={FiXCircle}
          color="red"
        />
        <MetricCard 
          title="Chronic Non-Updates" 
          value={analytics?.chronicNonUpdateCount || 0}
          icon={FiAlertTriangle}
          color="orange"
          description="Deals with no status updates"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <TabButton id="penalties" label="Deal Penalties" icon={FiAlertTriangle} isActive={activeTab === 'penalties'} />
        <TabButton id="chronic" label="Chronic Non-Updaters" icon={FiUsers} isActive={activeTab === 'chronic'} />
        <TabButton id="health" label="System Health" icon={FiActivity} isActive={activeTab === 'health'} />
        <TabButton id="reports" label="User Reports" icon={FiFlag} isActive={activeTab === 'reports'} />
      </div>

      {activeTab === 'penalties' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Deal Penalties Report</h2>
            <p className="text-gray-500 text-sm mt-1">Overview of penalties applied due to non-compliance</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">Total Penalties Applied</p>
                <p className="text-3xl font-bold text-red-700">{analytics?.totalPenaltiesApplied || 0}</p>
                <p className="text-red-500 text-xs mt-1">Credits deducted</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-orange-600 text-sm font-medium">Avg Penalty Per Deal</p>
                <p className="text-3xl font-bold text-orange-700">{analytics?.avgPenaltyPerDeal || 0}</p>
                <p className="text-orange-500 text-xs mt-1">Credits per deal</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-yellow-600 text-sm font-medium">Avg Response Time</p>
                <p className="text-3xl font-bold text-yellow-700">{analytics?.avgResponseTime || 0}</p>
                <p className="text-yellow-500 text-xs mt-1">Days to completion</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics?.statusCounts?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {analytics?.totalDeals > 0 
                          ? `${((item.count / analytics.totalDeals) * 100).toFixed(1)}%`
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chronic' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chronic Non-Update Users</h2>
            <p className="text-gray-500 text-sm mt-1">Users who frequently fail to update deal status</p>
          </div>
          <div className="p-6">
            {chronicUsers.length > 0 ? (
              <div className="space-y-4">
                {chronicUsers.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <FiUsers className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.user.name}</p>
                          <p className="text-sm text-gray-500">{item.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          {item.count} non-updates
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {item.deals.slice(0, 3).map((deal, dealIndex) => (
                        <div key={dealIndex} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">{deal.post?.title || 'Unknown Post'}</span>
                      
                        </div>
                      ))}
                      {item.deals.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{item.deals.length - 3} more deals
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Chronic Non-Updaters</h3>
                <p className="text-gray-500 mt-1">All users are keeping their deals updated</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">System Health Metrics</h2>
            <p className="text-gray-500 text-sm mt-1">Platform performance and health indicators</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Deal Completion Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-medium">{analytics?.completionRate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics?.completionRate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">{analytics?.successRate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics?.successRate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Fail Rate</span>
                      <span className="font-medium text-red-600">{analytics?.failRate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics?.failRate || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Response Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Average Response Time</span>
                    <span className="font-bold text-lg">{analytics?.avgResponseTime || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Chronic Non-Updates</span>
                    <span className="font-bold text-lg text-orange-600">
                      {analytics?.chronicNonUpdateCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Total Penalties</span>
                    <span className="font-bold text-lg text-red-600">
                      {analytics?.totalPenaltiesApplied || 0} credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analytics?.dealsByMonth && analytics.dealsByMonth.length > 0 && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Monthly Deal Volume</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {analytics.dealsByMonth.map((item, index) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const maxCount = Math.max(...analytics.dealsByMonth.map(m => m.count));
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="relative w-full flex justify-center">
                          <div 
                            className="w-8 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                            style={{ height: `${height * 1.5}px` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {monthNames[item._id.month - 1]}
                        </span>
                        <span className="text-xs font-medium">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">User Reports</h2>
            <p className="text-gray-500 text-sm mt-1">Reported posts and users requiring review</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <FiFlag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Active Reports</h3>
              <p className="text-gray-500 mt-1">There are currently no pending user reports to review</p>
              <p className="text-gray-400 text-sm mt-4">
                Reports will appear here when users flag content or other users for review
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
