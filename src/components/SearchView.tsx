import React, { useState, useMemo, useEffect } from 'react';
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
  Globe,
  Layers,
  Edit3,
  ListFilter,
} from 'lucide-react';
import { SearchRecord, SearchStage } from '../types';
import {
  INDUSTRY_CATEGORY_GROUPS,
  ALL_PREDEFINED_CATEGORIES,
  POPULAR_CATEGORY_SHORTCUTS,
  PREDEFINED_COUNTRIES_DATA,
  getCitiesForCountry,
  getDefaultCityForCountry,
  getPopularCitiesForCountry,
  getCountryLocation,
} from '../data/categoriesAndLocations';

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
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  const [city, setCity] = useState('Frankfurt am Main');
  const [isCustomCity, setIsCustomCity] = useState(false);

  const [category, setCategory] = useState('Dentist');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [radiusKm, setRadiusKm] = useState(20);
  const [keywords, setKeywords] = useState('');
  const [minOpportunityScore, setMinOpportunityScore] = useState(60);
  const [provider, setProvider] = useState('licensed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available cities dynamically derived from country selection
  const currentCities = useMemo(() => {
    return getCitiesForCountry(country);
  }, [country]);

  // Popular city shortcuts for selected country
  const popularCities = useMemo(() => {
    return getPopularCitiesForCountry(country);
  }, [country]);

  // Handle country selection
  const handleCountrySelect = (selectedCountry: string) => {
    if (selectedCountry === '__CUSTOM__') {
      setIsCustomCountry(true);
      setIsCustomCity(true);
      setCountry('');
      setCity('');
      return;
    }

    setIsCustomCountry(false);
    setCountry(selectedCountry);

    // Auto-update to default city for the chosen country
    const newDefaultCity = getDefaultCityForCountry(selectedCountry);
    setCity(newDefaultCity);
    setIsCustomCity(false);
  };

  // Handle city selection
  const handleCitySelect = (selectedCity: string) => {
    if (selectedCity === '__CUSTOM__') {
      setIsCustomCity(true);
      setCity('');
      return;
    }
    setIsCustomCity(false);
    setCity(selectedCity);
  };

  // Handle category selection
  const handleCategorySelect = (selectedCat: string) => {
    if (selectedCat === '__CUSTOM__') {
      setIsCustomCategory(true);
      setCategory('');
      return;
    }
    setIsCustomCategory(false);
    setCategory(selectedCat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCountry = country.trim();
    const cleanCity = city.trim();
    const cleanCat = category.trim();

    if (!cleanCountry) {
      setError('Please select or specify a Country.');
      return;
    }
    if (!cleanCity) {
      setError('Please select or specify a City / Region.');
      return;
    }
    if (!cleanCat) {
      setError('Please select or specify an Industry / Business Category.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onExecuteSearch({
        country: cleanCountry,
        city: cleanCity,
        radiusKm,
        category: cleanCat,
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

  // Check if current city is in the predefined list for this country
  const isCityInPredefinedList = currentCities.includes(city);

  // Check if current category is in predefined list
  const isCategoryInPredefinedList = ALL_PREDEFINED_CATEGORIES.includes(category);

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

            {/* Row 1: Country & City / Region */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Country Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    Country
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCountry(!isCustomCountry);
                      if (!isCustomCountry) {
                        setIsCustomCity(true);
                      }
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {isCustomCountry ? (
                      <>
                        <ListFilter className="h-3 w-3" />
                        Select list
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3 w-3" />
                        Custom
                      </>
                    )}
                  </button>
                </label>

                {!isCustomCountry ? (
                  <select
                    id="search-country-select"
                    value={country}
                    onChange={(e) => handleCountrySelect(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {PREDEFINED_COUNTRIES_DATA.map((c) => (
                      <option key={c.country} value={c.country}>
                        {c.flag} {c.country}
                      </option>
                    ))}
                    <option value="__CUSTOM__">🌐 Other Country (Type custom...)</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      id="search-country-custom-input"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country (e.g. Sweden, New Zealand)"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                )}
                <p className="mt-1 text-[11px] text-zinc-500">
                  Select a country to auto-populate regional cities.
                </p>
              </div>

              {/* City / Region Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    City / Region
                  </span>
                  {!isCustomCountry && currentCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCustomCity(!isCustomCity)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      {isCustomCity ? (
                        <>
                          <ListFilter className="h-3 w-3" />
                          Predefined list
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3 w-3" />
                          Custom city
                        </>
                      )}
                    </button>
                  )}
                </label>

                {!isCustomCity && currentCities.length > 0 ? (
                  <select
                    id="search-city-select"
                    value={isCityInPredefinedList ? city : '__CUSTOM__'}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {!isCityInPredefinedList && city && (
                      <option value={city}>{city} (Current)</option>
                    )}
                    {currentCities.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                    <option value="__CUSTOM__">+ Enter custom city / town...</option>
                  </select>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      id="search-city-custom-input"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={`Enter city or municipality in ${country || 'target region'}`}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {/* Popular City Quick Chips for Selected Country */}
                {popularCities.length > 0 && !isCustomCountry && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Top:</span>
                    {popularCities.map((pCity) => (
                      <button
                        key={pCity}
                        type="button"
                        onClick={() => {
                          setCity(pCity);
                          setIsCustomCity(false);
                        }}
                        className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                          city === pCity
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {pCity}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Industry / Business Category Selection & Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-400" />
                    Industry / Business Category
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {isCustomCategory ? (
                      <>
                        <ListFilter className="h-3 w-3" />
                        Predefined niches
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3 w-3" />
                        Custom niche
                      </>
                    )}
                  </button>
                </label>

                {!isCustomCategory ? (
                  <select
                    id="search-category-select"
                    value={isCategoryInPredefinedList ? category : '__CUSTOM__'}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {!isCategoryInPredefinedList && category && (
                      <option value={category}>{category} (Custom Selection)</option>
                    )}
                    {INDUSTRY_CATEGORY_GROUPS.map((group) => (
                      <optgroup key={group.name} label={group.name}>
                        {group.categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="__CUSTOM__">+ Enter custom industry / niche...</option>
                  </select>
                ) : (
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      id="search-category-custom-input"
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Dentist, Roofer, Orthodontist, Law Firm"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {/* Popular Category Shortcuts */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Popular:</span>
                  {POPULAR_CATEGORY_SHORTCUTS.slice(0, 6).map((catName) => (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => {
                        setCategory(catName);
                        setIsCustomCategory(false);
                      }}
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                        category === catName
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {catName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Search Radius: {radiusKm} km</span>
                  <span className="text-[11px] text-zinc-500">Surrounding metropolitan zone</span>
                </label>
                <div className="pt-2">
                  <input
                    id="search-radius-slider"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>5 km (City Center)</span>
                  <span>25 km (Metro Area)</span>
                  <span>100 km (Regional)</span>
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
                  id="search-provider-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="licensed">Licensed Business Registry (Official/Licensed Data)</option>
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
                    id="search-min-opp-slider"
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
                  Focuses scanner on high-value digital agency targets
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                id="execute-search-btn"
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
                      Targeting {activeSearch.params.category} in {activeSearch.params.city} ({activeSearch.params.country})
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
                    id="view-discovered-leads-btn"
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
                      setCountry(s.params.country);
                      setCity(s.params.city);
                      setCategory(s.params.category);
                      setIsCustomCountry(false);
                      setIsCustomCity(false);
                      setIsCustomCategory(false);
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
