import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime: number = Date.now();

  getHealthStatus() {
    return {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      platform: 'XYZ.AI Backend Core',
    };
  }
}
