import { Injectable, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  // Use a strong algorithm for encryption
  private readonly algorithm = 'aes-256-cbc';
  // Derive secret key from mandatory env variable; throws if missing
  private readonly secretKey = crypto.scryptSync(
    process.env.SUPABASE_ANON_KEY,
    'salt',
    32,
  );

  encrypt(text: string): { iv: string; encryptedData: string } {
    if (!text) return { iv: '', encryptedData: '' };
    // Generate a fresh IV for each encryption operation
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  }

  decrypt(encryptedData: string, ivHex: string): string {
    if (!encryptedData || !ivHex) return '';
    try {
      const ivBuffer = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, ivBuffer);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('[Data Security] Decryption failure. Secret keys mismatch.');
      return '';
    }
  }

  // Multi-tenant database checks: ensures user actions stay within their sandboxed workspace
  verifyWorkspaceIsolation(actorWorkspaceId: string, targetWorkspaceId: string): void {
    if (actorWorkspaceId !== targetWorkspaceId) {
      console.warn(`[Data Security Alert] Access violation! Workspace ${actorWorkspaceId} attempted to read data belonging to ${targetWorkspaceId}.`);
      throw new ForbiddenException('Security Sandbox Violation: Unauthorized access across isolated workspace nodes.');
    }
  }
}
