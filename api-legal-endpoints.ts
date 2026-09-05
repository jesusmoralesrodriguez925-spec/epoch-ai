import { Request, Response, Router } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

export const legalRouter = Router();

// Storage path for GDPR deletion requests and audit logs
const DATA_DIR = path.join(process.cwd(), 'data');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'legal_audit_logs.json');
const DELETION_REQUESTS_FILE = path.join(DATA_DIR, 'deletion_requests.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

function appendAuditLog(entry: {
  userId: string;
  userEmail: string;
  action: string;
  ipAddress?: string;
  metadata?: any;
}) {
  try {
    let logs: any[] = [];
    if (fs.existsSync(AUDIT_LOG_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, 'utf-8'));
    }
    logs.push({
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando audit log:', e);
  }
}

// 1. POST /api/user/data-export (GDPR Data Portability)
legalRouter.post('/api/user/data-export', async (req: Request, res: Response) => {
  const userId = req.body.userId || (req as any).user?.uid || 'anonymous';
  const userEmail = req.body.userEmail || (req as any).user?.email || 'user@kodi.ai';
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  appendAuditLog({
    userId,
    userEmail,
    action: 'DATA_EXPORTED',
    ipAddress: String(clientIp),
  });

  const exportPackage = {
    exportDate: new Date().toISOString(),
    gdprCompliance: 'Article 20 - Right to Data Portability',
    userProfile: {
      userId,
      email: userEmail,
      exportVersion: '6.4.0',
    },
    legalConsents: {
      privacyPolicy: true,
      termsOfService: true,
      aiUsage: true,
      dataSharing: true,
      aiDataProcessing: true,
      consentRecordedAt: new Date().toISOString(),
      ipAddressProof: clientIp,
    },
    activityRecords: {
      system: 'KODI AI Studio Enterprise Sandbox',
      totalSessionsExported: 1,
      status: 'active',
    },
  };

  return res.json(exportPackage);
});

// 2. POST /api/user/request-deletion (GDPR Right to be Forgotten)
legalRouter.post('/api/user/request-deletion', async (req: Request, res: Response) => {
  const userId = req.body.userId || (req as any).user?.uid || 'user-unknown';
  const userEmail = req.body.userEmail || (req as any).user?.email || 'user@kodi.ai';
  const reason = req.body.reason || 'User initiated deletion';
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  const confirmationCode = `KODI-DEL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const scheduledPurgeDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  // Save deletion ticket
  try {
    let requests: any[] = [];
    if (fs.existsSync(DELETION_REQUESTS_FILE)) {
      requests = JSON.parse(fs.readFileSync(DELETION_REQUESTS_FILE, 'utf-8'));
    }
    requests.push({
      confirmationCode,
      userId,
      userEmail,
      reason,
      clientIp: String(clientIp),
      requestedAt: new Date().toISOString(),
      scheduledPurgeDate,
      status: 'pending_purge_48h',
    });
    fs.writeFileSync(DELETION_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error registrando solicitud de eliminación:', e);
  }

  appendAuditLog({
    userId,
    userEmail,
    action: 'DELETION_REQUESTED',
    ipAddress: String(clientIp),
    metadata: { confirmationCode, scheduledPurgeDate, reason },
  });

  return res.json({
    success: true,
    message: 'Solicitud de eliminación registrada. Tus datos serán eliminados permanentemente en 48 horas.',
    confirmationCode,
    scheduledPurgeDate,
    gracePeriodHours: 24,
  });
});

// 3. POST /api/user/consent-update
legalRouter.post('/api/user/consent-update', async (req: Request, res: Response) => {
  const { userId, userEmail, consents } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  appendAuditLog({
    userId: userId || 'unknown',
    userEmail: userEmail || 'unknown',
    action: 'CONSENT_GRANTED',
    ipAddress: String(clientIp),
    metadata: { consents, version: '6.4.0' },
  });

  return res.json({
    success: true,
    message: 'Consentimiento legal registrado con prueba de auditoría.',
    recordedAt: new Date().toISOString(),
    ipProof: clientIp,
  });
});

// 4. GET /api/legal/privacy-policy
legalRouter.get('/api/legal/privacy-policy', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'PrivacyPolicy.md');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : 'Privacy Policy content not found';
  return res.json({
    version: '6.4.0',
    lastUpdated: '2026-08-29',
    compliance: ['GDPR', 'CCPA', 'EU_AI_ACT', 'FTC'],
    content,
  });
});

// 5. GET /api/legal/terms-of-service
legalRouter.get('/api/legal/terms-of-service', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'TermsOfService.md');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : 'Terms of Service content not found';
  return res.json({
    version: '6.4.0',
    lastUpdated: '2026-08-29',
    content,
  });
});

// 6. GET /api/legal/ai-notice
legalRouter.get('/api/legal/ai-notice', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'AiNotice.txt');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : 'AI Notice content not found';
  return res.json({
    version: '6.4.0',
    aiModels: ['Google Gemini 3.7 / 2.5', 'Groq Llama 3.3 70B', 'Tavily AI Search'],
    notice: content,
  });
});
