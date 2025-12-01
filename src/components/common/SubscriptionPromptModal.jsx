import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiLock, FiStar, FiAward, FiArrowRight, FiX } from "react-icons/fi";
import Button from "./Button";
import { showError, showInfo } from "../../utils/toast";

const SubscriptionPromptModal = ({ 
  isOpen, 
  onClose, 
  post, 
  userTier, 
  userPoints,
  currentPoints,
  onSubscribe
}) => {
  if (!isOpen) return null;

  const isLockedByTier = post.requiredTier && post.unlockType === "subscription";
  const isLockedByPoints = post.requiredPoints > 0 && post.unlockType === "points";

  const tierHierarchy = {
    free: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    diamond: 4,
  };

  const userTierLevel = tierHierarchy[userTier] || 0;
  const requiredTierLevel = tierHierarchy[post.requiredTier] || 0;
  const isUserEligible = userTierLevel >= requiredTierLevel;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {isLockedByTier ? "Subscription Required" : "Points Required"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            <span className="font-semibold">{post.title}</span> requires:
          </p>

          {isLockedByTier && (
            <div className="flex items-center gap-2 mb-2">
              <FiAward className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {post.requiredTier} Tier or Higher
              </span>
            </div>
          )}

          {isLockedByPoints && (
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-500" />
              <span className="text-gray-800 dark:text-gray-200">
                {post.requiredPoints} Points Required
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (You have: {userPoints})
              </span>
            </div>
          )}
        </div>

        {isLockedByTier && !isUserEligible && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-900 dark:text-indigo-200 mb-3">
              Your current tier: <span className="font-bold capitalize">{userTier}</span>
            </p>
            <p className="text-sm text-indigo-800 dark:text-indigo-300">
              Upgrade to <span className="font-bold capitalize">{post.requiredTier}</span> or higher to access this content.
            </p>
          </div>
        )}

        {isLockedByPoints && userPoints < post.requiredPoints && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-200 mb-2">
              You need <span className="font-bold">{post.requiredPoints - userPoints}</span> more points
            </p>
            <div className="w-full bg-yellow-200 dark:bg-yellow-900 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-2 bg-yellow-500"
                style={{ width: `${(userPoints / post.requiredPoints) * 100}%` }}
              />
            </div>
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              {userPoints} / {post.requiredPoints} points
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={onSubscribe}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg py-3 font-semibold flex items-center justify-center gap-2"
          >
            {isUserEligible || (userPoints >= post.requiredPoints)
              ? "Access Content"
              : "View Plans"}
            <FiArrowRight />
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
          {isLockedByTier
            ? "Access premium content by upgrading your subscription plan"
            : "Unlock more content with subscription points"}
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPromptModal;
