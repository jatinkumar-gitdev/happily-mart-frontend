import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.config';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/analytics/deals');
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!analytics) return <div className="p-4">No data available</div>;

  const getStatusCount = (status) => {
    const item = analytics.statusCounts.find(s => s._id === status);
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Cards */}
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
          <div className="text-gray-500">Active Deals</div>
          <div className="text-3xl font-bold mt-2">
            {getStatusCount('Contacted') + getStatusCount('Ongoing')}
          </div>
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
      

      
      {/* Recent Deals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Deals</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deal ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentDeals.map((deal) => (
                <tr key={deal._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deal.dealId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {deal.post.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Unlocker: {deal.unlocker.name}</div>
                      <div>Author: {deal.author.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;