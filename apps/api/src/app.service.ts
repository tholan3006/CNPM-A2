import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello() {
    return {
      status: 'success',
      message: 'Hello World! BrewLite API is running.',
      project: 'BrewLite - Digital Coffee & Cashless Payment',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        docs: '/api/docs',
        products: '/products',
        ordersMe: '/orders/me',
      },
    };
  }

  async getHealth() {
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      service: 'brewlite-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        memoryUsage: process.memoryUsage().rss,
      },
    };
  }
}

