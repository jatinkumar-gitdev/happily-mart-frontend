import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MainLayout from "../components/layout/MainLayout";
import { subscriptionService } from "../services/subscription.service";
import { showSuccess, showError, showInfo } from "../utils/toast";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { SUBSCRIPTION_FEATURES, PLAN_LIMITS } from "../data/subscriptionPlans";
import {
  FiCheck,
  FiAward,
  FiZap,
  FiStar,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiRefreshCw,
  FiUnlock,
  FiEdit3,
} from "react-icons/fi";

const Subscription = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [loadingPlanName, setLoadingPlanName] = useState(null);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => subscriptionService.getPlans(),
  });

  const { data: mySubscriptionData, isLoading: subscriptionLoading } = useQuery(
    {
      queryKey: ["mySubscription"],
      queryFn: () => subscriptionService.getMySubscription(),
    }
  );

  const plans = plansData?.plans || [];
  const mySubscription = mySubscriptionData?.subscription || {};

  const handlePurchase = async (plan) => {
    if (plan.name === "Free") {
      showError("Free plan is already active by default");
      return;
    }

    // Show toast when clicking purchase
    showInfo(`Initiating purchase for ${plan.displayName}...`);
    
    setLoadingPlanName(plan.name);

    try {
      // Create order
      const orderData = await subscriptionService.createOrder(
        plan.name,
        selectedCurrency
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Happily Mart",
        description: `${plan.displayName} Subscription`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyData = await subscriptionService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: plan.name,
              currency: selectedCurrency,
              amount: orderData.plan.price,
            });

            const totalCredits = verifyData.user?.credits || 0;
            const unlockCredits = verifyData.user?.unlockCredits || 0;
            const createCredits = verifyData.user?.createCredits || 0;
            
            showSuccess(
              `${plan.displayName} activated! Total: ${totalCredits} points (Unlock: ${unlockCredits}, Create: ${createCredits})`
            );
            queryClient.invalidateQueries(["mySubscription"]);
            queryClient.invalidateQueries(["profile"]);
            setLoadingPlanName(null);
          } catch (error) {
            showError(
              error.response?.data?.message || "Payment verification failed"
            );
            setLoadingPlanName(null);
          }
        },
        prefill: {
          name: mySubscription?.user?.name || "",
          email: mySubscription?.user?.email || "",
        },
        theme: {
          color: "#0EA5E9",
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanName(null);
            showInfo("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        showError(response.error.description || "Payment failed");
        setLoadingPlanName(null);
      });
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create order");
      setLoadingPlanName(null);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case "Free":
        return <FiShield className="w-6 h-6" />;
      case "Beginner":
        return <FiZap className="w-6 h-6" />;
      case "Intermediate":
        return <FiStar className="w-6 h-6" />;
      case "Advanced":
        return <FiAward className="w-6 h-6" />;
      default:
        return <FiShield className="w-6 h-6" />;
    }
  };

  // ... existing code ...

  const isCurrentPlan = (planName) => {
    return mySubscription?.currentPlan === planName;
  };

  const getPlanStyle = (planName) => {
    const styles = {
      Free: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        iconBg: "bg-gray-100",
        accent: "text-gray-500",
      },
      Beginner: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        iconBg: "bg-blue-100",
        accent: "text-blue-500",
      },
      Intermediate: {
        bg: "bg-teal-50",
        border: "border-teal-200",
        text: "text-teal-700",
        iconBg: "bg-teal-100",
        accent: "text-teal-500",
      },
      Advanced: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
        iconBg: "bg-indigo-100",
        accent: "text-indigo-500",
      },
    };
    return styles[planName] || styles.Free;
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Minimalist Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-3xl font-medium text-gray-800 mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-600 mb-8">
            Choose the plan that works best for you
          </p>

          {/* Sober Currency Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedCurrency("INR")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCurrency === "INR"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setSelectedCurrency("USD")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCurrency === "USD"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Current Plan Info - Minimal Design */}
        {mySubscription?.currentPlan && (
          <div className="mb-10 bg-white rounded-xl border border-gray-200 p-6 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <FiShield className="text-gray-400" />
                  Current Plan
                </p>
                <h3 className="text-xl font-medium text-gray-900">
                  {mySubscription.displayName || mySubscription.currentPlan}
                </h3>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Unlock Credits</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-medium text-gray-900">
                      {mySubscription.unlockCredits || 0}
                    </p>
                    <FiUnlock className="text-gray-400 text-sm" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Create Credits</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-medium text-gray-900">
                      {mySubscription.createCredits || 0}
                    </p>
                    <FiEdit3 className="text-gray-400 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {mySubscription.expiresAt && !mySubscription.isExpired && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-gray-600 text-sm">
                <FiCalendar className="text-gray-400" />
                <span>
                  Expires on{" "}
                  {new Date(mySubscription.expiresAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "short", day: "numeric" }
                  )}
                </span>
              </div>
            )}

            {mySubscription.isExpired && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-amber-600 text-sm">
                <FiRefreshCw className="text-amber-500" />
                <span>Your subscription has expired. Renew to continue.</span>
              </div>
            )}
          </div>
        )}

        {/* Plans Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price =
              selectedCurrency === "USD" ? plan.priceUSD : plan.priceINR;
            const gst = selectedCurrency === "INR" ? Math.round(price * 0.18) : 0;
            const total = price + gst;
            const isCurrent = isCurrentPlan(plan.name);
            const isPurchasing = loadingPlanName === plan.name;
            const features = SUBSCRIPTION_FEATURES[plan.name] || [];
            const planStyle = getPlanStyle(plan.name);

            return (
              <div
                key={plan._id}
                className={`rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? `ring-2 ring-offset-2 ${planStyle.accent.replace(
                        "text",
                        "ring"
                      )} ${planStyle.border}`
                    : `border-gray-200 hover:border-gray-300 ${planStyle.bg}`
                }`}
              >
                {/* Card Header */}
                <div className={`p-5 border-b ${planStyle.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`inline-flex p-2 rounded-lg ${planStyle.iconBg} ${planStyle.text}`}
                    >
                      {getPlanIcon(plan.name)}
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    {plan.displayName}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-semibold text-gray-900">
                      {selectedCurrency === "USD" ? "$" : "₹"}
                      {price}
                    </span>
                    {plan.duration > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        /{plan.duration}d
                      </span>
                    )}
                  </div>
                  
                  {selectedCurrency === "INR" && price > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        + GST ₹{gst} (18%)
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        Total: ₹{total}
                      </p>
                    </div>
                  )}
                </div>

                {/* Credits */}
                <div className="p-5 border-b border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Unlock Posts
                      </span>
                      <span className="font-medium text-gray-900">
                        {PLAN_LIMITS[plan.name]?.unlockCredits || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Create Posts
                      </span>
                      <span className="font-medium text-gray-900">
                        {PLAN_LIMITS[plan.name]?.createCredits || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-5 flex-grow">
                  <ul className="space-y-3 mb-6">
                    {features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <FiCheck
                          className="text-gray-400 mt-0.5 flex-shrink-0"
                          size={16}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(plan)}
                    disabled={plan.name === "Free" || isPurchasing}
                    className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      plan.name === "Free"
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : `bg-gray-900 text-white hover:bg-gray-800`
                    }`}
                  >
                    {isPurchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : plan.name === "Free" ? (
                      "Default Plan"
                    ) : isCurrent ? (
                      "Purchase More"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Soothing Info Section */}
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Simple & Transparent
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            All plans include access to our community features. Pay only for
            what you need.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <FiZap className="text-gray-400 mx-auto mb-2" size={20} />
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Pay Once
              </h4>
              <p className="text-xs text-gray-600">No recurring charges</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <FiUnlock className="text-gray-400 mx-auto mb-2" size={20} />
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Use Credits
              </h4>
              <p className="text-xs text-gray-600">For posts and creations</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <FiRefreshCw className="text-gray-400 mx-auto mb-2" size={20} />
              <h4 className="font-medium text-gray-900 text-sm mb-1">
                Flexible
              </h4>
              <p className="text-xs text-gray-600">Upgrade anytime</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Subscription;
