'use client';

import { useState, useEffect } from 'react';

interface BusinessSettings {
  businessName: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'CAPVETS',
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    operatingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (res.ok) {
        const data = await res.json();
        const mergedSettings = {
          businessName: data.businessName || 'CAPVETS',
          contact: {
            phone: data.contact?.phone || '',
            email: data.contact?.email || '',
            address: data.contact?.address || ''
          },
          operatingHours: {
            monday: { open: data.operatingHours?.monday?.open || '08:00', close: data.operatingHours?.monday?.close || '18:00', closed: data.operatingHours?.monday?.closed || false },
            tuesday: { open: data.operatingHours?.tuesday?.open || '08:00', close: data.operatingHours?.tuesday?.close || '18:00', closed: data.operatingHours?.tuesday?.closed || false },
            wednesday: { open: data.operatingHours?.wednesday?.open || '08:00', close: data.operatingHours?.wednesday?.close || '18:00', closed: data.operatingHours?.wednesday?.closed || false },
            thursday: { open: data.operatingHours?.thursday?.open || '08:00', close: data.operatingHours?.thursday?.close || '18:00', closed: data.operatingHours?.thursday?.closed || false },
            friday: { open: data.operatingHours?.friday?.open || '08:00', close: data.operatingHours?.friday?.close || '18:00', closed: data.operatingHours?.friday?.closed || false },
            saturday: { open: data.operatingHours?.saturday?.open || '08:00', close: data.operatingHours?.saturday?.close || '18:00', closed: data.operatingHours?.saturday?.closed || false },
            sunday: { open: data.operatingHours?.sunday?.open || '08:00', close: data.operatingHours?.sunday?.close || '18:00', closed: data.operatingHours?.sunday?.closed || true }
          }
        };
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Settings</h2>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg border ${message.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.contact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="+237 6XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="business@capvets.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <textarea
                value={settings.contact.address}
                onChange={(e) => handleContactChange('address', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your business address"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Hours</h3>

          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <label className="text-sm font-medium text-gray-700">{dayLabels[day]}</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.operatingHours[day].closed}
                    onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label className="text-sm text-gray-600">Closed</label>
                </div>

                {!settings.operatingHours[day].closed && (
                  <>
                    <input
                      type="time"
                      value={settings.operatingHours[day].open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={settings.operatingHours[day].close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </>
                )}

                {settings.operatingHours[day].closed && (
                  <span className="text-gray-400 italic">Closed all day</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-700 text-yellow-400 hover:bg-green-800'
              }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
