'use client';

interface FormData {
  productType: string;
  quantity: string;
  unit?: string;
  chickenNature: string;
  weightRange: string;
  cutUp: string;
  cutPieces: string;
  specialInstructions: string;
  name: string;
  phone: string;
  email: string;
  orderType: string;
  address: string;
  preferredTime: string;
}

interface PriceBreakdown {
  subtotal: number;
  cutUpFee: number;
  deliveryFee: number;
  total: number;
}

interface PricingConfig {
  chickenCategories: Record<string, number>;
  productPricing: Record<string, { label: string; units: Record<string, number> }>;
}

interface Step3Props {
  formData: FormData;
  priceBreakdown: PriceBreakdown;
  pricingConfig: PricingConfig;
  onEditOrder: () => void;
  onEditCustomer: () => void;
}

export default function Step3Preview({ formData, priceBreakdown, pricingConfig, onEditOrder, onEditCustomer }: Step3Props) {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Order Preview & Confirmation</h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Order Details */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3">Order Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Product:</span><span className="font-medium">{formData.productType === 'chicken' ? 'Chicken' : formData.productType.charAt(0).toUpperCase() + formData.productType.slice(1)}</span></div>
            {formData.productType === 'chicken' ? (
              <>
                <div className="flex justify-between"><span className="text-gray-500">Nature:</span><span className="font-medium">{formData.chickenNature === 'live' ? 'Live Chicken' : 'Ready-to-Cook'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Size:</span><span className="font-medium">{formData.weightRange} - {pricingConfig.chickenCategories[formData.weightRange]?.toLocaleString()} CFA each</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span className="text-gray-500">Unit:</span><span className="font-medium">{formData.unit}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-500">Quantity:</span><span className="font-medium">{formData.quantity}</span></div>
            {formData.productType === 'chicken' && formData.chickenNature !== 'live' && (
              <div className="flex justify-between"><span className="text-gray-500">Cut Up:</span><span className="font-medium">{formData.cutUp === 'yes' ? `Yes (${formData.cutPieces} pieces)` : 'No - Whole chicken'}</span></div>
            )}
            {formData.specialInstructions && <div className="flex justify-between"><span className="text-gray-500">Instructions:</span><span className="font-medium">{formData.specialInstructions}</span></div>}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3">Customer Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{formData.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium">{formData.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium">{formData.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Order Type:</span><span className="font-medium">{formData.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span></div>
            {formData.orderType === 'delivery' && <div className="flex justify-between"><span className="text-gray-500">Address:</span><span className="font-medium">{formData.address}</span></div>}
            {formData.preferredTime && <div className="flex justify-between"><span className="text-gray-500">Preferred Time:</span><span className="font-medium">{new Date(formData.preferredTime).toLocaleString()}</span></div>}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-5">
          <h4 className="font-bold text-gray-800 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">{formData.quantity} × {formData.productType === 'chicken' ? (pricingConfig.chickenCategories[formData.weightRange]?.toLocaleString() + ' CFA') : (pricingConfig.productPricing[formData.productType]?.units?.[formData.unit || '']?.toLocaleString() + ' CFA')}</span><span className="font-medium">{priceBreakdown.subtotal.toLocaleString()} CFA</span></div>
            {priceBreakdown.cutUpFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Cut-up fee</span><span className="font-medium">{priceBreakdown.cutUpFee.toLocaleString()} CFA</span></div>}
            {priceBreakdown.deliveryFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery fee</span><span className="font-medium">{priceBreakdown.deliveryFee.toLocaleString()} CFA</span></div>}
            <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold text-lg text-green-700"><span>Total:</span><span>{priceBreakdown.total.toLocaleString()} CFA</span></div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onEditOrder} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Edit Order Details</button>
        <button type="button" onClick={onEditCustomer} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Edit Customer Info</button>
      </div>
    </div>
  );
}
