import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios.config';
import Loader from '../common/Loader';
import { FiRefreshCw, FiFilter, FiChevronRight } from 'react-icons/fi';

const MobileDealDashboardEnhanced = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeals();
    fetchStats();
  }, [filter]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/deals', {
        params: { 
          status: filter === 'all' ? undefined : filter,
          role: 'all'
        }
      });
      setDeals(response.data.deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/deals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDealClick = (dealId) => {
    navigate(`/deals/${dealId}`);
  };
  
  const handleQuickUpdateClick = (dealId) => {
    navigate(`/deals/${dealId}/update`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Fail': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tagStatus) => {
    switch (tagStatus) {
      case 'New': return 'bg-purple-100 text-purple-800';
      case 'Hot': return 'bg-red-100 text-red-800';
      case 'Warm': return 'bg-orange-100 text-orange-800';
      case 'Cold': return 'bg-blue-100 text-blue-800';
      case 'Stale': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysSinceCreated = (createdAt) => {
    const days = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgressPercentage = (createdAt, expiresAt) => {
    const totalDuration = new Date(expiresAt) - new Date(createdAt);
    const elapsed = new Date() - new Date(createdAt);
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">My Deals</h1>
            <button 
              onClick={fetchDeals}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiRefreshCw />
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{stats.stats?.Contacted || 0}</p>
              <p className="text-xs text-gray-600">Contacted</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{stats.stats?.Ongoing || 0}</p>
              <p className="text-xs text-gray-600">Ongoing</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold">{(stats.stats?.Success || 0) + (stats.stats?.Fail || 0)}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All Deals
            </button>
            <button
              onClick={() => setFilter('Contacted,Ongoing')}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                filter === 'Contacted,Ongoing' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('Success,Fail,Closed')}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                filter === 'Success,Fail,Closed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="p-4">
        {deals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No deals yet</h3>
            <p className="text-gray-500">Unlock posts to start deals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div 
                key={deal._id} 
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    className="font-semibold text-gray-900 truncate flex-1 mr-2 cursor-pointer"
                    onClick={() => handleDealClick(deal._id)}
                  >
                    {deal.post.title}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </span>
                    <span className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(deal.tagStatus)}`}>
                      {deal.tagStatus}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {deal.post.requirement}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${getProgressPercentage(deal.createdAt, deal.expiresAt)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{getDaysSinceCreated(deal.createdAt)} days</span>
                    <span>90 days</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      Deal ID: {deal.dealId}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleQuickUpdateClick(deal._id)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Quick Update
                    </button>
                    <div 
                      className="flex items-center text-xs text-gray-500 cursor-pointer"
                      onClick={() => handleDealClick(deal._id)}
                    >
                      <span>
                        {deal.unlocker._id === localStorage.getItem('userId') 
                          ? `With ${deal.author.name}` 
                          : `From ${deal.unlocker.name}`}
                      </span>
                      <FiChevronRight className="ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDealDashboardEnhanced;