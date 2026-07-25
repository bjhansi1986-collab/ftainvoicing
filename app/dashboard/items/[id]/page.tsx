'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiPath, withBasePath } from '@/lib/paths';

interface ItemFormData {
  name: string;
  description: string;
  sku: string;
  unitPrice: string;
  currency: string;
  taxRate: string;
}

export default function EditItemPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    sku: '',
    unitPrice: '',
    currency: 'AED',
    taxRate: '5',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchItem = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch(apiPath(`/items/${params.id}`));
      if (!response.ok) {
        setMessage('Item not found.');
        return;
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        description: data.description || '',
        sku: data.sku || '',
        unitPrice: data.unitPrice?.toString() || '',
        currency: data.currency || 'AED',
        taxRate: data.taxRate?.toString() || '5',
      });
    } catch {
      setMessage('Failed to load item data.');
    } finally {
      setPageLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const submitData = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        taxRate: parseFloat(formData.taxRate),
      };

      const response = await fetch(apiPath(`/items/${params.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage('Item updated successfully!');
        setTimeout(() => {
          window.location.href = withBasePath('/dashboard/items');
        }, 1200);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update item.');
      }
    } catch {
      setMessage('An error occurred while updating the item.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-center py-8">Loading item...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Item</h2>
        <Link href="/dashboard/items" className="text-blue-600 hover:underline">
          Back to Items
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

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">Item Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Name/Description *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU/Code (Optional)</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
              <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required step="0.01" min="0" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
              <select name="currency" value={formData.currency} onChange={handleChange} required className="input-field">
                <option value="AED">AED (United Arab Emirates Dirham)</option>
                <option value="USD">USD (United States Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Tax Rate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%) *</label>
              <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} required step="0.01" min="0" max="100" className="input-field" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex gap-4">
          <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard/items" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
