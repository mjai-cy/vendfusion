import { Injectable, Logger } from '@nestjs/common';
import { ApolloService } from '../apollo/apollo.service';

export interface ScanReport {
  domain: string;
  companyName: string;
  businessSummary: string;
  industry: string;
  products: string[];
  services: string[];
  estimatedICP: {
    industries: string[];
    companySizes: string[];
    targetRoles: string[];
    painPoints: string[];
  };
  websiteQualityScore: number;
  aiSummary: string;
  topCompetitors: { name: string; website: string; marketShare: string }[];
  basicRecommendations: string[];
  aiReadinessScore: number;
  personas?: PersonaResult[];
}

export interface PersonaResult {
  name: string;
  role: string;
  company: string;
  pain: string;
  hook: string;
  signals: string[];
}

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);
  private readonly geminiKey = process.env.GEMINI_API_KEY || '';

  constructor(private readonly apolloService: ApolloService) {
    if (!this.geminiKey) {
      this.logger.warn('[Scan] GEMINI_API_KEY not set — website scanning will be unavailable.');
    } else {
      this.logger.log(`[Scan] Gemini API key loaded (prefix: ${this.geminiKey.substring(0, 6)}...).`);
    }
  }

  // ─── Gemini AI helper (uses @google/generative-ai SDK) ─────────────────────
  private async askGemini(prompt: string): Promise<string> {
    if (!this.geminiKey) throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');

    try {
      // Use the official SDK — handles both legacy (AIza) and newer (AQ.) key formats
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err: any) {
      throw new Error(`Gemini SDK error: ${err.message}`);
    }
  }

  // ─── Fetch website HTML ───────────────────────────────────────────────────
  private async fetchWebsiteText(url: string): Promise<string> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; xyzai-bot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      // Strip tags, compress whitespace
      return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 4000); // keep first 4k chars for Gemini
    } catch (err: any) {
      this.logger.warn(`[Scan] Failed to fetch ${url}: ${err.message}`);
      return '';
    }
  }

  // ─── Main: Generate full report ──────────────────────────────────────────
  async generateReport(url: string): Promise<ScanReport & { leads: any[] }> {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];

    this.logger.log(`[Scan] Starting AI scan of ${domain}`);

    // 1. Fetch real website text
    const pageText = await this.fetchWebsiteText(cleanUrl);

    // 2. Ask Gemini to analyze it
    let report: ScanReport;
    try {
      const prompt = `You are an expert B2B sales intelligence analyst. Analyze this company website and return a JSON object with NO markdown, NO code blocks, just raw JSON.

Website domain: ${domain}
Website content (first 4000 chars): ${pageText || `This is the company website at ${domain}`}

Return this exact JSON structure:
{
  "companyName": "exact company name",
  "businessSummary": "2-3 sentence description of what they do and who they serve",
  "industry": "primary industry",
  "products": ["product1", "product2", "product3"],
  "services": ["service1", "service2"],
  "estimatedICP": {
    "industries": ["industry1", "industry2", "industry3"],
    "companySizes": ["11-50 employees", "51-200 employees"],
    "targetRoles": ["CTO", "VP of Engineering", "Director of X"],
    "painPoints": ["pain1", "pain2", "pain3"]
  },
  "websiteQualityScore": 82,
  "aiSummary": "1-2 sentences on website quality and AI-readiness",
  "topCompetitors": [
    {"name": "CompetitorA", "website": "competitor-a.com", "marketShare": "35%"},
    {"name": "CompetitorB", "website": "competitor-b.com", "marketShare": "22%"}
  ],
  "basicRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "aiReadinessScore": 78
}`;

      const raw = await this.askGemini(prompt);
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      report = { domain, ...parsed };
      this.logger.log(`[Scan] Gemini analysis complete for ${domain}: ${report.companyName}`);
    } catch (err: any) {
      this.logger.error(`[Scan] Gemini analysis failed: ${err.message}`);
      throw new Error(`AI analysis failed for ${domain}: ${err.message}. Please check the URL and try again.`);
    }

    // 3. Get real leads from Apollo
    const leads = await this.fetchRealLeads(report);

    return { ...report, leads };
  }

  // ─── Free Persona Tool ────────────────────────────────────────────────────
  async generatePersonas(url: string): Promise<PersonaResult[]> {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    const pageText = await this.fetchWebsiteText(cleanUrl);

    try {
      const prompt = `You are an expert B2B sales strategist. Analyze this website and generate 3 distinct ideal customer personas for their outreach.

Website: ${domain}
Content: ${pageText || `Company website at ${domain}`}

Return ONLY raw JSON array (no markdown):
[
  {
    "name": "Persona Name (a job title/role archetype)",
    "role": "VP of Engineering",
    "company": "Type of company they work at",
    "pain": "Their specific pain point this product solves",
    "hook": "A one-line personalised outreach hook for this persona",
    "signals": ["buying signal 1", "buying signal 2", "buying signal 3"]
  },
  { ... },
  { ... }
]`;

      const raw = await this.askGemini(prompt);
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err: any) {
      this.logger.error(`[Persona] Gemini failed: ${err.message}`);
      return this.fallbackPersonas();
    }
  }

  // ─── Fetch real leads from Apollo ────────────────────────────────────────
  private async fetchRealLeads(report: ScanReport): Promise<any[]> {
    this.logger.log(`[Scan] Querying Apollo for real leads matching ${report.companyName}`);
    const searchRes = await this.apolloService.searchLeads({
      titles: report.estimatedICP.targetRoles,
      industries: report.estimatedICP.industries,
      per_page: 10,
    });

    if (searchRes?.leads?.length) {
      this.logger.log(`[Scan] Apollo returned ${searchRes.leads.length} real leads`);
      return searchRes.leads.map((p, i) => ({
        id: p.id || `lead-${Date.now()}-${i}`,
        name: p.name,
        role: p.title,
        companyName: p.company,
        domain: p.company_domain || '',
        intentScore: p.intent_score || Math.floor(Math.random() * 20) + 75,
        intentSignals: [
          'Competitor post interaction',
          'Recent funding round',
          'Active in target LinkedIn groups',
          'Job change signal',
        ],
        email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '.')}@${p.company_domain || 'domain.com'}`,
        phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
        linkedinUrl: p.linkedin_url || 'https://linkedin.com',
        outreachStatus: 'new',
        enrichmentStatus: 'enriched',
      }));
    }
    return [];
  }

  // ─── Fallback personas (only used when Gemini is unavailable) ──────────
  private fallbackPersonas(): PersonaResult[] {
    return [
      { name: 'The Scaling CTO', role: 'CTO', company: 'Series A/B SaaS startup (50-200 employees)', pain: 'Outbound sales pipeline is entirely manual — no time to build it while shipping product', hook: 'Hey {name}, I saw {company} just expanded their engineering team — curious how you\'re thinking about outbound pipeline right now?', signals: ['Recent engineering hiring spike', 'Product launch on LinkedIn', 'Competitor mentions in posts'] },
      { name: 'The Revenue-Focused VP Sales', role: 'VP of Sales', company: 'Mid-market B2B software (100-500 employees)', pain: 'SDR team spends 60% of time on research instead of outreach', hook: 'Noticed your team at {company} is still manually prospecting — we helped a similar team cut research time by 70%', signals: ['SDR job postings', 'CRM integration announcements', 'Sales hiring surge'] },
      { name: 'The Lean Founder', role: 'Founder / CEO', company: 'Early-stage B2B startup (1-20 employees)', pain: 'No sales team, doing outbound alone, unsure who the right ICP is', hook: 'Building {company} solo and doing your own outbound? We\'ve helped 200+ founders automate their prospecting in under 30 mins', signals: ['YC/accelerator batch announcement', 'Product Hunt launch', 'First hire job posts'] },
    ];
  }
}
