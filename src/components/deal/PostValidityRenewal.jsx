import React, { useState } from "react";
import { FiCalendar, FiAlertCircle, FiCheck } from "react-icons/fi";
import { dealsService } from "../../services/deals.service";
import { showError, showSuccess } from "../../utils/toast";

const PostValidityRenewal = ({ post, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValidity, setSelectedValidity] = useState("7");
  const [loading, setLoading] = useState(false);

  // Check if post is expired
  const isExpired = post.expiresAt && new Date() > new Date(post.expiresAt);
  
  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!post.expiresAt) return 0;
    const now = new Date();
    const expiryDate = new Date(post.expiresAt);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysLeft = getDaysUntilExpiry();
  const showWarning = daysLeft <= 3 && daysLeft > 0;

  const handleRenew = async () => {
    try {
      setLoading(true);
      const response = await dealsService.updatePostValidity(
        post._id,
        parseInt(selectedValidity)
      );
      
      showSuccess(response.message);
      setIsOpen(false);
      
      if (onSuccess) {
        onSuccess(response.post);
      }
    } catch (error) {
      showError(error.message || "Failed to renew validity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Warning Badge */}
      {(showWarning || isExpired) && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          isExpired
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }`}>
          <FiAlertCircle className="w-4 h-4" />
          {isExpired ? "Expired" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </div>
      )}

      {/* Renewal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isExpired
            ? "bg-red-600 hover:bg-red-700 text-white"
            : showWarning
            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        }`}
      >
        <FiCalendar className="inline-block w-4 h-4 mr-2" />
        {isExpired ? "Renew Post" : "Extend"}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Renew Post Validity
            </h3>

            {isExpired && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ Your post has expired and is no longer visible to prospects. Renew to make it visible again.
                </p>
              </div>
            )}

            {showWarning && !isExpired && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⏰ Your post will expire soon. Renew to keep it active!
                </p>
              </div>
            )}

            {/* Current validity info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Validity</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {post.validityPeriod} days
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Expires: {new Date(post.expiresAt).toLocaleDateString()}
              </p>
            </div>

            {/* Validity options */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select New Validity Period
              </p>
              <div className="space-y-2">
                {["7", "15", "30"].map((days) => (
                  <label key={days} className="flex items-center">
                    <input
                      type="radio"
                      name="validity"
                      value={days}
                      checked={selectedValidity === days}
                      onChange={(e) => setSelectedValidity(e.target.value)}
                      className="w-4 h-4 text-sky-600"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      {days} days
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info about points */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 Renewing validity {isExpired ? "deducts 1 subscription point" : "may deduct points"} based on your subscription plan.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Renewing...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Renew Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostValidityRenewal;
