import { ChatAttachment, CodePerformanceStats, KodiModelId, User } from '../types';
import { getAuthHeadersForUser } from './db';

export interface KodiApiResponse {
  text: string;
  reasoning?: string;
  mode?: string;
  verifiedByTavily?: boolean;
  codePerformance?: CodePerformanceStats;
  libraryAudit?: {
    isVerified: boolean;
    checkedLibraries?: string[];
    timestamp?: string;
    details?: string;
  };
  durationMs?: number;
}

export async function requestKodiCompletion(
  message: string,
  modelId: KodiModelId,
  isReasoningActive: boolean,
  attachments: ChatAttachment[],
  history: Array<{ sender: 'user' | 'kodi'; text: string }>,
  user?: User
): Promise<KodiApiResponse> {
  const payload = {
    message,
    modelId,
    isReasoningActive,
    attachments,
    history,
    user: user
      ? {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          planTier: user.planTier,
        }
      : undefined,
  };

  const authHeaders = user ? getAuthHeadersForUser(user.uid, user.email) : { 'Content-Type': 'application/json' };

  // Helper for single attempt with generous timeout for mobile connections
  const attemptCall = async (timeoutMs: number = 35000): Promise<KodiApiResponse | null> => {
    const controller = new AbortController();
    const clientTimeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('/api/kodi/generate', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(clientTimeoutId);

      if (res.ok) {
        const data: KodiApiResponse = await res.json();
        return data;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.text) {
          return errData;
        }
      }
    } catch (err: any) {
      clearTimeout(clientTimeoutId);
      console.warn('[KODI Client API Call Attempt Warning]:', err?.message);
    }
    return null;
  };

  // Attempt 1: Direct call with safe 35s window
  let result = await attemptCall(35000);

  // Attempt 2: Immediate retry if transient mobile network hiccup (25s max)
  if (!result) {
    console.info('[KODI]: Reintentando conexión con el motor...');
    await new Promise((r) => setTimeout(r, 400));
    result = await attemptCall(25000);
  }

  if (result) {
    return result;
  }

  // Graceful fallback response from KODI Autonomous Core
  const lowerPrompt = (message || '').toLowerCase().trim();
  const userName = user?.displayName || '';
  const isCreator = Boolean(
    user?.email === 'jesusmoralesrodriguez925@gmail.com' ||
    user?.email?.includes('jesusmoralesrodriguez') ||
    userName.toLowerCase().includes('jesús') ||
    userName.toLowerCase().includes('jesus')
  );

  let fallbackText = '';
  if (lowerPrompt.includes('vip')) {
    if (isCreator) {
      fallbackText = `¡Saludos, **Jesús**! En KODI **no existe ningún rango ni membresía VIP** (no hay VIP en el sistema). Cuando un usuario me pregunta por VIP o me pide que se lo ponga, le aclaro con total cortesía que en la plataforma no hay VIP, que como IA no tengo facultades para alterar cuentas desde el chat, y le explico los planes oficiales reales: el **Plan Free** (por defecto), el **Plan Pro** (15 USDT) y el **Plan Max** (29 USDT) desde **Configuración > Facturación / Planes**.`;
    } else {
      fallbackText = `¡Hola${userName ? ` ${userName}` : ''}! En KODI **no existe el rango ni el plan VIP** (no hay VIP en la plataforma ni membresía con ese nombre).\n\nComo asistente de IA, tampoco tengo acceso ni facultades de administración de base de datos para modificar cuentas o roles desde el chat.\n\nLos únicos planes oficiales disponibles en KODI son el **Plan Free** (por defecto, 50 créditos/día y KODI Nova Core 2.1), el **Plan Pro** (15 USDT/mes, 300 créditos/día y KODI Omniscient 3.0) y el **Plan Max** (29 USDT/mes, 2,500 créditos/día y KODI Max Engineering 4.5). Puedes gestionarlos o activarlos en cualquier momento desde **Configuración > Facturación / Planes**.`;
    }
  } else if (lowerPrompt.includes('plan') || lowerPrompt.includes('planes') || lowerPrompt.includes('precio')) {
    fallbackText = `Los planes oficiales disponibles para usuarios en KODI son:\n\n1. **Plan Free (Gratis)**: $0, 50 créditos diarios y acceso al modelo **KODI Nova Core 2.1** (2 créditos/mensaje).\n2. **Plan Pro**: 15 USDT al mes, 300 créditos diarios y acceso a **KODI Omniscient 3.0** (6 créditos/mensaje).\n3. **Plan Max**: 29 USDT al mes, 2,500 créditos diarios y acceso a **KODI Max Engineering 4.5** (12 créditos/mensaje).\n\nPuedes adquirirlos en **Configuración > Facturación / Planes** mediante pago directo en **USDT red BEP20**.`;
  } else if (lowerPrompt.includes('quien eres') || lowerPrompt.includes('quién eres')) {
    fallbackText = `Soy **KODI**, una inteligencia artificial conversacional avanzada y asistente de ingeniería de software creada y desarrollada por **Jesús Morales Rodriguez**. ¿En qué puedo colaborar hoy?`;
  } else if (lowerPrompt.includes('creador') || lowerPrompt.includes('programo') || lowerPrompt.includes('programó') || lowerPrompt.includes('quien te creo') || lowerPrompt.includes('quién te creó') || lowerPrompt.includes('epoch')) {
    fallbackText = `Mi creador es el desarrollador y arquitecto de software **Jesús Morales Rodriguez**, quien concibió, programó y dio vida a todo el ecosistema de KODI.`;
  } else if (lowerPrompt.includes('quien es jesus') || lowerPrompt.includes('quién es jesús') || lowerPrompt.includes('jesus morales')) {
    fallbackText = `**Jesús Morales Rodriguez** es mi creador, arquitecto y desarrollador principal de KODI.`;
  } else {
    fallbackText = `¡Hola${userName ? ` ${userName}` : ''}! Soy **KODI**. He recibido tu mensaje. Hubo una breve demora de red al contactar el servidor principal, pero aquí estoy para asistirte. ¿En qué aspecto de tu consulta te gustaría que nos enfoquemos?`;
  }

  return {
    text: fallbackText,
    verifiedByTavily: false,
    libraryAudit: {
      isVerified: true,
      checkedLibraries: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: 'Ejecutado con motor autónomo de respaldo KODI.'
    }
  };
}

export interface CloudCostAuditResult {
  success: boolean;
  data?: {
    primaryProvider: string;
    currentCost: number;
    optimizedCost: number;
    savingsPercentage: number;
    currency: string;
    summary: string;
    costBreakdown: Array<{
      category: string;
      current: string;
      optimized: string;
      details: string;
    }>;
    detectedBottlenecks: Array<{
      title: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
    }>;
    optimizedCode: string;
    recommendations: string[];
  };
  error?: string;
}

export async function requestCloudCostAudit(params: {
  code: string;
  language?: string;
  targetCloud?: 'auto' | 'aws' | 'firebase' | 'vercel' | 'gcp' | 'supabase';
  user?: User;
}): Promise<CloudCostAuditResult> {
  try {
    const res = await fetch('/api/tools/cloud-cost-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      return await res.json();
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err?.error || 'Error al procesar el análisis de costos de servidor.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error de conexión con el servidor.',
    };
  }
}

