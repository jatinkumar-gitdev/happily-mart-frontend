import { useState, useEffect } from "react";
import { FiX, FiLock, FiShield } from "react-icons/fi";
import { paymentService } from "../../services/payment.service";
import { useAuthStore } from "../../store/authStore";
import { showError, showSuccess } from "../../utils/toast";

const FIXED_UNLOCK_PRICE =
  parseFloat(import.meta.env.VITE_FIXED_UNLOCK_PRICE) || 4000;

const PaymentModal = ({ isOpen, onClose, post, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadRazorpay();
    }
  }, [isOpen]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!post) return;

    setLoading(true);
    setError("");

    try {
      const orderData = await paymentService.createOrder(post._id);

      if (!orderData.order || !orderData.paymentToken) {
        throw new Error("Invalid order response from server");
      }

      const paymentToken = orderData.paymentToken;

      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: "Happily Mart Platform",
        description: `Unlock: ${post.title}`,
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
            setLoading(true);
            const verificationResult = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentToken: paymentToken,
            });
            showSuccess(
              verificationResult.message ||
                "Payment successful! Contact details unlocked."
            );
            onSuccess?.(verificationResult.unlockedPost, verificationResult.payment);
            onClose();
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
            console.error("Payment verification error:", err);
            showError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. You can try again when ready.");
            showError("Payment cancelled. You can try again when ready.");
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 900,
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
        console.error("Payment failed:", response.error);
      });

      razorpay.open();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to initiate payment";
      setError(errorMessage);
      console.error("Payment initiation error:", err);
      showError(errorMessage);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiShield className="text-green-500" />
            Secure Payment
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900 rounded-full mx-auto mb-4">
            <FiLock className="text-3xl text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">
            {post?.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Unlock to view full details and contact information
          </p>
          <div className="text-center">
            <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              ₹{FIXED_UNLOCK_PRICE}
            </span>
            <p className="text-xs text-gray-500 mt-1">One-time payment</p>
          </div>

          {/* Security badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiShield className="text-green-500" />
              <span>Secured by Razorpay</span>
            </div>
            <div className="flex items-center gap-1">
              <FiLock className="text-green-500" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              </>
            ) : (
              `Pay ₹${FIXED_UNLOCK_PRICE}`
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          Your payment is processed securely. We never store your card details.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
