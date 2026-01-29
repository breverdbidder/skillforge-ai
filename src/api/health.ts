/**
 * Health check endpoint for Render.com deployment
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    clawdbot: boolean;
    kilo: boolean;
    github: boolean;
    sync: boolean;
  };
  version: string;
}

export function createHealthCheckServer(port: number = 3000): void {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/health' && req.method === 'GET') {
      const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          clawdbot: true,  // Would check actual connection
          kilo: true,      // Would check actual connection
          github: true,    // Would check actual connection
          sync: true,      // Would check sync status
        },
        version: process.env.npm_package_version || '1.0.0',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(health, null, 2));
    } else if (req.url === '/api/health' && req.method === 'GET') {
      // Alternative health endpoint
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });
}
