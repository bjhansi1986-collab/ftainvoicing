'use client';

import { useState } from 'react';
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

export default function NewItemPage() {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    sku: '',
    unitPrice: '',
    currency: 'AED',
    taxRate: '5',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      const response = await fetch(apiPath('/items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setMessage('Item added successfully!');
        setTimeout(() => {
          window.location.href = withBasePath('/dashboard/items');
        }, 1500);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to add item.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while adding the item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Item</h2>
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
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">
            Item Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name/Description *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Consulting Services, Development Hours"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Detailed description of the item/service"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU/Code (Optional)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., SRV-001, DEV-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique stock keeping unit for inventory tracking
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price *
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="input-field"
                placeholder="0.00"
              />
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
                <option value="AED">AED (United Arab Emirates Dirham)</option>
                <option value="USD">USD (United States Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Tax Rate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VAT Rate (%) *
              </label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                max="100"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard UAE VAT rate is 5%. Use 0 for VAT-exempt items.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-primary mb-3">Price Preview</h3>
          {formData.unitPrice && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Unit Price:</span>
                <span className="font-medium">
                  {formData.currency} {parseFloat(formData.unitPrice).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {formData.taxRate !== '0' && (
                <div className="flex justify-between text-gray-600">
                  <span>VAT ({formData.taxRate}%):</span>
                  <span>
                    {formData.currency}{' '}
                    {(
                      (parseFloat(formData.unitPrice) * parseFloat(formData.taxRate)) /
                      100
                    ).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Price with VAT:</span>
                <span>
                  {formData.currency}{' '}
                  {(
                    parseFloat(formData.unitPrice) *
                    (1 + parseFloat(formData.taxRate) / 100)
                  ).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t pt-6 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Item'}
          </button>
          <Link href="/dashboard/items" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
