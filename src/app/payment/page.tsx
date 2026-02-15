'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';

interface OrderData {
  productType: string;
  quantity: string;
  unit?: string;
  cutUp?: string;
  cutPieces?: string;
  orderType: string;
  address?: string;
  specialInstructions?: string;
  total: number;
  [key: string]: any;
}

export default function PaymentPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendingOrder');
    if (stored) {
      setOrder(JSON.parse(stored));
    } else {
      router.push('/order');
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const resetPayment = () => {
    setPaymentStatus('idle');
    setError(null);
  };

  const isValidCameroonPhone = (phone: string) => {
    const cleaned = phone.replace(/\s|-/g, '');
    return /^6\d{8}$/.test(cleaned) || /^2376\d{8}$/.test(cleaned) || /^\+2376\d{8}$/.test(cleaned);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod || !phoneNumber) {
      showToast('Please select a payment method and enter your phone number', 'error');
      return;
    }

    if (!isValidCameroonPhone(phoneNumber)) {
      showToast('Please enter a valid Cameroon phone number (e.g., 6XXXXXXXX, 2376XXXXXXXX, or +2376XXXXXXXX)', 'error');
      return;
    }

    try {
      setPaymentStatus('initiating');

      // Initiate payment
      const initRes = await fetch(API_ENDPOINTS.PAYMENT_INITIATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: order, amount: order!.total, paymentMethod, phoneNumber }),
      });
      const initData = await initRes.json();

      if (!initData.success) {
        setError(initData.message || 'Payment initiation failed');
        setPaymentStatus('failed');
        return;
      }

      showToast('Payment initiated! Please check your phone and confirm the payment.', 'success');
      setPaymentStatus('pending');

      // Poll for status
      const paymentRef = initData.paymentRef;
      let attempts = 0;
      const maxAttempts = 30;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setError('Payment timeout. Please try again.');
          setPaymentStatus('failed');
          return;
        }

        try {
          const statusRes = await fetch(API_ENDPOINTS.PAYMENT_STATUS(paymentRef));
          const statusData = await statusRes.json();

          if (statusData.success && statusData.status === 'COMPLETED') {
            setPaymentStatus('completing');

            // Complete payment
            const completeRes = await fetch(API_ENDPOINTS.PAYMENT_COMPLETE, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderData: order, paymentRef, paymentMethod, phoneNumber }),
            });
            const completeData = await completeRes.json();

            if (completeData.success) {
              showToast('Payment completed! Order created successfully.', 'success');
              localStorage.removeItem('pendingOrder');
              setTimeout(() => router.push('/order-success'), 2000);
            } else {
              setError(completeData.message || 'Error completing payment');
              setPaymentStatus('failed');
            }
            return;
          } else if (statusData.success && statusData.status === 'FAILED') {
            setError('Payment failed');
            setPaymentStatus('failed');
            return;
          }

          attempts++;
          setTimeout(poll, 2000);
        } catch {
          setError('Error checking payment status');
          setPaymentStatus('failed');
        }
      };

      poll();
    } catch {
      setError('Network error. Please try again.');
      setPaymentStatus('failed');
    }
  };

  if (!order) {
    return (
      <div className="max-w-lg mx-auto my-16 px-4 text-center">
        <p className="text-gray-500">Loading order information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-[fadeInDown_0.3s_ease-out] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <button onClick={() => router.push('/order')} className="absolute left-4 top-4 text-2xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">←</button>
        <img src="/logo.png" alt="Logo" className="w-16 h-auto mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">Confirm your order</h2>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Order Summary</h3>
        <div className="space-y-1.5 text-sm text-gray-600">
          <p>Product: {order.productType} - {order.quantity} {
            order.productType === 'chicken'
              ? (parseInt(order.quantity) === 1 ? 'chicken' : 'chickens')
              : order.unit || 'unit(s)'
          }</p>
          {order.productType === 'chicken' && (
            <p>Cut Up: {order.cutUp === 'yes' ? `Yes (${order.cutPieces} pieces)` : 'No'}</p>
          )}
          <p>Order Type: {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
          {order.orderType === 'delivery' && <p>Delivery Address: {order.address}</p>}
          {order.specialInstructions && <p>Special Instructions: {order.specialInstructions}</p>}
          <p className="text-base font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
            Total Amount: {order.total?.toLocaleString() || 0} CFA
          </p>
        </div>
      </div>

      {/* Payment Status Messages */}
      {paymentStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium text-yellow-800">⏳ Payment initiated! Please check your phone and confirm the payment.</p>
          <p className="text-yellow-700 mt-1">We&apos;ll automatically detect when your payment is completed.</p>
        </div>
      )}

      {paymentStatus === 'completing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium text-blue-800">🔄 Completing your order...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium text-red-800">❌ {error}</p>
          <button onClick={resetPayment} className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handlePayment} className="space-y-6">
        {/* Payment Methods */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-yellow-300 has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-50">
            <input type="radio" name="paymentMethod" value="mtn" checked={paymentMethod === 'mtn'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-yellow-500" />
            <img src="/mtn.png" alt="MTN Mobile Money" className="w-10 h-10 object-contain" />
            <span className="font-medium text-gray-800">MTN Mobile Money</span>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-orange-300 has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50">
            <input type="radio" name="paymentMethod" value="orange" checked={paymentMethod === 'orange'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-orange-500" />
            <img src="/orange.png" alt="Orange Money" className="w-10 h-10 object-contain" />
            <span className="font-medium text-gray-800">Orange Money</span>
          </label>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your mobile money number"
            required
            className={`w-full px-4 py-3 border-2 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200
              ${phoneNumber && !isValidCameroonPhone(phoneNumber) ? 'border-red-400' : 'border-gray-200'}`}
          />
          {phoneNumber && !isValidCameroonPhone(phoneNumber) && (
            <p className="text-red-500 text-xs mt-1">Please enter a valid Cameroon phone number</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={paymentStatus === 'initiating' || paymentStatus === 'pending' || paymentStatus === 'completing' || !paymentMethod || !phoneNumber || !isValidCameroonPhone(phoneNumber)}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-green-700 text-yellow-400 hover:bg-green-800 shadow-sm"
        >
          {paymentStatus === 'initiating' ? 'Initiating Payment...'
            : paymentStatus === 'pending' ? 'Waiting for Payment...'
              : paymentStatus === 'completing' ? 'Completing Order...'
                : `Pay ${order.total?.toLocaleString() || 0} CFA`}
        </button>
      </form>
    </div>
  );
}
