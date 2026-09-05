/**
 * MIDDLEWARE DE AUTENTICACIÓN - KODI AI STUDIO
 * Validación segura de usuarios contra Firebase/Supabase
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Tipos
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  planTier: 'free' | 'pro' | 'max';
  authProvider: 'google' | 'password';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  decodedToken?: any;
}

// Schemas
export const TokenSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  iat: z.number(),
  exp: z.number(),
});

// ==============================================================================
// VALIDACIÓN DE TOKEN (Firebase)
// ==============================================================================
export async function verifyFirebaseToken(token: string): Promise<AuthUser | null> {
  try {
    // En producción, usar firebase-admin:
    // import * as admin from 'firebase-admin';
    // const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Para desarrollo, simulamos la validación:
    if (!token || token.length < 20) {
      return null;
    }

    // Aquí iría la validación real con Firebase Admin SDK
    // Por ahora retornamos null para indicar que falló
    return null;
  } catch (error) {
    console.error('❌ Error validando token Firebase:', error);
    return null;
  }
}

// ==============================================================================
// VALIDACIÓN DE TOKEN (Supabase)
// ==============================================================================
export async function verifySupabaseToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token || token.length < 20) {
      return null;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://poytamgrnfzwafvlscgo.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    // Validación directa contra Supabase Auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
      signal: AbortSignal.timeout(4000)
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    if (!user || !user.id) {
      return null;
    }

    return {
      uid: user.id,
      email: user.email || 'usuario@supabase.co',
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      photoURL: user.user_metadata?.avatar_url,
      planTier: (user.user_metadata?.planTier as 'free' | 'pro' | 'max') || 'free',
      authProvider: user.app_metadata?.provider === 'google' ? 'google' : 'password'
    };
  } catch (error) {
    console.error('❌ Error validando token Supabase:', error);
    return null;
  }
}

// ==============================================================================
// MIDDLEWARE PRINCIPAL DE AUTENTICACIÓN
// ==============================================================================
export async function requireAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      console.warn(`🔓 [AUTH DENIED] Missing token from ${req.path}`);
      res.status(401).json({
        error: 'Autenticación requerida',
        message: 'Por favor incluye un Bearer token en el header Authorization'
      });
      return;
    }

    // 2. Validar formato del token
    if (typeof token !== 'string' || token.length < 20 || token.length > 2000) {
      console.warn(`🔓 [AUTH DENIED] Invalid token format from ${req.ip}`);
      res.status(401).json({
        error: 'Token inválido',
        message: 'El formato del token no es válido'
      });
      return;
    }

    // 3. Intentar verificar con Firebase primero
    let user = await verifyFirebaseToken(token);

    // 4. Si falla, intentar con Supabase
    if (!user) {
      user = await verifySupabaseToken(token);
    }

    // 5. Si ambas fallan, negar acceso
    if (!user) {
      console.warn(`🔓 [AUTH DENIED] Token verification failed for ${req.headers['x-user-email']}`);
      res.status(401).json({
        error: 'Token inválido o expirado',
        message: 'Por favor, vuelve a iniciar sesión'
      });
      return;
    }

    // 6. Adjuntar usuario al request
    req.user = user;
    req.decodedToken = token;

    console.log(`✅ [AUTH SUCCESS] User ${user.uid} (${user.planTier}) authenticated`);

    // 7. Continuar al siguiente middleware
    next();
  } catch (error) {
    console.error('❌ [AUTH ERROR]', error);
    res.status(500).json({
      error: 'Error de autenticación',
      message: 'Ocurrió un error al validar tu sesión'
    });
  }
}

// ==============================================================================
// MIDDLEWARE PARA VALIDAR PLAN ESPECÍFICO
// ==============================================================================
export function requirePlan(...allowedPlans: Array<'free' | 'pro' | 'max'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userPlan = req.user?.planTier;

    if (!userPlan) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!allowedPlans.includes(userPlan)) {
      console.warn(`🚫 [PLAN DENIED] User ${req.user?.uid} (${userPlan}) tried to access ${req.path}`);
      res.status(403).json({
        error: 'Plan no permitido',
        message: `Este recurso requiere uno de estos planes: ${allowedPlans.join(', ')}`,
        currentPlan: userPlan
      });
      return;
    }

    next();
  };
}

// ==============================================================================
// MIDDLEWARE PARA VALIDAR ADMIN
// ==============================================================================
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const userEmail = req.user?.email;
  const adminEmails = [
    'admin@kodi.ai',
    'jesusmoralesrodriguez925@gmail.com'
  ];

  if (!userEmail || !adminEmails.includes(userEmail)) {
    console.warn(`🚫 [ADMIN DENIED] Non-admin user ${userEmail} tried to access ${req.path}`);
    res.status(403).json({
      error: 'Acceso denegado',
      message: 'Este recurso solo está disponible para administradores'
    });
    return;
  }

  next();
}

// ==============================================================================
// EXTENDER DURACIÓN DE SESIÓN (Refresh Token)
// ==============================================================================
export async function refreshUserSession(userId: string, currentToken: string): Promise<string | null> {
  try {
    // En producción, esto generaría un nuevo token válido por más tiempo
    // usando el refresh token del usuario
    
    if (!userId || !currentToken) {
      return null;
    }

    // Simular generación de nuevo token
    // En real: const newToken = await admin.auth().createCustomToken(userId);
    
    return null;
  } catch (error) {
    console.error('❌ Error refrescando sesión:', error);
    return null;
  }
}

// ==============================================================================
// LOG DE ACCESO
// ==============================================================================
export function logAuthEvent(
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'TOKEN_EXPIRED' | 'PERMISSION_DENIED',
  details: {
    userId?: string;
    email?: string;
    path: string;
    method: string;
    ip?: string;
    reason?: string;
  }
): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] User: ${details.userId || 'unknown'} | Email: ${details.email || 'N/A'} | Path: ${details.path} | Method: ${details.method} | IP: ${details.ip || 'unknown'} | Reason: ${details.reason || 'N/A'}`;

  if (type.includes('FAILED') || type.includes('DENIED')) {
    console.warn(`🔓 ${logMessage}`);
  } else {
    console.log(`✅ ${logMessage}`);
  }
}

// ==============================================================================
// EXPORT
// ==============================================================================
export default {
  requireAuthentication,
  requirePlan,
  requireAdmin,
  refreshUserSession,
  logAuthEvent,
  verifyFirebaseToken,
  verifySupabaseToken
};
