// Get token from localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

// Clear token from localStorage
export const clearAccessToken = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.clear();
};

// Set token in localStorage
export const setAccessToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  const accessToken = getAccessToken();
  return !!accessToken;
};
