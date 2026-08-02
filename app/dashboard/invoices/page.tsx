'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiPath, withBasePath } from '@/lib/paths';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { name: string };
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  invoiceDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState('all');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch invoices
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(apiPath('/invoices'));
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      // Demo data
      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          client: { name: 'Acme Corporation' },
          totalAmount: 15500,
          currency: 'AED',
          status: 'sent',
          paymentStatus: 'paid',
          invoiceDate: '2024-01-15',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          client: { name: 'Tech Solutions Ltd' },
          totalAmount: 22300,
          currency: 'AED',
          status: 'sent',
          paymentStatus: 'unpaid',
          invoiceDate: '2024-01-20',
        },
      ]);
    }
  };

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

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inv.paymentStatus === 'paid';
    if (filter === 'unpaid') return inv.paymentStatus === 'unpaid';
    if (filter === 'draft') return inv.status === 'draft';
    return true;
  });

  const handleClone = async (id: string) => {
    setMessage('');
    setCloningId(id);
    try {
      const response = await fetch(apiPath(`/invoices/${id}/clone`), { method: 'POST' });
      if (response.ok) {
        const cloned = await response.json();
        window.location.href = withBasePath(`/dashboard/invoices/${cloned.id}/edit`);
        return;
      }
      const error = await response.json();
      setMessage(error.error || 'Failed to clone invoice.');
    } catch {
      setMessage('Failed to clone invoice.');
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
        <Link href="/dashboard/invoices/new" className="btn-primary">
          ➕ New Invoice
        </Link>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">{message}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'paid', 'unpaid', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="table-row">
                  <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">{invoice.client.name}</td>
                  <td className="px-6 py-4">
                    {invoice.currency} {invoice.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{invoice.invoiceDate}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}/edit`}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    {invoice.paymentStatus !== 'paid' && (
                      <Link
                        href={`/dashboard/payments?invoiceId=${invoice.id}`}
                        className="text-amber-600 hover:underline text-sm"
                      >
                        Record Payment
                      </Link>
                    )}
                    <a
                      href={apiPath(`/invoices/${invoice.id}/pdf`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm"
                    >
                      PDF
                    </a>
                    <button
                      onClick={() => handleClone(invoice.id)}
                      disabled={cloningId === invoice.id}
                      className="text-purple-600 hover:underline text-sm disabled:opacity-50"
                    >
                      {cloningId === invoice.id ? 'Cloning...' : 'Clone'}
                    </button>
                    <button className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No invoices found. Create your first invoice to get started.
          </div>
        )}
      </div>
    </div>
  );
}
