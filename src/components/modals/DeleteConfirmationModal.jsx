import React, { useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const DELETE_REASONS = [
  "Post is no longer available",
  "Posted content is incorrect",
  "Duplicate post",
  "No longer accepting contacts",
  "Changed business requirements",
  "Other reason",
];

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, postTitle, isLoading = false }) => {
  const [confirmText, setConfirmText] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const isConfirmValid = confirmText.toLowerCase() === "delete" && selectedReasons.length > 0;

  const handleReasonChange = (reason) => {
    if (reason === "Other reason") {
      setShowOtherInput(!showOtherInput);
      if (!showOtherInput) {
        setSelectedReasons([...selectedReasons, reason]);
      } else {
        setSelectedReasons(selectedReasons.filter((r) => r !== reason));
      }
    } else {
      if (selectedReasons.includes(reason)) {
        setSelectedReasons(selectedReasons.filter((r) => r !== reason));
      } else {
        setSelectedReasons([...selectedReasons, reason]);
      }
    }
  };

  const handleConfirm = () => {
    if (!isConfirmValid) return;

    const reasons = selectedReasons.includes("Other reason")
      ? [...selectedReasons, ...(otherReason ? [otherReason] : [])].filter((r) => r !== "Other reason")
      : selectedReasons;

    onConfirm(reasons);
    resetModal();
  };

  const resetModal = () => {
    setConfirmText("");
    setSelectedReasons([]);
    setOtherReason("");
    setShowOtherInput(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Post
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You are about to permanently delete <span className="font-semibold">"{postTitle}"</span>.
                This action cannot be undone.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select reason(s) for deletion (required):
                  </label>
                  <div className="space-y-2">
                    {DELETE_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedReasons.includes(reason)}
                          onChange={() => handleReasonChange(reason)}
                          className="w-4 h-4 text-sky-600 rounded focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {reason}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {showOtherInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Please specify (optional):
                    </label>
                    <input
                      type="text"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      placeholder="Enter additional details..."
                      maxLength={200}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type "<span className="font-bold">delete</span>" to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type 'delete' here..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isConfirmValid || isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
