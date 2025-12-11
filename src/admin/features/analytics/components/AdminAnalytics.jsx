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
      // We'll fetch both deal analytics and post analytics
      const [dealResponse, postResponse] = await Promise.all([
        axios.get('/api/deals/admin/analytics'),
        axios.get('/api/posts/admin/analytics')
      ]);
      
      setAnalytics({
        deals: dealResponse.data,
        posts: postResponse.data
      });
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    if (!analytics || !analytics.deals.statusCounts) return 0;
    const item = analytics.deals.statusCounts.find(s => s._id === status);
    return item ? item.count : 0;
  };

  const getCompletionRate = () => {
    if (!analytics) return 0;
    const completed = getStatusCount('Success') + getStatusCount('Fail') + getStatusCount('Closed');
    const total = analytics.deals.totalDeals || 0;
    return total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!analytics) return <div className="p-4">No data available</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
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
          <div className="text-gray-500">Total Posts</div>
          <div className="text-3xl font-bold mt-2">{analytics.posts?.totalPosts || 0}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Active Posts</div>
          <div className="text-3xl font-bold mt-2">{analytics.posts?.activePosts || 0}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Total Prospects</div>
          <div className="text-3xl font-bold mt-2">{analytics.posts?.totalProspects || 0}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Total Contacts</div>
          <div className="text-3xl font-bold mt-2">{analytics.posts?.totalContacts || 0}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500">Avg Contacts/Post</div>
          <div className="text-3xl font-bold mt-2">{analytics.posts?.avgContactsPerPost?.toFixed(1) || 0}</div>
        </div>
      </div>
      
      {/* Deal Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Deal Status Distribution</h2>
        <div className="space-y-4">
          {analytics.deals.statusCounts.map((status) => (
            <div key={status._id}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{status._id}</span>
                <span>{status.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${analytics.deals.totalDeals > 0 ? (status.count / analytics.deals.totalDeals) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Creator Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Creator Performance</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Creators</span>
              <span className="font-medium">{analytics.posts?.totalCreators || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Top Creators</span>
              <span className="font-medium">{analytics.posts?.topCreators?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Posts/Creator</span>
              <span className="font-medium">{analytics.posts?.avgPostsPerCreator?.toFixed(1) || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Prospect Engagement</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Active Prospects</span>
              <span className="font-medium">{analytics.posts?.activeProspects || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Returning Prospects</span>
              <span className="font-medium">{analytics.posts?.returningProspects || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion Rate</span>
              <span className="font-medium">
                {analytics.posts?.totalViews > 0 
                  ? ((analytics.posts?.totalContacts / analytics.posts?.totalViews) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badge Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Creator Badge Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">10+</div>
            <div className="text-gray-600">Bronze</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.posts?.badgeDistribution?.bronze || 0} creators
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">20+</div>
            <div className="text-gray-600">Silver</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.posts?.badgeDistribution?.silver || 0} creators
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">50+</div>
            <div className="text-gray-600">Gold</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.posts?.badgeDistribution?.gold || 0} creators
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">100+</div>
            <div className="text-gray-600">Platinum</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.posts?.badgeDistribution?.platinum || 0} creators
            </div>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">150+</div>
            <div className="text-gray-600">Diamond</div>
            <div className="text-sm text-gray-500 mt-1">
              {analytics.posts?.badgeDistribution?.diamond || 0} creators
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
    </div>
  );
};

export default AdminAnalytics;