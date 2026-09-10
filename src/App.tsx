import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SearchView } from './components/SearchView';
import { BusinessTableView } from './components/BusinessTableView';
import { SecuritySuiteView } from './components/SecuritySuiteView';
import { SettingsView } from './components/SettingsView';
import { BusinessDetailModal } from './components/BusinessDetailModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { CsvImportModal } from './components/CsvImportModal';
import {
  Business,
  Audit,
  Lead,
  SearchRecord,
  LeadStatus,
  AIReport,
  Contact,
  EvidenceRecord,
} from './types';

type BusinessWithMeta = Business & {
  audit?: Audit;
  lead?: Lead;
  contactsCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
  hasWhatsApp: boolean;
  hasDecisionMaker: boolean;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [businesses, setBusinesses] = useState<BusinessWithMeta[]>([]);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [activeSearch, setActiveSearch] = useState<SearchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Business for Detailed Dossier
  const [selectedBusinessDetail, setSelectedBusinessDetail] = useState<{
    business: Business;
    audit?: Audit;
    audits?: Audit[];
    aiReport?: AIReport;
    contacts: Contact[];
    evidence: EvidenceRecord[];
    lead?: Lead;
  } | null>(null);

  // Modal open states
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Fetch Businesses
  const fetchBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/businesses');
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    }
  }, []);

  // Fetch Searches
  const fetchSearches = useCallback(async () => {
    try {
      const res = await fetch('/api/searches');
      if (res.ok) {
        const data = await res.json();
        const list: SearchRecord[] = data.searches || [];
        setSearches(list);

        // Check for active processing search
        const active = list.find((s) => s.status === 'PROCESSING');
        if (active) {
          setActiveSearch(active);
        }
      }
    } catch (err) {
      console.error('Failed to load searches:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    Promise.all([fetchBusinesses(), fetchSearches()]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchBusinesses, fetchSearches]);

  // Polling for active search progress
  useEffect(() => {
    if (!activeSearch || activeSearch.status !== 'PROCESSING') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/searches/${activeSearch.id}`);
        if (res.ok) {
          const data = await res.json();
          const updated: SearchRecord = data.search;
          setActiveSearch(updated);

          if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
            fetchBusinesses();
            fetchSearches();
          }
        }
      } catch {
        // Ignore polling error
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeSearch, fetchBusinesses, fetchSearches]);

  // Execute Search
  const handleExecuteSearch = async (params: {
    country: string;
    city: string;
    radiusKm: number;
    category: string;
    keywords?: string;
    minOpportunityScore: number;
    provider: string;
  }): Promise<SearchRecord> => {
    const res = await fetch('/api/searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Failed to start search');
    }

    const data = await res.json();
    const searchRecord: SearchRecord = data.search;
    setActiveSearch(searchRecord);
    fetchSearches();
    return searchRecord;
  };

  // Select a business to view Dossier Modal
  const handleSelectBusiness = async (businessId: string) => {
    try {
      const res = await fetch(`/api/businesses/${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBusinessDetail(data);
      }
    } catch (err) {
      console.error('Failed to load business details:', err);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchBusinesses();
        if (selectedBusinessDetail && selectedBusinessDetail.lead?.id === leadId) {
          setSelectedBusinessDetail({
            ...selectedBusinessDetail,
            lead: { ...selectedBusinessDetail.lead, status },
          });
        }
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  // Update Lead Details (Notes, follow-up date)
  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        fetchBusinesses();
        if (selectedBusinessDetail && selectedBusinessDetail.lead?.id === leadId) {
          setSelectedBusinessDetail({
            ...selectedBusinessDetail,
            lead: { ...selectedBusinessDetail.lead, ...updates },
          });
        }
      }
    } catch (err) {
      console.error('Failed to update lead details:', err);
    }
  };

  // Suppress Business (DO_NOT_CONTACT)
  const handleSuppressBusiness = async (businessId: string) => {
    try {
      await fetch(`/api/businesses/${businessId}/suppress`, { method: 'POST' });
      fetchBusinesses();
      setSelectedBusinessDetail(null);
    } catch (err) {
      console.error('Failed to suppress business:', err);
    }
  };

  // Delete Business
  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await fetch(`/api/businesses/${businessId}`, { method: 'DELETE' });
      fetchBusinesses();
      setSelectedBusinessDetail(null);
    } catch (err) {
      console.error('Failed to delete business:', err);
    }
  };

  // Bulk Lead Status Update
  const handleBulkUpdateStatus = async (businessIds: string[], status: LeadStatus) => {
    try {
      const res = await fetch('/api/leads/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds, status }),
      });
      if (res.ok) {
        await fetchBusinesses();
      }
    } catch (err) {
      console.error('Failed to bulk update status:', err);
    }
  };

  // Bulk Suppress Businesses
  const handleBulkSuppress = async (businessIds: string[]) => {
    try {
      const res = await fetch('/api/businesses/bulk-suppress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds }),
      });
      if (res.ok) {
        await fetchBusinesses();
      }
    } catch (err) {
      console.error('Failed to bulk suppress businesses:', err);
    }
  };

  // Bulk Delete Businesses
  const handleBulkDelete = async (businessIds: string[]) => {
    try {
      const res = await fetch('/api/businesses/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds }),
      });
      if (res.ok) {
        await fetchBusinesses();
      }
    } catch (err) {
      console.error('Failed to bulk delete businesses:', err);
    }
  };

  // Bulk Add Tag
  const handleBulkAddTag = async (businessIds: string[], tag: string) => {
    try {
      const res = await fetch('/api/leads/bulk-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessIds, tag }),
      });
      if (res.ok) {
        await fetchBusinesses();
      }
    } catch (err) {
      console.error('Failed to bulk add tag:', err);
    }
  };

  // Manual Single Business Entry
  const handleManualAddBusiness = async (data: {
    name: string;
    category: string;
    city: string;
    country: string;
    street?: string;
    websiteUrl?: string;
    phone?: string;
  }) => {
    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to save business');
    }

    await fetchBusinesses();
  };

  // CSV Import
  const handleCsvImport = async (csvText: string): Promise<number> => {
    const res = await fetch('/api/import/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'CSV Import failed');
    }

    const data = await res.json();
    await fetchBusinesses();
    return data.importedCount;
  };

  // Export CSV
  const handleExportCsv = () => {
    window.location.href = '/api/export/csv';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewSearch={() => setActiveTab('search')}
        onOpenManualEntry={() => setIsManualEntryOpen(true)}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-xs text-zinc-500">
            Initializing workspace data...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                businesses={businesses}
                onSelectBusiness={handleSelectBusiness}
                onNavigateToSearch={() => setActiveTab('search')}
                onNavigateToLeads={() => setActiveTab('leads')}
              />
            )}

            {activeTab === 'search' && (
              <SearchView
                onExecuteSearch={handleExecuteSearch}
                activeSearch={activeSearch}
                recentSearches={searches}
                onViewResults={() => setActiveTab('leads')}
              />
            )}

            {activeTab === 'leads' && (
              <BusinessTableView
                businesses={businesses}
                onSelectBusiness={handleSelectBusiness}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onBulkUpdateStatus={handleBulkUpdateStatus}
                onBulkSuppress={handleBulkSuppress}
                onBulkDelete={handleBulkDelete}
                onBulkAddTag={handleBulkAddTag}
                onExportCsv={handleExportCsv}
                onOpenNewSearch={() => setActiveTab('search')}
              />
            )}

            {activeTab === 'security' && <SecuritySuiteView />}

            {activeTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950/80 py-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Local Business Opportunity Finder &bull; Production Full-Stack Architecture</span>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>SSRF-Shielded Crawler</span>
            <span>&bull;</span>
            <span>PageSpeed Core Web Vitals</span>
            <span>&bull;</span>
            <span>Gemini 3.8 Intelligence</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedBusinessDetail && (
        <BusinessDetailModal
          business={selectedBusinessDetail.business}
          audit={selectedBusinessDetail.audit}
          audits={selectedBusinessDetail.audits}
          aiReport={selectedBusinessDetail.aiReport}
          contacts={selectedBusinessDetail.contacts}
          evidence={selectedBusinessDetail.evidence}
          lead={selectedBusinessDetail.lead}
          onClose={() => setSelectedBusinessDetail(null)}
          onUpdateLead={handleUpdateLead}
          onSuppressBusiness={handleSuppressBusiness}
          onDeleteBusiness={handleDeleteBusiness}
        />
      )}

      {isManualEntryOpen && (
        <ManualEntryModal
          onClose={() => setIsManualEntryOpen(false)}
          onSubmit={handleManualAddBusiness}
        />
      )}

      {isCsvImportOpen && (
        <CsvImportModal
          onClose={() => setIsCsvImportOpen(false)}
          onImport={handleCsvImport}
        />
      )}
    </div>
  );
}
