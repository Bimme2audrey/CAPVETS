'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';
import Step1OrderDetails from '@/components/order/Step1OrderDetails';
import Step2CustomerInfo from '@/components/order/Step2CustomerInfo';
import Step3Preview from '@/components/order/Step3Preview';

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

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    productType: 'chicken',
    unit: 'crate',
    chickenNature: 'live',
    weightRange: '1.5-1.6kg',
    quantity: '',
    cutUp: 'no',
    cutPieces: '8',
    selectedParts: [] as string[],
    chickenState: 'fresh',
    specialInstructions: '',
    name: '',
    phone: '',
    email: '',
    orderType: 'pickup',
    address: '',
    preferredTime: '',
    status: 'Pending',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState({ subtotal: 0, cutUpFee: 0, deliveryFee: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Handle pre-selected product from Gallery
  useEffect(() => {
    const productType = searchParams.get('productType');
    const weightRange = searchParams.get('weightRange');
    const unit = searchParams.get('unit');
    if (productType) {
      setFormData((prev) => ({
        ...prev,
        productType,
        ...(weightRange ? { weightRange } : {}),
        ...(unit ? { unit } : {}),
      }));
    }
  }, [searchParams]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updates = { ...prev, [name]: value };
      if (name === 'cutUp' && value === 'no') updates.selectedParts = [];
      if (name === 'chickenNature' && value === 'live') { updates.cutUp = 'no'; updates.selectedParts = []; }
      return updates;
    });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      productType: value,
      quantity: '',
      cutUp: 'no',
      cutPieces: '8',
      selectedParts: [],
      unit: value === 'chicken' ? prev.unit : (Object.keys(pricingConfig.productPricing[value]?.units || { crate: 0 })[0] || 'crate')
    }));
  };

  const getCutUpFee = (cutPieces: string) => {
    const pieces = parseInt(cutPieces) || 0;
    return pieces > 4 ? pricingConfig.cutUpFeeHigh : pricingConfig.cutUpFeeLow;
  };

  const getDeliveryFee = useCallback((dist: number) => {
    for (const zone of Object.values(pricingConfig.deliveryZones)) {
      if (dist <= zone.maxDistance) return zone.fee;
    }
    return pricingConfig.deliveryZones.zone4.fee;
  }, []);

  // Calculate pricing
  useEffect(() => {
    const quantity = parseInt(formData.quantity) || 0;
    const isChicken = formData.productType === 'chicken';
    const unitPrice = isChicken
      ? (pricingConfig.chickenCategories[formData.weightRange] || pricingConfig.basePrice)
      : (pricingConfig.productPricing[formData.productType]?.units?.[formData.unit] || 0);
    const subtotal = quantity * unitPrice;
    let cutUpFee = 0;
    if (isChicken && formData.cutUp === 'yes') {
      cutUpFee = quantity * getCutUpFee(formData.cutPieces);
    }
    const deliveryFee = formData.orderType === 'delivery' ? 0 : 0; // Simplified for now
    setPriceBreakdown({ subtotal, cutUpFee, deliveryFee, total: subtotal + cutUpFee + deliveryFee });
  }, [formData.quantity, formData.productType, formData.weightRange, formData.unit, formData.cutUp, formData.cutPieces, formData.orderType]);

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (formData.productType === 'chicken') return !!(formData.chickenNature && formData.weightRange && formData.quantity && parseInt(formData.quantity) > 0);
        return !!(formData.productType && formData.unit && formData.quantity && parseInt(formData.quantity) > 0);
      case 2:
        const nameValid = formData.name.trim().length > 0;
        const phoneValid = /^6\d{8}$/.test(formData.phone.replace(/\s|-/g, '')) || /^2376\d{8}$/.test(formData.phone.replace(/\s|-/g, '')) || /^\+2376\d{8}$/.test(formData.phone.replace(/\s|-/g, ''));
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        const timeValid = formData.preferredTime.trim().length > 0;
        if (formData.orderType === 'delivery') return nameValid && phoneValid && emailValid && timeValid && formData.address.length > 0;
        return nameValid && phoneValid && emailValid && timeValid;
      case 3: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) setCurrentStep(currentStep + 1);
    else showToast('Please fill in all required fields before proceeding.', 'error');
  };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const goToStep = (step: number) => { if (step <= currentStep || validateStep(step - 1)) setCurrentStep(step); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderData = { ...formData, total: priceBreakdown.total, subtotal: priceBreakdown.subtotal, cutUpFee: priceBreakdown.cutUpFee, deliveryFee: priceBreakdown.deliveryFee, distance: 0 };
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      showToast('Order confirmed! Redirecting to payment...', 'success');
      setTimeout(() => router.push('/payment'), 1500);
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
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
            {[{ num: 1, label: 'Order Details' }, { num: 2, label: 'Customer Info' }, { num: 3, label: 'Preview' }].map((step) => (
              <div key={step.num} className="flex flex-col items-center cursor-pointer" onClick={() => goToStep(step.num)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 mb-1 bg-white border-4
                  ${currentStep === step.num ? 'border-yellow-400 text-gray-800 scale-110 shadow-md' : currentStep > step.num ? 'border-green-600 text-green-600' : 'border-gray-200 text-gray-500'}`}>
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
        {currentStep === 1 && <Step1OrderDetails formData={formData} pricingConfig={pricingConfig} onChange={handleChange} onProductChange={handleProductChange} />}
        {currentStep === 2 && <Step2CustomerInfo formData={formData} onChange={handleChange} />}
        {currentStep === 3 && <Step3Preview formData={formData} priceBreakdown={priceBreakdown} pricingConfig={pricingConfig} onEditOrder={() => setCurrentStep(1)} onEditCustomer={() => setCurrentStep(2)} />}

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
              {isSubmitting ? 'Processing...' : `Proceed to Payment (${priceBreakdown.total.toLocaleString()} CFA)`}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
