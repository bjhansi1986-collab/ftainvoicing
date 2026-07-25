'use client';

import { useEffect, useState } from 'react';
import { apiPath, withBasePath } from '@/lib/paths';

interface Settings {
  invoicePrefix: string;
  invoiceNumbering: number;
  defaultCurrency: string;
  defaultVatRate: number;
  enableVat: boolean;
  paymentTermsDays: number;
  invoiceTemplate: string;
  customNotes: string;
  footerText: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    invoicePrefix: 'INV',
    invoiceNumbering: 1000,
    defaultCurrency: 'AED',
    defaultVatRate: 5,
    enableVat: true,
    paymentTermsDays: 30,
    invoiceTemplate: 'standard',
    customNotes: '',
    footerText: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCompanyClick = () => {
    window.location.href = withBasePath('/dashboard/company');
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(apiPath('/settings'));
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const response = await fetch(apiPath('/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {/* Company Details Quick Link */}
      <div className="card border-2 border-blue-200 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1">Company Details</h3>
            <p className="text-gray-600 text-sm">
              Configure your company information, VAT registration, TRRN, and bank details
            </p>
          </div>
          <button
            onClick={handleCompanyClick}
            className="btn-primary"
          >
            Configure →
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-center font-medium ${
            message.includes('successfully')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Invoice Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Invoice Settings</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  name="invoicePrefix"
                  value={settings.invoicePrefix}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., INV"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Numbering (Starting)
                </label>
                <input
                  type="number"
                  name="invoiceNumbering"
                  value={settings.invoiceNumbering}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  name="defaultCurrency"
                  value={settings.defaultCurrency}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option>AED</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Template
                </label>
                <select
                  name="invoiceTemplate"
                  value={settings.invoiceTemplate}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="standard">Standard</option>
                  <option value="minimal">Minimal</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Payment Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Tax & Payment Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                name="enableVat"
                checked={settings.enableVat}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-gray-700 font-medium">Enable VAT</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default VAT Rate (%)
                </label>
                <input
                  type="number"
                  name="defaultVatRate"
                  value={settings.defaultVatRate}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms (Days)
                </label>
                <input
                  type="number"
                  name="paymentTermsDays"
                  value={settings.paymentTermsDays}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Content */}
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Custom Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Notes
              </label>
              <textarea
                name="customNotes"
                value={settings.customNotes}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Default notes to appear on invoices"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Footer
              </label>
              <textarea
                name="footerText"
                value={settings.footerText}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Footer text to appear on all invoices"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={() => fetchSettings()}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
