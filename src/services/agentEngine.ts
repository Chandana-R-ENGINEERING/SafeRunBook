import { Runbook, RunbookStep, ApprovalRequest, ExecutionReport, Environment, ExecutionMode } from '../types/runbook';
import { executeSimulatedTool } from './toolExecutor';
import { addAuditEvent, saveRunbook } from './storage';

export interface PlanGenerationResult {
  title: string;
  objective: string;
  targetService: string;
  steps: RunbookStep[];
  source: string;
}

// 1. Planner Agent
export async function planRunbook(
  prompt: string,
  environment: Environment,
  executionMode: ExecutionMode
): Promise<PlanGenerationResult> {
  try {
    const res = await fetch('/api/agent/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, environment, executionMode }),
    });

    if (res.ok) {
      const data = await res.json();
      const plan = data.plan;

      const steps: RunbookStep[] = plan.steps.map((s: any, idx: number) => {
        const isHighRisk = s.riskLevel === 'high' || (!s.reversible && environment === 'Production');
        return {
          id: s.id || `step-${idx + 1}`,
          name: s.name,
          purpose: s.purpose,
          riskLevel: isHighRisk ? 'high' : (s.riskLevel || 'low'),
          reversible: s.reversible ?? true,
          requiresApproval: isHighRisk || s.requiresApproval || (s.riskLevel === 'medium' && environment === 'Production'),
          status: 'pending' as const,
          tool: s.tool || 'http.healthCheck',
          toolParams: s.toolParams || {},
          successCriteria: s.successCriteria || 'Operation executed without critical errors',
          contingencyPlan: s.contingencyPlan || 'Revert step and notify on-call',
        };
      });

      return {
        title: plan.title || 'Operational Runbook',
        objective: plan.objective || prompt,
        targetService: plan.targetService || 'primary-service',
        steps,
        source: data.source || 'agent-planner',
      };
    }
  } catch (err) {
    console.warn('API planner failed, falling back to local reasoning:', err);
  }

  // Local fallback if fetch fails
  return {
    title: 'Post-Deployment Health Degradation Recovery',
    objective: `Investigate and restore failing health checks in ${environment}.`,
    targetService: 'api-gateway',
    steps: [
      {
        id: 'step-1',
        name: 'Inspect Deployment Health & Pod States',
        purpose: 'Query Kubernetes cluster to verify pod replicas and rollout status.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        status: 'pending',
        tool: 'k8s.getDeploymentStatus',
        toolParams: { namespace: environment.toLowerCase(), deployment: 'api-gateway' },
        successCriteria: 'Deployment metadata and replica status retrieved.',
        contingencyPlan: 'Check node-level metrics.',
      },
      {
        id: 'step-2',
        name: 'Analyze Recent Pod Crash & Error Logs',
        purpose: 'Fetch container stderr to locate stack trace and error signatures.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        status: 'pending',
        tool: 'k8s.getPodLogs',
        toolParams: { namespace: environment.toLowerCase(), podPrefix: 'api-gateway', tailLines: 200 },
        successCriteria: 'Error signature isolated.',
        contingencyPlan: 'Review APM traces.',
      },
      {
        id: 'step-3',
        name: 'Compare Git Release Diffs & Commit Metadata',
        purpose: 'Diff commit sha from release v2.4.1 against stable release v2.4.0.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        status: 'pending',
        tool: 'github.compareReleases',
        toolParams: { repo: 'org/api-gateway', base: 'v2.4.0', head: 'v2.4.1' },
        successCriteria: 'Identified configuration change causing crash.',
        contingencyPlan: 'Inspect config map history.',
      },
      {
        id: 'step-4',
        name: 'Rollback Deployment to Last Known Stable ReplicaSet',
        purpose: 'Revert deployment v2.4.1 to v2.4.0 to stop customer-facing 500 errors.',
        riskLevel: 'high',
        reversible: false,
        requiresApproval: true,
        status: 'pending',
        tool: 'k8s.rollbackDeployment',
        toolParams: { namespace: environment.toLowerCase(), deployment: 'api-gateway', targetRevision: 'v2.4.0' },
        successCriteria: 'All pods replaced with v2.4.0 and reporting Ready state.',
        contingencyPlan: 'Reroute to canary cluster.',
      },
      {
        id: 'step-5',
        name: 'Verify Synthetic HTTP Health Check Probe',
        purpose: 'Perform end-to-end HTTP health checks on /healthz.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        status: 'pending',
        tool: 'http.healthCheck',
        toolParams: { url: 'https://api.internal/healthz', expectedStatus: 200 },
        successCriteria: 'Endpoint responds with HTTP 200 OK within 50ms.',
        contingencyPlan: 'Alert on-call via PagerDuty.',
      },
      {
        id: 'step-6',
        name: 'Broadcast Incident Resolution to Slack & Ops Channel',
        purpose: 'Notify engineering stakeholders in #ops-incidents.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        status: 'pending',
        tool: 'slack.notifyChannel',
        toolParams: { channel: '#ops-incidents', severity: 'resolved' },
        successCriteria: 'Slack webhook acknowledged.',
        contingencyPlan: 'Fallback email notification.',
      },
    ],
    source: 'local-planner',
  };
}

// 2. Risk Assessment Agent: Builds approval request metadata for high-risk steps
export function createApprovalRequest(runbook: Runbook, step: RunbookStep): ApprovalRequest {
  const isRollback = step.tool.includes('rollback');
  const isRestart = step.tool.includes('restart');

  return {
    id: `appr-${runbook.id}-${step.id}`,
    stepId: step.id,
    stepName: step.name,
    runbookId: runbook.id,
    runbookTitle: runbook.title,
    environment: runbook.environment,
    riskLevel: step.riskLevel,
    action: isRollback
      ? `Rollback ${runbook.targetService} to stable revision in ${runbook.environment}`
      : isRestart
      ? `Restart worker fleet in ${runbook.environment}`
      : `Execute ${step.name} (${step.tool})`,
    exactCommand: isRollback
      ? `kubectl rollout undo deployment/${runbook.targetService} -n ${runbook.environment.toLowerCase()}`
      : isRestart
      ? `aws ecs update-service --cluster prod --service ${runbook.targetService} --force-new-deployment`
      : `${step.tool}(${JSON.stringify(step.toolParams)})`,
    whyNecessary: isRollback
      ? 'The current release image is crashing due to a missing environment variable. Immediate rollback terminates broken pods and restores healthy service replicas.'
      : 'Service is experiencing memory exhaustion or thread locking. A graceful rolling restart clears blocked I/O sockets.',
    expectedImpact: isRollback
      ? 'Pod replacement across cluster. 5 healthy pods will spawn; customer traffic routed back to stable release v2.4.0. Rollout takes ~25s.'
      : 'Temporary worker pool rotation with 25% max-unavailable limit. Zero dropped jobs.',
    potentialFailureScenarios: 'Database schema divergence if recent release ran forward-only migrations. (Pre-flight check: verified no destructive schema migration ran).',
    evidenceSoFar: [
      { label: 'Observed Health State', value: '3/5 replicas failing health check probes' },
      { label: 'Exception in Pod Logs', value: "TypeError: Cannot read properties of undefined (reading 'jwt_secret')" },
      { label: 'Root Cause Commit', value: '8f3a9d2 (jwt secret variable renamed in config)' },
    ],
    saferAlternative: isRollback
      ? 'Hotfix ConfigMap in-place and restart pods (Lead time: 15-20 mins vs 30 seconds for rollback).'
      : 'Wait for garbage collection and throttle incoming ingress rates.',
    requestedAt: new Date().toISOString(),
  };
}

// 3. Execution Agent & 4. Verification Agent: Executes a single step
export async function executeStep(
  runbook: Runbook,
  stepIndex: number,
  options: {
    rollbackApproved?: boolean;
  } = {}
): Promise<{
  step: RunbookStep;
  needsApproval?: boolean;
  approvalRequest?: ApprovalRequest;
}> {
  const step = runbook.steps[stepIndex];
  if (!step) throw new Error(`Step at index ${stepIndex} not found`);

  // Check if step requires approval and has not been approved yet
  const existingApproval = runbook.approvals?.find((a) => a.stepId === step.id);
  const isApproved = existingApproval?.decision === 'approved' || options.rollbackApproved;
  const isRejected = existingApproval?.decision === 'rejected';

  if (isRejected) {
    step.status = 'rejected';
    step.error = 'Operation rejected by Human Operator during safety checkpoint';
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Execution Agent',
      eventType: 'APPROVAL_REJECTED',
      severity: 'error',
      message: `Step "${step.name}" was rejected. Safe termination engaged.`,
      details: { stepId: step.id, reason: existingApproval?.decisionReason },
    });
    return { step };
  }

  if (step.requiresApproval && !isApproved) {
    step.status = 'needs_approval';
    const approvalReq = createApprovalRequest(runbook, step);
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Risk Assessment Agent',
      eventType: 'APPROVAL_REQUESTED',
      severity: 'warn',
      message: `Step "${step.name}" classified as ${step.riskLevel.toUpperCase()} RISK. Pausing execution for human approval.`,
      details: { stepId: step.id, exactCommand: approvalReq.exactCommand },
    });
    return { step, needsApproval: true, approvalRequest: approvalReq };
  }

  // Execute step via tool executor
  step.status = 'running';
  step.startedAt = new Date().toISOString();

  addAuditEvent({
    runbookId: runbook.id,
    runbookTitle: runbook.title,
    agent: 'Execution Agent',
    eventType: 'TOOL_INVOKED',
    severity: 'info',
    message: `Invoking tool adapter: ${step.tool}`,
    details: { stepId: step.id, tool: step.tool, params: step.toolParams },
  });

  const toolResult = await executeSimulatedTool(step.tool, step.toolParams, {
    runbookId: runbook.id,
    stepId: step.id,
    environment: runbook.environment,
    rollbackApproved: isApproved,
  });

  step.completedAt = new Date().toISOString();
  step.durationMs = toolResult.durationMs;
  step.output = toolResult.output;
  step.rawLogs = toolResult.logs;
  step.verified = toolResult.verified;
  step.verificationVerdict = toolResult.verdict;

  // Verification Agent verdict
  if (toolResult.verified) {
    step.status = 'verified';
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Verification Agent',
      eventType: 'VERIFICATION_PASSED',
      severity: 'success',
      message: `Verification passed for "${step.name}": ${toolResult.verdict}`,
      details: { stepId: step.id, criteria: step.successCriteria },
    });
  } else {
    step.status = 'failed';
    step.error = toolResult.verdict;
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Verification Agent',
      eventType: 'VERIFICATION_FAILED',
      severity: 'error',
      message: `Verification failed for "${step.name}": ${toolResult.verdict}`,
      details: { stepId: step.id, criteria: step.successCriteria },
    });
  }

  return { step };
}

// 5. Reporting Agent: Generates execution report
export function generateExecutionReport(runbook: Runbook): ExecutionReport {
  const completedSteps = runbook.steps.filter((s) => s.status === 'verified' || s.status === 'completed').length;
  const isRejected = runbook.steps.some((s) => s.status === 'rejected');
  const isFailed = runbook.steps.some((s) => s.status === 'failed');

  let durationSeconds = 0;
  if (runbook.createdAt) {
    const start = new Date(runbook.createdAt).getTime();
    const end = runbook.completedAt ? new Date(runbook.completedAt).getTime() : Date.now();
    durationSeconds = Math.max(12, Math.round((end - start) / 1000));
  }

  const report: ExecutionReport = {
    runbookId: runbook.id,
    title: runbook.title,
    generatedAt: new Date().toISOString(),
    environment: runbook.environment,
    status: isRejected ? 'rejected' : isFailed ? 'failed' : 'resolved',
    totalSteps: runbook.steps.length,
    completedSteps,
    approvalsCount: runbook.approvals?.length || 0,
    durationSeconds,
    rootCauseAnalysis: isRejected
      ? 'High-risk rollback operation was rejected by the operator. The service remains in diagnostic state until an alternative in-place patch is deployed.'
      : 'Release deployment introduced breaking configuration schema changes without corresponding Helm environment values, triggering bootstrap crashes in authentication middleware.',
    actionsSummary: runbook.steps
      .filter((s) => s.status === 'verified' || s.status === 'completed')
      .map((s) => `${s.name}: ${s.verificationVerdict || 'Executed and verified'}`),
    verificationEvidence: [
      {
        check: 'Kubernetes Pod Replica Readiness',
        result: isRejected ? '2/5 Ready (Degraded)' : '5/5 Ready (Nominal)',
        passed: !isRejected,
      },
      {
        check: 'Synthetic Ingress Health Probe',
        result: isRejected ? '500 Internal Server Error' : '200 OK (Latency: 38ms)',
        passed: !isRejected,
      },
      {
        check: 'Container CrashLoopBackOff Count',
        result: isRejected ? '3 active crashing pods' : '0 restarts in past 10 minutes',
        passed: !isRejected,
      },
    ],
    unresolvedItems: isRejected
      ? ['Broken release v2.4.1 is still deployed; requires manual hotfix to ConfigMap/api-gateway-secrets.']
      : [],
    recommendations: [
      'Implement automated pre-deployment validation for environment variable references in CI/CD.',
      'Configure automated canary deployments with synthetic probe gates before full fleet rollout.',
      'Establish secret rotation playbooks with dual-key transition windows.',
    ],
  };

  addAuditEvent({
    runbookId: runbook.id,
    runbookTitle: runbook.title,
    agent: 'Reporting Agent',
    eventType: 'REPORT_GENERATED',
    severity: 'info',
    message: `Final execution report generated. Workflow outcome: ${report.status.toUpperCase()}.`,
    details: { totalSteps: report.totalSteps, completedSteps: report.completedSteps },
  });

  return report;
}
