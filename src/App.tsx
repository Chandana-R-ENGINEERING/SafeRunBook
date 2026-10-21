import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CreateRunbookPage } from './pages/CreateRunbookPage';
import { ExecutionWorkspacePage } from './pages/ExecutionWorkspacePage';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage';
import { RunbookLibraryPage } from './pages/RunbookLibraryPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { IntegrationsSettingsPage } from './pages/IntegrationsSettingsPage';
import { LandingPage } from './pages/LandingPage';
import { ExecutionReportModal } from './components/ExecutionReportModal';
import { Runbook, AuditEvent, IntegrationItem, SafetySettings, Environment } from './types/runbook';
import {
  getStoredRunbooks,
  saveRunbooks,
  saveRunbook,
  getStoredAuditLogs,
  saveAuditLogs,
  addAuditEvent,
  getStoredIntegrations,
  saveIntegrations,
  getStoredSafetySettings,
  saveSafetySettings,
  resetDemoState,
} from './services/storage';
import { RunbookTemplate } from './services/mockData';
import { planRunbook } from './services/agentEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>('Production');

  // Application state backed by LocalStorage
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [activeRunbookId, setActiveRunbookId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [safetySettings, setSafetySettings] = useState<SafetySettings>(getStoredSafetySettings());
  const [reportModalRunbook, setReportModalRunbook] = useState<Runbook | null>(null);

  // Initialize state
  useEffect(() => {
    const loadedRunbooks = getStoredRunbooks();
    const loadedAudit = getStoredAuditLogs();
    const loadedIntegrations = getStoredIntegrations();
    const loadedSettings = getStoredSafetySettings();

    setRunbooks(loadedRunbooks);
    setAuditLogs(loadedAudit);
    setIntegrations(loadedIntegrations);
    setSafetySettings(loadedSettings);

    if (loadedRunbooks.length > 0 && !activeRunbookId) {
      setActiveRunbookId(loadedRunbooks[0].id);
    }
  }, []);

  // Compute pending approvals across all runbooks
  const pendingApprovals = runbooks.flatMap((r) =>
    (r.approvals || []).filter((a) => !a.decision)
  );

  const activeRunbook = runbooks.find((r) => r.id === activeRunbookId) || runbooks[0] || null;

  // Update a runbook
  const handleUpdateRunbook = (updated: Runbook) => {
    saveRunbook(updated);
    setRunbooks((prev) => {
      const idx = prev.findIndex((r) => r.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    setAuditLogs(getStoredAuditLogs());
  };

  // Launch Featured Demo Scenario: "My application is unhealthy after a recent deployment. Investigate the problem and prepare a safe recovery plan."
  const handleLaunchDemo = () => {
    const demoRunbookId = `rb-demo-${Date.now().toString(36).slice(-4)}`;
    const newDemoRunbook: Runbook = {
      id: demoRunbookId,
      title: 'Post-Deployment Health Degradation Recovery (Featured Demo)',
      objective: 'Investigate failing health check probes on api-gateway following release v2.4.1, isolate root cause, and execute safe verified recovery.',
      targetService: 'api-gateway',
      environment: 'Production',
      executionMode: 'simulation',
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStepIndex: 0,
      isDemoScenario: true,
      steps: [
        {
          id: 'step-1',
          name: 'Inspect Deployment Health & Pod States',
          purpose: 'Query Kubernetes cluster to verify pod replicas, crashloop counts, and rollout status.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          status: 'pending',
          tool: 'k8s.getDeploymentStatus',
          toolParams: { namespace: 'production', deployment: 'api-gateway' },
          successCriteria: 'Deployment metadata and replica status successfully retrieved.',
          contingencyPlan: 'Fall back to node-level metrics if API server is rate-limited.',
        },
        {
          id: 'step-2',
          name: 'Analyze Recent Pod Crash & Error Logs',
          purpose: 'Fetch the last 200 lines of container stderr to locate stack trace and error signatures.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          status: 'pending',
          tool: 'k8s.getPodLogs',
          toolParams: { namespace: 'production', podPrefix: 'api-gateway', tailLines: 200 },
          successCriteria: 'Error signature isolated and matched to specific configuration or code failure.',
          contingencyPlan: 'Cross-reference with APM distributed trace spans.',
        },
        {
          id: 'step-3',
          name: 'Compare Git Release Diffs & Commit Metadata',
          purpose: 'Diff commit sha from release v2.4.1 against stable release v2.4.0 to identify faulty commit.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          status: 'pending',
          tool: 'github.compareReleases',
          toolParams: { repo: 'org/api-gateway', base: 'v2.4.0', head: 'v2.4.1' },
          successCriteria: 'Identified configuration change introducing unhandled JWT secret missing variable.',
          contingencyPlan: 'Inspect config map version history.',
        },
        {
          id: 'step-4',
          name: 'Rollback Deployment to Last Known Stable ReplicaSet',
          purpose: 'Revert deployment v2.4.1 back to v2.4.0 to stop customer-facing 500 errors and restore traffic.',
          riskLevel: 'high',
          reversible: false,
          requiresApproval: true,
          status: 'pending',
          tool: 'k8s.rollbackDeployment',
          toolParams: { namespace: 'production', deployment: 'api-gateway', targetRevision: 'v2.4.0' },
          successCriteria: 'All 5 pods replaced with v2.4.0 images and reporting Ready state.',
          contingencyPlan: 'If rollback fails, reroute ingress traffic to failover canary cluster.',
        },
        {
          id: 'step-5',
          name: 'Verify Synthetic HTTP Health Check Probe',
          purpose: 'Perform end-to-end HTTP health checks on /healthz and /api/v1/ping.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          status: 'pending',
          tool: 'http.healthCheck',
          toolParams: { url: 'https://api.internal/healthz', expectedStatus: 200, timeoutMs: 3000 },
          successCriteria: 'Endpoint responds with HTTP 200 OK within 50ms latency.',
          contingencyPlan: 'Alert on-call engineer via PagerDuty if verification fails.',
        },
        {
          id: 'step-6',
          name: 'Broadcast Incident Resolution to Slack & Ops Channel',
          purpose: 'Notify engineering stakeholders in #ops-incidents with remediation audit link.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          status: 'pending',
          tool: 'slack.notifyChannel',
          toolParams: { channel: '#ops-incidents', severity: 'resolved', title: 'api-gateway healthy' },
          successCriteria: 'Webhook acknowledged with 200 OK.',
          contingencyPlan: 'Post to fallback email distribution list.',
        },
      ],
      approvals: [],
    };

    saveRunbook(newDemoRunbook);

    addAuditEvent({
      runbookId: newDemoRunbook.id,
      runbookTitle: newDemoRunbook.title,
      agent: 'Planner Agent',
      eventType: 'PLAN_CREATED',
      severity: 'info',
      message: 'Started featured demonstration scenario for post-deployment health investigation.',
      details: { environment: 'Production', stepsCount: 6, targetService: 'api-gateway' },
    });

    setRunbooks((prev) => [newDemoRunbook, ...prev]);
    setActiveRunbookId(demoRunbookId);
    setAuditLogs(getStoredAuditLogs());
    setActiveTab('executions');
  };

  // Reset Demo State
  const handleResetDemo = () => {
    resetDemoState();
    const fresh = getStoredRunbooks();
    setRunbooks(fresh);
    setAuditLogs(getStoredAuditLogs());
    setIntegrations(getStoredIntegrations());
    setSafetySettings(getStoredSafetySettings());
    if (fresh.length > 0) {
      setActiveRunbookId(fresh[0].id);
    }
  };

  // Use Template action
  const handleUseTemplate = async (template: RunbookTemplate) => {
    const result = await planRunbook(template.prompt, template.defaultEnvironment, 'simulation');
    const newRunbook: Runbook = {
      id: `rb-tpl-${Date.now().toString(36).slice(-4)}`,
      title: result.title || template.title,
      objective: result.objective || template.description,
      targetService: result.targetService || 'core-service',
      environment: template.defaultEnvironment,
      executionMode: 'simulation',
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: result.steps,
      currentStepIndex: 0,
      approvals: [],
    };

    saveRunbook(newRunbook);

    addAuditEvent({
      runbookId: newRunbook.id,
      runbookTitle: newRunbook.title,
      agent: 'Planner Agent',
      eventType: 'PLAN_CREATED',
      severity: 'info',
      message: `Created runbook from template "${template.title}" in ${template.defaultEnvironment}`,
    });

    setRunbooks((prev) => [newRunbook, ...prev]);
    setActiveRunbookId(newRunbook.id);
    setAuditLogs(getStoredAuditLogs());
    setActiveTab('executions');
  };

  // Approve action from Approval Center
  const handleApproveAction = (requestId: string, reason: string) => {
    const targetRb = runbooks.find((r) => r.approvals?.some((a) => a.id === requestId));
    if (!targetRb) return;

    const updatedApprovals = (targetRb.approvals || []).map((appr) => {
      if (appr.id === requestId) {
        return {
          ...appr,
          decision: 'approved' as const,
          decisionReason: reason,
          decidedAt: new Date().toISOString(),
          decidedBy: 'Operator (ravigowrichandu@gmail.com)',
        };
      }
      return appr;
    });

    const updated: Runbook = {
      ...targetRb,
      status: 'running',
      approvals: updatedApprovals,
    };

    handleUpdateRunbook(updated);
    setActiveRunbookId(updated.id);
    setActiveTab('executions');
  };

  // Reject action from Approval Center
  const handleRejectAction = (requestId: string, reason: string) => {
    const targetRb = runbooks.find((r) => r.approvals?.some((a) => a.id === requestId));
    if (!targetRb) return;

    const targetAppr = targetRb.approvals?.find((a) => a.id === requestId);
    const updatedApprovals = (targetRb.approvals || []).map((appr) => {
      if (appr.id === requestId) {
        return {
          ...appr,
          decision: 'rejected' as const,
          decisionReason: reason,
          decidedAt: new Date().toISOString(),
          decidedBy: 'Operator (ravigowrichandu@gmail.com)',
        };
      }
      return appr;
    });

    const updatedSteps = [...targetRb.steps];
    if (targetAppr) {
      const stepIdx = updatedSteps.findIndex((s) => s.id === targetAppr.stepId);
      if (stepIdx >= 0) {
        updatedSteps[stepIdx].status = 'rejected';
        updatedSteps[stepIdx].error = `Operation rejected by Human Operator: "${reason}"`;
      }
    }

    const updated: Runbook = {
      ...targetRb,
      status: 'paused',
      steps: updatedSteps,
      approvals: updatedApprovals,
    };

    handleUpdateRunbook(updated);
    setActiveRunbookId(updated.id);
    setActiveTab('executions');
  };

  // If viewing the Landing Page
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onLaunchDashboard={() => setActiveTab('dashboard')}
        onExploreDemo={handleLaunchDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar following 3-Zone Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovals.length}
        onLaunchDemo={handleLaunchDemo}
      />

      {/* Main Workspace Frame with Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingApprovalsCount={pendingApprovals.length}
          onResetDemo={handleResetDemo}
          selectedEnvironment={selectedEnvironment}
          setSelectedEnvironment={setSelectedEnvironment}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/80">
          {activeTab === 'dashboard' && (
            <DashboardPage
              runbooks={runbooks}
              auditLogs={auditLogs}
              pendingApprovals={pendingApprovals}
              selectedEnvironment={selectedEnvironment}
              onSelectRunbook={(id) => {
                setActiveRunbookId(id);
                setActiveTab('executions');
              }}
              onCreateNew={() => setActiveTab('create')}
              onLaunchDemo={handleLaunchDemo}
              onOpenApprovals={() => setActiveTab('approvals')}
              onOpenReport={(rb) => setReportModalRunbook(rb)}
            />
          )}

          {activeTab === 'create' && (
            <CreateRunbookPage
              defaultEnvironment={selectedEnvironment}
              onRunbookCreated={(newRb) => {
                setRunbooks((prev) => [newRb, ...prev]);
                setActiveRunbookId(newRb.id);
                setActiveTab('executions');
              }}
            />
          )}

          {activeTab === 'executions' && (
            <ExecutionWorkspacePage
              runbook={activeRunbook}
              onUpdateRunbook={handleUpdateRunbook}
              onNavigateToRunbook={(id) => setActiveRunbookId(id)}
              allRunbooks={runbooks}
              onOpenApprovalCenter={() => setActiveTab('approvals')}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalCenterPage
              pendingApprovals={pendingApprovals}
              onApprove={handleApproveAction}
              onReject={handleRejectAction}
              onNavigateToRunbook={(id) => {
                setActiveRunbookId(id);
                setActiveTab('executions');
              }}
            />
          )}

          {activeTab === 'library' && (
            <RunbookLibraryPage onUseTemplate={handleUseTemplate} />
          )}

          {activeTab === 'audit' && (
            <AuditLogPage
              auditLogs={auditLogs}
              onNavigateToRunbook={(id) => {
                setActiveRunbookId(id);
                setActiveTab('executions');
              }}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsSettingsPage
              integrations={integrations}
              safetySettings={safetySettings}
              onUpdateSafetySettings={(newSettings) => {
                setSafetySettings(newSettings);
                saveSafetySettings(newSettings);
              }}
              onTestIntegration={(id) => {
                const next = integrations.map((item) => {
                  if (item.id === id) {
                    return { ...item, lastChecked: 'Just now' };
                  }
                  return item;
                });
                setIntegrations(next);
                saveIntegrations(next);
              }}
            />
          )}
        </main>
      </div>

      {/* Global Report Modal */}
      {reportModalRunbook?.finalReport && (
        <ExecutionReportModal
          report={reportModalRunbook.finalReport}
          isOpen={Boolean(reportModalRunbook)}
          onClose={() => setReportModalRunbook(null)}
        />
      )}
    </div>
  );
}
