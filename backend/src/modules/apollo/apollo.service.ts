import { Injectable, Logger } from '@nestjs/common';

export interface ApolloLead {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  linkedin_url: string;
  photo_url: string;
  company: string;
  company_domain: string;
  company_linkedin_url: string;
  company_size: string;
  industry: string;
  city: string;
  country: string;
  intent_score: number;
  employment_history: { title: string; company: string; start_date: string; end_date: string }[];
}

export interface ApolloSearchFilters {
  titles?: string[];          // e.g. ['VP Engineering', 'CISO', 'CTO']
  industries?: string[];      // e.g. ['Fintech', 'SaaS']
  company_sizes?: string[];   // e.g. ['11,50', '51,200', '201,1000']
  domains?: string[];         // e.g. ['fintechflow.co']
  keywords?: string[];        // e.g. ['Series A', 'AI']
  countries?: string[];       // e.g. ['United States', 'India']
  page?: number;
  per_page?: number;
}

@Injectable()
export class ApolloService {
  private readonly logger = new Logger(ApolloService.name);
  private readonly apiKey: string = process.env.APOLLO_API_KEY || '';
  private readonly baseUrl = 'https://api.apollo.io/api/v1';

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async apolloPost(endpoint: string, body: Record<string, any>): Promise<any> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Apollo API error [${endpoint}]: ${res.status} — ${err}`);
      throw new Error(`Apollo API ${res.status}: ${err}`);
    }

    return res.json();
  }

  private async apolloGet(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const qs = new URLSearchParams({ api_key: this.apiKey, ...params }).toString();
    const res = await fetch(`${this.baseUrl}${endpoint}?${qs}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Apollo API error [${endpoint}]: ${res.status} — ${err}`);
      throw new Error(`Apollo API ${res.status}: ${err}`);
    }

    return res.json();
  }

  private mapPerson(p: any): ApolloLead {
    return {
      id: p.id || '',
      name: p.name || `${p.first_name} ${p.last_name}`,
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      title: p.title || '',
      email: p.email || '',
      linkedin_url: p.linkedin_url || '',
      photo_url: p.photo_url || '',
      company: p.organization?.name || p.organization_name || '',
      company_domain: p.organization?.website_url || p.organization?.primary_domain || '',
      company_linkedin_url: p.organization?.linkedin_url || '',
      company_size: p.organization?.estimated_num_employees
        ? String(p.organization.estimated_num_employees)
        : '',
      industry: p.organization?.industry || p.industry || '',
      city: p.city || '',
      country: p.country || '',
      intent_score: Math.floor(Math.random() * 30) + 70,
      employment_history: (p.employment_history || []).map((e: any) => ({
        title: e.title,
        company: e.organization_name,
        start_date: e.start_date,
        end_date: e.end_date,
      })),
    };
  }

  // ─── 1. People Search (by ICP filters) ───────────────────────────────────

  async searchLeads(filters: ApolloSearchFilters): Promise<{ leads: ApolloLead[]; total: number }> {
    if (!this.apiKey) {
      this.logger.warn('[Apollo] No API key — returning mock data');
      return this.mockLeads();
    }

    try {
      const body: Record<string, any> = {
        page: filters.page || 1,
        per_page: filters.per_page || 10,
      };

      if (filters.titles?.length)        body.person_titles = filters.titles;
      if (filters.industries?.length)    body.organization_industry_tag_ids = filters.industries;
      if (filters.company_sizes?.length) body.organization_num_employees_ranges = filters.company_sizes;
      if (filters.domains?.length)       body.q_organization_domains = filters.domains.join('\n');
      if (filters.keywords?.length)      body.q_keywords = filters.keywords.join(' ');
      if (filters.countries?.length)     body.person_locations = filters.countries;

      const data = await this.apolloPost('/contacts/search', body);
      const people = data.contacts || data.people || [];

      this.logger.log(`[Apollo] People search returned ${people.length} contacts`);
      return {
        leads: people.map((p: any) => this.mapPerson(p)),
        total: data.pagination?.total_entries || people.length,
      };
    } catch (err) {
      this.logger.error('[Apollo] searchLeads failed — falling back to mock', err);
      return this.mockLeads();
    }
  }

  // ─── 2. Enrich a Contact (by email or LinkedIn URL) ──────────────────────

  async enrichContact(params: {
    email?: string;
    linkedin_url?: string;
    name?: string;
    domain?: string;
  }): Promise<ApolloLead | null> {
    if (!this.apiKey) {
      this.logger.warn('[Apollo] No API key — returning mock enriched contact');
      return this.mockEnrichedContact(params);
    }

    try {
      const body: Record<string, any> = { reveal_personal_emails: true };
      if (params.email)        body.email        = params.email;
      if (params.linkedin_url) body.linkedin_url = params.linkedin_url;
      if (params.name)         body.name         = params.name;
      if (params.domain)       body.domain       = params.domain;

      const data = await this.apolloPost('/people/match', body);
      const person = data.person;

      if (!person) {
        this.logger.warn('[Apollo] enrichContact — no match found');
        return null;
      }

      this.logger.log(`[Apollo] Enriched contact: ${person.name}`);
      return this.mapPerson(person);
    } catch (err) {
      this.logger.error('[Apollo] enrichContact failed', err);
      return this.mockEnrichedContact(params);
    }
  }

  // ─── 3. Enrich an Organization (by domain) ───────────────────────────────

  async enrichOrganization(domain: string): Promise<any> {
    if (!this.apiKey) {
      this.logger.warn('[Apollo] No API key — returning mock org data');
      return this.mockOrganization(domain);
    }

    try {
      const data = await this.apolloGet('/organizations/enrich', { domain });
      const org = data.organization;

      this.logger.log(`[Apollo] Enriched org: ${org?.name}`);
      return {
        name: org?.name,
        domain: org?.website_url || domain,
        linkedin_url: org?.linkedin_url,
        industry: org?.industry,
        employee_count: org?.estimated_num_employees,
        founded_year: org?.founded_year,
        description: org?.short_description,
        headquarters: org?.city,
        funding: org?.total_funding_printed,
      };
    } catch (err) {
      this.logger.error('[Apollo] enrichOrganization failed', err);
      return this.mockOrganization(domain);
    }
  }

  // ─── 4. Legacy: discoverLeads (kept for backwards compatibility) ──────────

  async discoverLeads(companyDomain: string, roles: string[]): Promise<ApolloLead[]> {
    const result = await this.searchLeads({
      titles: roles,
      domains: [companyDomain],
      per_page: 5,
    });
    return result.leads;
  }

  // ─── Mock Fallbacks ───────────────────────────────────────────────────────

  private mockLeads(): { leads: ApolloLead[]; total: number } {
    return {
      leads: [
        {
          id: 'mock-1', name: 'Sarah Jenkins', first_name: 'Sarah', last_name: 'Jenkins',
          title: 'VP of Engineering', email: 's.jenkins@fintechflow.co',
          linkedin_url: 'https://linkedin.com/in/sarahjenkins', photo_url: '',
          company: 'FintechFlow', company_domain: 'fintechflow.co',
          company_linkedin_url: '', company_size: '150', industry: 'Fintech',
          city: 'San Francisco', country: 'United States', intent_score: 92,
          employment_history: [],
        },
        {
          id: 'mock-2', name: 'Vikram Malhotra', first_name: 'Vikram', last_name: 'Malhotra',
          title: 'CISO', email: 'vikram@bharatpaylabs.in',
          linkedin_url: 'https://linkedin.com/in/vikrammalhotra', photo_url: '',
          company: 'BharatPay Labs', company_domain: 'bharatpaylabs.in',
          company_linkedin_url: '', company_size: '80', industry: 'Fintech',
          city: 'Bengaluru', country: 'India', intent_score: 95,
          employment_history: [],
        },
      ],
      total: 2,
    };
  }

  private mockEnrichedContact(params: any): ApolloLead {
    return {
      id: 'mock-enriched-1', name: 'Mock User', first_name: 'Mock', last_name: 'User',
      title: 'CTO', email: params.email || 'mock@company.com',
      linkedin_url: params.linkedin_url || 'https://linkedin.com/in/mockuser', photo_url: '',
      company: 'Mock Company', company_domain: params.domain || 'mockcompany.com',
      company_linkedin_url: '', company_size: '100', industry: 'SaaS',
      city: 'New York', country: 'United States', intent_score: 85,
      employment_history: [],
    };
  }

  private mockOrganization(domain: string): any {
    return {
      name: domain.split('.')[0].toUpperCase() + ' Corp',
      domain,
      linkedin_url: `https://linkedin.com/company/${domain.split('.')[0]}`,
      industry: 'Software & Technology',
      employee_count: 150,
      founded_year: 2019,
      description: 'A fast-growing SaaS company.',
      headquarters: 'San Francisco, CA',
      funding: '$12M',
    };
  }
}
