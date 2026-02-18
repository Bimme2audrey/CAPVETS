'use client';

interface FormData {
  productType: string;
  unit: string;
  chickenNature: string;
  weightRange: string;
  quantity: string;
  cutUp: string;
  cutPieces: string;
  specialInstructions: string;
}

interface PricingConfig {
  basePrice: number;
  cutUpFeeLow: number;
  cutUpFeeHigh: number;
  chickenCategories: Record<string, number>;
  productPricing: Record<string, { label: string; units: Record<string, number> }>;
}

interface Step1Props {
  formData: FormData;
  pricingConfig: PricingConfig;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Step1OrderDetails({ formData, pricingConfig, onChange, onProductChange }: Step1Props) {
  const getCutUpFee = (cutPieces: string) => {
    const pieces = parseInt(cutPieces) || 0;
    return pieces > 4 ? pricingConfig.cutUpFeeHigh : pricingConfig.cutUpFeeLow;
  };

  const inputCls = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200';
  const selectCls = inputCls + ' bg-white';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';
  const helpCls = 'text-xs text-gray-400 mt-1';

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Order Details</h3>

      <div>
        <label className={labelCls}>Product *</label>
        <select name="productType" value={formData.productType} onChange={onProductChange} className={selectCls}>
          <option value="chicken">Chicken</option>
          <option value="eggs">Eggs</option>
          <option value="corn">Corn</option>
          <option value="beans">Beans</option>
          <option value="soybean">Soybean</option>
          <option value="palmnuts">Palm nuts</option>
        </select>
        <small className={helpCls}>Choose what you want to order</small>
      </div>

      {formData.productType !== 'chicken' && (
        <div>
          <label className={labelCls}>Unit *</label>
          <select name="unit" value={formData.unit} onChange={onChange} className={selectCls}>
            {Object.entries(pricingConfig.productPricing[formData.productType]?.units || {}).map(([unitKey, price]) => (
              <option key={unitKey} value={unitKey}>{unitKey} - {price.toLocaleString()} CFA</option>
            ))}
          </select>
          <small className={helpCls}>Select unit for {pricingConfig.productPricing[formData.productType]?.label}</small>
        </div>
      )}

      {formData.productType === 'chicken' && (
        <div>
          <label className={labelCls}>Nature of Chicken *</label>
          <select name="chickenNature" value={formData.chickenNature} onChange={onChange} className={selectCls}>
            <option value="live">Live Chicken</option>
            <option value="ready-to-cook">Ready-to-Cook Chicken</option>
          </select>
          <small className={helpCls}>Select the type of chicken you prefer</small>
        </div>
      )}

      {formData.productType === 'chicken' && (
        <div>
          <label className={labelCls}>Chicken Size *</label>
          <select name="weightRange" value={formData.weightRange} onChange={onChange} className={selectCls}>
            <option value="1.5-1.6kg">Small (1.5-1.6kg) - 3,000 CFA</option>
            <option value="1.7-1.8kg">Medium (1.7-1.8kg) - 3,500 CFA</option>
            <option value="1.9-2.1kg">Large (1.9-2.1kg) - 4,000 CFA</option>
            <option value="2.2-2.3kg">Extra Large (2.2-2.3kg) - 4,500 CFA</option>
            <option value="2.4-3kg">Jumbo (2.4-3kg) - 5,000 CFA</option>
          </select>
          <small className={helpCls}>Select the size of chicken you want</small>
        </div>
      )}

      <div>
        <label className={labelCls}>{formData.productType === 'chicken' ? 'Quantity (Number of Chickens) *' : `Quantity (${formData.unit}) *`}</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={onChange} min="1" max="100" required className={inputCls} placeholder={formData.productType === 'chicken' ? 'Enter number of chickens' : `Enter quantity in ${formData.unit}`} />
        <small className={helpCls}>Minimum 1, Maximum 100</small>
      </div>

      {formData.productType === 'chicken' && formData.chickenNature !== 'live' && (
        <div>
          <label className={labelCls}>Cut Up?</label>
          <select name="cutUp" value={formData.cutUp} onChange={onChange} className={selectCls}>
            <option value="no">No - Whole Chicken</option>
            <option value="yes">Yes - Cut Up</option>
          </select>
        </div>
      )}

      {formData.productType === 'chicken' && formData.cutUp === 'yes' && formData.chickenNature !== 'live' && (
        <div>
          <label className={labelCls}>Number of pieces per chicken *</label>
          <input type="number" name="cutPieces" value={formData.cutPieces} onChange={onChange} min="2" max="20" className={inputCls} required />
          <small className={helpCls}>Fee: {getCutUpFee(formData.cutPieces)} CFA per chicken {parseInt(formData.cutPieces) > 4 ? '(>4 pieces)' : '(≤4 pieces)'}</small>
        </div>
      )}

      <div>
        <label className={labelCls}>Special Instructions (Optional)</label>
        <textarea name="specialInstructions" value={formData.specialInstructions} onChange={onChange} placeholder="Any special requests for preparation..." rows={4} className={inputCls + ' resize-y'} />
      </div>

      {formData.quantity && (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3">Price Preview</h4>
          {formData.productType === 'chicken' ? (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formData.quantity} Chicken(s) × {pricingConfig.chickenCategories[formData.weightRange]?.toLocaleString()} CFA</span>
              <span>{(parseInt(formData.quantity) * (pricingConfig.chickenCategories[formData.weightRange] || pricingConfig.basePrice)).toLocaleString()} CFA</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formData.quantity} {pricingConfig.productPricing[formData.productType]?.label} × {pricingConfig.productPricing[formData.productType]?.units?.[formData.unit]?.toLocaleString()} CFA</span>
              <span>{(parseInt(formData.quantity) * (pricingConfig.productPricing[formData.productType]?.units?.[formData.unit] || 0)).toLocaleString()} CFA</span>
            </div>
          )}
          {formData.productType === 'chicken' && formData.cutUp === 'yes' && (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Cut-up fee ({formData.quantity} × {getCutUpFee(formData.cutPieces)})</span>
              <span>{(parseInt(formData.quantity) * getCutUpFee(formData.cutPieces)).toLocaleString()} CFA</span>
            </div>
          )}
          <div className="border-t border-gray-300 mt-2 pt-2 font-bold text-green-700">
            Subtotal: {(() => {
              const qty = parseInt(formData.quantity) || 0;
              const up = formData.productType === 'chicken' ? (pricingConfig.chickenCategories[formData.weightRange] || pricingConfig.basePrice) : (pricingConfig.productPricing[formData.productType]?.units?.[formData.unit] || 0);
              const cut = formData.productType === 'chicken' && formData.cutUp === 'yes' ? qty * getCutUpFee(formData.cutPieces) : 0;
              return (qty * up + cut).toLocaleString();
            })()} CFA
          </div>
        </div>
      )}
    </div>
  );
}
