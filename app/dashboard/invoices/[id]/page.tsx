'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CurrencyConverter } from '@/lib/currency';
import { NumberFormatter } from '@/lib/formatter';
import { apiPath } from '@/lib/paths';

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId: string | null;
    bankDetails: string | null;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    taxId: string | null;
  };
  lines: InvoiceLine[];
  payments: {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string | null;
  }[];
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAed, setShowAed] = useState(true);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
  });

  const fetchInvoice = useCallback(async () => {
    try {
      const response = await fetch(apiPath(`/invoices/${params.id}`));
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        setError('Invoice not found.');
      }
    } catch {
      setError('Failed to load invoice.');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || 'Invoice not found.'}
      </div>
    );
  }

  const showAedEquivalent = invoice.currency !== 'AED';
  const aedEquivalent = showAedEquivalent
    ? CurrencyConverter.convert(invoice.totalAmount, invoice.currency, 'AED')
    : null;
  const remainingAmount = Math.max(0, Number(invoice.totalAmount) - Number(invoice.paidAmount || 0));

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMessage('');

    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      setPaymentMessage('Enter a valid payment amount.');
      return;
    }

    if (amount > remainingAmount + 0.000001) {
      setPaymentMessage('Payment amount cannot exceed outstanding balance.');
      return;
    }

    setIsRecordingPayment(true);
    try {
      const response = await fetch(apiPath('/payments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount,
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPaymentMessage(data.error || 'Failed to record payment.');
        return;
      }

      setPaymentForm((prev) => ({ ...prev, amount: '', reference: '' }));
      setPaymentMessage('Payment recorded successfully.');
      await fetchInvoice();
    } catch {
      setPaymentMessage('Failed to record payment.');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{invoice.invoiceNumber}</h2>
          <p className="text-gray-600">Invoice details and PDF download</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="btn-outline">
            Edit Invoice
          </Link>
          <a
            href={`${apiPath(`/invoices/${invoice.id}/pdf`)}?showAed=${showAed ? '1' : '0'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            ⬇ Download PDF
          </a>
          <Link href="/dashboard/invoices" className="btn-outline">
            Back to Invoices
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                invoice.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : invoice.paymentStatus === 'partially_paid'
                    ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="font-medium">{NumberFormatter.formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium">{NumberFormatter.formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="font-medium text-red-600">
              {NumberFormatter.formatCurrency(remainingAmount, invoice.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Record Payment</h3>
          <Link
            href={`/dashboard/payments?invoiceId=${invoice.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Open Payment Tracking
          </Link>
        </div>

        {invoice.paymentStatus === 'paid' ? (
          <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm">
            This invoice is fully paid.
          </div>
        ) : (
          <form onSubmit={recordPayment} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              max={remainingAmount}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
              className="input-field"
              placeholder="Amount"
              required
            />
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
              className="input-field"
              required
            />
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="input-field"
              required
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="online">Online</option>
            </select>
            <input
              type="text"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))}
              className="input-field"
              placeholder="Reference (optional)"
            />
            <div className="md:col-span-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Remaining: {NumberFormatter.formatCurrency(remainingAmount, invoice.currency)}
              </p>
              <button
                type="submit"
                disabled={isRecordingPayment}
                className="btn-primary disabled:opacity-60"
              >
                {isRecordingPayment ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        )}

        {paymentMessage && (
          <p className="mt-3 text-sm text-gray-700">{paymentMessage}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">From</h3>
          <p className="font-bold">{invoice.company.name}</p>
          <p className="text-gray-600">{invoice.company.address}</p>
          <p className="text-gray-600">
            {invoice.company.city}, {invoice.company.country}
          </p>
          <p className="text-gray-600">{invoice.company.email}</p>
          <p className="text-gray-600">{invoice.company.phone}</p>
          {invoice.company.taxId && (
            <p className="text-gray-600">VAT ID: {invoice.company.taxId}</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Bill To</h3>
          <p className="font-bold">{invoice.client.name}</p>
          <p className="text-gray-600">{invoice.client.address}</p>
          <p className="text-gray-600">
            {invoice.client.city}, {invoice.client.country}
          </p>
          <p className="text-gray-600">{invoice.client.email}</p>
          <p className="text-gray-600">{invoice.client.phone}</p>
          {invoice.client.taxId && (
            <p className="text-gray-600">Tax ID: {invoice.client.taxId}</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Invoice Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Tax %</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.id} className="table-row">
                  <td className="px-4 py-3">{line.description}</td>
                  <td className="px-4 py-3 text-right">{Number(line.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    {invoice.currency} {Number(line.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">{Number(line.taxRate).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right">
                    {invoice.currency} {Number(line.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-gray-50">
        <div className="max-w-md ml-auto space-y-2">
          {showAedEquivalent && (
            <div className="flex justify-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showAed}
                  onChange={(e) => setShowAed(e.target.checked)}
                  className="w-4 h-4"
                />
                Show AED
              </label>
            </div>
          )}
          <div className="flex justify-between text-base">
            <span>Subtotal:</span>
            <span className="font-medium">
              {NumberFormatter.formatCurrency(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span>VAT:</span>
            <span className="font-medium">
              {NumberFormatter.formatCurrency(invoice.taxAmount, invoice.currency)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold text-primary">
            <span>Total:</span>
            <span>{NumberFormatter.formatCurrency(invoice.totalAmount, invoice.currency)}</span>
          </div>
          {showAed && showAedEquivalent && aedEquivalent && (
            <div className="flex justify-between text-sm text-gray-600 pt-1">
              <span>AED Equivalent:</span>
              <span className="font-medium">
                {NumberFormatter.formatCurrency(aedEquivalent.toNumber(), 'AED')}
              </span>
            </div>
          )}
        </div>
      </div>

      {invoice.notes && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-2">Notes</h3>
          <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Payment History</h3>
        {invoice.payments.length === 0 ? (
          <p className="text-gray-600">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Reference</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} className="table-row">
                    <td className="px-4 py-3">{NumberFormatter.formatDate(payment.paymentDate)}</td>
                    <td className="px-4 py-3 capitalize">{payment.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-4 py-3">{payment.reference || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {NumberFormatter.formatCurrency(Number(payment.amount), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



