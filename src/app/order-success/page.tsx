'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  useEffect(() => {
    localStorage.removeItem('pendingOrder');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <img src="/logo.png" alt="CapVets Logo" className="w-16 h-auto mx-auto mb-6" />

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Successful!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your order. We&apos;ve received your payment and will process your order shortly.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block w-full py-3 bg-green-700 text-yellow-400 rounded-lg font-semibold hover:bg-green-800 transition-colors text-center">
            Back to Home
          </Link>
          <Link href="/order" className="block w-full py-3 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center">
            Place Another Order
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Need help? Contact us at{' '}
            <a href="mailto:admin@capvets.com" className="text-green-600 hover:text-green-700">admin@capvets.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
