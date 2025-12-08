import React from "react";
import {
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiLock,
  FiAlertCircle,
} from "react-icons/fi";

const DealStatusTag = ({ status, size = "md", showIcon = true, className = "" }) => {
  const statusConfig = {
    Contacted: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Contacted",
      icon: FiPhone,
      description: "Initial contact made",
    },
    Ongoing: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Ongoing",
      icon: FiClock,
      description: "Deal in progress",
    },
    Success: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Success",
      icon: FiCheckCircle,
      description: "Deal completed successfully",
    },
    Fail: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Failed",
      icon: FiXCircle,
      description: "Deal failed",
    },
    Closed: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: "Closed",
      icon: FiLock,
      description: "Deal closed",
    },
  };

  const config = statusConfig[status] || statusConfig.Contacted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.bg} ${config.text} ${sizeClasses[size]} rounded-full font-medium ${className}`}
      title={config.description}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      <span>{config.label}</span>
    </div>
  );
};

export default DealStatusTag;
