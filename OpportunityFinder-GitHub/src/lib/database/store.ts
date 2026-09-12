import {
  User,
  Workspace,
  Business,
  Website,
  Audit,
  Contact,
  EvidenceRecord,
  AIReport,
  Lead,
  LeadStatus,
  SavedSearch,
  UsageQuota,
  SearchRecord,
} from '../../types';

interface DatabaseState {
  users: Map<string, User & { passwordHash: string }>;
  workspaces: Map<string, Workspace>;
  searches: Map<string, SearchRecord>;
  businesses: Map<string, Business>;
  websites: Map<string, Website>;
  audits: Map<string, Audit>;
  contacts: Map<string, Contact>;
  evidence: Map<string, EvidenceRecord>;
  aiReports: Map<string, AIReport>;
  leads: Map<string, Lead>;
  savedSearches: Map<string, SavedSearch>;
  quotas: Map<string, UsageQuota>;
  workspaceSettings: Map<string, Record<string, string>>;
}

// In-memory persistent state across requests
const db: DatabaseState = {
  users: new Map(),
  workspaces: new Map(),
  searches: new Map(),
  businesses: new Map(),
  websites: new Map(),
  audits: new Map(),
  contacts: new Map(),
  evidence: new Map(),
  aiReports: new Map(),
  leads: new Map(),
  savedSearches: new Map(),
  quotas: new Map(),
  workspaceSettings: new Map(),
};

// Initialize demo seed data
function seedInitialData() {
  // Demo user
  const demoUserId = 'usr_demo_001';
  const demoWorkspaceId = 'ws_demo_001';

  db.users.set(demoUserId, {
    id: demoUserId,
    email: 'mohammadbilal671@gmail.com',
    fullName: 'Bilal Mohammad',
    isEmailVerified: true,
    role: 'owner',
    createdAt: new Date().toISOString(),
    passwordHash: 'demo_password_hash_secure',
  });

  db.workspaces.set(demoWorkspaceId, {
    id: demoWorkspaceId,
    name: 'Main Agency Workspace',
    ownerId: demoUserId,
    plan: 'PRO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.quotas.set(demoWorkspaceId, {
    workspaceId: demoWorkspaceId,
    plan: 'PRO',
    periodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    searchesCount: 4,
    maxSearches: 100,
    businessesDiscovered: 42,
    maxBusinesses: 5000,
    auditsCount: 18,
    maxAudits: 500,
    aiAnalysesCount: 12,
    maxAiAnalyses: 250,
    exportsCount: 2,
    maxExports: 50,
  });

  // Seed sample businesses in Frankfurt & Berlin
  const sampleBusinesses = [
    {
      id: 'biz_001',
      name: 'Zahnarztpraxis Dr. Klaus Müller',
      category: 'Dentist',
      subcategory: 'General & Cosmetic Dentistry',
      street: 'Kaiserstraße 42',
      city: 'Frankfurt am Main',
      region: 'Hesse',
      postalCode: '60329',
      country: 'Germany',
      latitude: 50.1085,
      longitude: 8.6658,
      phone: '+49 69 2424900',
      websiteUrl: 'https://zahnarzt-mueller-frankfurt-example.de',
      websiteStatus: 'WEBSITE_FOUND' as const,
      source: 'licensed' as const,
      sourceId: 'lic_de_fra_9821',
      sourceUrl: 'https://opendata.frankfurt.de/registry/businesses',
      confidence: 0.95,
      websiteHealth: 34,
      opportunityScore: 88,
      leadStatus: 'QUALIFIED' as const,
      categories: ['NOT_MOBILE', 'VERY_SLOW', 'OUTDATED_DESIGN', 'HIGH_PRIORITY'] as const,
      audit: {
        performanceScore: 28,
        mobileScore: 32,
        seoScore: 48,
        accessibilityScore: 40,
        bestPracticesScore: 50,
        designScore: 25,
        uxScore: 30,
        conversionScore: 22,
        technologyScore: 30,
        websiteHealthScore: 34,
        opportunityScore: 88,
        metrics: {
          fcp: 4200,
          lcp: 7800,
          cls: 0.38,
          inp: 490,
          viewportMeta: false,
          responsiveLayout: false,
          horizontalOverflow: true,
          textReadabilityScore: 40,
          tapTargetsScore: 30,
          responsiveImagesScore: 20,
          navigationScore: 35,
          metaDescriptionExists: false,
          h1Exists: true,
          sslValid: true,
        },
      },
      contacts: [
        {
          id: 'con_001',
          fullName: 'Dr. Klaus Müller',
          jobTitle: 'Inhaber / Zahnarzt',
          email: 'praxis@zahnarzt-mueller-example.de',
          emailType: 'personal' as const,
          phone: '+49 69 2424900',
          whatsapp: 'https://wa.me/49692424900',
          contactType: 'owner' as const,
          publiclyListed: true,
          verified: true,
          confidence: 0.94,
          sourceUrl: 'https://zahnarzt-mueller-frankfurt-example.de/impressum',
          sourceType: 'business-impressum',
        },
      ],
      evidence: [
        {
          fieldName: 'managing_director',
          fieldValue: 'Dr. Klaus Müller',
          sourceUrl: 'https://zahnarzt-mueller-frankfurt-example.de/impressum',
          sourceType: 'business-website',
          confidence: 0.96,
          snippet: 'Angaben gemäß § 5 TMG: Dr. med. dent. Klaus Müller, Kaiserstraße 42, 60329 Frankfurt am Main',
        },
        {
          fieldName: 'phone',
          fieldValue: '+49 69 2424900',
          sourceUrl: 'https://zahnarzt-mueller-frankfurt-example.de/kontakt',
          sourceType: 'business-website',
          confidence: 0.98,
          snippet: 'Telefonische Sprechstunde: +49 69 2424900',
        },
      ],
      aiReport: {
        visualScore: 25,
        uxScore: 30,
        conversionScore: 22,
        technologyScore: 30,
        summary: 'Outdated fixed-width WordPress 4.2 site built in 2014. Viewport meta tag is missing, causing mobile rendering to display desktop zoom-out. No online appointment booking form exists.',
        executiveSummary: 'High-value private dental practice losing mobile search patients due to severe mobile layout failure, slow LCP (7.8s), and absence of a modern booking CTA.',
        problems: [
          { type: 'Mobile Optimization', severity: 'high' as const, reason: 'Missing viewport meta tag and severe horizontal text overflow on phones.' },
          { type: 'Conversion CTA', severity: 'high' as const, reason: 'No interactive appointment booking or click-to-call mobile button.' },
          { type: 'Page Speed', severity: 'medium' as const, reason: 'Uncompressed raw JPEG gallery totaling 8.4MB on homepage.' },
        ],
        recommendedServices: ['Modern Mobile-First Website Redesign', 'Online Appointment Scheduling Integration', 'Local SEO & Google Business Profile Optimization'],
      },
    },
    {
      id: 'biz_002',
      name: 'MainTaunus Dachdecker Meisterbetrieb',
      category: 'Roofing Contractor',
      subcategory: 'Residential & Commercial Roofing',
      street: 'Hanauer Landstraße 180',
      city: 'Frankfurt am Main',
      region: 'Hesse',
      postalCode: '60314',
      country: 'Germany',
      latitude: 50.113,
      longitude: 8.718,
      phone: '+49 69 8901234',
      websiteUrl: undefined,
      websiteStatus: 'NO_WEBSITE' as const,
      source: 'open_data' as const,
      sourceId: 'osm_node_8492019',
      sourceUrl: 'https://www.openstreetmap.org/node/8492019',
      confidence: 0.92,
      websiteHealth: 0,
      opportunityScore: 96,
      leadStatus: 'NEW' as const,
      categories: ['NO_WEBSITE', 'HIGH_COMMERCIAL_POTENTIAL', 'HIGH_PRIORITY'] as const,
      audit: {
        performanceScore: 0,
        mobileScore: 0,
        seoScore: 0,
        accessibilityScore: 0,
        bestPracticesScore: 0,
        designScore: 0,
        uxScore: 0,
        conversionScore: 0,
        technologyScore: 0,
        websiteHealthScore: 0,
        opportunityScore: 96,
        metrics: {
          viewportMeta: false,
          responsiveLayout: false,
          horizontalOverflow: false,
          textReadabilityScore: 0,
          tapTargetsScore: 0,
          responsiveImagesScore: 0,
          navigationScore: 0,
          metaDescriptionExists: false,
          h1Exists: false,
          sslValid: false,
        },
      },
      contacts: [
        {
          id: 'con_002',
          fullName: 'Stefan Weber',
          jobTitle: 'Dachdeckermeister & Inhaber',
          phone: '+49 69 8901234',
          contactType: 'owner' as const,
          publiclyListed: true,
          verified: false,
          confidence: 0.88,
          sourceUrl: 'https://www.handwerkskammer-frankfurt.de/verzeichnis/8492019',
          sourceType: 'chamber-of-crafts-public-listing',
        },
      ],
      evidence: [
        {
          fieldName: 'master_craftsman_registration',
          fieldValue: 'Stefan Weber - Dachdeckermeister',
          sourceUrl: 'https://www.handwerkskammer-frankfurt.de/verzeichnis/8492019',
          sourceType: 'official-registry',
          confidence: 0.92,
          snippet: 'Eingetragenes Handwerk: Dachdecker. Betriebsinhaber: Stefan Weber',
        },
      ],
      aiReport: {
        visualScore: 0,
        uxScore: 0,
        conversionScore: 0,
        technologyScore: 0,
        summary: 'Established commercial roofing firm with active local trades guild listing but zero online website presence. Completely missing out on digital estimate inquiries.',
        executiveSummary: 'Premier opportunity: Established local trades business with high average project tickets (€15,000 - €40,000) that currently has NO website. Ideal candidate for turnkey website launch and local search marketing.',
        problems: [
          { type: 'No Website Presence', severity: 'high' as const, reason: 'Business has no official website domain or landing page.' },
          { type: 'Lost Commercial Search Volume', severity: 'high' as const, reason: 'Competitors dominate all Google search inquiries for emergency roof repair in Frankfurt.' },
        ],
        recommendedServices: ['Turnkey 5-Page Trades Website', 'Emergency Call-Out Booking System', 'Local Google Maps & Search Package'],
      },
    },
    {
      id: 'biz_003',
      name: 'Boutique Hotel am Palmengarten',
      category: 'Hospitality',
      subcategory: 'Boutique Hotel & Suites',
      street: 'Miquelallee 14',
      city: 'Frankfurt am Main',
      region: 'Hesse',
      postalCode: '60325',
      country: 'Germany',
      latitude: 50.1245,
      longitude: 8.662,
      phone: '+49 69 9720800',
      websiteUrl: 'https://hotel-palmengarten-example.de',
      websiteStatus: 'WEBSITE_FOUND' as const,
      source: 'licensed' as const,
      sourceId: 'lic_fra_hotel_331',
      sourceUrl: 'https://frankfurt-tourismus.de/partner/hotel-palmengarten',
      confidence: 0.91,
      websiteHealth: 48,
      opportunityScore: 78,
      leadStatus: 'REVIEWING' as const,
      categories: ['VERY_SLOW', 'POOR_CONVERSION', 'HIGH_COMMERCIAL_POTENTIAL'] as const,
      audit: {
        performanceScore: 36,
        mobileScore: 58,
        seoScore: 62,
        accessibilityScore: 52,
        bestPracticesScore: 60,
        designScore: 45,
        uxScore: 40,
        conversionScore: 35,
        technologyScore: 45,
        websiteHealthScore: 48,
        opportunityScore: 78,
        metrics: {
          fcp: 3400,
          lcp: 6200,
          cls: 0.28,
          inp: 380,
          viewportMeta: true,
          responsiveLayout: true,
          horizontalOverflow: false,
          textReadabilityScore: 70,
          tapTargetsScore: 65,
          responsiveImagesScore: 30,
          navigationScore: 50,
          metaDescriptionExists: true,
          h1Exists: true,
          sslValid: true,
        },
      },
      contacts: [
        {
          id: 'con_003',
          fullName: 'Elena Becker',
          jobTitle: 'Hotel Managerin',
          email: 'rezeption@hotel-palmengarten-example.de',
          emailType: 'generic' as const,
          phone: '+49 69 9720800',
          contactType: 'manager' as const,
          publiclyListed: true,
          verified: true,
          confidence: 0.9,
          sourceUrl: 'https://hotel-palmengarten-example.de/impressum',
          sourceType: 'business-impressum',
        },
      ],
      evidence: [
        {
          fieldName: 'hotel_management',
          fieldValue: 'Elena Becker',
          sourceUrl: 'https://hotel-palmengarten-example.de/impressum',
          sourceType: 'business-website',
          confidence: 0.95,
          snippet: 'Geschäftsführung: Elena Becker. Handelsregister Frankfurt HRB 99120',
        },
      ],
      aiReport: {
        visualScore: 45,
        uxScore: 40,
        conversionScore: 35,
        technologyScore: 45,
        summary: 'Charming 28-room boutique hotel paying heavy 18-22% commissions to Booking.com because their direct booking engine is slow, clunky, and fails on mobile checkouts.',
        executiveSummary: 'Substantial commercial potential. Upgrading the direct reservation engine and room showcase page can save thousands in OTA commissions monthly.',
        problems: [
          { type: 'Booking Conversion Friction', severity: 'high' as const, reason: 'External booking widget takes 4 seconds to load and redirects users away.' },
          { type: 'Page Speed Slowdowns', severity: 'medium' as const, reason: 'High-resolution room photography uncompressed, dragging LCP to 6.2s.' },
        ],
        recommendedServices: ['Direct Booking Engine Integration', 'Luxury Visual Redesign', 'Speed & Image CDN Optimization'],
      },
    },
    {
      id: 'biz_004',
      name: 'Sanitär & Heizungstechnik Frank & Sohn',
      category: 'Plumbing & HVAC',
      subcategory: 'Heating, Bath & Emergency Plumbing',
      street: 'Mainzer Landstraße 310',
      city: 'Frankfurt am Main',
      region: 'Hesse',
      postalCode: '60326',
      country: 'Germany',
      latitude: 50.104,
      longitude: 8.641,
      phone: '+49 69 739011',
      websiteUrl: 'https://sanitaer-frank-frankfurt-example.de',
      websiteStatus: 'WEBSITE_DOWN' as const,
      source: 'licensed' as const,
      sourceId: 'lic_fra_shk_491',
      sourceUrl: 'https://opendata.frankfurt.de/registry/businesses',
      confidence: 0.93,
      websiteHealth: 15,
      opportunityScore: 92,
      leadStatus: 'CONTACTED' as const,
      categories: ['WEBSITE_DOWN', 'HIGH_COMMERCIAL_POTENTIAL', 'HIGH_PRIORITY'] as const,
      audit: {
        performanceScore: 10,
        mobileScore: 10,
        seoScore: 20,
        accessibilityScore: 10,
        bestPracticesScore: 15,
        designScore: 15,
        uxScore: 10,
        conversionScore: 10,
        technologyScore: 15,
        websiteHealthScore: 15,
        opportunityScore: 92,
        metrics: {
          viewportMeta: false,
          responsiveLayout: false,
          horizontalOverflow: false,
          textReadabilityScore: 0,
          tapTargetsScore: 0,
          responsiveImagesScore: 0,
          navigationScore: 0,
          metaDescriptionExists: false,
          h1Exists: false,
          sslValid: false,
        },
      },
      contacts: [
        {
          id: 'con_004',
          fullName: 'Markus Frank',
          jobTitle: 'Geschäftsführer',
          phone: '+49 69 739011',
          whatsapp: 'https://wa.me/4969739011',
          contactType: 'director' as const,
          publiclyListed: true,
          verified: true,
          confidence: 0.92,
          sourceUrl: 'https://handwerkskammer-rhein-main.de/mitglieder/shk-frank',
          sourceType: 'trade-registry',
        },
      ],
      evidence: [
        {
          fieldName: 'domain_status',
          fieldValue: 'HTTP 502 Bad Gateway / Server Down',
          sourceUrl: 'https://sanitaer-frank-frankfurt-example.de',
          sourceType: 'http-probe',
          confidence: 0.99,
          snippet: 'DNS resolves to hoster but server returns 502 Bad Gateway. Expired SSL certificate.',
        },
      ],
      aiReport: {
        visualScore: 15,
        uxScore: 10,
        conversionScore: 10,
        technologyScore: 15,
        summary: 'Emergency plumbing company whose website currently returns 502 Bad Gateway. Business is active and answering phones, but completely unreachable online.',
        executiveSummary: 'Urgent prospect. Their website is offline and SSL certificate is expired. The owners may not even realize they are losing emergency heating customers daily.',
        problems: [
          { type: 'Website Offline', severity: 'high' as const, reason: 'Site currently offline with server connection failure.' },
          { type: 'Expired Security Certificate', severity: 'high' as const, reason: 'SSL certificate expired 42 days ago.' },
        ],
        recommendedServices: ['Emergency Website Restoration & Hosting Migration', '24/7 Emergency Call Dispatch UI', 'Modern Secure SSL & Speed Setup'],
      },
    },
    {
      id: 'biz_005',
      name: 'Rechtsanwälte & Notare Dr. Stern & Partner',
      category: 'Legal Services',
      subcategory: 'Corporate Law & Notary',
      street: 'Bockenheimer Anlage 15',
      city: 'Frankfurt am Main',
      region: 'Hesse',
      postalCode: '60322',
      country: 'Germany',
      latitude: 50.118,
      longitude: 8.673,
      phone: '+49 69 153090',
      websiteUrl: 'https://kanzlei-stern-frankfurt-example.de',
      websiteStatus: 'WEBSITE_FOUND' as const,
      source: 'licensed' as const,
      sourceId: 'lic_fra_law_102',
      sourceUrl: 'https://rechtsanwaltskammer-frankfurt.de/verzeichnis',
      confidence: 0.97,
      websiteHealth: 55,
      opportunityScore: 72,
      leadStatus: 'REVIEWING' as const,
      categories: ['POOR_SEO', 'OUTDATED_DESIGN', 'HIGH_COMMERCIAL_POTENTIAL'] as const,
      audit: {
        performanceScore: 50,
        mobileScore: 65,
        seoScore: 42,
        accessibilityScore: 60,
        bestPracticesScore: 65,
        designScore: 55,
        uxScore: 50,
        conversionScore: 45,
        technologyScore: 50,
        websiteHealthScore: 55,
        opportunityScore: 72,
        metrics: {
          fcp: 2400,
          lcp: 4800,
          cls: 0.15,
          inp: 210,
          viewportMeta: true,
          responsiveLayout: true,
          horizontalOverflow: false,
          textReadabilityScore: 80,
          tapTargetsScore: 70,
          responsiveImagesScore: 50,
          navigationScore: 60,
          metaDescriptionExists: false,
          h1Exists: true,
          sslValid: true,
        },
      },
      contacts: [
        {
          id: 'con_005',
          fullName: 'Dr. Friedrich Stern',
          jobTitle: 'Senior Partner / Notar',
          email: 'kontakt@kanzlei-stern-example.de',
          emailType: 'generic' as const,
          phone: '+49 69 153090',
          contactType: 'director' as const,
          publiclyListed: true,
          verified: true,
          confidence: 0.95,
          sourceUrl: 'https://kanzlei-stern-frankfurt-example.de/impressum',
          sourceType: 'law-firm-impressum',
        },
      ],
      evidence: [
        {
          fieldName: 'notary_registration',
          fieldValue: 'Dr. Friedrich Stern',
          sourceUrl: 'https://kanzlei-stern-frankfurt-example.de/impressum',
          sourceType: 'business-website',
          confidence: 0.98,
          snippet: 'Zuständige Notarkammer: Notarkammer Frankfurt am Main. Anschrift: Bockenheimer Anlage 15',
        },
      ],
      aiReport: {
        visualScore: 55,
        uxScore: 50,
        conversionScore: 45,
        technologyScore: 50,
        summary: 'High-end commercial law firm with a conservative, static website. Weak SEO metadata and absent digital intake for corporate consultations.',
        executiveSummary: 'High billing rate legal practice. Missing search rankings for lucrative corporate notary and M&A keywords due to technical SEO deficits.',
        problems: [
          { type: 'Missing SEO Meta Tags', severity: 'medium' as const, reason: 'All practice area sub-pages share the identical generic title tag.' },
          { type: 'No Secure Client Intake', severity: 'low' as const, reason: 'Uses unencrypted mailto links rather than secure intake forms.' },
        ],
        recommendedServices: ['High-End Executive Web Design', 'Technical SEO Architecture', 'Encrypted Client Onboarding Portal'],
      },
    },
  ];

  sampleBusinesses.forEach((b) => {
    const business: Business = {
      id: b.id,
      workspaceId: demoWorkspaceId,
      name: b.name,
      category: b.category,
      subcategory: b.subcategory,
      street: b.street,
      city: b.city,
      region: b.region,
      postalCode: b.postalCode,
      country: b.country,
      latitude: b.latitude,
      longitude: b.longitude,
      phone: b.phone,
      websiteUrl: b.websiteUrl,
      websiteStatus: b.websiteStatus,
      source: b.source,
      sourceId: b.sourceId,
      sourceUrl: b.sourceUrl,
      confidence: b.confidence,
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.businesses.set(business.id, business);

    // Website record
    if (b.websiteUrl) {
      const siteId = `web_${b.id}`;
      db.websites.set(siteId, {
        id: siteId,
        businessId: b.id,
        url: b.websiteUrl,
        domain: new URL(b.websiteUrl).hostname,
        httpsEnabled: b.websiteUrl.startsWith('https:'),
        redirectCount: 0,
        robotsStatus: 'allowed',
        sitemapExists: true,
        websiteStatus: b.websiteStatus,
        firstSeenAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        technologies: ['WordPress', 'Apache'],
      });
    }

    // Historical Audit checkpoints for trend analytics
    const pastDate1 = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const pastDate2 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const curDate = new Date().toISOString();

    const histAudit1: Audit = {
      id: `aud_${b.id}_h1`,
      businessId: b.id,
      status: 'COMPLETED',
      ...b.audit,
      opportunityScore: Math.max(15, Math.min(95, b.audit.opportunityScore - 7)),
      mobileScore: Math.max(10, Math.min(95, b.audit.mobileScore + 5)),
      createdAt: pastDate1,
      completedAt: pastDate1,
    };
    db.audits.set(histAudit1.id, histAudit1);

    const histAudit2: Audit = {
      id: `aud_${b.id}_h2`,
      businessId: b.id,
      status: 'COMPLETED',
      ...b.audit,
      opportunityScore: Math.max(15, Math.min(95, b.audit.opportunityScore - 3)),
      mobileScore: Math.max(10, Math.min(95, b.audit.mobileScore + 2)),
      createdAt: pastDate2,
      completedAt: pastDate2,
    };
    db.audits.set(histAudit2.id, histAudit2);

    // Audit record (latest)
    const auditId = `aud_${b.id}`;
    const audit: Audit = {
      id: auditId,
      businessId: b.id,
      status: 'COMPLETED',
      ...b.audit,
      createdAt: curDate,
      completedAt: curDate,
    };
    db.audits.set(auditId, audit);

    // AI Report
    const aiId = `ai_${b.id}`;
    const aiReport: AIReport = {
      id: aiId,
      businessId: b.id,
      auditId,
      ...b.aiReport,
      confidence: 0.94,
      model: 'gemini-3.8-flash',
      generatedAt: new Date().toISOString(),
    };
    db.aiReports.set(aiId, aiReport);

    // Lead record
    const leadId = `lead_${b.id}`;
    const lead: Lead = {
      id: leadId,
      workspaceId: demoWorkspaceId,
      businessId: b.id,
      status: b.leadStatus,
      notes: `Identified via discovery scan for Frankfurt ${b.category}. High potential for agency web & SEO outreach.`,
      tags: [b.category.toLowerCase(), b.city.toLowerCase(), 'priority'],
      categories: [...b.categories],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.leads.set(leadId, lead);

    // Contacts & Evidence
    b.contacts.forEach((c) => {
      const contact: Contact = {
        ...c,
        businessId: b.id,
        collectedAt: new Date().toISOString(),
      };
      db.contacts.set(contact.id, contact);
    });

    b.evidence.forEach((e, idx) => {
      const ev: EvidenceRecord = {
        id: `ev_${b.id}_${idx}`,
        businessId: b.id,
        ...e,
        collectedAt: new Date().toISOString(),
        contentHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      };
      db.evidence.set(ev.id, ev);
    });
  });
}

// Seed upon module load
seedInitialData();

/**
 * Storage Layer with RLS and Workspace isolation.
 */
export const store = {
  // Users & Auth
  getUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === normalized) return u;
    }
    return null;
  },

  getUserById(id: string) {
    return db.users.get(id) || null;
  },

  createUser(user: User & { passwordHash: string }) {
    db.users.set(user.id, user);
    return user;
  },

  // Workspaces (RLS: User must be owner or member)
  getWorkspaceById(id: string, userId: string) {
    const ws = db.workspaces.get(id);
    if (!ws) return null;
    // RLS check
    if (ws.ownerId !== userId) {
      return null;
    }
    return ws;
  },

  getUserWorkspaces(userId: string) {
    const list: Workspace[] = [];
    for (const ws of db.workspaces.values()) {
      if (ws.ownerId === userId) {
        list.push(ws);
      }
    }
    return list;
  },

  createWorkspace(ws: Workspace) {
    db.workspaces.set(ws.id, ws);
    return ws;
  },

  // Quotas
  getQuota(workspaceId: string): UsageQuota {
    let quota = db.quotas.get(workspaceId);
    if (!quota) {
      quota = {
        workspaceId,
        plan: 'FREE',
        periodStart: new Date().toISOString(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        searchesCount: 0,
        maxSearches: 10,
        businessesDiscovered: 0,
        maxBusinesses: 50,
        auditsCount: 0,
        maxAudits: 5,
        aiAnalysesCount: 0,
        maxAiAnalyses: 5,
        exportsCount: 0,
        maxExports: 3,
      };
      db.quotas.set(workspaceId, quota);
    }
    return quota;
  },

  updateQuota(workspaceId: string, updates: Partial<UsageQuota>) {
    const current = this.getQuota(workspaceId);
    const updated = { ...current, ...updates };
    db.quotas.set(workspaceId, updated);
    return updated;
  },

  // Searches
  createSearch(search: SearchRecord) {
    db.searches.set(search.id, search);
    return search;
  },

  getSearch(id: string, workspaceId: string) {
    const search = db.searches.get(id);
    if (!search || search.workspaceId !== workspaceId) return null;
    return search;
  },

  updateSearch(id: string, updates: Partial<SearchRecord>) {
    const search = db.searches.get(id);
    if (!search) return null;
    const updated = { ...search, ...updates };
    db.searches.set(id, updated);
    return updated;
  },

  getWorkspaceSearches(workspaceId: string) {
    const list: SearchRecord[] = [];
    for (const s of db.searches.values()) {
      if (s.workspaceId === workspaceId) {
        list.push(s);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Businesses (RLS: Workspace scoped)
  getBusinesses(workspaceId: string) {
    const list: Business[] = [];
    for (const b of db.businesses.values()) {
      if (b.workspaceId === workspaceId && !b.isSuppressed) {
        list.push(b);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getBusinessById(id: string, workspaceId: string) {
    const b = db.businesses.get(id);
    if (!b || b.workspaceId !== workspaceId) return null;
    return b;
  },

  saveBusiness(business: Business) {
    db.businesses.set(business.id, business);
    return business;
  },

  suppressBusiness(id: string, workspaceId: string) {
    const b = this.getBusinessById(id, workspaceId);
    if (!b) return false;
    b.isSuppressed = true;
    b.updatedAt = new Date().toISOString();
    return true;
  },

  deleteBusiness(id: string, workspaceId: string) {
    const b = this.getBusinessById(id, workspaceId);
    if (!b) return false;
    db.businesses.delete(id);
    return true;
  },

  // Audits & Reports
  getLatestAuditForBusiness(businessId: string) {
    let latest: Audit | null = null;
    for (const a of db.audits.values()) {
      if (a.businessId === businessId) {
        if (!latest || new Date(a.createdAt).getTime() > new Date(latest.createdAt).getTime()) {
          latest = a;
        }
      }
    }
    return latest;
  },

  getAuditsForBusiness(businessId: string): Audit[] {
    const list: Audit[] = [];
    for (const a of db.audits.values()) {
      if (a.businessId === businessId) {
        list.push(a);
      }
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  saveAudit(audit: Audit) {
    db.audits.set(audit.id, audit);
    return audit;
  },

  getLatestAIReportForBusiness(businessId: string) {
    for (const r of db.aiReports.values()) {
      if (r.businessId === businessId) return r;
    }
    return null;
  },

  saveAIReport(report: AIReport) {
    db.aiReports.set(report.id, report);
    return report;
  },

  // Contacts & Evidence
  getContactsForBusiness(businessId: string) {
    const list: Contact[] = [];
    for (const c of db.contacts.values()) {
      if (c.businessId === businessId && !c.isSuppressed) {
        list.push(c);
      }
    }
    return list;
  },

  saveContact(contact: Contact) {
    db.contacts.set(contact.id, contact);
    return contact;
  },

  getEvidenceForBusiness(businessId: string) {
    const list: EvidenceRecord[] = [];
    for (const e of db.evidence.values()) {
      if (e.businessId === businessId) {
        list.push(e);
      }
    }
    return list;
  },

  saveEvidence(evidence: EvidenceRecord) {
    db.evidence.set(evidence.id, evidence);
    return evidence;
  },

  // Leads
  getLeadForBusiness(businessId: string, workspaceId: string) {
    for (const l of db.leads.values()) {
      if (l.businessId === businessId && l.workspaceId === workspaceId) {
        return l;
      }
    }
    return null;
  },

  saveLead(lead: Lead) {
    db.leads.set(lead.id, lead);
    return lead;
  },

  updateLead(id: string, workspaceId: string, updates: Partial<Lead>) {
    const lead = db.leads.get(id);
    if (!lead || lead.workspaceId !== workspaceId) return null;
    const updated = { ...lead, ...updates, updatedAt: new Date().toISOString() };
    db.leads.set(id, updated);
    return updated;
  },

  bulkUpdateLeadStatus(businessIds: string[], workspaceId: string, status: LeadStatus) {
    const updatedList: Lead[] = [];
    for (const businessId of businessIds) {
      const b = this.getBusinessById(businessId, workspaceId);
      if (!b) continue;

      let lead = this.getLeadForBusiness(businessId, workspaceId);
      if (lead) {
        lead.status = status;
        lead.updatedAt = new Date().toISOString();
        db.leads.set(lead.id, lead);
        updatedList.push(lead);
      } else {
        const newLead: Lead = {
          id: `lead_${businessId}`,
          workspaceId,
          businessId,
          status,
          notes: '',
          tags: [],
          categories: [b.category],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.leads.set(newLead.id, newLead);
        updatedList.push(newLead);
      }
    }
    return updatedList;
  },

  bulkAddTagToLeads(businessIds: string[], workspaceId: string, tag: string) {
    const cleanTag = tag.trim().toLowerCase();
    if (!cleanTag) return [];
    const updatedList: Lead[] = [];
    for (const businessId of businessIds) {
      let lead = this.getLeadForBusiness(businessId, workspaceId);
      if (lead) {
        if (!lead.tags.includes(cleanTag)) {
          lead.tags = [...lead.tags, cleanTag];
          lead.updatedAt = new Date().toISOString();
          db.leads.set(lead.id, lead);
        }
        updatedList.push(lead);
      } else {
        const newLead: Lead = {
          id: `lead_${businessId}`,
          workspaceId,
          businessId,
          status: 'NEW',
          notes: '',
          tags: [cleanTag],
          categories: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.leads.set(newLead.id, newLead);
        updatedList.push(newLead);
      }
    }
    return updatedList;
  },

  bulkDeleteBusinesses(businessIds: string[], workspaceId: string) {
    let count = 0;
    for (const id of businessIds) {
      if (this.deleteBusiness(id, workspaceId)) {
        count++;
      }
    }
    return count;
  },

  bulkSuppressBusinesses(businessIds: string[], workspaceId: string) {
    let count = 0;
    for (const id of businessIds) {
      if (this.suppressBusiness(id, workspaceId)) {
        count++;
      }
    }
    return count;
  },

  // Saved searches
  getSavedSearches(workspaceId: string) {
    const list: SavedSearch[] = [];
    for (const s of db.savedSearches.values()) {
      if (s.workspaceId === workspaceId) {
        list.push(s);
      }
    }
    return list;
  },

  createSavedSearch(s: SavedSearch) {
    db.savedSearches.set(s.id, s);
    return s;
  },

  deleteSavedSearch(id: string, workspaceId: string) {
    const s = db.savedSearches.get(id);
    if (!s || s.workspaceId !== workspaceId) return false;
    db.savedSearches.delete(id);
    return true;
  },

  // Workspace Settings / In-app API Tokens
  getWorkspaceSetting(workspaceId: string, key: string): string | undefined {
    const settings = db.workspaceSettings.get(workspaceId);
    return settings ? settings[key] : undefined;
  },

  setWorkspaceSetting(workspaceId: string, key: string, value: string): void {
    const existing = db.workspaceSettings.get(workspaceId) || {};
    existing[key] = value;
    db.workspaceSettings.set(workspaceId, existing);
  },
};
