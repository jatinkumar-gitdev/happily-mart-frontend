import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/auth.service";
import { forgotPasswordSchema } from "../../validators/authSchema";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { FiMail } from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: ({ email }) => authService.forgotPassword(email),
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Failed to send reset email");
    },
  });

  const onSubmit = (data) => {
    setError("");
    mutation.mutate(data);
  };

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
            Forgot Password
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your email to reset your password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
              Password reset link has been sent to your email!
            </div>
            <Link
              to="/login"
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              icon={FiMail}
              placeholder="Enter your email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-sky-500 hover:bg-sky-600"
            >
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
