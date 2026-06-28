import { Injectable, Logger } from '@nestjs/common';

export interface PageVisit {
  url: string;
  title: string;
  timestamp: string;
}

export interface Visitor {
  id: string;
  domain: string;
  companyName: string;
  companyIndustry: string;
  companySize: string;
  pagesVisited: PageVisit[];
  visitCount: number;
  firstSeen: string;
  lastSeen: string;
  city: string;
  country: string;
  source: string;
  email: string;
  phone: string;
  enriched: boolean;
  score: number;
  status: 'new' | 'identified' | 'contacted' | 'qualified';
}

@Injectable()
export class VisitorsService {
  private readonly logger = new Logger(VisitorsService.name);
  private visitors: Map<string, Visitor> = new Map();

  track(domain: string, pageUrl: string, pageTitle: string, source: string, ip: string): Visitor {
    const existing = this.visitors.get(domain);
    const now = new Date().toISOString();

    if (existing) {
      existing.pagesVisited.push({ url: pageUrl, title: pageTitle, timestamp: now });
      existing.visitCount += 1;
      existing.lastSeen = now;
      existing.score = this.calculateScore(existing);
      this.visitors.set(domain, existing);
      return existing;
    }

    const city = 'Unknown';
    const country = 'Unknown';

    const visitor: Visitor = {
      id: `vis-${Date.now()}`,
      domain,
      companyName: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
      companyIndustry: '',
      companySize: '',
      pagesVisited: [{ url: pageUrl, title: pageTitle, timestamp: now }],
      visitCount: 1,
      firstSeen: now,
      lastSeen: now,
      city,
      country,
      source: source || 'direct',
      email: '',
      phone: '',
      enriched: false,
      score: 10,
      status: 'new',
    };

    this.visitors.set(domain, visitor);
    this.logger.log(`New visitor tracked: ${domain}`);
    return visitor;
  }

  findAll(): Visitor[] {
    return Array.from(this.visitors.values())
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
  }

  findById(id: string): Visitor | undefined {
    return this.visitors.get(id);
  }

  findByDomain(domain: string): Visitor | undefined {
    return Array.from(this.visitors.values()).find(v => v.domain === domain);
  }

  async enrichVisitor(id: string): Promise<Visitor | null> {
    const visitor = this.visitors.get(id);
    if (!visitor) return null;

    try {
      const res = await fetch(`http://localhost:3002/apollo/enrich/organization?domain=${visitor.domain}`);
      if (res.ok) {
        const data = await res.json();
        visitor.companyName = data.name || visitor.companyName;
        visitor.companyIndustry = data.industry || '';
        visitor.companySize = data.company_size || '';
        visitor.city = data.city || visitor.city;
        visitor.country = data.country || visitor.country;
        visitor.enriched = true;
        visitor.score = this.calculateScore(visitor);
        this.visitors.set(id, visitor);
        this.logger.log(`Enriched visitor ${visitor.domain}: ${visitor.companyName}`);
      }
    } catch (err) {
      this.logger.error(`Enrich failed for ${visitor.domain}: ${err.message}`);
    }

    return visitor;
  }

  async enrichAll(): Promise<number> {
    let count = 0;
    for (const [id, visitor] of this.visitors) {
      if (!visitor.enriched) {
        await this.enrichVisitor(id);
        count++;
      }
    }
    return count;
  }

  updateStatus(id: string, status: Visitor['status']): Visitor | null {
    const visitor = this.visitors.get(id);
    if (!visitor) return null;
    visitor.status = status;
    this.visitors.set(id, visitor);
    return visitor;
  }

  getStats() {
    const all = this.findAll();
    return {
      total: all.length,
      new: all.filter(v => v.status === 'new').length,
      identified: all.filter(v => v.status === 'identified').length,
      qualified: all.filter(v => v.status === 'qualified').length,
      avgScore: all.length ? Math.round(all.reduce((s, v) => s + v.score, 0) / all.length) : 0,
    };
  }

  private calculateScore(visitor: Visitor): number {
    let score = 10;
    score += Math.min(visitor.visitCount * 5, 30);
    if (visitor.enriched) score += 20;
    if (visitor.email) score += 15;
    if (visitor.companyIndustry) score += 10;
    if (visitor.companySize.includes('50') || visitor.companySize.includes('100')) score += 10;
    if (visitor.companySize.includes('200') || visitor.companySize.includes('500')) score += 15;
    return Math.min(score, 100);
  }

  delete(id: string): boolean {
    return this.visitors.delete(id);
  }
}
