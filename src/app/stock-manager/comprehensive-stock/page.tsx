"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface ComprehensiveStockTransaction {
  _id: string;
  date: string;
  description: string;
  supplierCustomer?: string;
  reference?: string;
  amount?: number;
  purchase: {
    farmProduction?: number;
    reformers?: number;
  };
  sales: {
    liveFarm?: number;
    reformer?: number;
    dressedStore?: number;
  };
  broilerTransfer: {
    outForReformer?: number;
    outForFarm?: number;
    inForStore?: number;
  };
  mortalityTheftLoss: {
    farmLive?: number;
    storeDressed?: number;
    reformer?: number;
  };
  stockBalance: {
    farmLive?: number;
    storeDressed?: number;
    reformer?: number;
    total?: number;
  };
  modeOfOperation?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

interface CurrentBalances {
  farmLive: number;
  storeDressed: number;
  reformer: number;
  total: number;
}

// Transaction descriptions matching your poultry business operations
const TRANSACTION_DESCRIPTIONS = [
  { value: 'initial_stock', label: 'Initial Stock' },
  { value: 'purchase_day_old_chicks', label: 'Purchase - Day old chicks (Farm production)' },
  { value: 'purchase_matured_broilers', label: 'Purchase - Matured Broilers (Reformers)' },
  { value: 'sale_live_farm', label: 'Sale - Live Broilers (Farm Production)' },
  { value: 'sale_live_reformers', label: 'Sale - Live Broilers (Reformers)' },
  { value: 'sale_dressed_farm', label: 'Sale - Dressed Broilers (Farm)' },
  { value: 'sale_dressed_cold_store', label: 'Sale - Dressed Broilers (Cold store)' },
  { value: 'transfer_farm_to_cold', label: 'Transfer to cold store (From Farm Production)' },
  { value: 'transfer_reformers_to_cold', label: 'Transfer to cold store (From Reformers)' },
  { value: 'mortality_farm', label: 'Mortality - Farm Production' },
  { value: 'mortality_reformers', label: 'Mortality - Reformers' },
  { value: 'theft_farm', label: 'Theft - Farm (live)' },
  { value: 'theft_cold_store', label: 'Theft - Cold store (Dressed)' },
  { value: 'loss_farm', label: 'Loss/Spoilage (Farm)' },
  { value: 'loss_cold_store', label: 'Loss/Spoilage (Cold Store)' },
  { value: 'adjustment_positive', label: 'Stock Adjustment - Positive' },
  { value: 'adjustment_negative', label: 'Stock Adjustment - Negative' },
  { value: 'free_sample', label: 'Free Sample to prospects' },
  { value: 'return_live', label: 'Return from customer - Live' },
  { value: 'return_dressed', label: 'Return from customer - Dressed' }
];

const MODE_OF_OPERATIONS = [
  { value: 'cash_in_hand', label: 'Cash in Hand' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'momo', label: 'Mobile Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'inter_transfer', label: 'Inter-transfer' }
];

// Category filters for different stock types
const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Transactions' },
  { value: 'purchases', label: 'Purchases Only' },
  { value: 'sales', label: 'Sales Only' },
  { value: 'transfers', label: 'Transfers Only' },
  { value: 'mortality', label: 'Mortality Only' },
  { value: 'theft', label: 'Theft Only' },
  { value: 'losses', label: 'Losses Only' },
  { value: 'adjustments', label: 'Adjustments Only' },
  { value: 'samples', label: 'Free Samples Only' },
  { value: 'returns', label: 'Returns Only' }
];

export default function ComprehensiveStockDashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<ComprehensiveStockTransaction[]>([]);
  const [currentBalances, setCurrentBalances] = useState<CurrentBalances>({
    farmLive: 0,
    storeDressed: 0,
    reformer: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [user, setUser] = useState<any>(null);

  // Transaction detail interface
  interface TransactionDetail {
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    description?: string;
  }

  // Transaction details state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState('');
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetail[]>([]);
  const [chickenSizes, setChickenSizes] = useState<{ size: string; quantity: number; unitPrice: number }[]>([]);

  // Functions to handle detailed transactions
  const openDetailModal = (transactionType: string) => {
    setCurrentTransactionType(transactionType);
    setShowDetailModal(true);

    // Initialize with default values based on transaction type
    if (transactionType.includes('Purchase')) {
      setTransactionDetails([{ quantity: 0, unitPrice: 0, totalAmount: 0 }]);
      setChickenSizes([]);
    } else if (transactionType.includes('Sale') && transactionType.includes('Dressed')) {
      setTransactionDetails([]);
      setChickenSizes([{ size: '', quantity: 0, unitPrice: 0 }]);
    } else {
      setTransactionDetails([{ quantity: 0, unitPrice: 0, totalAmount: 0 }]);
      setChickenSizes([]);
    }
  };

  const calculateTotalAmount = () => {
    const detailsTotal = transactionDetails.reduce((sum, detail) => sum + detail.totalAmount, 0);
    const sizesTotal = chickenSizes.reduce((sum, size) => sum + (size.quantity * size.unitPrice), 0);
    return detailsTotal + sizesTotal;
  };

  const addTransactionDetail = () => {
    setTransactionDetails([...transactionDetails, { quantity: 0, unitPrice: 0, totalAmount: 0 }]);
  };

  const addChickenSize = () => {
    setChickenSizes([...chickenSizes, { size: '', quantity: 0, unitPrice: 0 }]);
  };

  const updateTransactionDetail = (index: number, field: keyof TransactionDetail, value: number | string) => {
    const updated = [...transactionDetails];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate total amount
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? (value as number) : updated[index].quantity;
      const unitPrice = field === 'unitPrice' ? (value as number) : updated[index].unitPrice;
      updated[index].totalAmount = quantity * unitPrice;
    }

    setTransactionDetails(updated);
  };

  const updateChickenSize = (index: number, field: 'size' | 'quantity' | 'unitPrice', value: string | number) => {
    const updated = [...chickenSizes];
    updated[index] = { ...updated[index], [field]: value };
    setChickenSizes(updated);
  };

  const removeTransactionDetail = (index: number) => {
    setTransactionDetails(transactionDetails.filter((_, i) => i !== index));
  };

  const removeChickenSize = (index: number) => {
    setChickenSizes(chickenSizes.filter((_, i) => i !== index));
  };

  const applyDetailsToForm = () => {
    const total = calculateTotalAmount();
    setFormData({ ...formData, amount: total.toString() });
    setShowDetailModal(false);

    // Reset details
    setTransactionDetails([]);
    setChickenSizes([]);
  };

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    supplierCustomer: '',
    reference: '',
    amount: '',
    purchaseFarmProduction: '',
    purchaseReformers: '',
    salesLiveFarm: '',
    salesReformer: '',
    salesDressedStore: '',
    broilerTransferOutReformer: '',
    broilerTransferOutFarm: '',
    broilerTransferInStore: '',
    mortalityFarmLive: '',
    mortalityStoreDressed: '',
    mortalityReformer: '',
    modeOfOperation: '',
    remarks: '',
    recordedBy: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('stockToken');
    const userData = localStorage.getItem('stockUser');

    if (!token) {
      router.push('/stock-manager/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
      setFormData(prev => ({ ...prev, recordedBy: JSON.parse(userData).name }));
    }

    fetchStockData();
  }, [router, selectedMonth, selectedYear, categoryFilter]);

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch(`/api/comprehensive-stock?month=${selectedMonth}&year=${selectedYear}&category=${categoryFilter}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions);
        setCurrentBalances(data.data.currentBalances);
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('stockToken');

      // Calculate stock balance based on transaction
      let stockBalance = { ...currentBalances };

      if (formData.description === 'sales_live_farm') {
        stockBalance.farmLive -= parseInt(formData.salesLiveFarm) || 0;
      }
      if (formData.description === 'sales_dressed_store') {
        stockBalance.storeDressed -= parseInt(formData.salesDressedStore) || 0;
      }
      if (formData.description === 'farm_production') {
        stockBalance.farmLive += parseInt(formData.purchaseFarmProduction) || 0;
      }
      if (formData.description === 'broiler_transfer') {
        stockBalance.farmLive -= parseInt(formData.broilerTransferOutReformer) || 0;
        stockBalance.storeDressed += parseInt(formData.broilerTransferInStore) || 0;
      }
      if (formData.description === 'mortality_theft_loss') {
        stockBalance.farmLive -= parseInt(formData.mortalityFarmLive) || 0;
        stockBalance.storeDressed -= parseInt(formData.mortalityStoreDressed) || 0;
      }

      stockBalance.total = stockBalance.farmLive + stockBalance.storeDressed + stockBalance.reformer;

      const payload = {
        date: formData.date,
        description: formData.description,
        supplierCustomer: formData.supplierCustomer || undefined,
        reference: formData.reference || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        purchase: {
          farmProduction: formData.purchaseFarmProduction ? parseInt(formData.purchaseFarmProduction) : 0,
          reformers: formData.purchaseReformers ? parseInt(formData.purchaseReformers) : 0
        },
        sales: {
          liveFarm: formData.salesLiveFarm ? parseInt(formData.salesLiveFarm) : 0,
          reformer: formData.salesReformer ? parseInt(formData.salesReformer) : 0,
          dressedStore: formData.salesDressedStore ? parseInt(formData.salesDressedStore) : 0
        },
        broilerTransfer: {
          outForReformer: formData.broilerTransferOutReformer ? parseInt(formData.broilerTransferOutReformer) : 0,
          outForFarm: formData.broilerTransferOutFarm ? parseInt(formData.broilerTransferOutFarm) : 0,
          inForStore: formData.broilerTransferInStore ? parseInt(formData.broilerTransferInStore) : 0
        },
        mortalityTheftLoss: {
          farmLive: formData.mortalityFarmLive ? parseInt(formData.mortalityFarmLive) : 0,
          storeDressed: formData.mortalityStoreDressed ? parseInt(formData.mortalityStoreDressed) : 0,
          reformer: formData.mortalityReformer ? parseInt(formData.mortalityReformer) : 0
        },
        stockBalance,
        modeOfOperation: formData.modeOfOperation || undefined,
        remarks: formData.remarks || undefined,
        recordedBy: formData.recordedBy
      };

      const res = await fetch('/api/comprehensive-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddForm(false);
        resetForm();
        fetchStockData();
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      supplierCustomer: '',
      reference: '',
      amount: '',
      purchaseFarmProduction: '',
      purchaseReformers: '',
      salesLiveFarm: '',
      salesReformer: '',
      salesDressedStore: '',
      broilerTransferOutReformer: '',
      broilerTransferOutFarm: '',
      broilerTransferInStore: '',
      mortalityFarmLive: '',
      mortalityStoreDressed: '',
      mortalityReformer: '',
      modeOfOperation: '',
      remarks: '',
      recordedBy: user?.name || ''
    });
  };

  const getDescriptionLabel = (value: string) => {
    const desc = TRANSACTION_DESCRIPTIONS.find(d => d.value === value);
    return desc ? desc.label : value;
  };

  const getModeLabel = (value: string) => {
    const mode = MODE_OF_OPERATIONS.find(m => m.value === value);
    return mode ? mode.label : value;
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading stock data...</div>;
  }

  return (
    <div>
      {/* Header with Month/Year Selection */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Comprehensive Stock Management</h2>
        <div className="flex gap-4 items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-purple-50"
          >
            {CATEGORY_FILTERS.map(filter => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Current Stock Balance Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Stock Balance</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{currentBalances.farmLive}</div>
            <div className="text-sm text-gray-600">Farm (Live)</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currentBalances.storeDressed}</div>
            <div className="text-sm text-gray-600">Store (Dressed)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{currentBalances.reformer}</div>
            <div className="text-sm text-gray-600">Reformers</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{currentBalances.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Comprehensive Stock Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Date</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Description</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Supplier/Customer</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Reference</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Amount (CFA)</th>
                <th className="text-center py-3 px-3 font-bold text-gray-700 border-r">Stock In</th>
                <th className="text-center py-3 px-3 font-bold text-gray-700 border-r">Stock Out</th>
                <th className="text-center py-3 px-3 font-bold text-gray-700 border-r">Balance</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700 border-r">Payment</th>
                <th className="text-left py-3 px-3 font-bold text-gray-700">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    No transactions found for this period
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const getDescriptionColor = (desc: string) => {
                    if (desc.includes('Purchase')) return 'text-green-700 bg-green-50';
                    if (desc.includes('Sale')) return 'text-blue-700 bg-blue-50';
                    if (desc.includes('Mortality') || desc.includes('Theft') || desc.includes('Loss')) return 'text-red-700 bg-red-50';
                    if (desc.includes('Transfer')) return 'text-purple-700 bg-purple-50';
                    if (desc.includes('Adjustment')) return 'text-amber-700 bg-amber-50';
                    return 'text-gray-700';
                  };

                  const stockIn = (transaction.purchase?.farmProduction || 0) +
                    (transaction.purchase?.reformers || 0);
                  const stockOut = (transaction.sales?.liveFarm || 0) +
                    (transaction.sales?.reformer || 0) +
                    (transaction.sales?.dressedStore || 0) +
                    (transaction.mortalityTheftLoss?.farmLive || 0) +
                    (transaction.mortalityTheftLoss?.storeDressed || 0) +
                    (transaction.mortalityTheftLoss?.reformer || 0);

                  return (
                    <tr key={transaction._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-600 border-r">
                        <div className="font-medium">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-3 border-r">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDescriptionColor(transaction.description)}`}>
                          {getDescriptionLabel(transaction.description)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 border-r">
                        {transaction.supplierCustomer || '-'}
                      </td>
                      <td className="py-3 px-3 text-gray-600 border-r">
                        {transaction.reference || '-'}
                      </td>
                      <td className="py-3 px-3 text-gray-600 border-r">
                        {transaction.amount ? (
                          <div className="font-semibold text-green-600">
                            {transaction.amount.toLocaleString()}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center border-r">
                        {stockIn > 0 ? (
                          <div className="font-bold text-green-600">
                            +{stockIn.toLocaleString()}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center border-r">
                        {stockOut > 0 ? (
                          <div className="font-bold text-red-600">
                            -{stockOut.toLocaleString()}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center border-r">
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">Farm:</span> {transaction.stockBalance?.farmLive || 0}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Store:</span> {transaction.stockBalance?.storeDressed || 0}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Ref:</span> {transaction.stockBalance?.reformer || 0}
                          </div>
                          <div className="text-xs font-bold border-t pt-1">
                            Total: {transaction.stockBalance?.total || 0}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 border-r">
                        {transaction.modeOfOperation ? (
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                            {getModeLabel(transaction.modeOfOperation)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {transaction.remarks ? (
                          <div className="max-w-xs truncate" title={transaction.remarks}>
                            {transaction.remarks}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal - Simplified for now */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Stock Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <select
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Description</option>
                    {TRANSACTION_DESCRIPTIONS.map(desc => (
                      <option key={desc.value} value={desc.value}>{desc.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier/Customer</label>
                  <input
                    type="text"
                    value={formData.supplierCustomer}
                    onChange={(e) => setFormData({ ...formData, supplierCustomer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Reference #"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (CFA)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0"
                    />
                    {(formData.description.includes('Purchase') ||
                      formData.description.includes('Sale') ||
                      formData.description.includes('Transfer')) && (
                        <button
                          type="button"
                          onClick={() => openDetailModal(formData.description)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Details
                        </button>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Operation</label>
                  <select
                    value={formData.modeOfOperation}
                    onChange={(e) => setFormData({ ...formData, modeOfOperation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Mode</option>
                    {MODE_OF_OPERATIONS.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>

                {/* Purchase Section */}
                <div className="md:col-span-3 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Purchase (Stock-In)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm Production</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.purchaseFarmProduction}
                          onChange={(e) => setFormData({ ...formData, purchaseFarmProduction: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                        {formData.description.includes('Purchase') && (
                          <button
                            type="button"
                            onClick={() => openDetailModal(formData.description)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reformers</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.purchaseReformers}
                          onChange={(e) => setFormData({ ...formData, purchaseReformers: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                        {formData.description.includes('Purchase') && (
                          <button
                            type="button"
                            onClick={() => openDetailModal(formData.description)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Section */}
                <div className="md:col-span-3 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Sales (Stock-Out)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Live Farm</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.salesLiveFarm}
                          onChange={(e) => setFormData({ ...formData, salesLiveFarm: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                        {formData.description.includes('Sale') && (
                          <button
                            type="button"
                            onClick={() => openDetailModal(formData.description)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reformer</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.salesReformer}
                          onChange={(e) => setFormData({ ...formData, salesReformer: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                        {formData.description.includes('Sale') && (
                          <button
                            type="button"
                            onClick={() => openDetailModal(formData.description)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dressed Store</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={formData.salesDressedStore}
                          onChange={(e) => setFormData({ ...formData, salesDressedStore: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                        {formData.description.includes('Sale') && (
                          <button
                            type="button"
                            onClick={() => openDetailModal(formData.description)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Broiler Transfer Section */}
                <div className="md:col-span-3 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Broiler Transfer</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Out for Reformer</label>
                      <input
                        type="number"
                        value={formData.broilerTransferOutReformer}
                        onChange={(e) => setFormData({ ...formData, broilerTransferOutReformer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Out for Farm</label>
                      <input
                        type="number"
                        value={formData.broilerTransferOutFarm}
                        onChange={(e) => setFormData({ ...formData, broilerTransferOutFarm: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">In for Store</label>
                      <input
                        type="number"
                        value={formData.broilerTransferInStore}
                        onChange={(e) => setFormData({ ...formData, broilerTransferInStore: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Mortality/Theft/Loss Section */}
                <div className="md:col-span-3 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Mortality/Theft/Loss</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farm (Live)</label>
                      <input
                        type="number"
                        value={formData.mortalityFarmLive}
                        onChange={(e) => setFormData({ ...formData, mortalityFarmLive: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store (Dressed)</label>
                      <input
                        type="number"
                        value={formData.mortalityStoreDressed}
                        onChange={(e) => setFormData({ ...formData, mortalityStoreDressed: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reformer</label>
                      <input
                        type="number"
                        value={formData.mortalityReformer}
                        onChange={(e) => setFormData({ ...formData, mortalityReformer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Remarks Section */}
                <div className="md:col-span-3 border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recorded By *</label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold hover:bg-green-800"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Transaction Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {currentTransactionType.includes('Purchase') ? 'Purchase Details' :
                  currentTransactionType.includes('Sale') && currentTransactionType.includes('Dressed') ? 'Sales Details by Chicken Size' :
                    'Transaction Details'}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Purchase Details */}
            {currentTransactionType.includes('Purchase') && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Enter Purchase Breakdown</h4>
                  <p className="text-sm text-blue-600">For example: 25 chicks @ 2000 CFA, 25 chicks @ 4000 CFA</p>
                </div>

                {transactionDetails.map((detail, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Item {index + 1}</h5>
                      {transactionDetails.length > 1 && (
                        <button
                          onClick={() => removeTransactionDetail(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={detail.quantity}
                          onChange={(e) => updateTransactionDetail(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (CFA)</label>
                        <input
                          type="number"
                          value={detail.unitPrice}
                          onChange={(e) => updateTransactionDetail(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold">
                          {detail.totalAmount.toLocaleString()} CFA
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          value={detail.description || ''}
                          onChange={(e) => updateTransactionDetail(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., Day-old chicks"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTransactionDetail}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                >
                  + Add Another Item
                </button>
              </div>
            )}

            {/* Dressed Chicken Sales Details */}
            {currentTransactionType.includes('Sale') && currentTransactionType.includes('Dressed') && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Enter Sales by Chicken Size</h4>
                  <p className="text-sm text-green-600">For example: 6 chickens @ 5000 CFA, 3 chickens @ 4000 CFA</p>
                </div>

                {chickenSizes.map((size, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Chicken Size Group {index + 1}</h5>
                      {chickenSizes.length > 1 && (
                        <button
                          onClick={() => removeChickenSize(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size/Weight</label>
                        <select
                          value={size.size}
                          onChange={(e) => updateChickenSize(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select size</option>
                          <option value="Small (1-1.5kg)">Small (1-1.5kg)</option>
                          <option value="Medium (1.5-2kg)">Medium (1.5-2kg)</option>
                          <option value="Large (2-2.5kg)">Large (2-2.5kg)</option>
                          <option value="Extra Large (2.5kg+)">Extra Large (2.5kg+)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={size.quantity}
                          onChange={(e) => updateChickenSize(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (CFA)</label>
                        <input
                          type="number"
                          value={size.unitPrice}
                          onChange={(e) => updateChickenSize(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addChickenSize}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                >
                  + Add Another Size Group
                </button>
              </div>
            )}

            {/* Total Amount Display */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {calculateTotalAmount().toLocaleString()} CFA
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyDetailsToForm}
                className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold hover:bg-green-800"
              >
                Apply to Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
