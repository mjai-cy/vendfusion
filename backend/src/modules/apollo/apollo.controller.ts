import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApolloService, ApolloSearchFilters } from './apollo.service';
import { AiPermissionsGuard } from '../security/ai-permissions.guard';

@Controller('apollo')
@UseGuards(AiPermissionsGuard)
export class ApolloController {
  constructor(private readonly apolloService: ApolloService) {}

  /**
   * GET /apollo/discover
   * Legacy endpoint — search leads by domain and role titles
   */
  @Get('discover')
  async discover(
    @Query('domain') domain: string,
    @Query('roles') rolesStr: string,
  ) {
    const roles = rolesStr ? rolesStr.split(',') : ['CISO', 'VP Engineering'];
    return this.apolloService.discoverLeads(domain, roles);
  }

  /**
   * POST /apollo/leads/search
   * Search for leads using ICP filters
   * Body: { titles, industries, company_sizes, domains, keywords, countries, page, per_page }
   */
  @Post('leads/search')
  async searchLeads(@Body() filters: ApolloSearchFilters) {
    return this.apolloService.searchLeads(filters);
  }

  /**
   * POST /apollo/enrich/contact
   * Enrich a contact by email, LinkedIn URL, or name+domain
   * Body: { email?, linkedin_url?, name?, domain? }
   */
  @Post('enrich/contact')
  async enrichContact(
    @Body() body: { email?: string; linkedin_url?: string; name?: string; domain?: string },
  ) {
    const result = await this.apolloService.enrichContact(body);
    if (!result) {
      return { success: false, message: 'No match found for the provided identifiers' };
    }
    return { success: true, lead: result };
  }

  /**
   * GET /apollo/enrich/organization?domain=example.com
   * Enrich a company by domain
   */
  @Get('enrich/organization')
  async enrichOrganization(@Query('domain') domain: string) {
    if (!domain) {
      return { success: false, message: 'domain query param is required' };
    }
    const result = await this.apolloService.enrichOrganization(domain);
    return { success: true, organization: result };
  }
}
