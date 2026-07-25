'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiPath } from '@/lib/paths';

interface Item {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  currency: string;
  taxRate: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(apiPath('/items'));
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([
        {
          id: '1',
          name: 'Consulting Services',
          sku: 'SRV-001',
          unitPrice: 500,
          currency: 'AED',
          taxRate: 5,
        },
        {
          id: '2',
          name: 'Development Hours',
          sku: 'DEV-001',
          unitPrice: 300,
          currency: 'AED',
          taxRate: 5,
        },
      ]);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(apiPath(`/items/${id}`), { method: 'DELETE' });
        if (response.ok) {
          setItems(items.filter((i) => i.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Items</h2>
        <Link href="/dashboard/items/new" className="btn-primary">
          ➕ Add Item
        </Link>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search items by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Unit Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tax Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.sku || '-'}</td>
                  <td className="px-6 py-4">
                    {item.currency} {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{item.taxRate}%</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link
                      href={`/dashboard/items/${item.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items found. Add your first item to get started.
          </div>
        )}
      </div>
    </div>
  );
}
