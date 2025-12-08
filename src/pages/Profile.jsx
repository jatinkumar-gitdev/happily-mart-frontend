import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { userService } from "../services/user.service";
import { paymentService } from "../services/payment.service";
import { subscriptionService } from "../services/subscription.service";
import MainLayout from "../components/layout/MainLayout";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import AvatarSelector from "../components/profile/AvatarSelector";
import { getAvatarUrl } from "../utils/avatarUtils";
import { showSuccess, showError, showInfo } from "../utils/toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiShoppingBag,
  FiCamera,
  FiGlobe,
  FiLink,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";

const Profile = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showDeactivateAccount, setShowDeactivateAccount] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarPresets, setAvatarPresets] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const queryClient = useQueryClient();

  const activeTab = searchParams.get("tab") || "profile";

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
  });

  const { data: accountStatus } = useQuery({
    queryKey: ["accountStatus"],
    queryFn: () => userService.getAccountStatus(),
    enabled: activeTab === "profile",
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  const { data: mySubscription } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  const profile = profileData?.user || user || {};

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profileData) => {
    if (!profileData) return 0;

    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.companyName,
      profileData.designation,
      profileData.country,
      profileData.state,
      profileData.city,
      profileData.sector,
      profileData.commodities,
      profileData.address1,
      profileData.alternateEmail,
      profileData.alternatePhone,
      profileData.linkedin,
      profileData.website,
      profileData.gstinNumber,
      profileData.registrationNumber,
      profileData.companyType,
      profileData.companyStructure,
      profileData.subSector,
    ];

    const filledFields = fields.filter(
      (field) => field && field.toString().trim() !== ""
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Ensure all form fields are properly updated in formData
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const profileCompletion = profile ? calculateProfileCompletion(profile) : 0;

  useEffect(() => {
    if (!isEditing && profile && Object.keys(profile).length > 0) {
      setFormData(profile);
    }
  }, [profile, isEditing]);

  useEffect(() => {
    if (profileData?.presets) {
      const presets = profileData.presets;

      if (Array.isArray(presets) && presets.length > 0) {
        setAvatarPresets(presets);
      } else if (typeof presets === "string" && presets.trim()) {
        const arr = presets
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        setAvatarPresets(arr);
      }
    }
  }, [profileData?.presets]);

  useEffect(() => {
    if (activeTab === "payments") {
      setShowChangePassword(false);
      setIsEditing(false);
      setShowDeleteAccount(false);
      setShowDeactivateAccount(false);
    }
  }, [activeTab]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
        setFormData(data.user);
      }
      setIsEditing(false);
      queryClient.invalidateQueries(["profile"]);
      if (data?.verificationRequired) {
        setPendingEmail(data.pendingEmail || "");
        setShowEmailVerification(true);
        setVerificationError("");
        showSuccess(
          data.message ||
            "Verification code sent to your new email. Enter it to finish the update."
        );
      } else {
        showSuccess(data?.message || "Profile updated successfully!");
      }
    },
    onError: (error) => {
      showError(error.response?.data?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      userService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError("");
      setShowChangePassword(false);
      showSuccess("Password changed successfully!");
    },
    onError: (error) => {
      setPasswordError(
        error.response?.data?.message || "Failed to change password"
      );
      showError(error.response?.data?.message || "Failed to change password");
    },
  });

  const requestDeletionMutation = useMutation({
    mutationFn: (password) => userService.requestAccountDeletion(password),
    onSuccess: () => {
      setDeletePassword("");
      setDeleteError("");
      setShowDeleteAccount(false);
      queryClient.invalidateQueries(["accountStatus"]);
      showSuccess(
        "Account deletion scheduled. Your account will be deleted in 7 days."
      );
    },
    onError: (error) => {
      setDeleteError(
        error.response?.data?.message || "Failed to request account deletion"
      );
      showError(
        error.response?.data?.message || "Failed to request account deletion"
      );
    },
  });

  const cancelDeletionMutation = useMutation({
    mutationFn: () => userService.cancelAccountDeletion(),
    onSuccess: () => {
      queryClient.invalidateQueries(["accountStatus"]);
      showSuccess("Account deletion request cancelled successfully.");
    },
    onError: (error) => {
      showError(
        error.response?.data?.message || "Failed to cancel deletion request"
      );
    },
  });

  const reactivationMutation = useMutation({
    mutationFn: ({ email }) => userService.requestAccountReactivation(email),
    onSuccess: (data, variables) => {
      const serverMessage =
        data?.message ||
        variables?.successMessage ||
        "Reactivation email sent! Please check your inbox.";
      showSuccess(serverMessage);
    },
    onError: (error) => {
      showError(
        error.response?.data?.message || "Failed to send reactivation email"
      );
    },
  });

  const verifyEmailChangeMutation = useMutation({
    mutationFn: (token) => userService.verifyEmailChange(token),
    onSuccess: (data) => {
      const message =
        data?.message ||
        "Email updated successfully. Please log in again with your new email.";
      showSuccess(message);
      setShowEmailVerification(false);
      setEmailVerificationCode("");
      setPendingEmail("");
      setVerificationError("");
      logout();
      navigate("/login", {
        state: { message },
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to verify email change";
      setVerificationError(errorMessage);
      showError(errorMessage);
    },
  });

  const getPrimaryEmail = () =>
    formData.email || profile.email || user?.email || "";

  const handleSendReactivationEmail = (
    successMessage,
    { force = false } = {}
  ) => {
    if (!force && accountStatus && !accountStatus.isDeactivated) {
      showInfo(
        "You can request a reactivation link after you deactivate. We'll also email it to you automatically."
      );
      return;
    }
    const emailToUse = getPrimaryEmail();
    if (!emailToUse) {
      showError("No primary email found to send the reactivation link.");
      return;
    }
    reactivationMutation.mutate({ email: emailToUse, successMessage });
  };

  const deactivateMutation = useMutation({
    mutationFn: ({ password, reason }) =>
      userService.deactivateAccount(password, reason),
    onSuccess: () => {
      setDeactivatePassword("");
      setDeactivateReason("");
      setDeactivateError("");
      setShowDeactivateAccount(false);
      showSuccess("Account deactivated successfully.");
      handleSendReactivationEmail(
        "We emailed you a secure reactivation link. Use it anytime to regain access.",
        { force: true }
      );
      logout();
      navigate("/login");
    },
    onError: (error) => {
      setDeactivateError(
        error.response?.data?.message || "Failed to deactivate account"
      );
      showError(
        error.response?.data?.message || "Failed to deactivate account"
      );
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: (data) => {
      if (data?.avatar) {
        setUser({ ...(user || {}), avatar: data.avatar });
        queryClient.invalidateQueries(["profile"]);
      }
    },
  });

  const presetAvatarMutation = useMutation({
    mutationFn: (preset) => userService.setPresetAvatar(preset),
    onSuccess: (data) => {
      if (data?.avatar) {
        setUser({ ...(user || {}), avatar: data.avatar });
        queryClient.invalidateQueries(["profile"]);
      }
    },
  });

  const handleStartEditing = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(profileData?.user || user || {});
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleRequestDeletion = () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Password is required");
      return;
    }
    requestDeletionMutation.mutate(deletePassword);
  };

  const handleDeactivate = () => {
    setDeactivateError("");
    if (!deactivatePassword) {
      setDeactivateError("Password is required");
      return;
    }
    deactivateMutation.mutate({
      password: deactivatePassword,
      reason: deactivateReason,
    });
  };

  const handleVerifyEmailChange = () => {
    setVerificationError("");
    if (!emailVerificationCode.trim()) {
      setVerificationError(
        "Enter the verification code sent to your new email."
      );
      return;
    }
    verifyEmailChangeMutation.mutate(
      emailVerificationCode.trim().toUpperCase()
    );
  };

  const handleCloseEmailVerification = () => {
    if (verifyEmailChangeMutation.isPending) return;
    setShowEmailVerification(false);
    setEmailVerificationCode("");
    setVerificationError("");
  };

  return (
    <>
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSearchParams({ tab: "profile" })}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setSearchParams({ tab: "payments" })}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "payments"
                  ? "border-b-2 border-sky-500 text-sky-600 dark:text-sky-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiShoppingBag />
                Purchase History
              </div>
            </button>
          </div>

          {activeTab === "profile" && (
            <>
              {/* Account Status Alert */}
              {accountStatus?.deletionRequestedAt && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiAlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                        Account Deletion Scheduled
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                        Your account is scheduled for deletion in{" "}
                        {accountStatus.daysUntilDeletion > 0
                          ? `${accountStatus.daysUntilDeletion} day(s)`
                          : "less than 1 day"}
                        . All your posts and data will be permanently deleted.
                      </p>
                      <Button
                        onClick={() => cancelDeletionMutation.mutate()}
                        disabled={cancelDeletionMutation.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {cancelDeletionMutation.isPending
                          ? "Cancelling..."
                          : "Cancel Deletion"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Profile
                  </h1>
                  {!isEditing ? (
                    <Button
                      onClick={handleStartEditing}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600"
                    >
                      <FiEdit2 />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                      >
                        <FiX />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600"
                      >
                        <FiSave />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sky-500 dark:bg-sky-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                      {profile.avatar ? (
                        <img
                          src={getAvatarUrl(profile.avatar)}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-white text-lg font-semibold ${
                          profile.avatar
                            ? "hidden"
                            : "flex items-center justify-center w-full h-full"
                        }`}
                      >
                        {profile.name
                          ? profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          : "HM"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Personalize your account with a custom avatar or choose
                      from our curated presets.
                    </p>
                    <Button
                      onClick={() => setShowAvatarModal(true)}
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600"
                    >
                      <FiCamera />
                      Manage Avatar
                    </Button>
                  </div>
                </div>

                {/* Profile Completion Progress */}
                <div className="mb-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Profile Completion
                    </h3>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${profileCompletion}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileCompletion === 100
                      ? "Your profile is complete!"
                      : profileCompletion >= 75
                      ? "Almost there! Just a few more details to go."
                      : profileCompletion >= 50
                      ? "Good progress! Complete your profile to get the most out of Happily Mart."
                      : "Complete your profile to unlock all features and connect better with others."}
                  </p>
                </div>

                {/* User Activity Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Activity
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-3">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {profile.posts || 0}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-1 font-medium">
                          Posts Created
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-3">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {profile.unlocked || 0}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide mt-1 font-medium">
                          Posts Unlocked
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-3">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {profile.deals || 0}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mt-1 font-medium">
                          Active Deals
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-700 p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 mb-3">
                          <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {profile.connections || 0}
                        </div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide mt-1 font-medium">
                          Connections
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Info Card */}
                {mySubscription?.subscription && (
                  <div className="mb-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Subscription Status
                        </h3>
                        {mySubscription.subscription.badge && (
                          <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm font-semibold">
                            {mySubscription.subscription.badge}{" "}
                            {mySubscription.subscription.currentPlan}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => navigate("/subscription")}
                        className="bg-sky-500 hover:bg-sky-600 text-sm"
                      >
                        Manage Plan
                      </Button>
                    </div>

                    {/* Credits Breakdown with Enhanced Visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Total Credits
                            </span>
                          </div>
                          <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                            {mySubscription.subscription.credits || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-sky-400 to-sky-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(
                                ((mySubscription.subscription.credits || 0) /
                                  Math.max(mySubscription.subscription.planDetails?.credits || 1, 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {mySubscription.subscription.planDetails?.credits || 0} included in plan
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Unlock Credits
                            </span>
                          </div>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {mySubscription.subscription.unlockCredits || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(
                                ((mySubscription.subscription.unlockCredits || 0) /
                                  Math.max(mySubscription.subscription.planDetails?.unlockCredits || 1, 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {mySubscription.subscription.planDetails?.unlockCredits || 0} included in plan
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Create Credits
                            </span>
                          </div>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {mySubscription.subscription.createCredits || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${Math.min(
                                ((mySubscription.subscription.createCredits || 0) /
                                  Math.max(mySubscription.subscription.planDetails?.createCredits || 1, 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {mySubscription.subscription.planDetails?.createCredits || 0} included in plan
                        </div>
                      </div>
                    </div>
                    
                    {/* Subscription Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Plan Validity</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {mySubscription.subscription.expiresAt && !mySubscription.subscription.isExpired ? (
                            <>
                              Expires on {new Date(mySubscription.subscription.expiresAt).toLocaleDateString()}
                              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                                {Math.ceil((new Date(mySubscription.subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days left
                              </span>
                            </>
                          ) : mySubscription.subscription.isExpired ? (
                            <span className="text-red-600 dark:text-red-400">Expired</span>
                          ) : (
                            "Lifetime"
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-purple-800 dark:text-purple-200">Plan Benefits</span>
                        </div>
                        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                          {mySubscription.subscription.planDetails?.features?.slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {mySubscription.subscription.planDetails?.features?.length > 2 && (
                            <li className="text-xs text-purple-600 dark:text-purple-400">
                              +{mySubscription.subscription.planDetails.features.length - 2} more benefits
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {mySubscription.subscription.expiresAt &&
                      !mySubscription.subscription.isExpired && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiCalendar className="flex-shrink-0" />
                          <span>
                            Valid until:{" "}
                            {new Date(
                              mySubscription.subscription.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                    {mySubscription.subscription.isExpired && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Your subscription has expired. Please renew to continue.
                      </div>
                    )}
                  </div>
                )}

                {/* Personal Information */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Name"
                      icon={FiUser}
                      value={
                        isEditing ? formData.name || "" : profile.name || ""
                      }
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Designation"
                      icon={FiUser}
                      value={
                        isEditing
                          ? formData.designation || ""
                          : profile.designation || ""
                      }
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Email"
                      icon={FiMail}
                      type="email"
                      value={
                        isEditing ? formData.email || "" : profile.email || ""
                      }
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                    {profile.pendingEmail && !showEmailVerification && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 -mt-4 mb-4 md:col-span-2">
                        Pending verification for{" "}
                        <span className="font-semibold">
                          {profile.pendingEmail}
                        </span>
                        . Enter the verification code sent to this address to
                        finish the change.
                      </p>
                    )}
                    <Input
                      label="Alternate Email"
                      icon={FiMail}
                      type="email"
                      value={
                        isEditing
                          ? formData.alternateEmail || ""
                          : profile.alternateEmail || ""
                      }
                      onChange={(e) => handleFieldChange('alternateEmail', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Phone"
                      icon={FiPhone}
                      value={
                        isEditing ? formData.phone || "" : profile.phone || ""
                      }
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Alternate Phone"
                      icon={FiPhone}
                      value={
                        isEditing
                          ? formData.alternatePhone || ""
                          : profile.alternatePhone || ""
                      }
                      onChange={(e) => handleFieldChange('alternatePhone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Company Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Company Name"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.companyName || ""
                          : profile.companyName || ""
                      }
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Registration Number"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.registrationNumber || ""
                          : profile.registrationNumber || ""
                      }
                      onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="GSTIN Number"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.gstinNumber || ""
                          : profile.gstinNumber || ""
                      }
                      onChange={(e) => handleFieldChange('gstinNumber', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Company Type"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.companyType || ""
                          : profile.companyType || ""
                      }
                      onChange={(e) => handleFieldChange('companyType', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Company Structure"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.companyStructure || ""
                          : profile.companyStructure || ""
                      }
                      onChange={(e) => handleFieldChange('companyStructure', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Address Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Address Line 1"
                        icon={FiMapPin}
                        value={
                          isEditing
                            ? formData.address1 || ""
                            : profile.address1 || ""
                        }
                        onChange={(e) => handleFieldChange('address1', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Alternate Address"
                        icon={FiMapPin}
                        value={
                          isEditing
                            ? formData.alternateAddress || ""
                            : profile.alternateAddress || ""
                        }
                        onChange={(e) => handleFieldChange('alternateAddress', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <Input
                      label="Country"
                      icon={FiMapPin}
                      value={
                        isEditing
                          ? formData.country || ""
                          : profile.country || ""
                      }
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="State"
                      icon={FiMapPin}
                      value={
                        isEditing ? formData.state || "" : profile.state || ""
                      }
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="City"
                      icon={FiMapPin}
                      value={
                        isEditing ? formData.city || "" : profile.city || ""
                      }
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Commodities"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.commodities || ""
                          : profile.commodities || ""
                      }
                      onChange={(e) => handleFieldChange('commodities', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Sector"
                      icon={FiBriefcase}
                      value={
                        isEditing ? formData.sector || "" : profile.sector || ""
                      }
                      onChange={(e) => handleFieldChange('sector', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Sub Sector"
                      icon={FiBriefcase}
                      value={
                        isEditing
                          ? formData.subSector || ""
                          : profile.subSector || ""
                      }
                      onChange={(e) => handleFieldChange('subSector', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Digital Links */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Digital Links
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="LinkedIn"
                      icon={FiLink}
                      value={
                        isEditing
                          ? formData.linkedin || ""
                          : profile.linkedin || ""
                      }
                      onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <Input
                      label="Twitter"
                      icon={FiLink}
                      value={
                        isEditing
                          ? formData.twitter || ""
                          : profile.twitter || ""
                      }
                      onChange={(e) => handleFieldChange('twitter', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://twitter.com/yourhandle"
                    />
                    <Input
                      label="Website"
                      icon={FiGlobe}
                      value={
                        isEditing
                          ? formData.website || ""
                          : profile.website || ""
                      }
                      onChange={(e) => handleFieldChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiLock />
                    Change Password
                  </h2>
                  {!showChangePassword && (
                    <Button
                      onClick={() => setShowChangePassword(true)}
                      variant="outline"
                      className="bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
                    >
                      Change Password
                    </Button>
                  )}
                </div>

                {showChangePassword && (
                  <div className="space-y-4">
                    <PasswordInput
                      label="Current Password"
                      icon={FiLock}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      label="New Password"
                      icon={FiLock}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      icon={FiLock}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    {passwordError && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {passwordError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setPasswordError("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={changePasswordMutation.isPending}
                        className="bg-sky-500 hover:bg-sky-600"
                      >
                        {changePasswordMutation.isPending
                          ? "Changing..."
                          : "Change Password"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Deletion/Deactivation Section */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
                <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                  <FiAlertTriangle />
                  Danger Zone
                </h2>

                <div className="space-y-4">
                  {/* Deactivate Account */}
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      Deactivate Account
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                      Temporarily disable your account. Reactivate anytime from
                      the login page when you're ready to return.
                    </p>
                    {!showDeactivateAccount ? (
                      <Button
                        onClick={() => setShowDeactivateAccount(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Deactivate Account
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <PasswordInput
                          label="Enter Password to Confirm"
                          icon={FiLock}
                          value={deactivatePassword}
                          onChange={(e) =>
                            setDeactivatePassword(e.target.value)
                          }
                          placeholder="Enter your password"
                        />
                        <Input
                          label="Reason (Optional)"
                          value={deactivateReason}
                          onChange={(e) => setDeactivateReason(e.target.value)}
                          placeholder="Why are you deactivating your account?"
                        />
                        {deactivateError && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {deactivateError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setShowDeactivateAccount(false);
                              setDeactivatePassword("");
                              setDeactivateReason("");
                              setDeactivateError("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDeactivate}
                            disabled={deactivateMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deactivateMutation.isPending
                              ? "Deactivating..."
                              : "Confirm Deactivation"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Account */}
                  {!accountStatus?.deletionRequestedAt && (
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        Permanently delete your account and all associated data.
                        This action cannot be undone. Your account will be
                        deleted after 7 days. You can cancel the deletion within
                        this period.
                      </p>
                      {!showDeleteAccount ? (
                        <Button
                          onClick={() => setShowDeleteAccount(true)}
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        >
                          <FiTrash2 />
                          Request Account Deletion
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <PasswordInput
                            label="Enter Password to Confirm"
                            icon={FiLock}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                          {deleteError && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {deleteError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setShowDeleteAccount(false);
                                setDeletePassword("");
                                setDeleteError("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRequestDeletion}
                              disabled={requestDeletionMutation.isPending}
                              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                              <FiTrash2 />
                              {requestDeletionMutation.isPending
                                ? "Requesting..."
                                : "Confirm Deletion"}
                            </Button>
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Forgot your password?{" "}
                            <button
                              onClick={() => {
                                userService
                                  .forgotPasswordForDeletion(profile.email)
                                  .then(() => {
                                    showSuccess(
                                      "Password reset link sent to your email. After resetting your password, you can proceed with account deletion."
                                    );
                                  })
                                  .catch(() => {
                                    showError(
                                      "Failed to send password reset email."
                                    );
                                  });
                              }}
                              className="underline font-semibold"
                            >
                              Reset Password
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {accountStatus?.isDeactivated && (
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-white/70 dark:bg-red-900/20">
                      <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                        Need to Reactivate Later?
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        We can email you a secure reactivation link whenever you
                        need it. The link is valid for 24 hours and works even
                        if your account is already deactivated.
                      </p>
                      <Button
                        onClick={() =>
                          handleSendReactivationEmail(
                            "Reactivation email sent! Please check your inbox."
                          )
                        }
                        disabled={reactivationMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      >
                        <FiCheckCircle
                          className={
                            reactivationMutation.isPending ? "animate-spin" : ""
                          }
                        />
                        {reactivationMutation.isPending
                          ? "Sending..."
                          : "Email Reactivation Link"}
                      </Button>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-3">
                        Tip: You can also request a link from the login page
                        after you sign out.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "payments" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FiShoppingBag />
                  Purchase History
                </h2>
                <Button
                  onClick={() => navigate("/payment-history")}
                  variant="outline"
                  className="text-sm"
                >
                  View Detailed History
                </Button>
              </div>
              <div className="text-center py-8">
                <FiShoppingBag className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For a detailed view of your payment history, please visit the
                  dedicated payment history page.
                </p>
                <Button
                  onClick={() => navigate("/payment-history")}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Go to Payment History
                </Button>
              </div>
            </div>
          )}
        </div>
        <AvatarSelector
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          presets={avatarPresets}
          onSelectPreset={(preset) =>
            presetAvatarMutation.mutate(preset, {
              onSuccess: () => {
                setShowAvatarModal(false);
              },
            })
          }
          onUpload={(file, done) =>
            uploadAvatarMutation.mutate(file, {
              onSettled: () => {
                done?.();
                setShowAvatarModal(false);
              },
            })
          }
          isSelectingPreset={presetAvatarMutation.isPending}
          isUploading={uploadAvatarMutation.isPending}
        />
      </MainLayout>

      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Verify Your New Email
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Enter the alphanumeric code we sent to{" "}
              <span className="font-semibold">
                {pendingEmail || "your new email"}
              </span>
              . The code expires in 15 minutes.
            </p>
            <Input
              label="Verification Code"
              value={emailVerificationCode}
              onChange={(e) =>
                setEmailVerificationCode(e.target.value.toUpperCase())
              }
              placeholder="E.g. AB12CD34"
              maxLength={12}
            />
            {verificationError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {verificationError}
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleVerifyEmailChange}
                disabled={verifyEmailChangeMutation.isPending}
                className="flex-1 bg-sky-500 hover:bg-sky-600"
              >
                {verifyEmailChangeMutation.isPending
                  ? "Verifying..."
                  : "Verify & Update"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseEmailVerification}
                disabled={verifyEmailChangeMutation.isPending}
                className="flex-1"
              >
                Close
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              For security reasons you will be signed out after verification and
              must log in with your new email.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
