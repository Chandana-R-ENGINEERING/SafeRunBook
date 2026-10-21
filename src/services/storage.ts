import { Runbook, AuditEvent, IntegrationItem, SafetySettings, ApprovalRequest } from '../types/runbook';
import { INITIAL_RUNBOOKS, INITIAL_AUDIT_LOGS, INITIAL_INTEGRATIONS, DEFAULT_SAFETY_SETTINGS } from './mockData';

const STORAGE_KEYS = {
  RUNBOOKS: 'saferunbook_runbooks',
  AUDIT_LOGS: 'saferunbook_audit_logs',
  INTEGRATIONS: 'saferunbook_integrations',
  SAFETY_SETTINGS: 'saferunbook_safety_settings',
  ACTIVE_RUNBOOK_ID: 'saferunbook_active_id',
};

export function getStoredRunbooks(): Runbook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUNBOOKS);
    if (!raw) {
      saveRunbooks(INITIAL_RUNBOOKS);
      return INITIAL_RUNBOOKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading runbooks from localStorage:', e);
    return INITIAL_RUNBOOKS;
  }
}

export function saveRunbooks(runbooks: Runbook[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RUNBOOKS, JSON.stringify(runbooks));
  } catch (e) {
    console.error('Failed saving runbooks to localStorage:', e);
  }
}

export function getRunbookById(id: string): Runbook | undefined {
  const runbooks = getStoredRunbooks();
  return runbooks.find((r) => r.id === id);
}

export function saveRunbook(runbook: Runbook): void {
  const runbooks = getStoredRunbooks();
  const index = runbooks.findIndex((r) => r.id === runbook.id);
  if (index >= 0) {
    runbooks[index] = { ...runbook, updatedAt: new Date().toISOString() };
  } else {
    runbooks.unshift({ ...runbook, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveRunbooks(runbooks);
}

export function deleteRunbook(id: string): void {
  const runbooks = getStoredRunbooks().filter((r) => r.id !== id);
  saveRunbooks(runbooks);
}

export function getStoredAuditLogs(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      saveAuditLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading audit logs from localStorage:', e);
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed saving audit logs to localStorage:', e);
  }
}

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const fullEvent: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const logs = getStoredAuditLogs();
  logs.unshift(fullEvent);
  saveAuditLogs(logs);
  return fullEvent;
}

export function getStoredIntegrations(): IntegrationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    if (!raw) {
      saveIntegrations(INITIAL_INTEGRATIONS);
      return INITIAL_INTEGRATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INTEGRATIONS;
  }
}

export function saveIntegrations(integrations: IntegrationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  } catch (e) {
    console.error('Failed saving integrations:', e);
  }
}

export function getStoredSafetySettings(): SafetySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_SETTINGS);
    if (!raw) {
      saveSafetySettings(DEFAULT_SAFETY_SETTINGS);
      return DEFAULT_SAFETY_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SAFETY_SETTINGS;
  }
}

export function saveSafetySettings(settings: SafetySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAFETY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed saving safety settings:', e);
  }
}

export function getPendingApprovals(): ApprovalRequest[] {
  const runbooks = getStoredRunbooks();
  const pending: ApprovalRequest[] = [];
  for (const rb of runbooks) {
    if (rb.approvals) {
      for (const appr of rb.approvals) {
        if (!appr.decision) {
          pending.push(appr);
        }
      }
    }
  }
  return pending;
}

export function resetDemoState(): void {
  localStorage.removeItem(STORAGE_KEYS.RUNBOOKS);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.INTEGRATIONS);
  localStorage.removeItem(STORAGE_KEYS.SAFETY_SETTINGS);
  saveRunbooks(INITIAL_RUNBOOKS);
  saveAuditLogs(INITIAL_AUDIT_LOGS);
  saveIntegrations(INITIAL_INTEGRATIONS);
  saveSafetySettings(DEFAULT_SAFETY_SETTINGS);
}
