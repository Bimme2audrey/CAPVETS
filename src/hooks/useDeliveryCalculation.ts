import { useState, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface DeliveryInfo {
  distance: number;
  deliveryFee: number;
  estimatedTime: string;
}

export function useDeliveryCalculation() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update location when user clicks on map
  const updateLocation = useCallback((lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address });
    setDeliveryInfo(null); // Reset delivery info when location changes
    setError(null);
  }, []);

  // Calculate delivery fee when user confirms location
  const calculateDelivery = useCallback(async (orderTotal: number) => {
    if (!selectedLocation) {
      setError('Please select a delivery location');
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          orderTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate delivery');
      }

      setDeliveryInfo(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delivery calculation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [selectedLocation]);

  // Reset everything
  const reset = useCallback(() => {
    setSelectedLocation(null);
    setDeliveryInfo(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    selectedLocation,
    deliveryInfo,
    isCalculating,
    error,
    updateLocation,
    calculateDelivery,
    reset,
  };
}
