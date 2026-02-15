'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleMap({ 
  onLocationSelect, 
  initialCenter = { lat: 4.0581, lng: 9.7043 }, // Douala city center
  zoom = 12,
  height = '400px'
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          return;
        }

        // Load Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          if (window.google && window.google.maps) {
            setIsLoaded(true);
          } else {
            setError('Failed to load Google Maps');
          }
        };

        script.onerror = () => {
          setError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Error loading Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add click handler to map
    map.addListener('click', async (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Remove previous marker if exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Get address from coordinates (reverse geocoding)
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          onLocationSelect(lat, lng, address);
        } else {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    });

    // Add search box for address search
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for a location...';
    input.className = 'map-search-input';
    input.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      width: 300px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      box-sizing: border-box;
    `;

    mapRef.current.appendChild(input);

    const searchBox = new window.google.maps.places.SearchBox(input);
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      // Clear previous marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add marker for selected place
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: map,
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Center map on selected place
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      }

      // Call onLocationSelect with place coordinates
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name;
      onLocationSelect(lat, lng, address);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [isLoaded, initialCenter, zoom, onLocationSelect]);

  if (error) {
    return (
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50" style={{ height }}>
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="text-sm mt-2">Please check your Google Maps API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
