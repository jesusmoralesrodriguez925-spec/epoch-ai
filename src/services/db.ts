import { User, UserWorkspace, ChatSession, UserCustomSettings, KodiModelId, PlanTier } from '../types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

const DB_USERS_KEY = 'kodi_database_users_v3';
const DB_WORKSPACES_KEY = 'kodi_database_workspaces_v3';
const DB_CHATS_PREFIX = 'kodi_database_chats_v3_';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Model credit costs:
 * - Nova Core 2.1: 2 credits
 * - Omniscient 3.0: 6 credits
 * - Max Engineering 4.5: 12 credits
 */
export const MODEL_CREDIT_COSTS: Record<KodiModelId, number> = {
  'nova-core-2.1': 2,
  'omniscient-3.0': 6,
  'max-4.5': 12,
};

/**
 * Generates a clean, unique human-readable User ID (e.g., KODI-USR-7482)
 * For the admin: KODI-ADMIN-001
 */
export function generateCleanUserId(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === 'jesusmoralesrodriguez925@gmail.com') {
    return 'KODI-ADMIN-001';
  }
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash << 5) - hash + cleanEmail.charCodeAt(i);
    hash |= 0;
  }
  const numeric = Math.abs(hash) % 90000 + 10000;
  return `KODI-USR-${numeric}`;
}

/**
 * Gets all user records from the persistent store
 */
function getAllUsersMap(): Record<string, User> {
  try {
    const raw = localStorage.getItem(DB_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users database:', err);
    return {};
  }
}

/**
 * Saves all user records
 */
function saveAllUsersMap(map: Record<string, User>): void {
  try {
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Error saving users database:', err);
  }
}

/**
 * Check if an email is the primary admin
 */
export function isUserAdmin(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === 'jesusmoralesrodriguez925@gmail.com';
}

export function getAuthHeadersForUser(userId: string, email?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
  
  let resolvedEmail = email;
  let resolvedName = '';

  try {
    const raw = localStorage.getItem('kodi_auth_current_session_v3') || localStorage.getItem('kodi_auth_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (!resolvedEmail && user?.email) resolvedEmail = user.email;
      if (user?.planTier) headers['x-user-plan'] = user.planTier;
      if (user?.displayName) resolvedName = user.displayName;
    }
  } catch {}
  
  if (!resolvedEmail || !resolvedName) {
    const users = getAllUsersMap();
    if (users[userId]) {
      if (!resolvedEmail && users[userId].email) {
        resolvedEmail = users[userId].email;
      }
      if (!resolvedName && users[userId].displayName) {
        resolvedName = users[userId].displayName;
      }
    }
  }

  if (resolvedName) {
    headers['x-user-name'] = encodeURIComponent(resolvedName);
  }

  if (resolvedEmail) {
    headers['x-user-email'] = resolvedEmail.trim().toLowerCase();
  }

  return headers;
}

function syncActiveSessionStorage(user: User): void {
  try {
    const sessionKeys = ['kodi_auth_current_session_v3', 'kodi_auth_user'];
    for (const key of sessionKeys) {
      localStorage.setItem(key, JSON.stringify(user));
    }
  } catch (e) {}
}

/**
 * Normalizes user credits and plans based on the date and 30-day subscription expiration
 */
function normalizeUserCredits(user: User): User {
  const today = getTodayDateString();
  const isAdmin = isUserAdmin(user.email);

  if (isAdmin) {
    const tier: PlanTier = user.planTier || 'max';
    const maxCredits = tier === 'max' ? 2500 : tier === 'pro' ? 300 : 50;

    return {
      ...user,
      uid: user.uid && user.uid.startsWith('KODI-') ? user.uid : 'KODI-ADMIN-001',
      isAdmin: true,
      role: 'KODI Chief Autonomous Administrator',
      planTier: tier,
      credits: typeof user.credits === 'number' ? user.credits : maxCredits,
      maxDailyCredits: maxCredits,
      totalSpentCredits: user.lastCreditResetDate === today ? (user.totalSpentCredits || 0) : 0,
      lastCreditResetDate: today,
    };
  }

  let tier: PlanTier = user.planTier || 'free';
  let expiration = user.planExpirationDate;

  // Check 30-day (1 month) expiration for paid tiers (pro / max)
  if (tier !== 'free' && expiration) {
    const expDate = new Date(expiration);
    const now = new Date();
    if (now.getTime() > expDate.getTime()) {
      // Plan expired after 1 month (30 days) -> revert to free plan
      tier = 'free';
      expiration = undefined;
    }
  }

  const maxCredits = tier === 'max' ? 2500 : tier === 'pro' ? 300 : 50;

  // New day reset
  if (user.lastCreditResetDate !== today) {
    return {
      ...user,
      uid: user.uid && user.uid.startsWith('KODI-') ? user.uid : generateCleanUserId(user.email),
      isAdmin: false,
      planTier: tier,
      planExpirationDate: expiration,
      credits: maxCredits,
      maxDailyCredits: maxCredits,
      totalSpentCredits: 0,
      lastCreditResetDate: today,
    };
  }

  return {
    ...user,
    uid: user.uid && user.uid.startsWith('KODI-') ? user.uid : generateCleanUserId(user.email),
    isAdmin: false,
    planTier: tier,
    planExpirationDate: expiration,
    credits: typeof user.credits === 'number' ? user.credits : maxCredits,
    maxDailyCredits: maxCredits,
    totalSpentCredits: user.totalSpentCredits || 0,
    lastCreditResetDate: user.lastCreditResetDate || today,
  };
}

/**
 * Fetch a single user by their UID from the database and sync with server
 */
export async function getUserProfile(uid: string, userEmail?: string): Promise<User | null> {
  const users = getAllUsersMap();
  let user = users[uid];

  if (!user && userEmail) {
    for (const key in users) {
      if (users[key].email.toLowerCase() === userEmail.toLowerCase().trim()) {
        user = users[key];
        break;
      }
    }
  }

  if (!user) {
    for (const key in users) {
      if (users[key].uid === uid) {
        user = users[key];
        break;
      }
    }
  }

  // Attempt server fetch to get freshest server-persisted profile
  try {
    const res = await fetch('/api/user/profile', {
      headers: getAuthHeadersForUser(uid, user?.email || userEmail),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        const serverUser: User = data.user;
        const merged: User = {
          ...(user || serverUser),
          displayName: serverUser.displayName || user?.displayName || 'Usuario',
          photoURL: serverUser.photoURL !== undefined ? serverUser.photoURL : user?.photoURL,
          planTier: serverUser.planTier || user?.planTier || (isUserAdmin(user?.email || userEmail) ? 'max' : 'free'),
          planExpirationDate: serverUser.planExpirationDate || user?.planExpirationDate,
          credits: serverUser.credits !== undefined ? serverUser.credits : user?.credits,
          maxDailyCredits: serverUser.maxDailyCredits !== undefined ? serverUser.maxDailyCredits : user?.maxDailyCredits,
          customSettings: {
            ...(user?.customSettings || {}),
            ...(serverUser.customSettings || {}),
          },
        };
        const normalized = normalizeUserCredits(merged);
        users[normalized.uid] = normalized;
        saveAllUsersMap(users);
        syncActiveSessionStorage(normalized);
        return normalized;
      }
    }
  } catch {}

  // Fallback check in Firestore with timeout guard
  try {
    if (firestore && user) {
      const userRef = doc(firestore, 'users', user.uid);
      const snapPromise = getDoc(userRef).catch(() => null);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
      const snap = await Promise.race([snapPromise, timeoutPromise]);
      if (snap && typeof snap.exists === 'function' && snap.exists()) {
        const cloudData = snap.data() as any;
        if (cloudData) {
          if (cloudData.displayName) user.displayName = cloudData.displayName;
          if (cloudData.photoURL !== undefined) user.photoURL = cloudData.photoURL || undefined;
          if (cloudData.planTier) user.planTier = cloudData.planTier;
          if (cloudData.planExpirationDate) user.planExpirationDate = cloudData.planExpirationDate;
          if (cloudData.customSettings) user.customSettings = { ...user.customSettings, ...cloudData.customSettings };
          const normalized = normalizeUserCredits(user);
          users[normalized.uid] = normalized;
          saveAllUsersMap(users);
          syncActiveSessionStorage(normalized);
          return normalized;
        }
      }
    }
  } catch {}

  if (!user) return null;

  const normalized = normalizeUserCredits(user);
  users[user.uid] = normalized;
  saveAllUsersMap(users);
  return normalized;
}

/**
 * Fetch a user by their email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = getAllUsersMap();
  const normalizedEmail = email.trim().toLowerCase();
  for (const uid in users) {
    if (users[uid].email.toLowerCase() === normalizedEmail) {
      const normalized = normalizeUserCredits(users[uid]);
      users[uid] = normalized;
      saveAllUsersMap(users);
      return normalized;
    }
  }

  // If not in local storage, query server
  try {
    const res = await fetch('/api/user/profile', {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'query',
        'x-user-email': normalizedEmail,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        const normalized = normalizeUserCredits(data.user);
        users[normalized.uid] = normalized;
        saveAllUsersMap(users);
        return normalized;
      }
    }
  } catch {}

  return null;
}

/**
 * Creates or updates a unique user database record.
 */
export async function createOrUpdateUserRecord(userData: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  authProvider: 'google' | 'password';
  customSettings?: UserCustomSettings;
}): Promise<User> {
  const users = getAllUsersMap();
  const now = new Date().toISOString();
  const today = getTodayDateString();
  const cleanEmail = userData.email.trim().toLowerCase();
  const isAdmin = isUserAdmin(cleanEmail);

  // Find existing by email or UID in memory map
  let existing: User | undefined;
  for (const id in users) {
    if (users[id].email.toLowerCase() === cleanEmail || (userData.uid && users[id].uid === userData.uid)) {
      existing = users[id];
      break;
    }
  }

  // If not found in local memory map, check active storage session
  if (!existing) {
    try {
      const rawSession = localStorage.getItem('kodi_auth_current_session_v3') || localStorage.getItem('kodi_auth_user');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed.email?.toLowerCase() === cleanEmail) {
          existing = parsed;
        }
      }
    } catch {}
  }

  const assignedUid = existing?.uid && existing.uid.startsWith('KODI-')
    ? existing.uid
    : generateCleanUserId(cleanEmail);

  const defaultPhoto = cleanEmail === 'jesusmoralesrodriguez925@gmail.com'
    ? 'https://lh3.googleusercontent.com/a/ACg8ocL'
    : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`;

  // Preserve previously uploaded custom photo if incoming is undefined or not provided
  const resolvedPhoto = userData.photoURL || existing?.photoURL || (userData.authProvider === 'google' ? defaultPhoto : undefined);

  // Preserve customized display name if incoming is just default email username
  const isIncomingNamePlaceholder = !userData.displayName || 
    userData.displayName.trim() === '' || 
    userData.displayName === cleanEmail.split('@')[0] || 
    userData.displayName === 'Usuario' ||
    userData.displayName === 'Usuario KODI';

  const resolvedDisplayName = !isIncomingNamePlaceholder
    ? userData.displayName!.trim()
    : (existing?.displayName || (isAdmin ? 'Jesus Morales Rodriguez' : cleanEmail.split('@')[0]));

  const tier: PlanTier = isAdmin ? 'max' : (existing?.planTier || 'free');
  const expirationDate = existing?.planExpirationDate;
  const maxCredits = tier === 'max' ? 2500 : tier === 'pro' ? 300 : 50;

  let currentCredits = maxCredits;
  let totalSpent = 0;

  if (isAdmin) {
    currentCredits = 2500;
  } else if (existing) {
    if (existing.lastCreditResetDate === today) {
      currentCredits = typeof existing.credits === 'number' ? existing.credits : maxCredits;
      totalSpent = existing.totalSpentCredits || 0;
    } else {
      currentCredits = maxCredits;
      totalSpent = 0;
    }
  }

  const userRecord: User = {
    uid: assignedUid,
    email: cleanEmail,
    displayName: resolvedDisplayName,
    photoURL: resolvedPhoto,
    role: isAdmin ? 'KODI Chief Autonomous Administrator' : (existing?.role || 'KODI Autonomous Architect'),
    createdAt: existing?.createdAt || now,
    lastLogin: now,
    authProvider: userData.authProvider,
    workspaceId: existing?.workspaceId || `ws_${assignedUid}_${Date.now()}`,
    isAdmin,
    planTier: tier,
    planExpirationDate: expirationDate,
    credits: currentCredits,
    maxDailyCredits: maxCredits,
    totalSpentCredits: totalSpent,
    lastCreditResetDate: today,
    customSettings: userData.customSettings || existing?.customSettings || {
      theme: 'dark',
      autoReasoning: true,
      defaultModel: 'nova-core-2.1',
    },
  };

  users[assignedUid] = userRecord;
  saveAllUsersMap(users);
  syncActiveSessionStorage(userRecord);

  // Sync to Backend Server API in background
  try {
    fetch('/api/user/sync', {
      method: 'POST',
      headers: getAuthHeadersForUser(userRecord.uid, userRecord.email),
      body: JSON.stringify({ user: userRecord }),
    }).catch((serverErr) => {
      console.warn('Backend server user sync notice:', serverErr);
    });
  } catch {}

  // Sync to Firestore in background if available
  try {
    if (firestore) {
      const userRef = doc(firestore, 'users', assignedUid);
      setDoc(userRef, {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL || null,
        authProvider: userRecord.authProvider,
        role: userRecord.role,
        createdAt: userRecord.createdAt,
        lastLogin: userRecord.lastLogin,
        planTier: userRecord.planTier,
        planExpirationDate: userRecord.planExpirationDate || null,
        credits: userRecord.credits,
        maxDailyCredits: userRecord.maxDailyCredits,
        isAdmin: userRecord.isAdmin,
        customSettings: userRecord.customSettings,
      }, { merge: true }).catch(() => {});
    }
  } catch {}

  // Ensure workspace exists
  await initUserWorkspace(userRecord.uid);

  return userRecord;
}

/**
 * Updates user profile details (displayName, photoURL) and syncs with backend server
 */
export function updateUserProfileData(userId: string, data: { displayName?: string; photoURL?: string }): User | null {
  const users = getAllUsersMap();
  let targetKey = userId;
  let user = users[userId];

  if (!user) {
    for (const key in users) {
      if (users[key].uid === userId || users[key].email.toLowerCase() === userId.toLowerCase()) {
        targetKey = key;
        user = users[key];
        break;
      }
    }
  }

  if (!user) return null;

  if (data.displayName !== undefined && data.displayName.trim()) {
    user.displayName = data.displayName.trim();
  }
  if (data.photoURL !== undefined) {
    user.photoURL = data.photoURL;
  }

  users[targetKey] = user;
  saveAllUsersMap(users);
  syncActiveSessionStorage(user);

  // Sync profile changes to backend server
  try {
    fetch('/api/user/profile', {
      method: 'POST',
      headers: getAuthHeadersForUser(user.uid, user.email),
      body: JSON.stringify({
        displayName: user.displayName,
        photoURL: user.photoURL,
      }),
    }).catch((err) => {
      console.warn('Server profile sync notice:', err);
    });
  } catch {}

  // Sync to Firestore in background
  try {
    if (firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL || null,
      }, { merge: true }).catch(() => {});
    }
  } catch {}

  return user;
}

/**
 * Deducts credit based on selected model:
 * - Nova Core 2.1: 2 credits
 * - Omniscient 3.0: 6 credits
 * - Max 4.5: 12 credits
 */
export function deductUserCredit(
  userId: string, 
  modelId: KodiModelId = 'nova-core-2.1'
): { success: boolean; remainingCredits: number; cost: number; user: User | null } {
  const users = getAllUsersMap();
  let targetKey = userId;
  let rawUser = users[userId];

  if (!rawUser) {
    for (const key in users) {
      if (users[key].uid === userId) {
        targetKey = key;
        rawUser = users[key];
        break;
      }
    }
  }

  if (!rawUser) return { success: false, remainingCredits: 0, cost: 0, user: null };

  const user = normalizeUserCredits(rawUser);
  const cost = MODEL_CREDIT_COSTS[modelId] || 2;

  // VIP / Admin with unlimited credits (-1)
  if (user.isAdmin || user.credits === -1) {
    user.totalSpentCredits = (user.totalSpentCredits || 0) + cost;
    users[targetKey] = user;
    saveAllUsersMap(users);
    return { success: true, remainingCredits: typeof user.credits === 'number' ? user.credits : 2500, cost, user };
  }

  // Not enough credits
  if (user.credits < cost) {
    return { success: false, remainingCredits: user.credits, cost, user };
  }

  user.credits = Math.max(0, user.credits - cost);
  user.totalSpentCredits = (user.totalSpentCredits || 0) + cost;
  users[targetKey] = user;
  saveAllUsersMap(users);

  return { success: true, remainingCredits: user.credits, cost, user };
}

/**
 * Upgrades a user's plan after verifying BEP20 Hash
 */
export function upgradeUserPlan(
  userId: string,
  newPlan: PlanTier,
  txHash: string
): { success: boolean; message: string; user: User | null } {
  // Validate hash format (64-66 hex chars standard EVM/BSC tx hash)
  const cleanHash = txHash.trim();
  const hexRegex = /^0x[a-fA-F0-9]{64}$/;
  
  if (!hexRegex.test(cleanHash)) {
    return {
      success: false,
      message: 'Hash de transacción inválido. Debe ser una transacción BEP20 válida que comience con 0x y tenga 66 caracteres.',
      user: null
    };
  }

  const users = getAllUsersMap();
  let targetKey = userId;
  let user = users[userId];

  if (!user) {
    for (const key in users) {
      if (users[key].uid === userId) {
        targetKey = key;
        user = users[key];
        break;
      }
    }
  }

  if (!user) {
    return { success: false, message: 'Usuario no encontrado.', user: null };
  }

  user.planTier = newPlan;
  
  // Set 30 days subscription expiration date (1 month duration)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  user.planExpirationDate = expirationDate.toISOString();

  if (newPlan === 'max') {
    user.credits = 2500;
    user.maxDailyCredits = 2500;
  } else if (newPlan === 'pro') {
    user.credits = 300;
    user.maxDailyCredits = 300;
  }

  users[targetKey] = user;
  saveAllUsersMap(users);
  syncActiveSessionStorage(user);

  // Sync plan upgrade to backend server
  try {
    fetch('/api/user/profile', {
      method: 'POST',
      headers: getAuthHeadersForUser(user.uid, user.email),
      body: JSON.stringify({
        planTier: user.planTier,
        planExpirationDate: user.planExpirationDate,
        credits: user.credits,
        maxDailyCredits: user.maxDailyCredits,
      }),
    }).catch((err) => {
      console.warn('Server plan sync notice:', err);
    });
  } catch {}

  // Sync to Firestore in background
  try {
    if (firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        planTier: user.planTier,
        planExpirationDate: user.planExpirationDate || null,
        credits: user.credits,
        maxDailyCredits: user.maxDailyCredits,
      }, { merge: true }).catch(() => {});
    }
  } catch {}

  const successMsg = newPlan === 'max'
    ? '¡Plan KODI Max Engineering 4.5 activado con éxito! Se han liberado ambos modelos de IA (Max Engineering 4.5 + Omniscient 3.0), 2,500 créditos diarios y todas las funciones por 30 días (1 mes).'
    : '¡Plan KODI Omniscient 3.0 activado exitosamente con 300 créditos diarios por 30 días (1 mes)!';

  return {
    success: true,
    message: successMsg,
    user
  };
}

/**
 * Directly switches a user's active plan (Used by Admin or instant tier select)
 */
export function setUserPlanDirectly(userId: string, newPlan: PlanTier): { success: boolean; user: User | null } {
  const users = getAllUsersMap();
  let targetKey = userId;
  let user = users[userId];

  if (!user) {
    for (const key in users) {
      if (users[key].uid === userId) {
        targetKey = key;
        user = users[key];
        break;
      }
    }
  }

  if (!user) return { success: false, user: null };

  user.planTier = newPlan;
  const isAdmin = isUserAdmin(user.email);

  if (newPlan === 'max') {
    user.credits = 2500;
    user.maxDailyCredits = 2500;
  } else if (newPlan === 'pro') {
    user.credits = 300;
    user.maxDailyCredits = 300;
  } else {
    user.credits = 50;
    user.maxDailyCredits = 50;
  }

  if (!isAdmin) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    user.planExpirationDate = newPlan === 'free' ? undefined : expirationDate.toISOString();
  } else {
    user.planExpirationDate = undefined;
  }

  users[targetKey] = user;
  saveAllUsersMap(users);
  syncActiveSessionStorage(user);

  // Sync to backend server
  try {
    fetch('/api/user/profile', {
      method: 'POST',
      headers: getAuthHeadersForUser(user.uid, user.email),
      body: JSON.stringify({
        planTier: user.planTier,
        planExpirationDate: user.planExpirationDate,
        credits: user.credits,
        maxDailyCredits: user.maxDailyCredits,
      }),
    }).catch((err) => {
      console.warn('Server plan sync notice:', err);
    });
  } catch {}

  // Sync to Firestore
  try {
    if (firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        planTier: user.planTier,
        planExpirationDate: user.planExpirationDate || null,
        credits: user.credits,
        maxDailyCredits: user.maxDailyCredits,
      }, { merge: true }).catch(() => {});
    }
  } catch {}

  return { success: true, user };
}

/**
 * Updates custom settings for a user and syncs with server
 */
export function updateUserCustomSettings(userId: string, settings: Partial<UserCustomSettings>): User | null {
  const users = getAllUsersMap();
  let targetKey = userId;
  let user = users[userId];

  if (!user) {
    for (const key in users) {
      if (users[key].uid === userId) {
        targetKey = key;
        user = users[key];
        break;
      }
    }
  }

  if (!user) return null;

  user.customSettings = {
    ...user.customSettings,
    ...settings,
  };
  users[targetKey] = user;
  saveAllUsersMap(users);
  syncActiveSessionStorage(user);

  // Sync settings to server backend
  try {
    fetch('/api/user/profile', {
      method: 'POST',
      headers: getAuthHeadersForUser(user.uid, user.email),
      body: JSON.stringify({
        customSettings: user.customSettings,
      }),
    }).catch((err) => {
      console.warn('Server settings sync notice:', err);
    });
  } catch {}

  // Sync to Firestore
  try {
    if (firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, {
        customSettings: user.customSettings,
      }, { merge: true }).catch(() => {});
    }
  } catch {}

  return user;
}

/**
 * Filters and sanitizes AI placeholder messages from persistent storage
 * without destroying in-flight active generations.
 */
export function cleanEmptyAiMessages(chats: ChatSession[], preserveStreaming: boolean = false): ChatSession[] {
  if (!Array.isArray(chats)) return [];
  return chats.map((session) => ({
    ...session,
    messages: (session.messages || []).filter((msg) => {
      if (msg && msg.sender === 'kodi' && (!msg.text || msg.text.trim() === '')) {
        // If actively streaming or instructed to preserve in-flight message, keep it!
        if (preserveStreaming || msg.isStreaming) {
          return true;
        }
        // If it's a completely orphaned empty message with no retry capability, clean it up
        return false;
      }
      return true;
    }).map((msg) => {
      // When loading saved chats from disk/cloud after the app was closed,
      // ensure stale messages are not left in an eternal 'isStreaming: true' state
      if (!preserveStreaming && msg.sender === 'kodi' && msg.isStreaming) {
        return {
          ...msg,
          isStreaming: false,
        };
      }
      return msg;
    }),
  }));
}

/**
 * Robustly merges multiple chat sources (local, server, cloud) by ID, preserving the latest and most complete messages
 */
export function mergeChatSessions(primary: ChatSession[], secondary: ChatSession[]): ChatSession[] {
  const map = new Map<string, ChatSession>();

  const list = [...(secondary || []), ...(primary || [])];
  for (const session of list) {
    if (!session || !session.id) continue;
    const existing = map.get(session.id);
    if (!existing) {
      map.set(session.id, session);
    } else {
      const existingMsgs = (existing.messages || []).length;
      const currentMsgs = (session.messages || []).length;
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const currentTime = new Date(session.updatedAt || session.createdAt || 0).getTime();

      if (currentMsgs > existingMsgs || (currentMsgs === existingMsgs && currentTime >= existingTime)) {
        map.set(session.id, session);
      }
    }
  }

  return cleanEmptyAiMessages(Array.from(map.values())).sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Gets all chats for a specific user (from local storage for instant render)
 */
export function getUserChats(userId: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(`${DB_CHATS_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return cleanEmptyAiMessages(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.error('Error reading user chats:', err);
    return [];
  }
}

/**
 * Loads chats from Backend Server & Firestore Cloud Database with seamless fallback to local
 */
export async function loadUserChatsFromCloud(userId: string): Promise<ChatSession[]> {
  const localChats = getUserChats(userId);
  if (!userId) return localChats;

  let combinedChats = localChats;

  // 1. Try Backend Server API first
  try {
    const res = await fetch('/api/user/chats', {
      headers: getAuthHeadersForUser(userId),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.chats) && data.chats.length > 0) {
        combinedChats = mergeChatSessions(combinedChats, data.chats);
        localStorage.setItem(`${DB_CHATS_PREFIX}${userId}`, JSON.stringify(combinedChats));
      }
    }
  } catch (err) {
    console.warn('Backend server chats sync notice (fallback to Firestore/cache):', err);
  }

  // 2. Try Firestore Cloud Database with quick timeout guard
  try {
    if (firestore) {
      const chatDocRef = doc(firestore, 'kodi_user_chats', userId);
      const snapPromise = getDoc(chatDocRef).catch(() => null);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
      const snap = await Promise.race([snapPromise, timeoutPromise]);
      
      if (snap && typeof snap.exists === 'function' && snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.chats) && data.chats.length > 0) {
          combinedChats = mergeChatSessions(combinedChats, data.chats);
          localStorage.setItem(`${DB_CHATS_PREFIX}${userId}`, JSON.stringify(combinedChats));
          // Sync merged back to server backend as well
          fetch('/api/user/chats', {
            method: 'POST',
            headers: getAuthHeadersForUser(userId),
            body: JSON.stringify({ chats: combinedChats }),
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    // Graceful silent fallback to local storage
  }

  return combinedChats;
}

/**
 * Saves all chats for a specific user locally, to Backend Server, AND to Firestore
 */
export function saveUserChats(userId: string, chats: ChatSession[]): void {
  if (!userId || !Array.isArray(chats)) return;

  const cleaned = cleanEmptyAiMessages(chats, true);

  // 1. Instant local persistence
  try {
    localStorage.setItem(`${DB_CHATS_PREFIX}${userId}`, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Error saving user chats locally:', err);
  }

  // Sanitize circular references or non-serializable properties
  let sanitizedChats: any[] = [];
  try {
    sanitizedChats = JSON.parse(JSON.stringify(cleaned));
  } catch {
    sanitizedChats = cleaned;
  }

  // 2. Backend Server persistence
  try {
    fetch('/api/user/chats', {
      method: 'POST',
      headers: getAuthHeadersForUser(userId),
      body: JSON.stringify({ chats: sanitizedChats }),
    }).catch((err) => {
      console.warn('Server chat sync notice:', err);
    });
  } catch (err) {
    console.warn('Could not dispatch server chat sync:', err);
  }

  // 3. Cloud Database Persistence to Firestore in background
  try {
    if (firestore) {
      const chatDocRef = doc(firestore, 'kodi_user_chats', userId);
      setDoc(
        chatDocRef,
        {
          userId,
          chats: sanitizedChats,
          updatedAt: new Date().toISOString(),
          deviceInfo: navigator.userAgent || 'web-client',
        },
        { merge: true }
      ).catch(() => {});
    }
  } catch {}
}

/**
 * Initializes a unique workspace for the user if it doesn't exist
 */
export async function initUserWorkspace(userId: string): Promise<UserWorkspace> {
  try {
    const raw = localStorage.getItem(DB_WORKSPACES_KEY);
    const workspaces: Record<string, UserWorkspace> = raw ? JSON.parse(raw) : {};

    if (!workspaces[userId]) {
      workspaces[userId] = {
        userId,
        projectsCount: 1,
        recentTasks: [
          {
            id: 'task-1',
            title: 'KODI Autonomous Engine Initialized',
            status: 'completed',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        geminiModel: 'Gemini 2.5 Pro (Autonomous Coding Core)',
        autonomousMode: true,
        apiTokensUsed: 0
      };
      localStorage.setItem(DB_WORKSPACES_KEY, JSON.stringify(workspaces));
    }

    return workspaces[userId];
  } catch (err) {
    console.error('Error initializing workspace:', err);
    return {
      userId,
      projectsCount: 1,
      recentTasks: [],
      geminiModel: 'Gemini 2.5 Pro',
      autonomousMode: true,
      apiTokensUsed: 0
    };
  }
}
