import React from "react";
import { FiCalendar, FiRefreshCw, FiCheckCircle, FiXCircle } from "react-icons/fi";
import DealProgressIndicator from "./DealProgressIndicator";

const PostDealInfo = ({ 
  deal, 
  onStatusUpdate, 
  showProgress = true, 
  compact = false,
  isLoading = false 
}) => {
  if (!deal) return null;

  const getDaysSinceUnlocked = () => {
    if (!deal.createdAt) return 0;
    const unlockDate = new Date(deal.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - unlockDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceUnlocked = getDaysSinceUnlocked();

  const canUpdateStatus = deal.status !== "Closed" && deal.status !== "Success" && deal.status !== "Fail";

  const handleQuickUpdate = (newStatus) => {
    if (onStatusUpdate && canUpdateStatus) {
      onStatusUpdate(deal._id || deal.id, newStatus);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-500">
          {daysSinceUnlocked}d ago
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <FiCalendar className="w-4 h-4" />
          <span>{daysSinceUnlocked} days since unlocked</span>
        </div>
      </div>

      {showProgress && (
        <DealProgressIndicator status={deal.status} size="sm" />
      )}

      {canUpdateStatus && onStatusUpdate && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 mr-2">Quick update:</span>
          
          {deal.status === "Contacted" && (
            <button
              onClick={() => handleQuickUpdate("Ongoing")}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <FiRefreshCw className="w-3 h-3" />
              Mark Ongoing
            </button>
          )}
          
          {(deal.status === "Contacted" || deal.status === "Ongoing") && (
            <>
              <button
                onClick={() => handleQuickUpdate("Success")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                <FiCheckCircle className="w-3 h-3" />
                Success
              </button>
              <button
                onClick={() => handleQuickUpdate("Fail")}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                <FiXCircle className="w-3 h-3" />
                Failed
              </button>
            </>
          )}
        </div>
      )}

      {deal.chronicNonUpdate && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <FiXCircle className="w-4 h-4" />
          <span>Chronic non-update warning</span>
        </div>
      )}
    </div>
  );
};

export default PostDealInfo;
