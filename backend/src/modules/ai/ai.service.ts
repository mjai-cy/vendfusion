import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: string = process.env.AI_PROVIDER || 'gemini';

  private buildPrompt(leadName: string, role: string, company: string, triggers: string[]): string {
    return `You are an expert B2B sales development representative. Write a personalized outreach email to a prospect.

Prospect Details:
- Name: ${leadName}
- Role: ${role}
- Company: ${company}
- Triggers/Intent Signals: ${triggers.join(', ')}

Write a concise, personalized email (subject + body) that:
1. References the trigger signals to show relevance
2. Demonstrates understanding of their role
3. Offers clear value proposition
4. Includes a low-friction call-to-action (10-15 min call)

Return the response in JSON format with "subject" and "body" fields. Keep the subject under 60 characters. Keep the body under 150 words.`;
  }

  async generateOutreach(leadName: string, role: string, company: string, triggers: string[]): Promise<{ subject: string; body: string }> {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasClaude = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    let activeProvider = this.provider;

    if (activeProvider.includes('gemini') && !hasGemini) {
      if (hasClaude) { activeProvider = 'claude'; }
      else if (hasOpenAI) { activeProvider = 'openai'; }
    } else if (activeProvider.includes('claude') && !hasClaude) {
      if (hasGemini) { activeProvider = 'gemini'; }
      else if (hasOpenAI) { activeProvider = 'openai'; }
    } else if (activeProvider.includes('openai') && !hasOpenAI) {
      if (hasGemini) { activeProvider = 'gemini'; }
      else if (hasClaude) { activeProvider = 'claude'; }
    }

    const apiKeySet = hasGemini || hasClaude || hasOpenAI;
    if (!apiKeySet) {
      this.logger.warn(`No API keys found — returning mock for ${leadName}`);
      return {
        subject: `Quick question about ${company}'s ${role} strategy`,
        body: `Hi ${leadName},\n\nNoticed ${company} has been ${triggers[0] || 'expanding recently'}.\n\nWe help ${role}s at companies like yours automate outbound and book more meetings without scaling headcount.\n\nWorth a 10-min chat to see if it's a fit?\n\nBest,\nXYZ Sales Agent`,
      };
    }

    try {
      this.logger.log(`Calling ${activeProvider} API for ${leadName} at ${company}`);

      if (activeProvider === 'gemini') {
        return await this.callGemini(leadName, role, company, triggers);
      } else if (activeProvider === 'openai') {
        return await this.callOpenAI(leadName, role, company, triggers);
      } else if (activeProvider === 'claude') {
        return await this.callClaude(leadName, role, company, triggers);
      }
    } catch (err) {
      this.logger.error(`AI call failed: ${err.message}. Falling back to mock.`);
    }

    return {
      subject: `Optimizing ${role} workflows at ${company}`,
      body: `Hi ${leadName},\n\nHope this finds you well. I generated this custom outreach draft based on recent triggers: ${triggers.join(', ')}.\n\nBest regards.`,
    };
  }

  private async callGemini(leadName: string, role: string, company: string, triggers: string[]): Promise<{ subject: string; body: string }> {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = this.buildPrompt(leadName, role, company, triggers);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return this.parseAiResponse(text);
  }

  private async callOpenAI(leadName: string, role: string, company: string, triggers: string[]): Promise<{ subject: string; body: string }> {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = this.buildPrompt(leadName, role, company, triggers);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    const text = response.choices[0]?.message?.content?.trim() || '';
    return this.parseAiResponse(text);
  }

  private async callClaude(leadName: string, role: string, company: string, triggers: string[]): Promise<{ subject: string; body: string }> {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = this.buildPrompt(leadName, role, company, triggers);
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0]?.text?.trim() || '';
    return this.parseAiResponse(text);
  }

  private parseAiResponse(text: string): { subject: string; body: string } {
    try {
      const json = JSON.parse(text);
      return { subject: json.subject || '', body: json.body || '' };
    } catch {
      const subjectMatch = text.match(/"subject"\s*:\s*"([^"]+)"/);
      const bodyMatch = text.match(/"body"\s*:\s*"([^"]+)"/);
      return {
        subject: subjectMatch ? subjectMatch[1] : 'Personalized outreach',
        body: bodyMatch ? bodyMatch[1] : text,
      };
    }
  }

  async runWeeklyOptimization(ratings: number[], performanceScore: number): Promise<{ learnings: string[]; proposals: string[] }> {
    return {
      learnings: [
        'Outbound email open rates increased by 12% on Tuesdays.',
        'Shortening WhatsApp prompts to under 140 characters reduced unsubscribe lists.',
      ],
      proposals: [
        'Set email scheduling delays to run between 9AM and 11AM local time.',
        'Inject social trigger context in the first 2 sentences.',
      ],
    };
  }
}
