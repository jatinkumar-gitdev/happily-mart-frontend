import { FiTrendingUp } from "react-icons/fi";

const PointsProgressBar = ({ 
  currentPoints = 0, 
  maxPoints = 40, 
  label = "Progress to Diamond Tier",
  size = "default",
  showPercentage = true,
  animated = true
}) => {
  const percentage = Math.min(100, Math.round((currentPoints / maxPoints) * 100));
  const remaining = Math.max(0, maxPoints - currentPoints);

  const sizeClasses = {
    small: { container: "h-2", label: "text-xs" },
    default: { container: "h-3", label: "text-sm" },
    large: { container: "h-4", label: "text-base" }
  };

  const classes = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className={`font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 ${classes.label}`}>
            <FiTrendingUp className="w-4 h-4" />
            {label}
          </label>
          {showPercentage && (
            <span className={`font-bold text-gray-900 dark:text-white ${classes.label}`}>
              {currentPoints}/{maxPoints} points
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${classes.container} overflow-hidden shadow-inner`}>
        <div
          className={`h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ${
            animated ? "shadow-lg" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {remaining > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {remaining} more {remaining === 1 ? "point" : "points"} to reach next tier
        </p>
      )}

      {remaining === 0 && (
        <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
          You have reached the maximum tier! 🎉
        </p>
      )}
    </div>
  );
};

export default PointsProgressBar;
