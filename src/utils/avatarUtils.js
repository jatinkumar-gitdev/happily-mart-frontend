export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
    return avatarPath;
  }

  if (avatarPath.startsWith("/")) {
    return avatarPath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8800/api";
  const baseUrl = apiUrl.replace("/api", "");
  return `${baseUrl}/uploads/avatars/${avatarPath}`;
};