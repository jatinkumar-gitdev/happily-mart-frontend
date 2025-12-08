import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.config';
import { useParams, useNavigate } from 'react-router-dom';

const AdminDealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/deals/admin/${id}`);
      setDeal(response.data.deal);
    } catch (err) {
      setError('Failed to fetch deal details');
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!deal) return <div className="p-4">Deal not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deal Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      {/* Deal Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Deal Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Deal ID</p>
                <p className="font-medium">{deal.dealId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(deal.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expires</p>
                <p className="font-medium">{new Date(deal.expiresAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Credit Adjustments</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Bonus Credits</p>
                <p className="font-medium text-green-600">+{deal.creditAdjustments.bonus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Penalty Credits</p>
                <p className="font-medium text-red-600">-{deal.creditAdjustments.penalty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chronic Non-Update</p>
                <p className="font-medium">{deal.chronicNonUpdate ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Post Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{deal.post.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requirement</p>
                <p className="font-medium">{deal.post.requirement}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{deal.post.category} / {deal.post.subcategory}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{deal.post.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Unlocker (User B)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{deal.unlocker.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{deal.unlocker.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{deal.unlocker.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Masked Contact</p>
              <p className="font-medium">{deal.maskedContacts.unlocker.email}</p>
              <p className="font-medium">{deal.maskedContacts.unlocker.phone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Author (User A)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{deal.author.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{deal.author.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium">{deal.author.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Masked Contact</p>
              <p className="font-medium">{deal.maskedContacts.author.email}</p>
              <p className="font-medium">{deal.maskedContacts.author.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Status History</h2>
        <div className="space-y-4">
          {deal.statusHistory.map((history, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(history.status)}`}>
                  {history.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(history.updatedAt).toLocaleString()}
                </span>
              </div>
              {history.updatedBy && (
                <p className="text-sm text-gray-600 mt-1">
                  Updated by: {history.updatedBy.name || 'System'}
                </p>
              )}
              {history.notes && (
                <p className="mt-2 text-gray-700">{history.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Confirmations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Success Confirmation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Unlocker:</span>
                <span className={deal.confirmations.success.unlocker.confirmed ? 'text-green-600' : 'text-gray-500'}>
                  {deal.confirmations.success.unlocker.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Author:</span>
                <span className={deal.confirmations.success.author.confirmed ? 'text-green-600' : 'text-gray-500'}>
                  {deal.confirmations.success.author.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Fail Confirmation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Unlocker:</span>
                <span className={deal.confirmations.fail.unlocker.confirmed ? 'text-red-600' : 'text-gray-500'}>
                  {deal.confirmations.fail.unlocker.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Author:</span>
                <span className={deal.confirmations.fail.author.confirmed ? 'text-red-600' : 'text-gray-500'}>
                  {deal.confirmations.fail.author.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDealDetails;