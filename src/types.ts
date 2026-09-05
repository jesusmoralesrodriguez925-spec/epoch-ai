export type KodiModelId = 'nova-core-2.1' | 'omniscient-3.0' | 'max-4.5';
export type PlanTier = 'free' | 'pro' | 'max';

export interface KodiModelInfo {
  id: KodiModelId;
  name: string;
  version: string;
  tagline: string;
  badge?: string;
  isPaid: boolean;
  creditCost: number; // 2 for Nova Core, 6 for Omniscient, 12 for Max Engineering
  description: string;
  speed: string;
  intelligence: string;
}

export interface UserCustomSettings {
  theme?: 'dark' | 'light' | 'midnight';
  autoReasoning?: boolean;
  defaultModel?: KodiModelId;
  systemPromptPreset?: string;
}

export interface User {
  uid: string; // Full unique ID (e.g., KODI-USR-8821 or personal UID)
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  authProvider: 'google' | 'password';
  workspaceId: string;
  isAdmin?: boolean;
  planTier: PlanTier; // 'free' | 'pro' | 'max'
  planExpirationDate?: string; // ISO date string when paid plan expires (30 days from purchase)
  credits: number; // 50 daily for standard, 300 for pro, -1 for unlimited VIP / max
  maxDailyCredits: number; // 50 for free, 300 for pro, -1 for max/admin
  totalSpentCredits: number; // Total credits spent today
  lastCreditResetDate: string; // YYYY-MM-DD
  customSettings?: UserCustomSettings;
  // Legal Compliance & GDPR Fields
  consentPrivacyPolicy?: boolean;
  consentPrivacyPolicyDate?: string;
  consentTermsOfService?: boolean;
  consentTermsOfServiceDate?: string;
  consentAiUsage?: boolean;
  consentAiUsageDate?: string;
  consentDataSharing?: boolean;
  consentDataSharingDate?: string;
  consentThirdPartyAi?: boolean;
  consentThirdPartyAiDate?: string;
  ipAddressOnConsent?: string;
  dataDeleteRequestedAt?: string | null;
  dataDeleteScheduledFor?: string | null;
  dataDeletedAt?: string | null;
  deletionConfirmationCode?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url?: string;
  size?: string;
  mimeType?: string;
  data?: string;
}

export interface CodePerformanceStats {
  durationMs: number;
  ramMb: number;
  cpuScore?: string;
  status: 'optimal' | 'moderate' | 'heavy' | 'error';
  testedLanguage?: string;
  outputPreview?: string;
  executedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kodi';
  text: string;
  timestamp: string;
  modelId?: KodiModelId;
  modelName?: string;
  reasoning?: string;
  isReasoningOpen?: boolean;
  isStreaming?: boolean;
  attachments?: ChatAttachment[];
  verifiedByTavily?: boolean;
  codePerformance?: CodePerformanceStats;
  libraryAudit?: {
    isVerified: boolean;
    checkedLibraries?: string[];
    timestamp?: string;
    details?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  messages: ChatMessage[];
}

export interface UserWorkspace {
  userId: string;
  projectsCount: number;
  recentTasks: {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'queued';
    timestamp: string;
  }[];
  geminiModel: string;
  autonomousMode: boolean;
  apiTokensUsed: number;
}

export interface WorkspaceFileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
}

