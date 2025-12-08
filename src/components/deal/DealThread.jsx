import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios.config';

const DealThread = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/deals/${id}`);
      setDeal(response.data.deal);
    } catch (err) {
      setError('Failed to fetch deal details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await axios.put(`/api/deals/${id}/status`, {
        status: newStatus,
        notes
      });
      
      setDeal(response.data.deal);
      setShowUpdateModal(false);
      setNewStatus('');
      setNotes('');
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!deal) return <div>Deal not found</div>;

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">Deal Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deal.status)}`}>
            {deal.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Post Details</h2>
            <p className="font-medium">{deal.post.title}</p>
            <p className="text-gray-600">{deal.post.requirement}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Your Contact</p>
                <p>{deal.maskedContacts.author.email}</p>
                <p>{deal.maskedContacts.author.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Partner Contact</p>
                <p>{deal.maskedContacts.unlocker.email}</p>
                <p>{deal.maskedContacts.unlocker.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Status History</h2>
          <div className="space-y-3">
            {deal.statusHistory.map((history, index) => (
              <div key={index} className="flex items-start border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex-1">
                  <p className="font-medium">{history.status}</p>
                  <p className="text-sm text-gray-600">
                    Updated by {history.updatedBy?.name || 'System'} on{' '}
                    {new Date(history.updatedAt).toLocaleString()}
                  </p>
                  {history.notes && <p className="mt-1 text-gray-700">{history.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setNewStatus('Ongoing');
              setShowUpdateModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Mark as Ongoing
          </button>
          <button
            onClick={() => {
              setNewStatus('Success');
              setShowUpdateModal(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Mark as Success
          </button>
          <button
            onClick={() => {
              setNewStatus('Fail');
              setShowUpdateModal(true);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Mark as Fail
          </button>
          <button
            onClick={() => {
              setNewStatus('Closed');
              setShowUpdateModal(true);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close Deal
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Deal Status</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Success">Success</option>
                  <option value="Fail">Fail</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this status update..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealThread;