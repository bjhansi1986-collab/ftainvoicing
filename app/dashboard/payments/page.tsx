'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NumberFormatter } from '@/lib/formatter';
import { apiPath } from '@/lib/paths';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  status: string;
}

interface InvoiceOption {
  id: string;
  invoiceNumber: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  client: { name: string };
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const invoiceIdFromQuery = searchParams.get('invoiceId') || '';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [filter, setFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    invoiceId: invoiceIdFromQuery,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    fetchPaymentsAndInvoices();
  }, []);

  useEffect(() => {
    if (invoiceIdFromQuery) {
      setForm((prev) => ({ ...prev, invoiceId: invoiceIdFromQuery }));
    }
  }, [invoiceIdFromQuery]);

  const fetchPaymentsAndInvoices = async () => {
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        fetch(apiPath('/payments')),
        fetch(apiPath('/invoices')),
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }

      if (invoicesRes.ok) {
        const invoiceData = await invoicesRes.json();
        setInvoices(invoiceData);
      }
    } catch {
      setMessage('Failed to load payments and invoices.');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!form.invoiceId) {
      setMessage('Select an invoice first.');
      return;
    }

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setMessage('Enter a valid amount.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(apiPath('/payments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: form.invoiceId,
          amount,
          paymentDate: form.paymentDate,
          paymentMethod: form.paymentMethod,
          reference: form.reference,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.error || 'Failed to record payment.');
        return;
      }

      setForm((prev) => ({
        ...prev,
        amount: '',
        reference: '',
        notes: '',
      }));
      setMessage('Payment recorded successfully.');
      await fetchPaymentsAndInvoices();
    } catch {
      setMessage('Failed to record payment.');
    } finally {
      setIsSaving(false);
    }
  };

  const getMethodIcon = (method: string) => {
    const icons: { [key: string]: string } = {
      cash: '💵',
      check: '📋',
      bank_transfer: '🏦',
      card: '💳',
      online: '💻',
    };
    return icons[method] || '💰';
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true;
    return payment.paymentMethod === filter;
  });

  const selectedInvoice = invoices.find((inv) => inv.id === form.invoiceId);
  const selectedInvoiceRemaining = selectedInvoice
    ? Math.max(0, Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount))
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Payment Tracking</h2>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.toLowerCase().includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Record Payment</h3>
        <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
            <select
              value={form.invoiceId}
              onChange={(e) => setForm((prev) => ({ ...prev, invoiceId: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select invoice</option>
              {invoices
                .filter((invoice) => invoice.paymentStatus !== 'paid')
                .map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.client.name}
                  </option>
                ))}
            </select>
            {selectedInvoice && (
              <p className="text-xs text-gray-600 mt-1">
                Remaining: {NumberFormatter.formatCurrency(selectedInvoiceRemaining, selectedInvoice.currency)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={selectedInvoiceRemaining || undefined}
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="input-field"
              required
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
              className="input-field"
              placeholder="Optional reference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="input-field"
              placeholder="Optional notes"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            AED {payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Payment Count</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{payments.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600 text-sm">Average Payment</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            AED{' '}
            {payments.length > 0
              ? (payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'bank_transfer', 'card', 'check', 'cash', 'online'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="table-row">
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/dashboard/invoices/${payment.invoiceId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {payment.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{payment.clientName}</td>
                  <td className="px-6 py-4">
                    {NumberFormatter.formatCurrency(Number(payment.amount), payment.currency || 'AED')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      {getMethodIcon(payment.paymentMethod)}
                      {payment.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">{NumberFormatter.formatDate(payment.paymentDate)}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payments found. Payments will appear here once recorded.
          </div>
        )}
      </div>
    </div>
  );
}
