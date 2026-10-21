export type RiskLevel = 'low' | 'medium' | 'high';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'needs_approval'
  | 'blocked'
  | 'failed'
  | 'verified'
  | 'rejected';

export type Environment = 'Development' | 'Staging' | 'Production';

export type ExecutionMode = 'simulation' | 'connected';

export interface RunbookStep {
  id: string;
  name: string;
  purpose: string;
  riskLevel: RiskLevel;
  reversible: boolean;
  requiresApproval: boolean;
  status: StepStatus;
  tool: string;
  toolParams: Record<string, any>;
  successCriteria: string;
  contingencyPlan: string;
  output?: Record<string, any>;
  rawLogs?: string[];
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  verificationVerdict?: string;
  verified?: boolean;
  error?: string;
}

export interface ApprovalRequest {
  id: string;
  stepId: string;
  stepName: string;
  runbookId: string;
  runbookTitle: string;
  environment: Environment;
  riskLevel: RiskLevel;
  action: string;
  exactCommand: string;
  whyNecessary: string;
  expectedImpact: string;
  potentialFailureScenarios: string;
  evidenceSoFar: Array<{ label: string; value: string }>;
  saferAlternative?: string;
  requestedAt: string;
  decision?: 'approved' | 'rejected';
  decisionReason?: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface ExecutionReport {
  runbookId: string;
  title: string;
  generatedAt: string;
  environment: Environment;
  status: 'resolved' | 'rejected' | 'failed' | 'in_progress';
  totalSteps: number;
  completedSteps: number;
  approvalsCount: number;
  durationSeconds: number;
  rootCauseAnalysis: string;
  actionsSummary: string[];
  verificationEvidence: Array<{ check: string; result: string; passed: boolean }>;
  unresolvedItems: string[];
  recommendations: string[];
}

export interface Runbook {
  id: string;
  title: string;
  objective: string;
  targetService: string;
  environment: Environment;
  executionMode: ExecutionMode;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'blocked';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  steps: RunbookStep[];
  currentStepIndex: number;
  approvals: ApprovalRequest[];
  finalReport?: ExecutionReport;
  isDemoScenario?: boolean;
}

export type AgentRole =
  | 'Planner Agent'
  | 'Risk Assessment Agent'
  | 'Execution Agent'
  | 'Verification Agent'
  | 'Reporting Agent'
  | 'Human Operator';

export type AuditSeverity = 'info' | 'warn' | 'error' | 'critical' | 'success';

export interface AuditEvent {
  id: string;
  timestamp: string;
  runbookId: string;
  runbookTitle: string;
  agent: AgentRole;
  eventType:
    | 'PLAN_CREATED'
    | 'STEP_STARTED'
    | 'TOOL_INVOKED'
    | 'STEP_COMPLETED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_GRANTED'
    | 'APPROVAL_REJECTED'
    | 'STEP_FAILED'
    | 'VERIFICATION_PASSED'
    | 'VERIFICATION_FAILED'
    | 'WORKFLOW_PAUSED'
    | 'WORKFLOW_RESUMED'
    | 'WORKFLOW_CANCELLED'
    | 'REPORT_GENERATED';
  severity: AuditSeverity;
  message: string;
  details?: Record<string, any>;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Observability' | 'Collaboration' | 'Version Control';
  status: 'connected' | 'demo' | 'disconnected';
  description: string;
  lastChecked: string;
  capabilities: string[];
  version?: string;
  authType: string;
}

export interface SafetySettings {
  autoExecuteLowRisk: boolean;
  requireApprovalMediumInProd: boolean;
  alwaysRequireApprovalHigh: boolean;
  maxAutonomousSteps: number;
  haltOnVerificationFailure: boolean;
  dryRunFirst: boolean;
  slackAlertsEnabled: boolean;
  strictEnvironmentGuards: boolean;
}
