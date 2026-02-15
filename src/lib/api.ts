const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  PAYMENT_INITIATE: '/api/payments/initiate',
  PAYMENT_STATUS: (ref: string) => `/api/payments/status/${ref}`,
  PAYMENT_COMPLETE: '/api/payments/complete',
  MEDIA: '/api/media',
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_STATS: '/api/admin/stats',
  CALCULATE_DELIVERY: '/api/calculate-delivery',
};

export default API_BASE_URL;
