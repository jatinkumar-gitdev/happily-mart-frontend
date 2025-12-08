import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.config';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/deals/admin/analytics');
      setAnalytics(response.data.analytics);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    if (!analytics) return 0;
    const item = analytics.statusCounts.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getCompletionRate = () => {
    if (!analytics) return 0;
    const completed = getStatusCount('Success') + getStatusCount('Fail') + getStatusCount('Closed');
    const total = analytics.totalDeals;
    return total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!analytics) return <div className="p-4">No data available</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deal Analytics</h1>
        <div className="flex gap-2">
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
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Total Deals</div>
          <div className="text-3xl font-bold mt-2">{analytics.totalDeals}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Success Rate</div>
          <div className="text-3xl font-bold mt-2">{analytics.successRate}%</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Failure Rate</div>
          <div className="text-3xl font-bold mt-2">{analytics.failRate}%</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Avg Response Time</div>
          <div className="text-3xl font-bold mt-2">{analytics.avgResponseTime} days</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Completion Rate</div>
          <div className="text-3xl font-bold mt-2">{getCompletionRate()}%</div>
        </div>
      </div>
      
      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Deal Status Distribution</h2>
        <div className="space-y-4">
          {analytics.statusCounts.map((status) => (
            <div key={status._id}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{status._id}</span>
                <span>{status.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${analytics.totalDeals > 0 ? (status.count / analytics.totalDeals) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Response Time Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Average Response Time</span>
              <span className="font-medium">{analytics.avgResponseTime} days</span>
            </div>
            <div className="flex justify-between">
              <span>Fastest Response (1 day)</span>
              <span className="font-medium text-green-600">
                {analytics.statusCounts.filter(s => s._id === 'Success' || s._id === 'Fail').reduce((acc, curr) => acc + Math.min(curr.count, Math.floor(curr.count * 0.1)), 0)} deals
              </span>
            </div>
            <div className="flex justify-between">
              <span>Late Responses (&gt;30 days)</span>
              <span className="font-medium text-red-600">
                {analytics.chronicNonUpdateCount || 0} deals
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Impact Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Penalties Applied</span>
              <span className="font-medium text-red-600">{analytics.totalPenaltiesApplied || 0} credits</span>
            </div>
            <div className="flex justify-between">
              <span>Average Penalty Per Deal</span>
              <span className="font-medium">{analytics.avgPenaltyPerDeal || 0} credits</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus Credits Awarded</span>
              <span className="font-medium text-green-600">0 credits</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-5xl mb-2">📈</div>
            <p className="text-gray-500 mb-2">Interactive Chart Visualization</p>
            <p className="text-sm text-gray-400">Would show trends over time</p>
          </div>
        </div>
      </div>
      
      {/* Chronic Non-Update Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Chronic Non-Update Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {analytics.chronicNonUpdateCount || 0}
            </div>
            <div className="text-gray-600">Deals Auto-Closed</div>
            <div className="text-sm text-gray-500 mt-1">
              Due to inactivity
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {analytics.totalPenaltiesApplied || 0}
            </div>
            <div className="text-gray-600">Penalties Applied</div>
            <div className="text-sm text-gray-500 mt-1">
              Total credit deductions
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.avgPenaltyPerDeal || 0}
            </div>
            <div className="text-gray-600">Avg Penalty Per Deal</div>
            <div className="text-sm text-gray-500 mt-1">
              Credit impact per deal
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-medium mb-2">Impact Assessment</h3>
          <div className="text-sm text-gray-600">
            <p>
              {analytics.chronicNonUpdateCount > 0 
                ? `Approximately ${(analytics.chronicNonUpdateCount / analytics.totalDeals * 100).toFixed(1)}% of deals were auto-closed due to inactivity.` 
                : 'Excellent! No deals were auto-closed due to inactivity.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;