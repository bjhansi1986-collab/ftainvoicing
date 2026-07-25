'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiPath } from '@/lib/paths';

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  pendingPayments: number;
  totalItems: number;
  overdueInvoices: number;
}

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="card hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalItems: 0,
    overdueInvoices: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(apiPath('/dashboard/stats'));
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set default values for demo
      setStats({
        totalInvoices: 24,
        totalClients: 12,
        totalRevenue: 125500,
        pendingPayments: 35000,
        totalItems: 48,
        overdueInvoices: 3,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon="📄"
          color="text-blue-600"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon="👥"
          color="text-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={`AED ${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="text-purple-600"
        />
        <StatCard
          title="Pending Payments"
          value={`AED ${stats.pendingPayments.toLocaleString()}`}
          icon="⏳"
          color="text-orange-600"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon="⚠️"
          color="text-red-600"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon="📦"
          color="text-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/invoices/new"
            className="btn-primary text-center"
          >
            ➕ New Invoice
          </Link>
          <Link
            href="/dashboard/clients/new"
            className="btn-primary text-center"
          >
            ➕ Add Client
          </Link>
          <Link
            href="/dashboard/items/new"
            className="btn-primary text-center"
          >
            ➕ Add Item
          </Link>
          <Link
            href="/dashboard/company"
            className="btn-secondary text-center"
          >
            🏢 Company Details
          </Link>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Recent Invoices</h2>
          <Link href="/dashboard/invoices" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="px-6 py-4">INV-2024-001</td>
                <td className="px-6 py-4">Acme Corporation</td>
                <td className="px-6 py-4">AED 15,500</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4">2024-01-15</td>
              </tr>
              <tr className="table-row">
                <td className="px-6 py-4">INV-2024-002</td>
                <td className="px-6 py-4">Tech Solutions Ltd</td>
                <td className="px-6 py-4">AED 22,300</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4">2024-01-20</td>
              </tr>
              <tr className="table-row">
                <td className="px-6 py-4">INV-2024-003</td>
                <td className="px-6 py-4">Global Industries</td>
                <td className="px-6 py-4">AED 18,750</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Draft
                  </span>
                </td>
                <td className="px-6 py-4">2024-01-22</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
