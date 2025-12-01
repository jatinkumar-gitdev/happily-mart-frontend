import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { userService } from "../../services/user.service";
import Button from "../../components/common/Button";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { showSuccess, showError } from "../../utils/toast";

const ReactivateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const token = searchParams.get("token");

  const verifyMutation = useMutation({
    mutationFn: (token) => userService.verifyReactivationToken(token),
    onSuccess: (data) => {
      setSuccess(true);
      setError("");
      showSuccess("Account reactivated successfully! Logging you in...");
      
      // Auto login after reactivation
      setTimeout(() => {
        // Navigate to login with success message
        navigate("/login", {
          state: { message: "Account reactivated! Please login with your credentials." },
        });
      }, 2000);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to reactivate account";
      setError(errorMessage);
      showError(errorMessage);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setError("Invalid or missing reactivation token");
      showError("Invalid reactivation link");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 transition-colors">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HiOutlineLightningBolt className="text-3xl sm:text-4xl text-sky-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Happily Mart
            </h1>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Account Reactivation
          </h2>
        </div>

        {verifyMutation.isPending && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Reactivating your account...
            </p>
          </div>
        )}

        {success && (
          <div className="text-center py-8">
            <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Account Reactivated!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your account has been successfully reactivated. Redirecting to login...
            </p>
            <Link to="/login">
              <Button className="bg-sky-500 hover:bg-sky-600">
                Go to Login
              </Button>
            </Link>
          </div>
        )}

        {error && !verifyMutation.isPending && (
          <div className="text-center py-8">
            <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Reactivation Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full bg-sky-500 hover:bg-sky-600">
                  Go to Login
                </Button>
              </Link>
              <Link to="/forgot-password">
                <Button variant="secondary" className="w-full">
                  Request New Reactivation Link
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactivateAccountPage;

