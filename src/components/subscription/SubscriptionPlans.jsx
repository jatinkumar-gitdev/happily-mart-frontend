import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "../../services/subscription.service";
import { useAuthStore } from "../../store/authStore";
import {
  FiCheck,
  FiX,
  FiStar,
  FiAward,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import Button from "../common/Button";
import { showError, showSuccess } from "../../utils/toast";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getTierColor = (tier) => {
  switch (tier.toLowerCase()) {
    case "diamond":
      return "from-indigo-500 to-purple-600";
    case "gold":
      return "from-yellow-400 to-orange-500";
    case "silver":
      return "from-gray-300 to-gray-500";
    case "bronze":
      return "from-amber-500 to-amber-700";
    default:
      return "from-green-400 to-green-600";
  }
};

const getTierIcon = (tier) => {
  switch (tier.toLowerCase()) {
    case "diamond":
      return <FiAward className="w-8 h-8" />;
    case "gold":
      return <FiStar className="w-8 h-8" />;
    case "silver":
      return <FiTrendingUp className="w-8 h-8" />;
    case "bronze":
      return <FiZap className="w-8 h-8" />;
    default:
      return <FiCheck className="w-8 h-8" />;
  }
};

const SubscriptionPlans = ({ onClose, showAllPlans = false }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [processingPlan, setProcessingPlan] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [displayPlans, setDisplayPlans] = useState([]);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => subscriptionService.getPlans(),
  });

  const { data: mySubscriptions } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => subscriptionService.getMySubscriptions(),
    enabled: !!user,
  });

  const { data: nextPlans } = useQuery({
    queryKey: ["nextAvailablePlans"],
    queryFn: () => subscriptionService.getNextAvailablePlans(),
    enabled: !!user && !showAllPlans,
  });

  useEffect(() => {
    if (!showAllPlans && nextPlans?.nextAvailablePlans) {
      const plans = nextPlans.nextAvailablePlans.map((p) => ({
        key: p.plan,
        // prefer canonical plan definition from plansData when available,
        // otherwise fall back to the shape returned by nextAvailablePlans
        ...(plansData?.plans?.[p.plan] || p),
      }));
      setDisplayPlans(plans);
    } else if (showAllPlans && plansData?.plans) {
      const plans = Object.entries(plansData.plans).map(([key, value]) => ({
        key,
        ...value,
      }));
      setDisplayPlans(plans);
    }
  }, [plansData, nextPlans, showAllPlans]);

  const purchaseMutation = useMutation({
    mutationFn: async (planKey) => {
      setProcessingPlan(planKey);
      const orderData = await subscriptionService.createOrder(
        planKey,
        currency
      );

      // If backend returns a completed subscription (free plan), resolve immediately
      if (orderData.subscription && !orderData.order) {
        return orderData;
      }

      if (!orderData.order || !orderData.paymentToken) {
        throw new Error("Invalid order response from server");
      }

      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          order_id: orderData.order.id,
          name: "Happily Mart Platform",
          description: `${
            orderData.planDetails?.name || plan.name || planKey
          } Subscription`,
          image: "/logo.png",
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#0EA5E9",
          },
          handler: async (response) => {
            try {
              const verifyData = await subscriptionService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentToken: orderData.paymentToken,
              });
              resolve(verifyData);
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error("Payment cancelled"));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    },
    onSuccess: (data) => {
      const totalCredits = data.user?.credits || 0;
      const unlockCredits = data.user?.unlockCredits || 0;
      const createCredits = data.user?.createCredits || 0;
      
      showSuccess(
        `Subscription activated! Total Points: ${totalCredits} (Unlock: ${unlockCredits}, Create: ${createCredits})`
      );
      queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["nextAvailablePlans"] });
      setProcessingPlan(null);
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    },
    onError: (error) => {
      setProcessingPlan(null);
      showError(
        error.message ||
          error.response?.data?.message ||
          "Failed to process subscription"
      );
    },
  });

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Currency Selector */}
      <div className="mb-6 flex gap-2 justify-center">
        <button
          onClick={() => setCurrency("INR")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currency === "INR"
              ? "bg-sky-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          INR (₹)
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currency === "USD"
              ? "bg-sky-500 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          }`}
        >
          USD ($)
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayPlans.map((plan) => {
          const isCurrentPlan =
            mySubscriptions?.userPoints?.currentSubscription?.plan === plan.key;
          const price = currency === "INR" ? plan.priceINR : plan.priceUSD;
          const gst = currency === "INR" ? Math.round(price * 0.18) : 0;
          const total = price + gst;
          const currencySymbol = currency === "INR" ? "₹" : "$";

          return (
            <div
              key={plan.key}
              className={`relative rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                isCurrentPlan ? "ring-4 ring-sky-500" : ""
              }`}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getTierColor(
                  plan.key
                )} opacity-10`}
              />

              <div className="relative bg-white dark:bg-gray-800 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`bg-gradient-to-br ${getTierColor(
                        plan.key
                      )} p-2 rounded-lg text-white`}
                    >
                      {getTierIcon(plan.key)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <span className="text-xs bg-sky-500 text-white px-2 py-1 rounded">
                          Current Plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {currencySymbol}
                      {price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        one-time
                      </span>
                    )}
                  </div>
                  {currency === "INR" && price > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        + GST {currencySymbol}{gst} (18%)
                      </p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total: {currencySymbol}{total}
                      </p>
                    </div>
                  )}
                  {price === 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Free
                    </p>
                  )}
                </div>

                {/* Points */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <FiStar className="text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {plan.points}
                      </span>{" "}
                      {plan.points === 1 ? "Point" : "Points"}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6 flex-1">
                  <ul className="space-y-2 text-sm">
                    {plan.key === "bronze" && (
                      <>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Free tier access
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Basic badge
                          </span>
                        </li>
                      </>
                    )}
                    {plan.key === "silver" && (
                      <>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Silver badge
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            5 points to unlock posts
                          </span>
                        </li>
                      </>
                    )}
                    {plan.key === "gold" && (
                      <>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Gold badge & avatar
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            12 unlock points
                          </span>
                        </li>
                      </>
                    )}
                    {plan.key === "diamond" && (
                      <>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Premium diamond tier
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">
                            40 premium unlock points
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Button */}
                <Button
                  onClick={() => purchaseMutation.mutate(plan.key)}
                  disabled={
                    purchaseMutation.isLoading ||
                    processingPlan === plan.key
                  }
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    "bg-gradient-to-r " +
                    getTierColor(plan.key) +
                    " text-white hover:shadow-lg"
                  }`}
                >
                  {processingPlan === plan.key
                    ? "Processing..."
                    : price === 0
                    ? "Activate Free"
                    : isCurrentPlan
                    ? "Purchase Again"
                    : "Purchase Now"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {displayPlans.length === 0 && !plansLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You already have the highest tier plan!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Enjoy your premium benefits.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
