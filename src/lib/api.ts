const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  ORDERS: `${API_BASE_URL}/orders`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  PAYMENT_INITIATE: `${API_BASE_URL}/api/payments/initiate`,
  PAYMENT_STATUS: (ref: string) => `${API_BASE_URL}/api/payments/status/${ref}`,
  PAYMENT_COMPLETE: `${API_BASE_URL}/api/payments/complete`,
  MEDIA: `${API_BASE_URL}/media`,
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
};

export default API_BASE_URL;
