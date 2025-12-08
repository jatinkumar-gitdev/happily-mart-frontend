import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "../index";
import { loginSchema } from "../../../../validators/authSchema";
import Input from "../../../../components/common/Input";
import PasswordInput from "../../../../components/common/PasswordInput";
import Button from "../../../../components/common/Button";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { showSuccess, showError } from "../../../../utils/toast";
import { AdminLoader } from "../../core";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => {
      return adminLogin(email, password, rememberMe);
    },
    onSuccess: (data) => {
      showSuccess("Admin login successful!");
      setShowLoader(true);
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 2000);
    },
    onError: (error) => {
      const serverMessage = error.response?.data?.message;
      const fallbackMessage = error.message;
      const errorMessage = serverMessage || fallbackMessage || "Login failed";
      setError(errorMessage);
      showError(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation's onError handler
    }
  };

  // If already authenticated, show loader and redirect
  if (isAdminAuthenticated) {
    return <AdminLoader />;
  }

  // Show loader when login is successful
  if (showLoader) {
    return <AdminLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gray-900 text-white p-3 rounded-lg">
              <FiLock className="text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Portal
            </h1>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
            Secure Access
          </h2>
          <p className="text-gray-500 mt-2">
            Administrator login required
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }} className="space-y-6">
          <Input
            label="Admin Email"
            type="email"
            icon={FiMail}
            placeholder="Enter your admin email"
            {...register("email")}
            error={errors.email?.message}
          />

          <PasswordInput
            label="Admin Password"
            name="password"
            icon={FiLock}
            placeholder="Enter your admin password"
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600">
              Remember me for 30 days
            </label>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {loginMutation.isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Not an administrator?{" "}
            <Link
              to="/login"
              className="text-gray-900 hover:text-gray-700 font-semibold transition-colors"
            >
              User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;