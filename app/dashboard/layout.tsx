'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import { apiPath, withBasePath } from '@/lib/paths';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch(apiPath('/auth/logout'), { method: 'POST' });
    } finally {
      window.location.href = withBasePath('/login');
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/companies', label: 'Companies', icon: '🏢' },
    { href: '/dashboard/invoices', label: 'Invoices', icon: '📄' },
    { href: '/dashboard/clients', label: 'Clients', icon: '👥' },
    { href: '/dashboard/items', label: 'Items', icon: '📦' },
    { href: '/dashboard/payments', label: 'Payments', icon: '💳' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">FTA</span>
              <span className="text-sm">Pro</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-gray-700 p-2 rounded"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          {isSidebarOpen && (
            <div className="text-sm">
              <p className="font-semibold text-gray-100">Company Name</p>
              <p className="text-gray-400 text-xs">admin@company.com</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {menuItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">👤</button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
