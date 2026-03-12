'use client';

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

interface OrderTotals {
  subtotal: number;
  totalCutUpFee: number;
  deliveryFee: number;
  total: number;
}

interface PricingConfig {
  chickenCategories: Record<string, number>;
  productPricing: Record<string, { label: string; units: Record<string, number> }>;
}

interface Step3Props {
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totals: OrderTotals;
  pricingConfig: PricingConfig;
  onEditOrder: () => void;
  onEditCustomer: () => void;
}

export default function Step3Preview({ items, customerInfo, totals, pricingConfig, onEditOrder, onEditCustomer }: Step3Props) {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Order Preview & Confirmation</h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Order Items */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3">Order Items ({items.length})</h4>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-medium">
                    {item.productType === 'chicken' ? 'Chicken' : item.productType.charAt(0).toUpperCase() + item.productType.slice(1)}
                  </span>
                  {item.productType === 'chicken' && (
                    <span className="text-gray-500 ml-2">
                      ({item.chickenNature === 'live' ? 'Live' : 'Ready-to-Cook'} - {item.weightRange})
                    </span>
                  )}
                  {item.productType !== 'chicken' && (
                    <span className="text-gray-500 ml-2">({item.unit})</span>
                  )}
                  <div className="text-gray-500">
                    {item.quantity} × {item.unitPrice.toLocaleString()} CFA
                    {item.cutUpFee > 0 && (
                      <span className="text-orange-600 ml-2">+ cut-up fee</span>
                    )}
                  </div>
                </div>
                <span className="font-medium">{item.itemTotal.toLocaleString()} CFA</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-5 border-b border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3">Customer Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{customerInfo.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium">{customerInfo.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium">{customerInfo.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Order Type:</span><span className="font-medium">{customerInfo.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span></div>
            {customerInfo.orderType === 'delivery' && <div className="flex justify-between"><span className="text-gray-500">Address:</span><span className="font-medium">{customerInfo.address}</span></div>}
            {customerInfo.preferredTime && <div className="flex justify-between"><span className="text-gray-500">Preferred Time:</span><span className="font-medium">{new Date(customerInfo.preferredTime).toLocaleString()}</span></div>}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-5">
          <h4 className="font-bold text-gray-800 mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal:</span><span className="font-medium">{totals.subtotal.toLocaleString()} CFA</span></div>
            {totals.totalCutUpFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Cut-up fees:</span><span className="font-medium">{totals.totalCutUpFee.toLocaleString()} CFA</span></div>}
            {totals.deliveryFee > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery fee:</span><span className="font-medium">{totals.deliveryFee.toLocaleString()} CFA</span></div>}
            <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold text-lg text-green-700"><span>Total:</span><span>{totals.total.toLocaleString()} CFA</span></div>
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
