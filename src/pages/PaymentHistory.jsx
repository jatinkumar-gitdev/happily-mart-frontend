import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "../components/layout/MainLayout";
import { subscriptionService } from "../services/subscription.service";
import { showError } from "../utils/toast";
import Loader from "../components/common/Loader";
import Button from "../components/common/Button";
import {
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiPackage,
  FiSearch,
  FiX,
} from "react-icons/fi";

const PaymentHistory = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [highlightedTerm, setHighlightedTerm] = useState("");

  const {
    data: historyData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["subscriptionHistory"],
    queryFn: () => subscriptionService.getHistory(),
  });

  useEffect(() => {
    if (isError) {
      showError(
        error.response?.data?.message || "Failed to load payment history"
      );
    }
  }, [isError, error]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-500 text-xl" />;
      case "failed":
        return <FiXCircle className="text-red-500 text-xl" />;
      case "pending":
        return <FiCreditCard className="text-yellow-500 text-xl" />;
      case "refunded":
        return <FiDollarSign className="text-blue-500 text-xl" />;
      default:
        return <FiPackage className="text-gray-500 text-xl" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case "Free":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "Beginner":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200";
      case "Advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const filteredHistory =
    historyData?.history?.filter(
      (item) =>
        (filter === "all" || item.status === filter) &&
        (searchQuery === "" ||
          item.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.paymentId &&
            item.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.razorpayPaymentId &&
            item.razorpayPaymentId
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (item.razorpayOrderId &&
            item.razorpayOrderId
              .toLowerCase()
              .includes(searchQuery.toLowerCase())))
    ) || [];

  if (isLoading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your subscription payment records and transaction details
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-sky-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Payments
          </Button>
          <Button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg ${
              filter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Completed
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter("failed")}
            className={`px-4 py-2 rounded-lg ${
              filter === "failed"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Failed
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search payments..."
              className="w-full px-3 py-2 pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  // Add search term to history
                  if (
                    e.target.value.trim() &&
                    !searchHistory.includes(e.target.value.trim())
                  ) {
                    setSearchHistory((prev) => [
                      e.target.value.trim(),
                      ...prev.slice(0, 4),
                    ]);
                  }
                }
              }}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(term);
                    // Highlight the search term
                    setHighlightedTerm(term);
                    setTimeout(() => setHighlightedTerm(""), 2000);
                  }}
                  className={`px-2 py-1 text-xs rounded-full ${
                    searchQuery === term
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {historyData?.history?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-sky-100 dark:bg-sky-900/30 mr-3">
                  <FiDollarSign className="text-sky-600 dark:text-sky-400 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Spent
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(
                      historyData.history
                        .filter((item) => item.status === "completed")
                        .reduce((sum, item) => sum + item.amountPaid, 0),
                      "INR"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 mr-3">
                  <FiCheckCircle className="text-green-600 dark:text-green-400 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Successful
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {
                      historyData.history.filter(
                        (item) => item.status === "completed"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/30 mr-3">
                  <FiCreditCard className="text-yellow-600 dark:text-yellow-400 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {
                      historyData.history.filter(
                        (item) => item.status === "pending"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30 mr-3">
                  <FiXCircle className="text-red-600 dark:text-red-400 text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Failed
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {
                      historyData.history.filter(
                        (item) => item.status === "failed"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                <FiCreditCard className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No payment history
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === "all"
                  ? "You haven't made any payments yet."
                  : `You don't have any ${filter} payments.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHistory.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            <span
                              className={
                                highlightedTerm &&
                                payment.plan
                                  .toLowerCase()
                                  .includes(highlightedTerm.toLowerCase())
                                  ? "bg-yellow-200 dark:bg-yellow-600 rounded px-1"
                                  : ""
                              }
                            >
                              {payment.plan}
                            </span>{" "}
                            Plan
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(
                              payment.plan
                            )}`}
                          >
                            {payment.plan}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                          Transaction ID:{" "}
                          {payment.paymentId ||
                            payment.razorpayPaymentId ||
                            "N/A"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-gray-400 text-xs" />
                            <span>{formatDate(payment.createdAt)}</span>
                          </div>
                          <span>•</span>
                          <span className="font-medium">
                            {formatCurrency(
                              payment.amountPaid,
                              payment.currency
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                      {payment.expiresAt && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Expires:{" "}
                          {new Date(payment.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {payment.razorpayOrderId && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Order ID: {payment.razorpayOrderId}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentHistory;
