import React, { useState } from 'react';
import { X, Building2, Globe, MapPin, Tag, Phone } from 'lucide-react';

interface ManualEntryModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    city: string;
    country: string;
    street?: string;
    websiteUrl?: string;
    phone?: string;
  }) => Promise<void>;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dentist');
  const [city, setCity] = useState('Frankfurt am Main');
  const [country, setCountry] = useState('Germany');
  const [street, setStreet] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      setError('Business name and city are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        city: city.trim(),
        country: country.trim(),
        street: street.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add business');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Add Single Business Prospect</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">Business Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Thomas Weber Dental Studio"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Category / Niche</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Dentist, Law Firm"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">City / Region *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Frankfurt"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Kaiserstraße 24"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Germany"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1 flex items-center justify-between">
              <span>Official Website URL</span>
              <span className="text-zinc-500 text-[10px]">Leave blank if business has no website</span>
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="e.g. https://www.example-dentist.de"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +49 69 123456"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Save & Analyze'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
