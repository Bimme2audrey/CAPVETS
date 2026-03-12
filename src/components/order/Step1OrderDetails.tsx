'use client';

import { useState } from 'react';

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

interface FormData {
  items: OrderItem[];
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
  onChange: (formData: FormData) => void;
}

export default function Step1OrderDetails({ formData, pricingConfig, onChange }: Step1Props) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [expandedChicken, setExpandedChicken] = useState<string | null>(null);
  const [chickenType, setChickenType] = useState<string>('live'); // Track selected chicken type

  const getCutUpFee = (cutPieces: string) => {
    const pieces = parseInt(cutPieces) || 0;
    return pieces > 4 ? pricingConfig.cutUpFeeHigh : pricingConfig.cutUpFeeLow;
  };

  const calculateItemPrice = (item: Partial<OrderItem>) => {
    let unitPrice = 0;
    let cutUpFee = 0;

    if (!item.productType || !item.quantity) {
      return { unitPrice: 0, itemTotal: 0, cutUpFee: 0 };
    }

    if (item.productType === 'chicken') {
      unitPrice = pricingConfig.chickenCategories[item.weightRange || '1.5-1.6kg'] || 0;
    } else {
      unitPrice = pricingConfig.productPricing[item.productType]?.units?.[item.unit || ''] || 0;
    }

    const subtotal = unitPrice * (item.quantity || 0);

    if (item.productType === 'chicken' && item.cutUp === 'yes') {
      cutUpFee = (item.quantity || 0) * getCutUpFee(item.cutPieces || '6');
    }

    return {
      unitPrice,
      itemTotal: subtotal + cutUpFee,
      cutUpFee
    };
  };

  const addChickenItem = (weightRange: string, quantity: number) => {
    const pricing = calculateItemPrice({
      productType: 'chicken',
      weightRange,
      quantity,
      chickenNature: chickenType, // Use the selected chicken type
      cutUp: chickenType === 'ready-to-cook' ? 'no' : 'no' // Default to no cut up
    });

    const item: OrderItem = {
      id: Date.now().toString() + Math.random(),
      productType: 'chicken',
      unit: '',
      chickenNature: chickenType, // Use the selected chicken type
      weightRange,
      quantity,
      cutUp: chickenType === 'ready-to-cook' ? 'no' : 'no', // Default to no cut up
      cutPieces: '',
      unitPrice: pricing.unitPrice,
      itemTotal: pricing.itemTotal,
      cutUpFee: pricing.cutUpFee
    };

    onChange({ ...formData, items: [...formData.items, item] });
  };

  const addProductItem = (productType: string, unit: string, quantity: number) => {
    const pricing = calculateItemPrice({
      productType,
      unit,
      quantity
    });

    const item: OrderItem = {
      id: Date.now().toString() + Math.random(),
      productType,
      unit,
      chickenNature: '',
      weightRange: '',
      quantity,
      cutUp: 'no',
      cutPieces: '',
      unitPrice: pricing.unitPrice,
      itemTotal: pricing.itemTotal,
      cutUpFee: pricing.cutUpFee
    };

    onChange({ ...formData, items: [...formData.items, item] });
  };

  const removeItem = (id: string) => {
    onChange({ ...formData, items: formData.items.filter(item => item.id !== id) });
  };

  const updateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const pricing = calculateItemPrice({ ...item, quantity: newQuantity });
        return {
          ...item,
          quantity: newQuantity,
          unitPrice: pricing.unitPrice,
          itemTotal: pricing.itemTotal,
          cutUpFee: pricing.cutUpFee
          // Don't overwrite cutPieces, cutUp, etc.
        };
      }
      return item;
    });

    onChange({ ...formData, items: updatedItems });
  };

  const inputCls = 'w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  const orderSubtotal = formData.items.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalCutUpFee = formData.items.reduce((sum, item) => sum + (item.cutUpFee || 0), 0);
  const baseSubtotal = orderSubtotal - totalCutUpFee;

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Order Details</h3>

      {/* Product Selection */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            🛒 Select Products
            <span className="text-xs text-gray-500 font-normal">Tap to see options</span>
          </h4>
        </div>

        <div className="p-4">
          {/* Chicken Product */}
          <div className="mb-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedProduct(selectedProduct === 'chicken' ? null : 'chicken');
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${selectedProduct === 'chicken'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">Chicken</div>
                    <div className="text-xs text-gray-500">Multiple sizes available</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formData.items.filter(item => item.productType === 'chicken').length} items
                  </span>
                  <span className="text-gray-400">
                    {selectedProduct === 'chicken' ? '▲' : '▼'}
                  </span>
                </div>
              </div>
            </button>

            {/* Chicken Options Dropdown */}
            {selectedProduct === 'chicken' && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="font-semibold text-gray-700 mb-3">Select Chicken Options</h5>

                {/* Chicken Nature Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chicken Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChickenType('live')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${chickenType === 'live'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      Live Chicken
                    </button>
                    <button
                      type="button"
                      onClick={() => setChickenType('ready-to-cook')}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${chickenType === 'ready-to-cook'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      Ready-to-Cook
                    </button>
                  </div>
                </div>

                {/* Only show size selection if chicken type is selected */}
                {chickenType && (
                  <>
                    {/* Chicken Size Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chicken Size</label>
                      <div className="space-y-2">
                        {Object.entries(pricingConfig.chickenCategories).map(([weightRange, price]) => {
                          const currentItem = formData.items.find(item =>
                            item.productType === 'chicken' && item.weightRange === weightRange && item.chickenNature === chickenType
                          );
                          const quantity = currentItem?.quantity || 0;
                          const sizeLabel = weightRange === '1.5-1.6kg' ? 'Small' :
                            weightRange === '1.7-1.8kg' ? 'Medium' :
                              weightRange === '1.9-2.1kg' ? 'Large' :
                                weightRange === '2.2-2.3kg' ? 'XL' : 'Jumbo';

                          return (
                            <div key={weightRange} className={`border rounded-lg transition-all duration-200 ${quantity > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                              }`}>
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">{sizeLabel} Chicken</div>
                                    <div className="text-sm text-gray-500">{weightRange} - {price.toLocaleString()} CFA each</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(
                                        currentItem?.id || '',
                                        quantity - 1
                                      )}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${quantity > 0
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                      disabled={quantity === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (currentItem) {
                                          updateItemQuantity(currentItem.id, quantity + 1);
                                        } else {
                                          addChickenItem(weightRange, 1);
                                        }
                                      }}
                                      className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Cut-up Options (only for ready-to-cook and when item exists) */}
                                {chickenType === 'ready-to-cook' && currentItem && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="text-xs font-medium text-gray-600 mb-2">Cut Up Option:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedItems = formData.items.map(item => {
                                            if (item.id === currentItem.id) {
                                              const updatedItem = { ...item, cutUp: 'no', cutPieces: '' };
                                              const pricing = calculateItemPrice(updatedItem);
                                              return {
                                                ...updatedItem,
                                                unitPrice: pricing.unitPrice,
                                                itemTotal: pricing.itemTotal,
                                                cutUpFee: pricing.cutUpFee
                                              };
                                            }
                                            return item;
                                          });
                                          onChange({ ...formData, items: updatedItems });
                                        }}
                                        className={`p-2 rounded-lg border-2 text-left transition-colors text-xs ${currentItem.cutUp === 'no'
                                          ? 'border-green-500 bg-green-50 text-green-700'
                                          : 'border-gray-300 bg-white text-gray-700'
                                          }`}
                                      >
                                        <div className="font-medium">Whole</div>
                                        <div className="text-xs">No cut up</div>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedItems = formData.items.map(item => {
                                            if (item.id === currentItem.id) {
                                              const updatedItem = { ...item, cutUp: 'yes', cutPieces: '6' };
                                              const pricing = calculateItemPrice(updatedItem);
                                              return {
                                                ...updatedItem,
                                                unitPrice: pricing.unitPrice,
                                                itemTotal: pricing.itemTotal,
                                                cutUpFee: pricing.cutUpFee
                                              };
                                            }
                                            return item;
                                          });
                                          onChange({ ...formData, items: updatedItems });
                                        }}
                                        className={`p-2 rounded-lg border-2 text-left transition-colors text-xs ${currentItem.cutUp === 'yes'
                                          ? 'border-green-500 bg-green-50 text-green-700'
                                          : 'border-gray-300 bg-white text-gray-700'
                                          }`}
                                      >
                                        <div className="font-medium">Cut Up</div>
                                        <div className="text-xs">+{pricingConfig.cutUpFeeLow} CFA</div>
                                      </button>
                                    </div>

                                    {/* Number of pieces (if cut up is selected for this specific item) */}
                                    {currentItem.cutUp === 'yes' && (
                                      <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                          <label className="text-xs font-medium text-gray-600">Pieces:</label>
                                          <input
                                            key={`pieces-${currentItem.id}`}
                                            type="number"
                                            min="2"
                                            max="20"
                                            value={currentItem.cutPieces || ''}
                                            onChange={(e) => {
                                              const pieces = e.target.value;
                                              const updatedItems = formData.items.map(item => {
                                                if (item.id === currentItem.id) {
                                                  const updatedItem = { ...item, cutPieces: pieces };
                                                  const pricing = calculateItemPrice(updatedItem);
                                                  return {
                                                    ...updatedItem,
                                                    unitPrice: pricing.unitPrice,
                                                    itemTotal: pricing.itemTotal,
                                                    cutUpFee: pricing.cutUpFee
                                                  };
                                                }
                                                return item;
                                              });
                                              onChange({ ...formData, items: updatedItems });
                                            }}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:border-yellow-400 focus:outline-none"
                                            placeholder="6"
                                          />
                                          <span className="text-xs text-gray-500">
                                            (+{getCutUpFee(currentItem.cutPieces || '6')} CFA each)
                                            {parseInt(currentItem.cutPieces || '6') > 4 ? ' (>4 pcs)' : ' (≤4 pcs)'}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </>
                )}
              </div>
            )}
          </div>

          {/* Other Products */}
          {Object.entries(pricingConfig.productPricing).map(([productType, productInfo]) => (
            <div key={productType} className="mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProduct(selectedProduct === productType ? null : productType);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${selectedProduct === productType
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 capitalize">{productInfo.label}</div>
                      <div className="text-xs text-gray-500">Multiple units available</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formData.items.filter(item => item.productType === productType).length} items
                    </span>
                    <span className="text-gray-400">
                      {selectedProduct === productType ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Product Options Dropdown */}
              {selectedProduct === productType && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-3">Select Unit</h5>
                  <div className="space-y-2">
                    {Object.entries(productInfo.units).map(([unit, price]) => {
                      const currentItem = formData.items.find(item =>
                        item.productType === productType && item.unit === unit
                      );
                      const quantity = currentItem?.quantity || 0;

                      return (
                        <div key={`${productType}-${unit}`} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${quantity > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                          }`}>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 capitalize">{unit}</div>
                            <div className="text-sm text-gray-500">{price.toLocaleString()} CFA each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateItemQuantity(
                                  currentItem?.id || '',
                                  quantity - 1
                                );
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${quantity > 0
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (currentItem) {
                                  updateItemQuantity(currentItem.id, quantity + 1);
                                } else {
                                  addProductItem(productType, unit, 1);
                                }
                              }}
                              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compact Order Summary */}
      {formData.items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-yellow-50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">Your Order</h4>
              <span className="text-sm text-gray-600">{formData.items.length} items</span>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {item.productType === 'chicken' ? 'Chicken' : item.productType.charAt(0).toUpperCase() + item.productType.slice(1)}
                      {item.productType === 'chicken' && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({item.weightRange === '1.5-1.6kg' ? 'Small' :
                            item.weightRange === '1.7-1.8kg' ? 'Medium' :
                              item.weightRange === '1.9-2.1kg' ? 'Large' :
                                item.weightRange === '2.2-2.3kg' ? 'XL' : 'Jumbo'})
                          {item.chickenNature === 'ready-to-cook' && item.cutUp === 'yes' && (
                            <span className="text-orange-600 ml-1">
                              - Cut into {item.cutPieces || '6'} pieces
                            </span>
                          )}
                          {item.chickenNature === 'ready-to-cook' && item.cutUp === 'no' && (
                            <span className="text-blue-600 ml-1">
                              - Whole
                            </span>
                          )}
                        </span>
                      )}
                      {item.productType !== 'chicken' && (
                        <span className="text-xs text-gray-500 ml-1">({item.unit})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} × {item.unitPrice.toLocaleString()} CFA
                      {item.cutUpFee > 0 && (
                        <span className="text-orange-600 ml-1">
                          + cut-up fee
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-700 text-sm">
                      {item.itemTotal.toLocaleString()} CFA
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">{baseSubtotal.toLocaleString()} CFA</span>
                </div>
                {totalCutUpFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cut-up fees:</span>
                    <span className="font-medium">{totalCutUpFee.toLocaleString()} CFA</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-green-700">
                    {orderSubtotal.toLocaleString()} CFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special Instructions */}
      <div>
        <label className={labelCls}>Special Instructions (Optional)</label>
        <textarea
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={(e) => onChange({ ...formData, specialInstructions: e.target.value })}
          placeholder="Any special requests for preparation..."
          rows={3}
          className={inputCls + ' resize-y'}
        />
      </div>
    </div>
  );
}
