import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/user.service";
import { loginSchema } from "../../validators/authSchema";
import Input from "../common/Input";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";
import Checkbox from "../common/Checkbox";
import ReCaptcha from "../common/ReCaptcha";
import { FiMail, FiLock, FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { showSuccess, showError } from "../../utils/toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState("");
  const [showReactivation, setShowReactivation] = useState(false);
  const [emailForReactivation, setEmailForReactivation] = useState("");
  const [reactivationFeedback, setReactivationFeedback] = useState({
    type: null,
    message: "",
  });
  const [reactivationCooldown, setReactivationCooldown] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");
  const email = watch("email");

  useEffect(() => {
    const storedPreference = localStorage.getItem("rememberMePreference");
    const shouldRemember = storedPreference === "true";
    if (shouldRemember) {
      setValue("rememberMe", true);
      const storedEmail = localStorage.getItem("rememberedEmail");
      if (storedEmail) {
        setValue("email", storedEmail);
        setEmailForReactivation(storedEmail);
      }
    }
  }, [setValue]);

  useEffect(() => {
    localStorage.setItem("rememberMePreference", rememberMe ? "true" : "false");
    if (!rememberMe) {
      localStorage.removeItem("rememberedEmail");
    }
  }, [rememberMe]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password, rememberMe, recaptchaToken }) =>
      authService.login(email, password, rememberMe, recaptchaToken),
    onSuccess: (data, variables) => {
      showSuccess("Login successful!");
      setAuth(data.user, data.accessToken, variables.rememberMe);
      if (variables.rememberMe) {
        localStorage.setItem("rememberedEmail", variables.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/feed");
    },
    onError: (error) => {
      const serverMessage = error.response?.data?.message;
      const fallbackMessage = error.message;
      const errorMessage = serverMessage || fallbackMessage || "Login failed";
      setError(errorMessage);

      // Check if rate limit exceeded
      if (error.response?.status === 429) {
        showError(errorMessage);
      }
      // Check if account is deactivated
      else if (
        error.response?.status === 403 ||
        errorMessage.includes("deactivated") ||
        errorMessage.includes("ACCOUNT_DEACTIVATED")
      ) {
        setShowReactivation(true);
        setEmailForReactivation(email || "");
        showError("Account is deactivated");
      } else {
        showError(errorMessage);
      }
    },
  });

  const reactivationMutation = useMutation({
    mutationFn: ({ email }) => userService.requestAccountReactivation(email),
    onSuccess: () => {
      showSuccess("Reactivation email sent! Please check your inbox.");
      setShowReactivation(false);
      setError("");
      setReactivationFeedback({
        type: "success",
        message: "Reactivation email sent. Check your inbox.",
      });
      setReactivationCooldown(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to send reactivation email";
      showError(errorMessage);
      setReactivationFeedback({
        type: "error",
        message: errorMessage,
      });
      setReactivationCooldown(true);
      setTimeout(() => {
        setReactivationCooldown(false);
      }, 3000);
    },
  });

  const onSubmit = (data) => {
    setError("");
    setShowReactivation(false);

    // Only require CAPTCHA if site key is configured
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    loginMutation.mutate({ ...data, recaptchaToken: captchaToken });
  };

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
    setError("");
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken("");
    setError("CAPTCHA expired. Please verify again.");
  };

  const handleCaptchaError = () => {
    setCaptchaToken("");
    setError("CAPTCHA verification failed. Please try again.");
  };

  const handleRequestReactivation = () => {
    const targetEmail = emailForReactivation || email;
    if (!targetEmail) {
      showError("Please enter your email address");
      return;
    }
    setReactivationFeedback({ type: null, message: "" });
    reactivationMutation.mutate({ email: targetEmail });
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
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
            {showReactivation && (
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                <p className="mb-2 text-sm">
                  Your account is deactivated. Click below to receive a
                  reactivation email.
                </p>
                <Button
                  type="button"
                  onClick={handleRequestReactivation}
                  disabled={
                    reactivationMutation.isPending || reactivationCooldown
                  }
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2"
                >
                  <FiRefreshCw
                    className={
                      reactivationMutation.isPending || reactivationCooldown
                        ? "animate-spin"
                        : ""
                    }
                  />
                  {reactivationMutation.isPending
                    ? "Sending..."
                    : reactivationCooldown
                    ? "Please wait..."
                    : "Reactivate Account"}
                </Button>
                {reactivationFeedback.message && (
                  <p
                    className={`mt-3 text-sm ${
                      reactivationFeedback.type === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {reactivationFeedback.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            placeholder="Enter your email"
            {...register("email")}
            error={errors.email?.message}
          />

          <PasswordInput
            label="Password"
            name="password"
            icon={FiLock}
            placeholder="Enter your password"
            {...register("password")}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" {...register("rememberMe")} />
            <Link
              to="/forgot-password"
              className="text-sm text-nowrap text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* ReCAPTCHA */}
          {RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center">
              <ReCaptcha
                ref={recaptchaRef}
                siteKey={RECAPTCHA_SITE_KEY}
                onVerify={handleCaptchaVerify}
                onExpired={handleCaptchaExpired}
                onError={handleCaptchaError}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Signing in...
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
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
