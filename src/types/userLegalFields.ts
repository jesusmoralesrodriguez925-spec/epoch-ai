/**
 * KODI AI STUDIO - USER LEGAL & COMPLIANCE DATA MODEL
 * GDPR, CCPA, EU AI ACT & FTC Compliance fields
 */

export interface UserLegalConsent {
  consentPrivacyPolicy: boolean;
  consentPrivacyPolicyDate?: string; // ISO 8601 Timestamp
  consentTermsOfService: boolean;
  consentTermsOfServiceDate?: string; // ISO 8601 Timestamp
  consentAiUsage: boolean;
  consentAiUsageDate?: string; // ISO 8601 Timestamp
  consentDataSharing: boolean;
  consentDataSharingDate?: string; // ISO 8601 Timestamp
  consentThirdPartyAi: boolean;
  consentThirdPartyAiDate?: string; // ISO 8601 Timestamp
  ipAddressOnConsent?: string; // Stored for legal proof and audit trails
  consentVersion?: string; // e.g. "6.4.0"
}

export interface UserDataDeletionState {
  dataDeleteRequestedAt?: string | null; // ISO 8601 Timestamp or null
  dataDeleteScheduledFor?: string | null; // Request timestamp + 48 hours
  dataDeletedAt?: string | null; // Final deletion timestamp
  deletionConfirmationCode?: string | null;
  deletionReason?: string;
}

export interface LegalAuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'DATA_EXPORTED' | 'DELETION_REQUESTED' | 'DELETION_CANCELLED' | 'DELETION_COMPLETED';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
