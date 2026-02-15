'use client';

import { useState } from 'react';
import { useDeliveryCalculation } from '@/hooks/useDeliveryCalculation';
import GoogleMap from '@/components/GoogleMap';

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
  orderTotal?: number; // Add order total for delivery calculation
  onDeliveryFeeChange?: (fee: number) => void; // Callback to update parent with delivery fee
}

export default function Step2CustomerInfo({
  formData,
  onChange,
  orderTotal = 0,
  onDeliveryFeeChange
}: Step2Props) {
  const [showMap, setShowMap] = useState(false);
  const {
    selectedLocation,
    deliveryInfo,
    isCalculating,
    error,
    updateLocation,
    calculateDelivery
  } = useDeliveryCalculation();

  const isValidCameroonPhone = (phone: string) => {
    const cleaned = phone.replace(/\s|-/g, '');
    return /^6\d{8}$/.test(cleaned) || /^2376\d{8}$/.test(cleaned) || /^\+2376\d{8}$/.test(cleaned);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const inputCls = 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200';
  const selectCls = inputCls + ' bg-white';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    updateLocation(lat, lng, address);
    // Update the address field with the selected location
    const syntheticEvent = {
      target: { name: 'address', value: address || `${lat}, ${lng}` }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Calculate delivery when location is confirmed
  const handleConfirmDelivery = async () => {
    const result = await calculateDelivery(orderTotal);
    if (result && onDeliveryFeeChange) {
      onDeliveryFeeChange(result.deliveryFee);
    }
  };

  // Reset delivery info when switching to pickup
  const handleOrderTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
    if (e.target.value === 'pickup' && onDeliveryFeeChange) {
      onDeliveryFeeChange(0); // Reset delivery fee for pickup
    }
  };

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
        <select name="orderType" value={formData.orderType} onChange={handleOrderTypeChange} className={selectCls}>
          <option value="pickup">Pickup (Free)</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {formData.orderType === 'delivery' && (
        <>
          <div>
            <label className={labelCls}>Delivery Address *</label>
            <div className="space-y-3">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
                placeholder="Click 'Select Location on Map' to set delivery address"
                required
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full bg-green-700 text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                {showMap ? 'Hide Map' : '📍 Select Location on Map'}
              </button>
            </div>
          </div>

          {/* Real Google Map */}
          {showMap && (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">Click on the map or search for your delivery location</p>

              <GoogleMap
                onLocationSelect={handleLocationSelect}
                initialCenter={{ lat: 4.061579298251527, lng: 9.75264045767144 }} // Your business location
                height="400px"
              />

              {selectedLocation && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700">
                    📍 Selected: {selectedLocation.address || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirmDelivery}
                    disabled={isCalculating}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {isCalculating ? '🔄 Calculating...' : '✅ Confirm Location & Calculate Fee'}
                  </button>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  ⚠️ {error}
                </div>
              )}

              {deliveryInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <h4 className="font-semibold text-green-800 mb-2">📦 Delivery Details:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Distance: {deliveryInfo.distance} km</p>
                    <p>Delivery Fee: {deliveryInfo.deliveryFee.toLocaleString()} CFA</p>
                    <p>Estimated Time: {deliveryInfo.estimatedTime}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div>
        <label className={labelCls}>Preferred Time *</label>
        <input type="datetime-local" name="preferredTime" value={formData.preferredTime} onChange={onChange} min={new Date().toISOString().slice(0, 16)} required className={inputCls} />
      </div>
    </div>
  );
}
