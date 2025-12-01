
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;

  // If it's already a full URL, return as is
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  // Get the base backend URL (without /api)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const baseUrl = apiUrl.replace("/api", "");

  // If avatar path starts with /, use it directly
  if (avatarPath.startsWith("/")) {
    return `${baseUrl}${avatarPath}`;
  }

  // Otherwise, assume it's a relative path from uploads
  return `${baseUrl}/uploads/avatars/${avatarPath}`;
};

