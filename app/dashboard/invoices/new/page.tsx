'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CurrencyConverter } from '@/lib/currency';
import { apiPath, withBasePath } from '@/lib/paths';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Item {
  id: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  currency: string;
}

interface LineItem {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

interface InvoiceFormData {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  items: LineItem[];
}

export default function NewInvoicePage() {
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'AED',
    notes: '',
    items: [],
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [showAed, setShowAed] = useState(true);

  useEffect(() => {
    fetchClientsAndItems();
  }, []);

  const fetchClientsAndItems = async () => {
    try {
      const [clientRes, itemRes] = await Promise.all([
        fetch(apiPath('/clients')),
        fetch(apiPath('/items')),
      ]);

      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClients(clientData);
      }
      if (itemRes.ok) {
        const itemData = await itemRes.json();
        setItems(itemData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use demo data
      setClients([
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'contact@acme.ae',
        },
      ]);
      setItems([
        {
          id: '1',
          name: 'Consulting Services',
          unitPrice: 500,
          taxRate: 5,
          currency: 'AED',
        },
      ]);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      itemId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 5,
      taxAmount: 0,
      lineTotal: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, ...updates };

        // Recalculate
        const taxAmount = (updated.unitPrice * updated.quantity * updated.taxRate) / 100;
        const lineTotal = updated.unitPrice * updated.quantity + taxAmount;

        return {
          ...updated,
          taxAmount,
          lineTotal,
        };
      }),
    }));
  };

  const handleItemSelect = (lineItemId: string, selectedItemId: string) => {
    const selectedItem = items.find((i) => i.id === selectedItemId);
    if (selectedItem) {
      updateLineItem(lineItemId, {
        itemId: selectedItemId,
        description: selectedItem.name,
        unitPrice: selectedItem.unitPrice,
        taxRate: selectedItem.taxRate,
      });
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      subtotal += itemSubtotal;
      totalTax += item.taxAmount;
    });

    return {
      subtotal,
      totalTax,
      total: subtotal + totalTax,
    };
  };

  const totals = calculateTotals();

  const aedEquivalent =
    formData.currency !== 'AED'
      ? CurrencyConverter.convert(totals.total, formData.currency, 'AED')
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      setMessage('Please select a client.');
      return;
    }

    if (formData.items.length === 0) {
      setMessage('Please add at least one item to the invoice.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const submitData = {
        ...formData,
        subtotal: totals.subtotal,
        taxAmount: totals.totalTax,
        totalAmount: totals.total,
      };

      const response = await fetch(apiPath('/invoices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage('Invoice created successfully!');
        setTimeout(() => {
          window.location.href = withBasePath('/dashboard/invoices');
        }, 1500);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create invoice.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while creating the invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Invoice</h2>
        <Link href="/dashboard/invoices" className="text-blue-600 hover:underline">
          Back to Invoices
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-center font-medium mb-6 ${
            message.includes('successfully')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">Invoice Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="btn-secondary text-sm"
            >
              ➕ Add Item
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              No items added. Click Add Item to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((lineItem) => (
                <div
                  key={lineItem.id}
                  className="border rounded-lg p-4 bg-gray-50 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item
                      </label>
                      <select
                        value={lineItem.itemId}
                        onChange={(e) => handleItemSelect(lineItem.id, e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select from catalog or enter custom</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.currency} {item.unitPrice})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={lineItem.description}
                        onChange={(e) =>
                          updateLineItem(lineItem.id, {
                            description: e.target.value,
                          })
                        }
                        required
                        className="input-field"
                        placeholder="Item description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={lineItem.quantity}
                        onChange={(e) =>
                          updateLineItem(lineItem.id, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        min="0"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        value={lineItem.unitPrice}
                        onChange={(e) =>
                          updateLineItem(lineItem.id, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        min="0"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax %
                      </label>
                      <input
                        type="number"
                        value={lineItem.taxRate}
                        onChange={(e) =>
                          updateLineItem(lineItem.id, {
                            taxRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        min="0"
                        max="100"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <input
                        type="text"
                        value={lineItem.lineTotal.toFixed(2)}
                        disabled
                        className="input-field bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      Subtotal: {(lineItem.quantity * lineItem.unitPrice).toFixed(2)} | Tax:{' '}
                      {lineItem.taxAmount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(lineItem.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {formData.items.length > 0 && (
          <div className="card bg-gray-50">
            <div className="space-y-2 text-right">
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
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formData.currency} {totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span>VAT (5%):</span>
                <span className="font-medium">
                  {formData.currency} {totals.totalTax.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold text-primary">
                <span>Total:</span>
                <span>
                  {formData.currency} {totals.total.toFixed(2)}
                </span>
              </div>
              {showAed && aedEquivalent && (
                <div className="flex justify-between text-sm text-gray-600 pt-1">
                  <span>AED Equivalent:</span>
                  <span className="font-medium">AED {aedEquivalent.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Payment terms, special instructions, or additional notes for the client"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </button>
          <Link href="/dashboard/invoices" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}







