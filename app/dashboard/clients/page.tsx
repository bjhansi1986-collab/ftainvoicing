'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiPath } from '@/lib/paths';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  taxId?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(apiPath('/clients'));
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'contact@acme.ae',
          phone: '+971 4 123 4567',
          city: 'Dubai',
          country: 'UAE',
          taxId: 'TAX-123456',
        },
        {
          id: '2',
          name: 'Tech Solutions Ltd',
          email: 'info@techsolutions.ae',
          phone: '+971 2 222 3333',
          city: 'Abu Dhabi',
          country: 'UAE',
          taxId: 'TAX-654321',
        },
      ]);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(apiPath(`/clients/${id}`), { method: 'DELETE' });
        if (response.ok) {
          setClients(clients.filter((c) => c.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
        <Link href="/dashboard/clients/new" className="btn-primary">
          ➕ Add Client
        </Link>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tax ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="table-row">
                  <td className="px-6 py-4 font-medium">{client.name}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{client.phone}</td>
                  <td className="px-6 py-4">{client.city}</td>
                  <td className="px-6 py-4">{client.taxId || '-'}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
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
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No clients found. Add your first client to get started.
          </div>
        )}
      </div>
    </div>
  );
}
