import { Injectable, Logger } from '@nestjs/common';

export interface SequenceStep {
  id: string;
  order: number;
  channel: 'email' | 'linkedin' | 'whatsapp';
  delayDays: number;
  subject?: string;
  template: string;
  condition: 'auto' | 'wait_for_reply' | 'wait_for_meeting';
}

export interface Sequence {
  id: string;
  name: string;
  campaignId: string;
  steps: SequenceStep[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
}

const DEFAULT_STEPS: Omit<SequenceStep, 'id'>[] = [
  { order: 1, channel: 'linkedin', delayDays: 0, template: 'Hi {{first_name}}, noticed {{company}} is growing. Would love to connect!', condition: 'auto', subject: '' },
  { order: 2, channel: 'email', delayDays: 2, subject: 'Quick intro for {{company}}', template: 'Hi {{first_name}},\n\nNoticed {{company}} has been {{trigger}}.\n\nWe help teams like yours automate outbound and book more meetings.\n\nWorth a quick chat?\n\nBest,\n{{sender_name}}', condition: 'wait_for_reply' },
  { order: 3, channel: 'linkedin', delayDays: 5, template: 'Hey {{first_name}} — following up on my previous message. Would 10 min this week work?', condition: 'auto' },
  { order: 4, channel: 'email', delayDays: 7, subject: 'Still exploring options?', template: 'Hi {{first_name}},\n\nJust a friendly follow-up. Happy to share how we\'ve helped similar {{role}}s at {{industry}} companies.\n\nBest,\n{{sender_name}}', condition: 'auto' },
];

@Injectable()
export class SequencesService {
  private readonly logger = new Logger(SequencesService.name);
  private sequences: Map<string, Sequence> = new Map();

  create(name: string, campaignId: string): Sequence {
    const seq: Sequence = {
      id: `seq-${Date.now()}`,
      name,
      campaignId,
      steps: DEFAULT_STEPS.map((s, i) => ({ ...s, id: `step-${Date.now()}-${i}` })),
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.sequences.set(seq.id, seq);
    this.logger.log(`Created sequence: ${seq.id} for campaign ${campaignId}`);
    return seq;
  }

  findAll(): Sequence[] {
    return Array.from(this.sequences.values());
  }

  findById(id: string): Sequence | undefined {
    return this.sequences.get(id);
  }

  findByCampaign(campaignId: string): Sequence[] {
    return this.findAll().filter(s => s.campaignId === campaignId);
  }

  updateSteps(id: string, steps: SequenceStep[]): Sequence | null {
    const seq = this.sequences.get(id);
    if (!seq) return null;
    seq.steps = steps;
    this.sequences.set(id, seq);
    return seq;
  }

  updateStatus(id: string, status: Sequence['status']): Sequence | null {
    const seq = this.sequences.get(id);
    if (!seq) return null;
    seq.status = status;
    this.sequences.set(id, seq);
    this.logger.log(`Sequence ${id} status -> ${status}`);
    return seq;
  }

  async executeStep(sequenceId: string, step: SequenceStep, lead: any): Promise<boolean> {
    this.logger.log(`Executing step ${step.order} [${step.channel}] of sequence ${sequenceId} for ${lead.name}`);

    const filledSubject = (step.subject || '').replace(/\{\{(\w+)\}\}/g, (_, key) => lead[key] || `{{${key}}}`);
    const filledBody = step.template.replace(/\{\{(\w+)\}\}/g, (_, key) => lead[key] || `{{${key}}}`);

    try {
      if (step.channel === 'email') {
        const res = await fetch(`http://localhost:3002/outreach/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: lead.email, subject: filledSubject, body: filledBody }),
        });
        return res.ok;
      } else if (step.channel === 'whatsapp') {
        const res = await fetch(`http://localhost:3002/outreach/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toPhone: lead.whatsapp, text: filledBody }),
        });
        return res.ok;
      } else if (step.channel === 'linkedin') {
        this.logger.log(`[LinkedIn] Simulated connection request to ${lead.name}: "${filledBody.substring(0, 100)}..."`);
        return true;
      }
      return false;
    } catch (err) {
      this.logger.error(`Failed to execute step ${step.id}: ${err.message}`);
      return false;
    }
  }

  delete(id: string): boolean {
    return this.sequences.delete(id);
  }
}
