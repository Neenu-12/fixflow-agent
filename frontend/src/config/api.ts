const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const API_ENDPOINTS = {
  failures: `${API_BASE_URL}/failures`,
  approve: `${API_BASE_URL}/approve`,
};

export const buildFailuresUrl = (params?: Record<string, string>) => {
  const url = new URL(API_ENDPOINTS.failures);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};
