import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Tag,
  Sliders,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SearchRecord, SearchStage } from '../types';

interface SearchViewProps {
  onExecuteSearch: (params: {
    country: string;
    city: string;
    radiusKm: number;
    category: string;
    keywords?: string;
    minOpportunityScore: number;
    provider: string;
  }) => Promise<SearchRecord>;
  activeSearch: SearchRecord | null;
  recentSearches: SearchRecord[];
  onViewResults: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onExecuteSearch,
  activeSearch,
  recentSearches,
  onViewResults,
}) => {
  const [country, setCountry] = useState('Germany');
  const [city, setCity] = useState('Frankfurt am Main');
  const [category, setCategory] = useState('Dentist');
  const [radiusKm, setRadiusKm] = useState(20);
  const [keywords, setKeywords] = useState('');
  const [minOpportunityScore, setMinOpportunityScore] = useState(60);
  const [provider, setProvider] = useState('licensed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !category) {
      setError('City and Category are required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onExecuteSearch({
        country,
        city,
        radiusKm,
        category,
        keywords: keywords.trim() ? keywords : undefined,
        minOpportunityScore,
        provider,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch search');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STAGES: { id: SearchStage; label: string; desc: string }[] = [
    { id: 'DISCOVERY', label: 'Discovery', desc: 'Querying compliant provider registry' },
    { id: 'WEBSITE_CHECK', label: 'DNS & Site Check', desc: 'Verifying official domain & SSL' },
    { id: 'CRAWLING', label: 'Safe Crawl', desc: 'SSRF-guarded HTTP content extraction' },
    { id: 'PERFORMANCE', label: 'Performance', desc: 'Measuring LCP, FCP & layout shift' },
    { id: 'MOBILE', label: 'Mobile Audit', desc: 'Evaluating viewport & responsive layout' },
    { id: 'CONTACT_EXTRACTION', label: 'Contacts', desc: 'Extracting public emails & impressum' },
    { id: 'AI_ANALYSIS', label: 'Gemini AI', desc: 'Synthesizing commercial opportunity' },
    { id: 'SCORING', label: 'Deterministic Scoring', desc: 'Calculating final Opportunity Score' },
    { id: 'COMPLETE', label: 'Complete', desc: 'Leads normalized in workspace' },
  ];

  const currentStageIndex = activeSearch
    ? STAGES.findIndex((s) => s.id === activeSearch.stage)
    : -1;

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight">
          AI Business Discovery Engine
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Scan municipal registries, open business datasets, or Google Places for local opportunities with weak digital presence.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Search Config Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Country & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Germany, United Kingdom, USA"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>City / Region</span>
                  <span className="text-[11px] text-indigo-400 cursor-pointer" onClick={() => setCity('Frankfurt am Main')}>
                    e.g. Frankfurt
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Frankfurt, Berlin, Munich"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Category & Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Industry / Business Category</span>
                  <span className="text-[11px] text-zinc-500">Target niche</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Dentist, Roofing Contractor, Law Firm"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Search Radius: {radiusKm} km</span>
                  <span className="text-[11px] text-zinc-500">Surrounding area</span>
                </label>
                <div className="pt-2">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Provider Selector & Min Opportunity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-zinc-400" />
                  Discovery Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="licensed">Licensed Business Registry (Frankfurt/Official)</option>
                  <option value="open_data">Open Community Data Provider (OSM/OpenData)</option>
                  <option value="mock">Development Mock Provider (Offline Testing)</option>
                  <option value="google_places_official">Google Places API (Official API)</option>
                </select>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Compliant data sources only. No scraping of Google Maps DOM.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                    Min Opportunity Score
                  </span>
                  <span className="text-indigo-400 font-semibold">{minOpportunityScore}/100</span>
                </label>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={minOpportunityScore}
                    onChange={(e) => setMinOpportunityScore(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Focus on highest-value agency prospects
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || activeSearch?.status === 'PROCESSING'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting || activeSearch?.status === 'PROCESSING' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning & Auditing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find Local Opportunities
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Progress Card (Active Pipeline) */}
          {activeSearch && (
            <div className="rounded-xl border border-indigo-500/30 bg-zinc-900/80 p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {activeSearch.status === 'PROCESSING' ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : activeSearch.status === 'COMPLETED' ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {activeSearch.status === 'COMPLETED'
                        ? 'Discovery Scan Completed!'
                        : activeSearch.status === 'FAILED'
                        ? 'Scan Encountered Issue'
                        : `Executing: ${activeSearch.stage}`}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Targeting {activeSearch.params.category} in {activeSearch.params.city}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-indigo-400">
                    {activeSearch.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${activeSearch.progressPercent}%` }}
                />
              </div>

              {/* Live KPI Tally */}
              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-zinc-800/80 text-center">
                <div className="p-2 rounded bg-zinc-950/60">
                  <div className="text-xs text-zinc-400">Discovered</div>
                  <div className="text-sm font-semibold text-white">{activeSearch.totalDiscovered}</div>
                </div>
                <div className="p-2 rounded bg-zinc-950/60">
                  <div className="text-xs text-zinc-400">Websites</div>
                  <div className="text-sm font-semibold text-emerald-400">{activeSearch.websitesFound}</div>
                </div>
                <div className="p-2 rounded bg-zinc-950/60">
                  <div className="text-xs text-zinc-400">No Website</div>
                  <div className="text-sm font-semibold text-amber-400">{activeSearch.noWebsites}</div>
                </div>
                <div className="p-2 rounded bg-zinc-950/60">
                  <div className="text-xs text-zinc-400">High Opp.</div>
                  <div className="text-sm font-semibold text-purple-400">{activeSearch.highOpportunities}</div>
                </div>
              </div>

              {/* Stage Stepper Checklist */}
              <div className="space-y-1.5 pt-2">
                {STAGES.map((s, idx) => {
                  const isDone = currentStageIndex > idx || activeSearch.status === 'COMPLETED';
                  const isCurrent = currentStageIndex === idx && activeSearch.status === 'PROCESSING';

                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-zinc-700" />
                        )}
                        <span className={isCurrent ? 'font-medium text-white' : isDone ? 'text-zinc-300' : 'text-zinc-500'}>
                          {s.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">{s.desc}</span>
                    </div>
                  );
                })}
              </div>

              {activeSearch.status === 'COMPLETED' && (
                <div className="pt-3 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={onViewResults}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
                  >
                    View All Discovered Leads
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Recent Searches & Discovery Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Recent Discovery Scans</h3>
            {recentSearches.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">No scans run yet in this workspace.</p>
            ) : (
              <div className="space-y-2.5">
                {recentSearches.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCity(s.params.city);
                      setCategory(s.params.category);
                      setCountry(s.params.country);
                    }}
                    className="p-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 cursor-pointer text-xs space-y-1 group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors">
                        {s.params.category} &bull; {s.params.city}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${s.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span>{s.totalDiscovered} found ({s.noWebsites} no site)</span>
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 text-xs text-zinc-400">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Compliance & Safety Mandate
            </h3>
            <p className="leading-relaxed">
              Every discovered record tracks license provenance. Crawling enforces rigorous <strong>SSRF protection</strong> against private IP ranges and adheres to robots policies.
            </p>
            <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800 text-[11px] text-zinc-500">
              No unofficial Google Maps DOM scraping is executed. Official Google Places Web APIs or licensed open city registers are utilized exclusively.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
