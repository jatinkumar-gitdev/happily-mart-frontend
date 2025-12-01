import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../../services/subscription.service";
import SubscriptionPlans from "./SubscriptionPlans";
import { FiTrendingUp, FiAward, FiZap, FiStar, FiGift, FiChevronRight } from "react-icons/fi";
import Button from "../common/Button";

const getTierBadgeColor = (tier) => {
  switch (tier?.toLowerCase()) {
    case "diamond":
      return "bg-gradient-to-r from-indigo-500 to-purple-600";
    case "gold":
      return "bg-gradient-to-r from-yellow-400 to-orange-500";
    case "silver":
      return "bg-gradient-to-r from-gray-300 to-gray-500";
    case "bronze":
      return "bg-gradient-to-r from-amber-500 to-amber-700";
    default:
      return "bg-gradient-to-r from-green-400 to-green-600";
  }
};

const getTierIcon = (tier) => {
  switch (tier?.toLowerCase()) {
    case "diamond":
      return <FiAward className="w-5 h-5" />;
    case "gold":
      return <FiStar className="w-5 h-5" />;
    case "silver":
      return <FiTrendingUp className="w-5 h-5" />;
    case "bronze":
      return <FiZap className="w-5 h-5" />;
    default:
      return <FiGift className="w-5 h-5" />;
  }
};

const SubscriptionTab = ({ profile }) => {
  const [showUpgradePlans, setShowUpgradePlans] = useState(false);

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => subscriptionService.getMySubscriptions(),
  });

  const points = profile?.subscriptionPoints || 0;
  const totalPurchased = profile?.totalPointsPurchased || 0;
  const totalUsed = profile?.totalPointsUsed || 0;
  const currentTier = profile?.tier || "free";
  const subscriptionHistory = subscriptionData?.subscriptionHistory || [];

  // Calculate progress to next tier (Diamond is max)
  const progressPercentage = Math.min(100, Math.round((points / 40) * 100));

  const tierLevels = {
    free: { name: "Free", minPoints: 0, color: "bg-green-500" },
    bronze: { name: "Bronze", minPoints: 1, color: "bg-amber-600" },
    silver: { name: "Silver", minPoints: 5, color: "bg-gray-500" },
    gold: { name: "Gold", minPoints: 12, color: "bg-yellow-500" },
    diamond: { name: "Diamond", minPoints: 40, color: "bg-indigo-600" },
  };

  return (
    <div className="space-y-6">
      {/* Current Tier Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Subscription & Points
        </h2>

        {/* Tier Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Tier Card */}
          <div className={`${getTierBadgeColor(currentTier)} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium opacity-90">Current Tier</p>
                <h3 className="text-3xl font-bold capitalize mt-1">{currentTier}</h3>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                {getTierIcon(currentTier)}
              </div>
            </div>
            {profile?.currentSubscription?.purchasedAt && (
              <p className="text-sm opacity-90">
                Purchased on{" "}
                {new Date(profile.currentSubscription.purchasedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Points Summary */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              Points Summary
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Available</span>
                <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {points}
                </span>
              </div>
              <div className="border-t border-sky-200 dark:border-sky-800 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Total Purchased</span>
                  <span className="font-semibold">{totalPurchased}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Total Used</span>
                  <span className="font-semibold">{totalUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress to Diamond Tier
            </p>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {points}/40 points
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {40 - points <= 0
              ? "You have reached the maximum tier!"
              : `${40 - points} more points to unlock Diamond tier`}
          </p>
        </div>

        {/* Tier Breakdown */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Available Tiers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(tierLevels).map(([key, tier]) => {
              const isCurrentTier = key === currentTier;
              const isAchieved = points >= tier.minPoints && key !== "free" || key === "free";
              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrentTier
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                      : isAchieved
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <div
                    className={`${tier.color} rounded-full w-8 h-8 flex items-center justify-center text-white mb-2 mx-auto`}
                  >
                    {getTierIcon(key)}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white text-center capitalize">
                    {tier.name}
                  </p>
                  {tier.minPoints > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {tier.minPoints} pts
                    </p>
                  )}
                  {isCurrentTier && (
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-bold text-center mt-1">
                      Current
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Button */}
        {currentTier !== "diamond" && (
          <div className="mb-8">
            <Button
              onClick={() => setShowUpgradePlans(!showUpgradePlans)}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:shadow-lg py-3 font-semibold flex items-center justify-center gap-2"
            >
              {showUpgradePlans ? "Hide Plans" : "Upgrade Your Plan"}
              <FiChevronRight />
            </Button>
          </div>
        )}

        {/* Subscription Plans */}
        {showUpgradePlans && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <SubscriptionPlans
              onClose={() => setShowUpgradePlans(false)}
              showAllPlans={false}
            />
          </div>
        )}
      </div>

      {/* Subscription History */}
      {subscriptionHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Subscription History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Points
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptionHistory.map((sub, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white capitalize ${
                          sub.plan === "diamond"
                            ? "bg-indigo-600"
                            : sub.plan === "gold"
                            ? "bg-yellow-500"
                            : sub.plan === "silver"
                            ? "bg-gray-500"
                            : sub.plan === "bronze"
                            ? "bg-amber-600"
                            : "bg-green-500"
                        }`}
                      >
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {sub.points}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {sub.amount === 0
                        ? "Free"
                        : `${sub.currency === "INR" ? "₹" : "$"}${sub.amount}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(sub.purchasedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {subscriptionHistory.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FiGift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No subscription purchases yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Upgrade your plan to unlock more features and points
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTab;
