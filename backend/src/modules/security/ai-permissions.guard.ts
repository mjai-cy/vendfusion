import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AiPermissionsGuard implements CanActivate {
  // Define strict blocked endpoints and keywords for safety alignment
  private readonly blockedKeywords = [
    'drop_table',
    'delete_database',
    'deploy_code',
    'change_billing',
    'cancel_subscription',
    'reset_password',
    'access_secrets',
    'approve_deployment',
  ];

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const caller = request.headers['x-caller'] || 'user';
    const path = request.url;

    // Check if the request is triggered by an autonomous AI agent
    if (caller === 'ai-agent') {
      console.log(`[AI Permissions Guard] Inspecting AI agent request target path: "${path}"`);

      // 1. Enforce strict URL checks
      const containsBlockedPath = this.blockedKeywords.some((keyword) => 
        path.toLowerCase().includes(keyword.replace('_', '-')),
      );

      // 2. Enforce strict body payload checks
      const requestBody = JSON.stringify(request.body || {});
      const containsBlockedBody = this.blockedKeywords.some((keyword) => 
        requestBody.toLowerCase().includes(keyword),
      );

      if (containsBlockedPath || containsBlockedBody) {
        console.error(`[AI Permissions Guard Block] AI agent execution halted. Attempted unauthorized operation on: "${path}"`);
        throw new ForbiddenException(
          'Security Constraint: AI agent does not possess permissions to modify auth settings, delete tables, alter billing, or approve production updates.',
        );
      }
    }

    return true; // Request allowed
  }
}
