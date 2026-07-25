'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiPath, withBasePath } from '@/lib/paths';

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  uaeId: string;
  taxId: string;
  trrn: string;
  vatRate: number;
  logo?: string;
  signature?: string;
  bankDetails?: string;
}

export default function CompanyDetailsPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dubai',
    country: 'UAE',
    uaeId: '',
    taxId: '',
    trrn: '',
    vatRate: 5,
    logo: '',
    signature: '',
    bankDetails: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const endpoint = companyId ? apiPath(`/companies/${companyId}`) : apiPath('/company');
        const response = await fetch(endpoint);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || 'Dubai',
          country: data.country || 'UAE',
          uaeId: data.uaeId || '',
          taxId: data.taxId || '',
          trrn: data.trrn || '',
          vatRate: Number(data.vatRate ?? 5),
          logo: data.logo || '',
          signature: data.signature || '',
          bankDetails: data.bankDetails || '',
        });
        setLogoPreview(data.logo || null);
        setSignaturePreview(data.signature || null);
      } catch {
        // Keep empty form fallback
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vatRate' ? parseFloat(value) : value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Logo size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
        setMessage('Logo must be an image file (PNG, JPG, GIF, WEBP)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          logo: base64,
        }));
        setLogoPreview(base64);
        setMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: undefined,
    }));
    setLogoPreview(null);
  };


  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setMessage('Signature size must be less than 3MB');
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        setMessage('Signature must be an image file (PNG, JPG, WEBP)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          signature: base64,
        }));
        setSignaturePreview(base64);
        setMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = () => {
    setFormData((prev) => ({
      ...prev,
      signature: undefined,
    }));
    setSignaturePreview(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const endpoint = companyId ? apiPath(`/companies/${companyId}`) : apiPath('/company');
      const method = companyId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Company details saved successfully!');
        setTimeout(() => {
          window.location.href = withBasePath('/dashboard/settings');
        }, 1500);
      } else {
        setMessage('Failed to save company details.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while saving company details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
        <Link href="/dashboard/settings" className="text-blue-600 hover:underline">
          Back to Settings
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
        {/* Company Logo */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">
            Company Logo
          </h3>
          <div className="space-y-4">
            {logoPreview && (
              <div className="flex items-center gap-4">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    className="h-32 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="btn-outline text-red-600 border-red-300"
                >
                  ✕ Remove Logo
                </button>
              </div>
            )}

            {!logoPreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-gray-700 font-medium mb-2">Upload Company Logo</p>
                <p className="text-gray-500 text-sm mb-4">
                  PNG, JPG, GIF, or WEBP • Max 5MB
                </p>
                <label className="btn-primary cursor-pointer inline-block">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>


        {/* Authorized Signature */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Authorized Signature
          </h3>
          <div className="space-y-4">
            {signaturePreview && (
              <div className="flex items-center gap-4">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={signaturePreview}
                    alt="Signature Preview"
                    className="h-20 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSignature}
                  className="btn-outline text-red-600 border-red-300"
                >
                  Remove Signature
                </button>
              </div>
            )}

            {!signaturePreview && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
                <p className="text-gray-700 font-medium mb-2">Upload Signature</p>
                <p className="text-gray-500 text-sm mb-4">
                  PNG, JPG, or WEBP - Max 3MB
                </p>
                <label className="btn-primary cursor-pointer inline-block">
                  Choose Signature
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        {/* Company Basic Info */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., ABC Trading LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="info@company.ae"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="+971 4 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
                disabled
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Office address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Dubai"
              />
            </div>
          </div>
        </div>

        {/* UAE Compliance */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            UAE Compliance Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UAE Trade License Number (TRRN) *
              </label>
              <input
                type="text"
                name="trrn"
                value={formData.trrn}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., 1234567890123"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trade Registration and Renewal Number from Dubai/Abu Dhabi Municipality
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UAE Estb. ID / License ID (Optional)
              </label>
              <input
                type="text"
                name="uaeId"
                value={formData.uaeId}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 123456"
              />
              <p className="text-xs text-gray-500 mt-1">
                Establishment ID from your business license
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VAT Registration Number *
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., 100123456700003"
              />
              <p className="text-xs text-gray-500 mt-1">
                15-digit VAT Registration Number from FTA
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VAT Rate (%) *
              </label>
              <input
                type="number"
                name="vatRate"
                value={formData.vatRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                required
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard UAE VAT rate is 5%
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Bank Details
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Details (Optional)
            </label>
            <textarea
              name="bankDetails"
              value={formData.bankDetails}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Bank Name: ABC Bank UAE
Account Number: 123456789
IBAN: AE123456789012345678901
SWIFT: ABCDUAE"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear on invoices for payment instructions
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Company Details'}
          </button>
          <Link href="/dashboard/settings" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}







