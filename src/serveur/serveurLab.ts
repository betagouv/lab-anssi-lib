import { Express, Request, Response, NextFunction } from 'express';
import { IpDeniedError, IpFilter } from 'express-ipfilter';
import rateLimit from 'express-rate-limit';

export const creeServeurLab = (
  config: ConfigurationServeurLab
): Express => {
  const express = require('express');
  const app = express();

  const limiteRequetesParMinute = rateLimit({
    windowMs: 60 * 1000,
    limit: config.reseau.maxRequetesParMinute,
  });
  app.set('trust proxy', config.reseau.trustProxy);
  app.use(limiteRequetesParMinute);

  if (config.reseau.ipAutorisees) {
    app.use(
      IpFilter(config.reseau.ipAutorisees, {
        detectIp: (request) => {
          const forwardedFor = request.headers['x-forwarded-for'];
          if (typeof forwardedFor === 'string') {
            const ips = forwardedFor
              .split(',')
              .map((ip) => ip.trim())
              .filter((ip) => ip !== '');

            if (ips.length > 0) {
              const ipWaf = ips[ips.length - 1];
              return ipWaf;
            }
          }
          return 'interdire';
        },
        mode: 'allow',
        log: false,
      })
    );
    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof IpDeniedError) {
        res.status(403).send('Access denied');
      } else {
        next(err)
      }
    });
  }
  return app;
};

export type ConfigurationServeurLab = {
  reseau: {
    trustProxy: number | string;
    maxRequetesParMinute: number;
    ipAutorisees: string[] | false;
  };
};
