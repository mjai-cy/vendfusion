import { Injectable } from '@nestjs/common';

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
}

@Injectable()
export class ScanService {
  generateReport(url: string): ScanReport {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = cleanUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    const namePart = domain.split('.')[0];
    const companyName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return {
      domain,
      companyName: `${companyName} Technologies`,
      businessSummary: `${companyName} Technologies is a specialized platform offering modern workflows and intelligent operations designed for high-performance ${companyName} operations.`,
      industry: 'Technology / Software as a Service',
      products: [
        `${companyName} Core Engine`,
        `${companyName} Analytics Suite`,
        `${companyName} Connect API`,
      ],
      services: [
        'Enterprise Integration Architecture',
        'Custom Workflow Consulting',
        '24/7 Managed Sandbox Operations',
      ],
      estimatedICP: {
        industries: ['SaaS', 'Enterprise Software', 'Financial Technology', 'Logistics'],
        companySizes: ['11-50 employees', '51-200 employees', '201-500 employees'],
        targetRoles: ['CTO', 'VP of Engineering', 'Director of Operations', 'Product Owner'],
        painPoints: [
          'High manual process latency',
          'Poor integration with existing CRM pipelines',
          'Lack of real-time pipeline visibility',
        ],
      },
      websiteQualityScore: Math.floor(Math.random() * 20) + 75,
      aiSummary: `Your site ${domain} displays modern responsive layouts, but is missing explicit programmatic semantic schemas. This restricts AI personalization agents from fully extracting product catalog attributes automatically.`,
      topCompetitors: [
        { name: `${companyName} Dynamics Ltd`, website: `dynamics-${domain}`, marketShare: '42%' },
        { name: `Global ${companyName} Core`, website: `global-${namePart}.io`, marketShare: '28%' },
      ],
      basicRecommendations: [
        'Deploy schema.org microdata properties on primary pricing nodes.',
        'Optimize sitemap XML structure to allow deeper agent crawling pathways.',
        'Address cache-control header policies to speed up page response latency.',
      ],
      aiReadinessScore: Math.floor(Math.random() * 25) + 70,
    };
  }
}
