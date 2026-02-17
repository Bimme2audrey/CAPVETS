'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api';

interface MediaItem {
  _id?: string;
  public_id?: string;
  url: string;
  type: string;
  description?: string;
  productType?: string;
  chickenCategory?: string;
}

const PRODUCT_OPTIONS = [
  { value: '', label: 'Select Product Type' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'corn', label: 'Corn' },
  { value: 'beans', label: 'Beans' },
  { value: 'soybean', label: 'Soybean' },
  { value: 'palmnuts', label: 'Palm Nuts' },
  { value: 'snails', label: 'Snails' },
  { value: 'pigs', label: 'Pigs' },
  { value: 'fish', label: 'Fish' },
];

const CHICKEN_CATEGORIES = [
  { value: '', label: 'Select Size' },
  { value: '1.5-1.6kg', label: 'Small (1.5-1.6kg) - 3,000 CFA' },
  { value: '1.7-1.8kg', label: 'Medium (1.7-1.8kg) - 3,500 CFA' },
  { value: '1.9-2.1kg', label: 'Large (1.9-2.1kg) - 4,000 CFA' },
  { value: '2.2-2.3kg', label: 'Extra Large (2.2-2.3kg) - 4,500 CFA' },
  { value: '2.4-3kg', label: 'Jumbo (2.4-3kg) - 5,000 CFA' },
];

export default function MediaManagerPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [chickenCategory, setChickenCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.MEDIA);
      const data = await res.json();
      if (data.result === 'success') {
        setMedia(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    // Reset product type when switching from video to image or vice versa
    if (file) {
      if (file.type.startsWith('video/')) {
        setProductType('');
        setChickenCategory('');
      }
    }
  };

  const isVideo = selectedFile?.type.startsWith('video/') || false;
  const isImage = selectedFile?.type.startsWith('image/') || false;

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('description', description);
      formData.append('productType', productType);
      formData.append('chickenCategory', chickenCategory);

      const res = await fetch(API_ENDPOINTS.MEDIA, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });

      if (res.ok) {
        setDescription('');
        setProductType('');
        setChickenCategory('');
        setSelectedFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchMedia();
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm('Delete this media item?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_ENDPOINTS.MEDIA}/${publicId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      fetchMedia();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getProductLabel = (type: string) => {
    const product = PRODUCT_OPTIONS.find(p => p.value === type);
    return product?.label || type;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CHICKEN_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Media Manager</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">File *</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {selectedFile && (
              <div className="mt-1 text-xs text-gray-500">
                {isVideo ? '📹 Video detected' : '🖼️ Image detected'}
              </div>
            )}
          </div>

          {isImage && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Type *</label>
                <select
                  value={productType}
                  onChange={(e) => {
                    setProductType(e.target.value);
                    if (e.target.value !== 'chicken') setChickenCategory('');
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-yellow-400 focus:outline-none bg-white"
                >
                  {PRODUCT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {productType === 'chicken' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chicken Size</label>
                  <select
                    value={chickenCategory}
                    onChange={(e) => setChickenCategory(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-yellow-400 focus:outline-none bg-white"
                  >
                    {CHICKEN_CATEGORIES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {isVideo && (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Video Type</label>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                📹 Video - No product type needed
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || (isImage && !productType) || !selectedFile}
          className="px-6 py-2.5 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800 transition-colors disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        {isImage && !productType && (
          <p className="mt-2 text-sm text-amber-600">
            ⚠️ Please select a product type for images
          </p>
        )}
      </form>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No media items yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item, index) => (
            <div key={item.public_id || index} className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative">
              {item.type === 'videos' ? (
                <video controls className="w-full h-48 object-cover">
                  <source src={item.url} type="video/mp4" />
                </video>
              ) : (
                <img src={item.url} alt={item.description || 'Media'} className="w-full h-48 object-cover" />
              )}
              <div className="p-3">
                {item.productType && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {getProductLabel(item.productType)}
                    </span>
                    {item.chickenCategory && (
                      <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        {item.chickenCategory}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-600 truncate">{item.description || 'No description'}</p>
              </div>
              {item.public_id && (
                <button
                  onClick={() => handleDelete(item.public_id!)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-red-600 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
