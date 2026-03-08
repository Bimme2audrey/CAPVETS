"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

interface MonthlyStockSheet {
  _id: string;
  month: string;
  year: number;
  transactions: any[];
  openingBalance: {
    farmLive: number;
    storeDressed: number;
    reformer: number;
    total: number;
  };
  closingBalance: {
    farmLive: number;
    storeDressed: number;
    reformer: number;
    total: number;
  };
  summary: {
    totalPurchases: number;
    totalSales: number;
    totalMortality: number;
    totalTransfers: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function MonthlyReportsPage() {
  const router = useRouter();
  const [monthlySheets, setMonthlySheets] = useState<MonthlyStockSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<MonthlyStockSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('stockToken');
    const userData = localStorage.getItem('stockUser');

    if (!token) {
      router.push('/stock-manager/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchMonthlyReports();
  }, [router]);

  const fetchMonthlyReports = async () => {
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch('/api/monthly-reports', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setMonthlySheets(data.data.monthlySheets);
      }
    } catch (err) {
      console.error('Error fetching monthly reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch('/api/monthly-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear
        })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedSheet(data.data.monthlySheet);
        fetchMonthlyReports(); // Refresh the list
      } else {
        alert(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const viewMonthlyReport = async (month: string, year: number) => {
    try {
      const token = localStorage.getItem('stockToken');
      const res = await fetch(`/api/monthly-reports?month=${month}&year=${year}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success && data.data.monthlySheet) {
        setSelectedSheet(data.data.monthlySheet);
      } else {
        alert('No data found for this month');
      }
    } catch (err) {
      console.error('Error fetching monthly report:', err);
    }
  };

  const getMonthName = (month: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNum = parseInt(month.split('-')[1]) - 1;
    return months[monthNum];
  };

  const exportToExcel = () => {
    if (!selectedSheet) return;

    // Create CSV content
    const csvContent = [
      ['Monthly Stock Report', `${getMonthName(selectedSheet.month)} ${selectedSheet.year}`],
      [],
      ['Opening Balance'],
      ['Farm (Live)', selectedSheet.openingBalance.farmLive],
      ['Store (Dressed)', selectedSheet.openingBalance.storeDressed],
      ['Reformers', selectedSheet.openingBalance.reformer],
      ['Total', selectedSheet.openingBalance.total],
      [],
      ['Summary'],
      ['Total Purchases', selectedSheet.summary.totalPurchases],
      ['Total Sales', selectedSheet.summary.totalSales],
      ['Total Mortality/Loss', selectedSheet.summary.totalMortality],
      ['Total Transfers', selectedSheet.summary.totalTransfers],
      ['Revenue', `${selectedSheet.summary.revenue} CFA`],
      [],
      ['Closing Balance'],
      ['Farm (Live)', selectedSheet.closingBalance.farmLive],
      ['Store (Dressed)', selectedSheet.closingBalance.storeDressed],
      ['Reformers', selectedSheet.closingBalance.reformer],
      ['Total', selectedSheet.closingBalance.total],
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${selectedSheet.month}-${selectedSheet.year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading monthly reports...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Monthly Stock Reports</h2>
        <div className="flex gap-4 items-center">
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
            onClick={generateMonthlyReport}
            disabled={generating}
            className="px-4 py-2 bg-green-700 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-green-800 disabled:bg-gray-300"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Reports List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Reports</h3>
          <div className="space-y-2">
            {monthlySheets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No monthly reports generated yet</p>
            ) : (
              monthlySheets.map((sheet) => (
                <div
                  key={sheet._id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewMonthlyReport(sheet.month, sheet.year)}
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {getMonthName(sheet.month)} {sheet.year}
                    </div>
                    <div className="text-sm text-gray-500">
                      Revenue: {sheet.summary.revenue.toLocaleString()} CFA
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {sheet.closingBalance.total} birds
                    </div>
                    <div className="text-xs text-gray-500">
                      Closing balance
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Report Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedSheet ? `${getMonthName(selectedSheet.month)} ${selectedSheet.year}` : 'Select a Report'}
            </h3>
            {selectedSheet && (
              <button
                onClick={exportToExcel}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Export CSV
              </button>
            )}
          </div>

          {selectedSheet ? (
            <div className="space-y-6">
              {/* Opening Balance */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Opening Balance</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm (Live):</span>
                    <span className="font-medium">{selectedSheet.openingBalance.farmLive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store (Dressed):</span>
                    <span className="font-medium">{selectedSheet.openingBalance.storeDressed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reformers:</span>
                    <span className="font-medium">{selectedSheet.openingBalance.reformer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{selectedSheet.openingBalance.total}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Monthly Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Purchases:</span>
                    <span className="font-medium text-green-600">{selectedSheet.summary.totalPurchases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium text-red-600">{selectedSheet.summary.totalSales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mortality/Loss:</span>
                    <span className="font-medium text-orange-600">{selectedSheet.summary.totalMortality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfers:</span>
                    <span className="font-medium text-blue-600">{selectedSheet.summary.totalTransfers}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-bold text-green-700">{selectedSheet.summary.revenue.toLocaleString()} CFA</span>
                  </div>
                </div>
              </div>

              {/* Closing Balance */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Closing Balance</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm (Live):</span>
                    <span className="font-medium">{selectedSheet.closingBalance.farmLive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store (Dressed):</span>
                    <span className="font-medium">{selectedSheet.closingBalance.storeDressed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reformers:</span>
                    <span className="font-medium">{selectedSheet.closingBalance.reformer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-lg">{selectedSheet.closingBalance.total}</span>
                  </div>
                </div>
              </div>

              {/* Net Change */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Net Change:</span>
                  <span className={`font-bold text-lg ${selectedSheet.closingBalance.total > selectedSheet.openingBalance.total
                      ? 'text-green-600'
                      : selectedSheet.closingBalance.total < selectedSheet.openingBalance.total
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                    {selectedSheet.closingBalance.total - selectedSheet.openingBalance.total > 0 ? '+' : ''}
                    {selectedSheet.closingBalance.total - selectedSheet.openingBalance.total} birds
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Select a monthly report to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
