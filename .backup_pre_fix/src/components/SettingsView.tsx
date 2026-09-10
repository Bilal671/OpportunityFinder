import React, { useState, useEffect } from 'react';
import {
  Settings,
  Zap,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import { UsageQuota } from '../types';

export const SettingsView: React.FC = () => {
  const [quota, setQuota] = useState<UsageQuota | null>(null);
  const [config, setConfig] = useState<{
    geminiConfigured: boolean;
    pageSpeedConfigured: boolean;
    googleMapsConfigured: boolean;
    turnstileConfigured: boolean;
    providers: Array<{ id: string; name: string; description: string; isConfigured: boolean }>;
  } | null>(null);

  useEffect(() => {
    fetch('/api/quota')
      .then((res) => res.json())
      .then((data) => setQuota(data.quota))
      .catch(() => {});

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-400" />
          Workspace Quotas & Provider Status
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monitor search quotas, plan allowances, and external provider integration connectivity.
        </p>
      </div>

      {/* Quotas & Usage Card */}
      {quota && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Monthly Plan Quota & Usage</h2>
            </div>
            <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              {quota.plan} PLAN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searches */}
            <div className="space-y-2 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Discovery Searches</span>
                <span className="text-zinc-400">
                  {quota.searchesCount} / {quota.maxSearches}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(quota.searchesCount / quota.maxSearches) * 100}%` }}
                />
              </div>
            </div>

            {/* Audits */}
            <div className="space-y-2 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Deep Audits Performed</span>
                <span className="text-zinc-400">
                  {quota.auditsCount} / {quota.maxAudits}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(quota.auditsCount / quota.maxAudits) * 100}%` }}
                />
              </div>
            </div>

            {/* AI Syntheses */}
            <div className="space-y-2 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Gemini AI Reports</span>
                <span className="text-zinc-400">
                  {quota.aiAnalysesCount} / {quota.maxAiAnalyses}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(quota.aiAnalysesCount / quota.maxAiAnalyses) * 100}%` }}
                />
              </div>
            </div>

            {/* Exports */}
            <div className="space-y-2 p-3.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Safe CSV Exports</span>
                <span className="text-zinc-400">
                  {quota.exportsCount} / {quota.maxExports}
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(quota.exportsCount / quota.maxExports) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Connectivity Status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Database className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Discovery Provider Registry</h2>
        </div>

        <div className="space-y-2.5">
          {config?.providers.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-zinc-200">{p.name}</div>
                <div className="text-[11px] text-zinc-400">{p.description}</div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-medium ${
                  p.isConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {p.isConfigured ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Available
                  </>
                ) : (
                  'Key Needed'
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration & Environment Variables Guide */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <KeyRound className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Environment Configuration Status</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-200">Google Gemini AI SDK (@google/genai)</div>
              <div className="text-[11px] text-zinc-500">Powers prompt-injection safe website opportunity analysis</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${config?.geminiConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {config?.geminiConfigured ? 'Connected' : 'Fallback Engine Active'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-200">Google PageSpeed Insights API</div>
              <div className="text-[11px] text-zinc-500">Official Google mobile performance and Core Web Vitals scoring</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${config?.pageSpeedConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {config?.pageSpeedConfigured ? 'Connected' : 'Crawler Timing Mode'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-200">Google Places API (Web Services)</div>
              <div className="text-[11px] text-zinc-500">Optional discovery provider for global places query</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${config?.googleMapsConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {config?.googleMapsConfigured ? 'Connected' : 'Open Data Mode Active'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-zinc-200">Cloudflare Turnstile CAPTCHA</div>
              <div className="text-[11px] text-zinc-500">Anti-bot security verification (skipped for now; pass-through active)</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
              {config?.turnstileConfigured ? 'Connected' : 'Skipped for now (Bypassed)'}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-[11px] text-zinc-400 leading-relaxed">
          <span className="font-semibold text-zinc-200">Platform Note:</span> All secret keys are configured securely via the AI Studio Settings menu and executed server-side only in <code>server.ts</code>. No client-side browser exposure occurs.
        </div>
      </div>
    </div>
  );
};
