'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: 'Multicurrency Support',
      description: 'Generate invoices in USD and AED with automatic exchange rate conversion',
      icon: '💱',
    },
    {
      title: 'VAT Compliance',
      description: 'Built-in UAE VAT compliance with customizable tax rates',
      icon: '✅',
    },
    {
      title: 'PDF Export',
      description: 'Professional PDF invoice export with custom branding',
      icon: '📄',
    },
    {
      title: 'Client Master',
      description: 'Manage unlimited clients with complete contact information',
      icon: '👥',
    },
    {
      title: 'Item Master',
      description: 'Create and manage inventory items with pricing',
      icon: '📦',
    },
    {
      title: 'Payment Tracking',
      description: 'Track payments and payment status for each invoice',
      icon: '💳',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">FTA</span>
              <span className="text-sm text-gray-600">Invoice Pro</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-primary transition">
                Features
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-primary transition">
                Login
              </Link>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary"
            >
              ☰
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="#features" className="block text-gray-700 hover:text-primary py-2">
                Features
              </Link>
              <Link href="/login" className="block text-gray-700 hover:text-primary py-2">
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Professional Invoice Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your invoice generation with multicurrency support, VAT compliance, and professional PDF exports for UAE businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="btn-primary text-lg px-8 py-3 text-center"
            >
              Get Started →
            </Link>
            <Link
              href="#features"
              className="btn-outline text-lg px-8 py-3 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your invoicing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start creating professional invoices in minutes.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">FTA Invoice Pro</h3>
              <p className="text-sm">Professional invoicing for UAE businesses</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Features</Link></li>
                <li><Link href="#" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 FTA Invoice Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
