import { Router } from 'express';
import healthCheck from './health-check.js';
import logger from '../utils/logger.js';

export default () => {
  const r = Router();
  
  r.get('/health', healthCheck);
  
  logger.info('[ROUTES] Application routes registered', {
    timestamp: new Date().toISOString()
  });

  return r;
};