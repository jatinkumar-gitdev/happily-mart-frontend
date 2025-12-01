import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/auth.service";
import { otpSchema } from "../../validators/authSchema";
import { showError, showSuccess } from "../../utils/toast";
import Input from "../common/Input";
import Button from "../common/Button";
import { FiMail } from "react-icons/fi";

const OTPVerification = ({ email, onSuccess }) => {
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ otp }) => authService.verifyOTP(email, otp),
    onSuccess: (data) => {
      setSuccess("Email verified successfully!");
      showSuccess("Email verified successfully!");
      setAuth(data.user, data.accessToken);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "OTP verification failed";
      setError(errorMessage);
      showError(errorMessage);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authService.sendOTP(email),
    onSuccess: () => {
      setSuccess("OTP resent successfully!");
      showSuccess("OTP resent successfully!");
      setError("");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP";
      setError(errorMessage);
      showError(errorMessage);
    },
  });

  const onSubmit = (data) => {
    setError("");
    setSuccess("");
    verifyMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 transition-colors">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
          We've sent a 6-digit OTP to{" "}
          <strong className="break-all text-gray-800 dark:text-white">
            {email}
          </strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Enter OTP"
            type="text"
            icon={FiMail}
            placeholder="000000"
            maxLength={6}
            {...register("otp")}
            error={errors.otp?.message}
          />

          <Button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full bg-sky-500 hover:bg-sky-600"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            {resendMutation.isPending ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
