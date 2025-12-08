import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.config';

const AdminDealsManagement = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);

  useEffect(() => {
    fetchDeals();
  }, [filter, sortBy, sortOrder, page]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/deals/admin/all', {
        params: { 
          status: filter !== 'all' ? filter : undefined,
          sortBy,
          sortOrder,
          page,
          limit: 10
        }
      });
      setDeals(response.data.deals);
      setTotalPages(response.data.pages);
      setTotalDeals(response.data.total);
    } catch (err) {
      setError('Failed to fetch deals');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDeals();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deal Management</h1>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Total Deals</div>
          <div className="text-2xl font-bold">{totalDeals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Active Deals</div>
          <div className="text-2xl font-bold">{deals.filter(d => ['Contacted', 'Ongoing'].includes(d.status)).length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Successful Deals</div>
          <div className="text-2xl font-bold">{deals.filter(d => d.status === 'Success').length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">Failed Deals</div>
          <div className="text-2xl font-bold">{deals.filter(d => d.status === 'Fail').length}</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search by post title..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </form>
          
          <div className="flex flex-wrap gap-2">
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
            {['Contacted', 'Ongoing', 'Success', 'Fail', 'Closed'].map((status) => (
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
        </div>
      </div>
      
      {/* Deals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('dealId')}
                >
                  Deal ID {sortBy === 'dealId' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('post.title')}
                >
                  Post {sortBy === 'post.title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => {
                        // View deal details
                        window.location.href = `/admin/deals/${deal._id}`;
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-900"
                      onClick={() => {
                        // Edit deal status
                        console.log('Edit deal', deal._id);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No deals found</p>
          </div>
        )}
        
        {/* Pagination */}
        {deals.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 10, totalDeals)}</span> of{' '}
              <span className="font-medium">{totalDeals}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 text-sm rounded ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 text-sm rounded ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDealsManagement;