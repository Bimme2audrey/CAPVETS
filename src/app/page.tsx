'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';
import { Egg, Fish, Wheat, Sprout, Snail, PiggyBank } from 'lucide-react';

const CHICKEN_CATEGORIES: Record<string, { weight: string; price: number; label: string; color: string }> = {
  '1.5-1.6kg': { weight: '1.5-1.6kg', price: 3000, label: 'Small (1.5-1.6kg)', color: '#10b981' },
  '1.7-1.8kg': { weight: '1.7-1.8kg', price: 3500, label: 'Medium (1.7-1.8kg)', color: '#f59e0b' },
  '1.9-2.1kg': { weight: '1.9-2.1kg', price: 4000, label: 'Large (1.9-2.1kg)', color: '#8b5cf6' },
  '2.2-2.3kg': { weight: '2.2-2.3kg', price: 4500, label: 'Extra Large (2.2-2.3kg)', color: '#ef4444' },
  '2.4-3kg': { weight: '2.4-3kg', price: 5000, label: 'Jumbo (2.4-3kg)', color: '#06b6d4' },
};

const PRODUCT_PRICING: Record<string, { label: string; units: Record<string, number> }> = {
  eggs: { label: 'Eggs', units: { crate: 3500, dozen: 1200 } },
  corn: { label: 'Corn', units: { kg: 400, bag: 15000 } },
  beans: { label: 'Beans', units: { kg: 800, bag: 28000 } },
  soybean: { label: 'Soybean', units: { kg: 900, bag: 32000 } },
  palmnuts: { label: 'Palm nuts', units: { kg: 700, sack: 25000 } },
  snails: { label: 'Snails', units: { dozen: 5000, kg: 7000 } },
  pigs: { label: 'Pigs', units: { kg: 2500, whole: 120000 } },
  fish: { label: 'Fish', units: { kg: 1800, carton: 45000 } },
};

interface MediaItem {
  url: string;
  type: string;
  description?: string;
  title?: string;
  public_id?: string;
  thumbnail?: string;
  productType?: string;
  chickenCategory?: string;
}

export default function Gallery() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MEDIA);
      const data = await response.json();
      if (data.result === 'success') {
        const validMedia = (data.data || []).filter((item: MediaItem) => item.url && item.url.trim() !== '');
        setMedia(validMedia);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'images' || activeFilter === 'videos') return item.type === activeFilter;
      return true;
    });
  }, [media, activeFilter]);

  const getCategoryForMedia = useCallback((item: MediaItem) => {
    if (!item.description) return null;
    const d = item.description.toLowerCase();
    if (d.includes('1.5') || d.includes('1.6')) return '1.5-1.6kg';
    if (d.includes('1.7') || d.includes('1.8')) return '1.7-1.8kg';
    if (d.includes('1.9') || d.includes('2.0') || d.includes('2.1')) return '1.9-2.1kg';
    if (d.includes('2.2') || d.includes('2.3')) return '2.2-2.3kg';
    if (d.includes('2.4') || d.includes('2.5') || d.includes('3.0')) return '2.4-3kg';
    if (d.includes('small')) return '1.5-1.6kg';
    if (d.includes('medium')) return '1.7-1.8kg';
    if (d.includes('large')) return '1.9-2.1kg';
    if (d.includes('extra large') || d.includes('extra-large')) return '2.2-2.3kg';
    if (d.includes('jumbo')) return '2.4-3kg';
    return null;
  }, []);

  const getProductForMedia = useCallback((item: MediaItem): string | null => {
    // First check if productType is explicitly set in the media item
    if (item.productType) {
      return item.productType;
    }
    // Fallback to description-based detection
    const t = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    if (t.includes('chicken') || t.includes('poulet')) return 'chicken';
    if (t.includes('egg') || t.includes('oeuf')) return 'eggs';
    if (t.includes('corn') || t.includes('maize') || t.includes('mais')) return 'corn';
    if (t.includes('bean') || t.includes('haricot')) return 'beans';
    if (t.includes('soy') || t.includes('soja')) return 'soybean';
    if (t.includes('palm') || t.includes('palmnut') || t.includes('noix de palme')) return 'palmnuts';
    if (t.includes('snail') || t.includes('escargot')) return 'snails';
    if (t.includes('pig') || t.includes('pork') || t.includes('porc')) return 'pigs';
    if (t.includes('fish') || t.includes('poisson')) return 'fish';
    return null;
  }, []);

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setActiveFilter(categoryKey);
    setSelectedProduct('chicken');
    setSelectedUnit(null);
  };

  const handleOrderNow = () => {
    if (selectedProduct === 'chicken' && selectedCategory) {
      const cat = CHICKEN_CATEGORIES[selectedCategory];
      router.push(`/order?productType=chicken&weightRange=${cat.weight}&price=${cat.price}&label=${encodeURIComponent(cat.label)}`);
      return;
    }
    if (selectedProduct && selectedProduct !== 'chicken') {
      const unit = selectedUnit || Object.keys(PRODUCT_PRICING[selectedProduct].units)[0];
      router.push(`/order?productType=${selectedProduct}&unit=${unit}`);
      return;
    }
    router.push('/order');
  };

  const MediaCard = ({ item, isCategory = false, categoryData = null }: {
    item: MediaItem;
    isCategory?: boolean;
    categoryData?: { key: string; weight: string; price: number; label: string; color: string } | null;
  }) => {
    const handleCardClick = () => {
      const product = getProductForMedia(item);
      if (isCategory && categoryData) {
        handleCategorySelect(categoryData.key);
        const cat = CHICKEN_CATEGORIES[categoryData.key];
        router.push(`/order?productType=chicken&weightRange=${cat.weight}&price=${cat.price}&label=${encodeURIComponent(cat.label)}`);
        return;
      }
      if (product) {
        setSelectedProduct(product);
        setSelectedCategory(null);
        setActiveFilter('all');
        if (product === 'chicken') {
          // Use stored chickenCategory if available
          const weightRange = item.chickenCategory || '1.5-1.6kg';
          const cat = CHICKEN_CATEGORIES[weightRange];
          if (cat) {
            router.push(`/order?productType=chicken&weightRange=${cat.weight}&price=${cat.price}&label=${encodeURIComponent(cat.label)}`);
          } else {
            router.push(`/order?productType=chicken`);
          }
        } else {
          const defaultUnit = Object.keys(PRODUCT_PRICING[product].units)[0];
          setSelectedUnit(defaultUnit);
          router.push(`/order?productType=${product}&unit=${defaultUnit}`);
        }
      }
    };

    const isSelected = selectedCategory === categoryData?.key;

    return (
      <div
        className={`relative rounded-xl overflow-hidden shadow-md bg-white border transition-all duration-300 cursor-pointer aspect-[4/3] flex flex-col hover:-translate-y-1 hover:shadow-lg group
          ${isCategory ? '' : ''}
          ${isSelected ? 'border-[3px] border-green-700 shadow-[0_0_0_3px_rgba(0,150,64,0.3)]' : 'border-gray-200'}
        `}
        onClick={handleCardClick}
      >
        {item.type === 'videos' ? (
          <video controls className="w-full h-full object-cover rounded-xl" poster={item.thumbnail}>
            <source src={item.url} type="video/mp4" />
          </video>
        ) : (
          <img
            src={item.url}
            alt={item.description || 'Gallery image'}
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-[1.02]"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Category overlay */}
        {isCategory && categoryData && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 text-white transition-transform duration-300 backdrop-blur-sm border-t border-white/20
            ${isSelected
              ? 'translate-y-0 bg-gradient-to-t from-green-700/90 to-transparent'
              : 'translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/80 to-transparent'
            }`}>
            <div className="text-sm font-semibold mb-0.5">{categoryData.label}</div>
            <div className="text-base font-bold mb-2">{categoryData.price.toLocaleString()} CFA</div>
            <div className="w-full h-[3px] rounded" style={{ backgroundColor: categoryData.color }}></div>
          </div>
        )}

        {/* Product badge */}
        {!isCategory && getProductForMedia(item) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm border-t border-white/20">
            <p className="m-0 font-semibold text-center">
              {(PRODUCT_PRICING[getProductForMedia(item)!]?.label || getProductForMedia(item))?.toUpperCase()}
            </p>
          </div>
        )}

        {/* Description */}
        {!isCategory && !getProductForMedia(item) && item.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm border-t border-white/20">
            <p className="m-0 font-semibold text-center">{item.description}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Product Icons - Desktop Only */}
      <div className="hidden lg:block fixed inset-0 pointer-events-none overflow-hidden">
        {/* Egg Icons */}
        <div className="absolute top-20 left-10 text-orange-300 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '0s' }}>
          <Egg size={48} />
        </div>
        <div className="absolute top-40 right-20 text-orange-300 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '1s' }}>
          <Egg size={40} />
        </div>

        {/* Fish Icons */}
        <div className="absolute top-60 left-32 text-blue-300 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '2s' }}>
          <Fish size={44} />
        </div>
        <div className="absolute bottom-40 right-16 text-blue-300 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '3s' }}>
          <Fish size={40} />
        </div>

        {/* Corn Icons */}
        <div className="absolute top-80 right-32 text-yellow-400 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '1.5s' }}>
          <Wheat size={44} />
        </div>
        <div className="absolute bottom-60 left-20 text-yellow-400 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '2.5s' }}>
          <Wheat size={40} />
        </div>

        {/* Bean Icons */}
        <div className="absolute top-32 left-48 text-green-300 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '0.5s' }}>
          <Sprout size={40} />
        </div>
        <div className="absolute bottom-32 right-48 text-green-300 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '3.5s' }}>
          <Sprout size={44} />
        </div>

        {/* Snail Icons */}
        <div className="absolute top-52 right-40 text-purple-300 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '1.2s' }}>
          <Snail size={40} />
        </div>
        <div className="absolute bottom-52 left-40 text-purple-300 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '2.8s' }}>
          <Snail size={36} />
        </div>

        {/* Pig Icons */}
        <div className="absolute top-72 left-64 text-pink-300 opacity-40 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '0.8s' }}>
          <PiggyBank size={44} />
        </div>
        <div className="absolute bottom-72 right-64 text-pink-300 opacity-35 animate-[float_6s_ease-in-out_infinite" style={{ animationDelay: '3.2s' }}>
          <PiggyBank size={40} />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto my-8 px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 px-4">
          <img
            src="/logo.png"
            alt="CapVets Logo"
            className="w-20 h-auto mb-6 mx-auto animate-[fadeInDown_0.8s_ease-out]"
          />
          <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-[fadeInUp_0.8s_ease-out]">
            Our Products
          </h1>
          <p className="text-gray-500 text-lg animate-[fadeInUp_0.8s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
            Take a look at our quality products before placing your order
          </p>

          {/* Filters */}
          <div className="flex justify-center gap-3 mt-8 animate-[fadeInUp_0.8s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards] flex-wrap">
            {['all', 'images', 'videos'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 border-2 border-yellow-400 rounded-full font-medium text-sm min-w-[80px] transition-all duration-300 cursor-pointer
                ${activeFilter === filter
                    ? 'bg-yellow-400 text-gray-800 shadow-sm'
                    : 'bg-transparent text-gray-800 hover:bg-yellow-400 hover:text-gray-800'
                  }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All' : filter === 'images' ? 'Photos' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center p-12 text-gray-500">
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center p-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <p>No media items to display.</p>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 p-4">
            {filteredMedia.map((item, index) => {
              const categoryKey = getCategoryForMedia(item);
              const isCategory = categoryKey !== null;
              return (
                <MediaCard
                  key={item.public_id || index}
                  item={item}
                  isCategory={isCategory}
                  categoryData={isCategory ? { key: categoryKey, ...CHICKEN_CATEGORIES[categoryKey] } : null}
                />
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center my-12 px-4">
          {selectedProduct === 'chicken' && selectedCategory && (
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-700 rounded-xl p-6 mb-6 max-w-md mx-auto">
              <h4 className="text-green-700 text-lg font-semibold mb-2">
                Selected: {CHICKEN_CATEGORIES[selectedCategory].label}
              </h4>
              <p className="text-gray-800 font-medium">
                Price: {CHICKEN_CATEGORIES[selectedCategory].price.toLocaleString()} CFA per chicken
              </p>
            </div>
          )}
          {selectedProduct && selectedProduct !== 'chicken' && (
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-700 rounded-xl p-6 mb-6 max-w-md mx-auto">
              <h4 className="text-green-700 text-lg font-semibold mb-2">
                Selected: {PRODUCT_PRICING[selectedProduct].label}
              </h4>
              <p className="text-gray-800 font-medium">
                Unit: {selectedUnit || Object.keys(PRODUCT_PRICING[selectedProduct].units)[0]}
              </p>
              <p className="text-gray-800 font-medium">
                Price: {(PRODUCT_PRICING[selectedProduct].units[selectedUnit || Object.keys(PRODUCT_PRICING[selectedProduct].units)[0]]).toLocaleString()} CFA per unit
              </p>
            </div>
          )}
          <button
            className="inline-block px-8 py-4 bg-green-700 text-yellow-400 rounded-lg font-semibold text-lg min-w-[200px] text-center shadow-sm transition-all duration-300 hover:bg-green-800 hover:scale-105 hover:shadow-md cursor-pointer"
            onClick={handleOrderNow}
          >
            {selectedProduct === 'chicken' && selectedCategory
              ? `Order ${CHICKEN_CATEGORIES[selectedCategory].label} 🛒`
              : selectedProduct && selectedProduct !== 'chicken'
                ? `Order ${PRODUCT_PRICING[selectedProduct].label} 🛒`
                : 'Order Now 🛒'}
          </button>
        </div>
      </div>
    </div>
  );
}
