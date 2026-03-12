'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';
import Step1OrderDetails from '@/components/order/Step1OrderDetails';
import Step2CustomerInfo from '@/components/order/Step2CustomerInfo';
import Step3Preview from '@/components/order/Step3Preview';

interface OrderItem {
  id: string;
  productType: string;
  unit?: string;
  chickenNature: string;
  weightRange: string;
  quantity: number;
  cutUp: string;
  cutPieces: string;
  unitPrice: number;
  itemTotal: number;
  cutUpFee: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  orderType: string;
  address: string;
  preferredTime: string;
}

const pricingConfig = {
  basePrice: 100,
  cutUpFeeLow: 100,
  cutUpFeeHigh: 200,
  chickenCategories: {
    '1.5-1.6kg': 3000,
    '1.7-1.8kg': 3500,
    '1.9-2.1kg': 4000,
    '2.2-2.3kg': 4500,
    '2.4-3kg': 5000,
  } as Record<string, number>,
  productPricing: {
    eggs: { label: 'Eggs', units: { crate: 2000, dozen: 1000 } },
    corn: { label: 'Corn', units: { kg: 400, bag: 15000 } },
    beans: { label: 'Beans', units: { kg: 800, bag: 28000 } },
    soybean: { label: 'Soybean', units: { kg: 900, bag: 32000 } },
    palmnuts: { label: 'Palm nuts', units: { kg: 700, sack: 25000 } },
  } as Record<string, { label: string; units: Record<string, number> }>,
  deliveryZones: {
    zone1: { maxDistance: 5, fee: 1000 },
    zone2: { maxDistance: 10, fee: 1500 },
    zone3: { maxDistance: 20, fee: 2000 },
    zone4: { maxDistance: 999, fee: 3000 },
  },
};

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [orderFormData, setOrderFormData] = useState({
    items: [] as OrderItem[],
    specialInstructions: ''
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    orderType: 'pickup',
    address: '',
    preferredTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Handle pre-selected product from Gallery
  useEffect(() => {
    const productType = searchParams.get('productType');
    const weightRange = searchParams.get('weightRange');
    const unit = searchParams.get('unit');

    if (productType) {
      // Auto-add a default item if coming from gallery
      let unitPrice = 0;
      let defaultUnit = '';

      if (productType === 'chicken') {
        unitPrice = pricingConfig.chickenCategories[weightRange || '1.5-1.6kg'] || 0;
      } else {
        defaultUnit = Object.keys(pricingConfig.productPricing[productType]?.units || {})[0] || '';
        unitPrice = pricingConfig.productPricing[productType]?.units?.[defaultUnit] || 0;
      }

      const newItem: OrderItem = {
        id: Date.now().toString(),
        productType,
        unit: productType === 'chicken' ? '' : defaultUnit,
        chickenNature: 'live',
        weightRange: productType === 'chicken' ? weightRange || '1.5-1.6kg' : '',
        quantity: 1,
        cutUp: 'no',
        cutPieces: '',
        unitPrice,
        itemTotal: unitPrice,
        cutUpFee: 0
      };

      setOrderFormData({ items: [newItem], specialInstructions: '' });
    }
  }, [searchParams]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const getDeliveryFee = useCallback((dist: number) => {
    for (const zone of Object.values(pricingConfig.deliveryZones)) {
      if (dist <= zone.maxDistance) return zone.fee;
    }
    return pricingConfig.deliveryZones.zone4.fee;
  }, []);

  // Handle delivery fee updates
  const handleDeliveryFeeChange = useCallback((fee: number, distance?: number) => {
    setDeliveryFee(fee);
    if (distance !== undefined) setDeliveryDistance(distance);
  }, []);

  // Calculate order totals
  const orderTotals = {
    subtotal: orderFormData.items.reduce((sum: number, item: OrderItem) => sum + item.itemTotal, 0),
    totalCutUpFee: orderFormData.items.reduce((sum: number, item: OrderItem) => sum + item.cutUpFee, 0),
    deliveryFee,
    total: orderFormData.items.reduce((sum: number, item: OrderItem) => sum + item.itemTotal, 0) + deliveryFee
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return orderFormData.items.length > 0;
      case 2:
        const nameValid = customerInfo.name.trim().length > 0;
        const phoneValid = /^6\d{8}$/.test(customerInfo.phone.replace(/\s|-/g, '')) || /^2376\d{8}$/.test(customerInfo.phone.replace(/\s|-/g, '')) || /^\+2376\d{8}$/.test(customerInfo.phone.replace(/\s|-/g, ''));
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email);
        const timeValid = customerInfo.preferredTime.trim().length > 0;
        if (customerInfo.orderType === 'delivery') return nameValid && phoneValid && emailValid && timeValid && customerInfo.address.length > 0;
        return nameValid && phoneValid && emailValid && timeValid;
      case 3: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else showToast('Please fill in all required fields before proceeding.', 'error');
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || validateStep(step - 1)) setCurrentStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderData = {
        ...customerInfo,
        items: orderFormData.items,
        specialInstructions: orderFormData.specialInstructions,
        ...orderTotals,
        distance: deliveryDistance,
        status: 'Pending'
      };

      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Send order confirmation notifications
      // TODO: Re-enable after notification service is properly set up
      /*
      try {
        const { OrderNotificationService } = await import('@/lib/notifications/order-notifications');
        const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const notificationData = {
          orderId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          items: orderFormData.items,
          total: orderTotals.total,
          deliveryFee: orderTotals.deliveryFee,
          specialInstructions: orderFormData.specialInstructions,
          orderType: customerInfo.orderType,
          address: customerInfo.address,
          preferredTime: customerInfo.preferredTime,
          paymentLink: `${window.location.origin}/payment`
        };

        const notifications = await OrderNotificationService.sendOrderConfirmation(notificationData);
        console.log('Order confirmation notifications sent:', notifications);

        // Store order ID for later use
        localStorage.setItem('currentOrderId', orderId);
      } catch (notificationError) {
        console.error('Failed to send order confirmation:', notificationError);
        // Continue with order process even if notifications fail
      }
      */

      showToast('Order submitted! Proceeding to payment...', 'success');
      setTimeout(() => router.push('/payment'), 1500);
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-[fadeInDown_0.3s_ease-out] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <button onClick={() => router.push('/')} className="absolute left-4 top-4 text-2xl text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">←</button>
        <img src="/logo.png" alt="Logo" className="w-16 h-auto mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">Place Your Order</h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative">
          {/* Progress line behind numbers */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10" />
          <div
            className="absolute top-5 left-0 h-1 bg-yellow-400 rounded-full transition-all duration-500 -z-10"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />

          {/* Step numbers */}
          <div className="flex justify-between relative">
            {[{ num: 1, label: 'Products' }, { num: 2, label: 'Customer Info' }, { num: 3, label: 'Review' }].map((step) => (
              <div key={step.num} className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(step.num)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 mb-1 bg-white border-4
                  ${currentStep === step.num ? 'border-yellow-400 text-gray-800 scale-110 shadow-md' : currentStep > step.num ? 'border-green-600 text-green-600' : 'border-gray-200 text-gray-500'}`} >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span className={`text-xs font-medium ${currentStep === step.num ? 'text-yellow-600' : 'text-gray-400'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <Step1OrderDetails
            formData={orderFormData}
            pricingConfig={pricingConfig}
            onChange={setOrderFormData}
          />
        )}

        {currentStep === 2 && (
          <Step2CustomerInfo
            formData={customerInfo}
            onChange={handleCustomerInfoChange}
            orderTotal={orderTotals.subtotal}
            onDeliveryFeeChange={handleDeliveryFeeChange}
          />
        )}

        {currentStep === 3 && (
          <Step3Preview
            items={orderFormData.items}
            customerInfo={customerInfo}
            totals={orderTotals}
            pricingConfig={pricingConfig}
            onEditOrder={() => setCurrentStep(1)}
            onEditCustomer={() => setCurrentStep(2)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 gap-4">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer">← Previous</button>
          )}
          <div className="flex-1" />
          {currentStep < totalSteps && (
            <button type="button" onClick={nextStep} disabled={!validateStep(currentStep)} className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${validateStep(currentStep) ? 'bg-green-700 text-yellow-400 hover:bg-green-800 shadow-sm' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Next →</button>
          )}
          {currentStep === totalSteps && (
            <button type="submit" disabled={isSubmitting} className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-700 text-yellow-400 hover:bg-green-800 shadow-sm'}`}>
              {isSubmitting ? 'Processing...' : `Proceed to Payment (${orderTotals.total.toLocaleString()} CFA)`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto my-8 px-4 text-center py-12">Loading...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
