import { FiAward, FiStar, FiZap, FiTrendingUp } from "react-icons/fi";

const getTierBadgeColors = (tier) => {
  switch (tier?.toLowerCase()) {
    case "diamond":
      return {
        bg: "from-indigo-500 to-purple-600",
        text: "text-white",
        light: "bg-indigo-100 dark:bg-indigo-900/30",
        badge: "bg-indigo-600"
      };
    case "gold":
      return {
        bg: "from-yellow-400 to-orange-500",
        text: "text-white",
        light: "bg-yellow-100 dark:bg-yellow-900/30",
        badge: "bg-yellow-500"
      };
    case "silver":
      return {
        bg: "from-gray-300 to-gray-500",
        text: "text-gray-900",
        light: "bg-gray-100 dark:bg-gray-900/30",
        badge: "bg-gray-500"
      };
    case "bronze":
      return {
        bg: "from-amber-500 to-amber-700",
        text: "text-white",
        light: "bg-amber-100 dark:bg-amber-900/30",
        badge: "bg-amber-600"
      };
    default:
      return {
        bg: "from-green-400 to-green-600",
        text: "text-white",
        light: "bg-green-100 dark:bg-green-900/30",
        badge: "bg-green-500"
      };
  }
};

const getTierIcon = (tier) => {
  switch (tier?.toLowerCase()) {
    case "diamond":
      return <FiAward className="w-3 h-3" />;
    case "gold":
      return <FiStar className="w-3 h-3" />;
    case "silver":
      return <FiTrendingUp className="w-3 h-3" />;
    case "bronze":
      return <FiZap className="w-3 h-3" />;
    default:
      return <FiTrendingUp className="w-3 h-3" />;
  }
};

const AvatarWithTierBadge = ({ 
  avatar, 
  name, 
  tier = "free", 
  size = "md",
  showBadge = true,
  className = ""
}) => {
  const colors = getTierBadgeColors(tier);
  const tierName = tier?.charAt(0).toUpperCase() + tier?.slice(1).toLowerCase();

  const sizeMap = {
    sm: { container: "w-10 h-10", badge: "w-5 h-5" },
    md: { container: "w-16 h-16", badge: "w-6 h-6" },
    lg: { container: "w-24 h-24", badge: "w-8 h-8" },
    xl: { container: "w-32 h-32", badge: "w-10 h-10" }
  };

  const sizes = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Circle */}
      <div
        className={`${sizes.container} rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-lg font-semibold ${colors.text}`}>
            {name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "HM"}
          </span>
        )}
      </div>

      {/* Tier Badge */}
      {showBadge && (
        <div
          className={`absolute -bottom-1 -right-1 ${sizes.badge} ${colors.badge} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-gray-800 group`}
          title={`${tierName} Tier`}
        >
          {getTierIcon(tier)}
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tierName}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarWithTierBadge;
