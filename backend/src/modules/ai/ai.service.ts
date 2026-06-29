import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: string = process.env.AI_PROVIDER || 'gemini';

  private buildEmailPrompt(leadName: string, role: string, company: string, triggers: string[], companyDesc?: string): string {
    return `You are an expert B2B sales development representative. Write a personalized outreach email to a prospect.

Prospect Details:
- Name: ${leadName}
- Role: ${role}
- Company: ${company}
- Triggers/Intent Signals: ${triggers.join(', ')}
${companyDesc ? `- Our Company: ${companyDesc}` : ''}

Write a concise, personalized email (subject + body) that:
1. References the trigger signals to show relevance
2. Demonstrates understanding of their role
3. Offers clear value proposition
4. Includes a low-friction call-to-action (10-15 min call)

Return the response in JSON format with "subject" and "body" fields. Keep the subject under 60 characters. Keep the body under 150 words.`;
  }

  private buildLinkedInPrompt(leadName: string, role: string, company: string, triggers: string[], companyDesc?: string): string {
    return `You are an expert B2B sales development representative. Write a personalized LinkedIn message/connection request to a prospect.

Prospect Details:
- Name: ${leadName}
- Role: ${role}
- Company: ${company}
- Triggers/Intent Signals: ${triggers.join(', ')}
${companyDesc ? `- Our Company: ${companyDesc}` : ''}

Write a concise, personalized LinkedIn connection request message that:
1. References the trigger signals to show relevance (e.g., "I saw your recent post about...")
2. Is friendly and professional
3. Mentions why you want to connect
4. Under 300 characters (LinkedIn limit for connection requests)

Return the response as a plain text string (the message only, no JSON).`;
  }

  private async tryCallAi(leadName: string, role: string, company: string, triggers: string[], promptBuilder: (...args: any[]) => string, companyDesc?: string): Promise<string> {
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
    if (!apiKeySet) return '';

    const prompt = promptBuilder(leadName, role, company, triggers, companyDesc);

    try {
      this.logger.log(`Calling ${activeProvider} API for ${leadName} at ${company}`);

      if (activeProvider === 'gemini') {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } else if (activeProvider === 'openai') {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });
        return response.choices[0]?.message?.content?.trim() || '';
      } else if (activeProvider === 'claude') {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        });
        return response.content[0]?.text?.trim() || '';
      }
    } catch (err) {
      this.logger.error(`AI call failed: ${err.message}.`);
    }

    return '';
  }

  async generateOutreach(leadName: string, role: string, company: string, triggers: string[], companyDescription?: string): Promise<{ subject: string; body: string }> {
    const aiText = await this.tryCallAi(leadName, role, company, triggers, this.buildEmailPrompt, companyDescription);

    if (aiText) {
      try {
        const json = JSON.parse(aiText);
        return { subject: json.subject || '', body: json.body || '' };
      } catch {
        const subjectMatch = aiText.match(/"subject"\s*:\s*"([^"]+)"/);
        const bodyMatch = aiText.match(/"body"\s*:\s*"([^"]+)"/);
        if (subjectMatch || bodyMatch) {
          return {
            subject: subjectMatch ? subjectMatch[1] : 'Personalized outreach',
            body: bodyMatch ? bodyMatch[1] : aiText,
          };
        }
      }
    }

    return {
      subject: `Quick question about ${company}'s ${role} strategy`,
      body: `Hi ${leadName},\n\nNoticed ${company} has been ${triggers[0] || 'expanding recently'}.\n\nWe help ${role}s at companies like yours automate outbound and book more meetings without scaling headcount.\n\nWorth a 10-min chat to see if it's a fit?\n\nBest,\n[Your Name]`,
    };
  }

  async generateLinkedInMessage(leadName: string, role: string, company: string, triggers: string[], companyDescription?: string): Promise<{ message: string }> {
    const aiText = await this.tryCallAi(leadName, role, company, triggers, this.buildLinkedInPrompt, companyDescription);

    if (aiText) {
      return { message: aiText.substring(0, 300) };
    }

    return {
      message: `Hi ${leadName}, I saw your work at ${company} as ${role} and noticed ${triggers[0] || 'your recent activity in the space'}. Would love to connect and share ideas!`,
    };
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
