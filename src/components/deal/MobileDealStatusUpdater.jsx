import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios.config';
import Loader from '../common/Loader';
import { FiCheck, FiX, FiClock, FiArrowRight } from 'react-icons/fi';

const MobileDealStatusUpdater = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateDealStatus = async (status) => {
    try {
      setLoading(true);
      await axios.put(`/api/deals/${id}/status`, {
        status,
        notes: `Quick update via mobile dashboard`
      });
      
      // Navigate back to deals list
      navigate('/deals/mobile');
    } catch (err) {
      setError('Failed to update deal status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiArrowRight className="transform rotate-180" />
            </button>
            <h1 className="text-lg font-bold">Quick Update</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Update Deal Status</h2>
          <p className="text-gray-600 text-center mb-6">
            Tap the appropriate button to quickly update your deal status
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateDealStatus('Ongoing')}
              className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                <FiClock className="text-yellow-600 text-xl" />
              </div>
              <span className="font-medium text-yellow-800">Ongoing</span>
            </button>

            <button
              onClick={() => updateDealStatus('Success')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <FiCheck className="text-green-600 text-xl" />
              </div>
              <span className="font-medium text-green-800">Success</span>
            </button>

            <button
              onClick={() => updateDealStatus('Fail')}
              className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <FiX className="text-red-600 text-xl" />
              </div>
              <span className="font-medium text-red-800">Fail</span>
            </button>

            <button
              onClick={() => updateDealStatus('Closed')}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FiX className="text-gray-600 text-xl" />
              </div>
              <span className="font-medium text-gray-800">Close</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> For Success/Fail status, both parties need to confirm. 
            This quick update will notify the other party to confirm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileDealStatusUpdater;