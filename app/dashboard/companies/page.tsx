'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiPath } from '@/lib/paths';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  uaeId?: string | null;
  taxId?: string;
  city: string;
  country: string;
  address: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiPath('/companies'));
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([
        {
          id: '1',
          name: 'FTA Invoice Solutions',
          email: 'admin@ftainvoice.ae',
          phone: '+971 4 123 4567',
          uaeId: '12345678901234',
          taxId: 'VAT-123456789',
          city: 'Dubai',
          country: 'UAE',
          address: 'Business Park, Dubai',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Digital Services LLC',
          email: 'contact@digitalservices.ae',
          phone: '+971 2 222 3333',
          uaeId: '98765432109876',
          taxId: 'VAT-987654321',
          city: 'Abu Dhabi',
          country: 'UAE',
          address: 'Corniche Road, Abu Dhabi',
          createdAt: '2024-01-20',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.uaeId || '').includes(searchTerm)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        const response = await fetch(apiPath(`/companies/${id}`), { method: 'DELETE' });
        if (response.ok) {
          setCompanies(companies.filter((c) => c.id !== id));
          setMessage('Company deleted successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Failed to delete company:', error);
        setMessage('Failed to delete company.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Company Directory</h2>
          <p className="text-gray-600 text-sm mt-1">Manage all registered companies</p>
        </div>
        <Link href="/dashboard/company" className="btn-primary">
          ➕ Add Company
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg font-medium">
          {message}
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by company name, email, or UAE ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Companies Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading companies...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {companies.length === 0
              ? 'No companies registered yet. Add your first company to get started.'
              : 'No companies match your search.'}
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Company Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">UAE ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">VAT ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="table-row">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {company.uaeId || '—'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {company.taxId ? (
                        <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {company.taxId}
                        </code>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                        {company.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                        {company.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4">{company.city}</td>
                    <td className="px-6 py-4 space-x-2">
                      <Link
                        href={`/dashboard/company/${company.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Card */}
      {companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Companies</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{companies.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Companies with VAT</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {companies.filter((c) => c.taxId).length}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Cities</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {new Set(companies.map((c) => c.city)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
