import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.config';
import { Link } from 'react-router-dom';

const DealsDashboard = () => {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDeals();
    fetchStats();
  }, [filter]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/deals', {
        params: { status: filter !== 'all' ? filter : undefined }
      });
      setDeals(response.data.deals);
    } catch (err) {
      setError('Failed to fetch deals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/deals/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Deals</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(stats).map(([status, count]) => (
            <div 
              key={status} 
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFilter(status)}
            >
              <div className="text-sm text-gray-500 capitalize">{status}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Deals
          </button>
          {Object.keys(stats).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === status 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Deals List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {deals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No deals found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deals.map((deal) => (
                <Link 
                  key={deal._id} 
                  to={`/deals/${deal._id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{deal.post.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {deal.post.requirement}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Created {new Date(deal.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {deal.unlocker._id === localStorage.getItem('userId') 
                          ? `With ${deal.author.name}` 
                          : `From ${deal.unlocker.name}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealsDashboard;