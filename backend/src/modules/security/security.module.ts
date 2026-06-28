import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security.service';
import { AiPermissionsGuard } from './ai-permissions.guard';

@Global() // Make security guards and encryptors globally available
@Module({
  providers: [SecurityService, AiPermissionsGuard],
  exports: [SecurityService, AiPermissionsGuard],
})
export class SecurityModule {}
