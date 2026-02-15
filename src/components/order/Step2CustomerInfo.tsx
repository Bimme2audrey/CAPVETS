'use client';

interface FormData {
  name: string;
  phone: string;
  email: string;
  orderType: string;
  address: string;
  preferredTime: string;
}

interface Step2Props {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function Step2CustomerInfo({ formData, onChange }: Step2Props) {
  const isValidCameroonPhone = (phone: string) => {
    const cleaned = phone.replace(/\s|-/g, '');
    return /^6\d{8}$/.test(cleaned) || /^2376\d{8}$/.test(cleaned) || /^\+2376\d{8}$/.test(cleaned);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const inputCls = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200';
  const selectCls = inputCls + ' bg-white';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Customer & Delivery Information</h3>

      <div>
        <label className={labelCls}>Name *</label>
        <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="Your full name" required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Phone Number *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="e.g., +237 6XX XXX XXX" required className={`${inputCls} ${formData.phone && !isValidCameroonPhone(formData.phone) ? 'border-red-400' : ''}`} />
        {formData.phone && !isValidCameroonPhone(formData.phone) && <p className="text-red-500 text-xs mt-1">Enter a valid Cameroon phone number</p>}
      </div>

      <div>
        <label className={labelCls}>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="e.g., your@email.com" required className={`${inputCls} ${formData.email && !isValidEmail(formData.email) ? 'border-red-400' : ''}`} />
        {formData.email && !isValidEmail(formData.email) && <p className="text-red-500 text-xs mt-1">Enter a valid email address</p>}
      </div>

      <div>
        <label className={labelCls}>Order Type</label>
        <select name="orderType" value={formData.orderType} onChange={onChange} className={selectCls}>
          <option value="pickup">Pickup (Free)</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {formData.orderType === 'delivery' && (
        <div>
          <label className={labelCls}>Delivery Address *</label>
          <input type="text" name="address" value={formData.address} onChange={onChange} placeholder="e.g., Bonanjo, Mambanda" required className={inputCls} />
        </div>
      )}

      <div>
        <label className={labelCls}>Preferred Time *</label>
        <input type="datetime-local" name="preferredTime" value={formData.preferredTime} onChange={onChange} min={new Date().toISOString().slice(0, 16)} required className={inputCls} />
      </div>
    </div>
  );
}
