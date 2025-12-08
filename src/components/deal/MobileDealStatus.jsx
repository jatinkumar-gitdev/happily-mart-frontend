import React, { useState } from 'react';
import axios from '../../api/axios.config';

const MobileDealStatus = ({ deal, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    try {
      setLoading(true);
      const response = await axios.put(`/api/deals/${deal._id}/status`, {
        status: newStatus,
        notes
      });
      
      onUpdate(response.data.deal);
      setShowActions(false);
      setNewStatus('');
      setNotes('');
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Contacted': return 'bg-blue-500';
      case 'Ongoing': return 'bg-yellow-500';
      case 'Success': return 'bg-green-500';
      case 'Fail': return 'bg-red-500';
      case 'Closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      {/* Deal Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{deal.post.title}</h3>
            <p className="text-sm text-gray-500">{deal.post.requirement}</p>
          </div>
          <span className={`w-3 h-3 rounded-full ${getStatusColor(deal.status)}`}></span>
        </div>
      </div>

      {/* Deal Info */}
      <div className="p-4 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="font-medium">{deal.status}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Created</span>
          <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Partner</span>
          <span>
            {deal.unlocker._id === localStorage.getItem('userId') 
              ? deal.author.name 
              : deal.unlocker.name}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4">
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium"
        >
          {showActions ? 'Cancel' : 'Update Status'}
        </button>

        {/* Actions Panel */}
        {showActions && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes..."
              />
            </div>
            
            <button
              onClick={handleStatusUpdate}
              disabled={loading || !newStatus}
              className={`w-full py-2 rounded-lg font-medium ${
                loading || !newStatus
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {loading ? 'Updating...' : 'Confirm Update'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDealStatus;