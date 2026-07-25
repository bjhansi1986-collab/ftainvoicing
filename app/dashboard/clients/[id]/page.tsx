'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiPath, withBasePath } from '@/lib/paths';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  tradeId: string;
}

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dubai',
    country: 'UAE',
    taxId: '',
    tradeId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchClient = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch(apiPath(`/clients/${params.id}`));
      if (!response.ok) {
        setMessage('Client not found.');
        return;
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'UAE',
        taxId: data.taxId || '',
        tradeId: data.tradeId || '',
      });
    } catch {
      setMessage('Failed to load client data.');
    } finally {
      setPageLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(apiPath(`/clients/${params.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Client updated successfully!');
        setTimeout(() => {
          window.location.href = withBasePath('/dashboard/clients');
        }, 1200);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update client.');
      }
    } catch {
      setMessage('An error occurred while updating the client.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-center py-8">Loading client...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Client</h2>
        <Link href="/dashboard/clients" className="text-blue-600 hover:underline">
          Back to Clients
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
          <h3 className="text-lg font-semibold text-primary mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select name="country" value={formData.country} onChange={handleChange} className="input-field">
                <option value="UAE">UAE</option>
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="India">India</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required className="input-field" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Tax & License Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VAT Registration Number (Optional)</label>
              <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trade License Number (Optional)</label>
              <input type="text" name="tradeId" value={formData.tradeId} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex gap-4">
          <button type="submit" disabled={isLoading} className="btn-primary disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard/clients" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
