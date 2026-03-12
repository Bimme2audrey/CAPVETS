'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api';

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

interface Order {
  _id: string;
  name: string;
  phone: string;
  email: string;
  // New multi-product structure
  items?: OrderItem[]; // Optional for backward compatibility
  specialInstructions?: string;
  // Legacy single-product structure (for backward compatibility)
  productType?: string;
  quantity?: string;
  unit?: string;
  weightRange?: string;
  cutUp?: string;
  cutPieces?: string;
  // Common fields
  total: number;
  subtotal: number;
  cutUpFee?: number; // Legacy
  totalCutUpFee?: number; // New: Total cut-up fees from all items
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  orderType: string;
  address?: string;
  preferredTime: string;
  createdAt: string;
  distance?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState<{ [key: string]: 'phone' | 'email' }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(25); // 25 orders per page
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: { payment?: boolean; delivery?: boolean } }>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(API_ENDPOINTS.ORDERS, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Sort orders by creation date (oldest first for priority processing)
  const sortedOrders = [...orders].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const statusColor = (status: string, type: 'payment' | 'delivery' | 'general' = 'general') => {
    if (type === 'payment') {
      switch (status?.toLowerCase()) {
        case 'paid': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'failed': return 'bg-red-100 text-red-700 border-red-200';
        case 'refunded': return 'bg-purple-100 text-purple-700 border-purple-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    } else if (type === 'delivery') {
      switch (status?.toLowerCase()) {
        case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
        case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'out-for-delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    } else {
      switch (status?.toLowerCase()) {
        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  const formatProductDetails = (order: Order) => {
    // Debug: Log the order structure
    console.log('Order structure:', order);

    if (!order.items || order.items.length === 0) {
      // Handle old single-product orders (seamless display)
      if (order.productType === 'chicken') {
        const details = [];
        if (order.weightRange) details.push(order.weightRange);
        if (order.cutUp === 'yes' && order.cutPieces) details.push(`Cut: ${order.cutPieces} pieces`);
        return `${order.quantity || 'N/A'} ${order.weightRange || ''} chicken${details.length > 0 ? ` (${details.join(' • ')})` : ''}`;
      }
      return `${order.quantity || 'N/A'} ${order.unit || ''} ${order.productType || 'Unknown'}`;
    }

    // Handle new multi-product orders
    const itemCount = order.items.length;
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    if (itemCount === 1) {
      const item = order.items[0];
      if (item.productType === 'chicken') {
        const details = [];
        if (item.weightRange) details.push(item.weightRange);
        if (item.cutUp === 'yes' && item.cutPieces) details.push(`Cut: ${item.cutPieces} pieces`);
        return `${item.quantity} ${item.weightRange} chicken${details.length > 0 ? ` (${details.join(' • ')})` : ''}`;
      }
      return `${item.quantity} ${item.unit} ${item.productType}`;
    }

    // Multiple items
    const chickenItems = order.items.filter(item => item.productType === 'chicken');
    const otherItems = order.items.filter(item => item.productType !== 'chicken');

    const parts = [];
    if (chickenItems.length > 0) {
      const chickenTotal = chickenItems.reduce((sum, item) => sum + item.quantity, 0);
      parts.push(`${chickenTotal} chicken${chickenTotal > 1 ? 's' : ''}`);
    }
    if (otherItems.length > 0) {
      parts.push(`${otherItems.length} other product${otherItems.length > 1 ? 's' : ''}`);
    }

    return `${itemCount} items (${parts.join(' + ')})`;
  };

  const formatProductSummary = (order: Order) => {
    if (!order.items || order.items.length === 0) return 'No items';

    return order.items.map(item => {
      if (item.productType === 'chicken') {
        const sizeLabel = item.weightRange === '1.5-1.6kg' ? 'Small' :
          item.weightRange === '1.7-1.8kg' ? 'Medium' :
            item.weightRange === '1.9-2.1kg' ? 'Large' :
              item.weightRange === '2.2-2.3kg' ? 'XL' : 'Jumbo';
        return `${item.quantity}×${sizeLabel} chicken (${item.itemTotal.toLocaleString()} CFA)`;
      }
      return `${item.quantity}×${item.unit} ${item.productType} (${item.itemTotal.toLocaleString()} CFA)`;
    }).join('\n');
  };

  const formatPreferredTime = (timeString: string) => {
    if (!timeString) return 'Not specified';
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const toggleContact = (orderId: string) => {
    setShowContact(prev => ({
      ...prev,
      [orderId]: prev[orderId] === 'phone' ? 'email' : 'phone'
    }));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(prev => ({
      ...prev,
      [orderId]: { delivery: true }
    }));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          statusType: 'delivery',
          newStatus
        })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders(prev => prev.map(order =>
        order._id === orderId
          ? { ...order, deliveryStatus: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(prev => ({
        ...prev,
        [orderId]: { delivery: false }
      }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
        <div className="text-sm text-gray-500">
          {sortedOrders.length} total orders • Page {currentPage} of {totalPages || 1}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : sortedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No orders found.</div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Order Date & Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Order Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Delivery Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Preferred Delivery Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Quantity</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Payment Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => {
                    const { date, time } = formatDate(order.createdAt);
                    const currentContact = showContact[order._id] || 'phone';

                    return (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* Date & Time */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{date}</div>
                          <div className="text-xs text-gray-500">{time}</div>
                        </td>

                        {/* Customer Name */}
                        <td className="px-4 py-3 font-medium text-gray-900">{order.name}</td>

                        {/* Contact (Toggleable) */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleContact(order._id)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <div className="font-medium text-gray-900">
                              {currentContact === 'phone' ? order.phone : order.email}
                            </div>
                          </button>
                        </td>

                        {/* Order Type */}
                        <td className="px-4 py-3">
                          <div className="font-medium capitalize">
                            {order.orderType === 'pickup' ? (
                              <span className="text-green-700">Pickup</span>
                            ) : (
                              <span className="text-blue-700">Delivery</span>
                            )}
                          </div>
                        </td>

                        {/* Delivery Location */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.orderType === 'delivery' ? (
                              order.address || 'Not specified'
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* Preferred Time */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {formatPreferredTime(order.preferredTime)}
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {order.items && order.items.length > 0 ? (
                              order.items.length === 1 ? (
                                order.items[0].productType.charAt(0).toUpperCase() + order.items[0].productType.slice(1)
                              ) : (
                                `Multi (${order.items.length} items)`
                              )
                            ) : (
                              // Handle legacy single-product orders
                              order.productType ? (
                                order.productType.charAt(0).toUpperCase() + order.productType.slice(1)
                              ) : (
                                'No items'
                              )
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{formatProductDetails(order)}</div>
                          {order.items && order.items.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(formatProductSummary(order));
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                            >
                              View details →
                            </button>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {order.items && order.items.length > 0 ? (
                              order.items.reduce((sum, item) => sum + item.quantity, 0).toString()
                            ) : (
                              // Handle legacy single-product orders
                              order.quantity ? order.quantity.toString() : '0'
                            )}
                          </div>
                          {order.items && order.items.length > 1 ? (
                            <div className="text-xs text-gray-500">
                              {order.items.length} types
                            </div>
                          ) : null}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{order.total?.toLocaleString()} CFA</div>
                          <div className="text-xs text-gray-500">
                            {(order.totalCutUpFee || order.cutUpFee || 0) > 0 && `+${(order.totalCutUpFee || order.cutUpFee || 0)} cut-up`}
                            {order.deliveryFee > 0 && ` +${order.deliveryFee} delivery`}
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(order.paymentStatus || 'PENDING', 'payment')}`}>
                            {order.paymentStatus === 'COMPLETED' ? 'Paid' :
                              order.paymentStatus === 'PENDING' ? 'Pending' :
                                order.paymentStatus === 'FAILED' ? 'Failed' :
                                  order.paymentStatus === 'CANCELLED' ? 'Cancelled' : 'Pending'}
                          </span>
                        </td>

                        {/* Delivery Status */}
                        <td className="px-4 py-3">
                          <select
                            value={order.deliveryStatus || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updatingStatus[order._id]?.delivery}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${statusColor(order.deliveryStatus, 'delivery')} ${updatingStatus[order._id]?.delivery ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="preparing">Preparing</option>
                            <option value="out-for-delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, sortedOrders.length)} of {sortedOrders.length} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  const isNearCurrent = Math.abs(pageNumber - currentPage) <= 2 || pageNumber === 1 || pageNumber === totalPages;

                  if (!isNearCurrent && pageNumber !== 1 && pageNumber !== totalPages) {
                    if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                      return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${isCurrentPage
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
