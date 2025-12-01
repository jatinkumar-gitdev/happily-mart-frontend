import { FiLock, FiStar, FiAward, FiCheck } from "react-icons/fi";

const SubscriptionBadge = ({ 
  unlockType, 
  requiredPoints, 
  requiredTier,
  isUnlocked,
  userTier,
  userPoints,
  isOwnPost
}) => {
  if (isUnlocked || isOwnPost) return null;

  // Check if already unlocked by tier
  const tierHierarchy = {
    free: 0,
    bronze: 1,
    silver: 2,
    gold: 3,
    diamond: 4,
  };

  const userTierLevel = tierHierarchy[userTier] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier] || 0;
  const isUnlockedByTier = userTierLevel >= requiredTierLevel;
  const isUnlockedByPoints = (userPoints || 0) >= requiredPoints;

  if (isUnlockedByTier || isUnlockedByPoints) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
        <FiCheck className="w-3 h-3" />
        <span>Unlocked</span>
      </div>
    );
  }

  if (unlockType === "subscription" && requiredTier) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
        <FiAward className="w-3 h-3" />
        <span>{requiredTier}</span>
        <FiLock className="w-3 h-3" />
      </div>
    );
  }

  if (unlockType === "points" && requiredPoints > 0) {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
        <FiStar className="w-3 h-3" />
        <span>{requiredPoints} pts</span>
        <FiLock className="w-3 h-3" />
      </div>
    );
  }

  return null;
};

export default SubscriptionBadge;
