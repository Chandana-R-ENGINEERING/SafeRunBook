import React from 'react';
import { Runbook, AuditEvent, ApprovalRequest, Environment } from '../types/runbook';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  PlusCircle,
  FileText,
  Activity,
  Layers,
  Terminal,
} from 'lucide-react';

interface DashboardPageProps {
  runbooks: Runbook[];
  auditLogs: AuditEvent[];
  pendingApprovals: ApprovalRequest[];
  selectedEnvironment: Environment;
  onSelectRunbook: (id: string) => void;
  onCreateNew: () => void;
  onLaunchDemo: () => void;
  onOpenApprovals: () => void;
  onOpenReport: (runbook: Runbook) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  runbooks,
  auditLogs,
  pendingApprovals,
  selectedEnvironment,
  onSelectRunbook,
  onCreateNew,
  onLaunchDemo,
  onOpenApprovals,
  onOpenReport,
}) => {
  // Filter by selected environment
  const filteredRunbooks = runbooks.filter(
    (r) => selectedEnvironment === 'Production' || r.environment === selectedEnvironment
  );

  const totalRuns = filteredRunbooks.length;
  const successfulRuns = filteredRunbooks.filter((r) => r.status === 'completed').length;
  const activeRuns = filteredRunbooks.filter((r) => r.status === 'running' || r.status === 'paused').length;
  const failedRuns = filteredRunbooks.filter((r) => r.status === 'failed' || r.status === 'blocked').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Demo Trigger */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SafeRunbook Operations Console</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedEnvironment} Scope</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Plan intelligently. Act safely. Verify everything.
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              AI agents convert complex operational issues into structured runbooks, autonomously execute safe diagnostic steps, and pause at verified approval checkpoints before modifying state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onLaunchDemo}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Featured Scenario</span>
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Runbook</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Executions</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
            {totalRuns}
          </div>
          <div className="text-[11px] text-slate-500">
            Across {selectedEnvironment} environment
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Verified Recoveries</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {successfulRuns}
          </div>
          <div className="text-[11px] text-slate-500">
            100% verified via synthetic probes
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-slate-500">
            {pendingApprovals.length > 0 ? (
              <button
                onClick={onOpenApprovals}
                className="text-amber-400 hover:underline font-medium"
              >
                Requires operator review →
              </button>
            ) : (
              'All safety gates clear'
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Blocked / Failed</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {failedRuns}
          </div>
          <div className="text-[11px] text-slate-500">
            Zero unauthorized actions taken
          </div>
        </div>
      </div>

      {/* Featured Demonstration Scenario Card */}
      <div className="p-5 rounded-xl border border-teal-500/30 bg-teal-950/10 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            <Activity className="w-4 h-4" />
            <span>End-to-End Evaluation Scenario: Post-Deployment Recovery</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Tested against both Approval and Rejection paths
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Simulates an incident where a recent release (v2.4.1) causes application 500 errors. The Planner creates a 6-step runbook, inspects pod logs to isolate the missing JWT secret, evaluates a rollback, pauses at the human approval gate, and verifies health check probes upon resolution.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start End-to-End Simulation</span>
          </button>
          <span className="text-xs text-slate-500">
            Restartable anytime to test approval vs rejection logic
          </span>
        </div>
      </div>

      {/* Two Column Layout: Recent Workflows & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Active & Recent Runbooks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Recent Runbook Executions
            </h2>
            <button
              onClick={onCreateNew}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              + New Workflow
            </button>
          </div>

          <div className="space-y-3">
            {filteredRunbooks.length > 0 ? (
              filteredRunbooks.slice(0, 5).map((rb) => {
                const totalSteps = rb.steps.length;
                const completedSteps = rb.steps.filter(
                  (s) => s.status === 'completed' || s.status === 'verified'
                ).length;
                const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                const hasPendingApproval = rb.approvals?.some((a) => !a.decision);

                return (
                  <div
                    key={rb.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer space-y-3"
                    onClick={() => onSelectRunbook(rb.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-100 hover:text-emerald-400 transition-colors">
                            {rb.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono">{rb.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rb.targetService}</span>
                          <span aria-hidden="true">·</span>
                          <span>{rb.environment}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasPendingApproval && (
                          <span className="px-2 py-0.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded">
                            Action Paused
                          </span>
                        )}
                        <StatusBadge status={rb.status} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {rb.objective}
                    </p>

                    {/* Progress Bar & Steps Count */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>
                          {completedSteps} of {totalSteps} steps completed
                        </span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            rb.status === 'failed'
                              ? 'bg-rose-500'
                              : rb.status === 'completed'
                              ? 'bg-emerald-400'
                              : 'bg-teal-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                      <span className="text-[11px] text-slate-500">
                        Updated {new Date(rb.updatedAt).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-3">
                        {rb.finalReport && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReport(rb);
                            }}
                            className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Report</span>
                          </button>
                        )}
                        <span className="text-slate-400 hover:text-slate-200 flex items-center gap-1">
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-400">No runbooks found for {selectedEnvironment}.</p>
                <button
                  onClick={onCreateNew}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg"
                >
                  Create Runbook
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Live Audit History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Safety & Audit Events
            </h2>
            <span className="text-xs text-slate-500 font-mono">Immutable</span>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {auditLogs.slice(0, 8).map((log) => {
                let badgeColor = 'text-slate-400';
                if (log.severity === 'critical' || log.severity === 'error') {
                  badgeColor = 'text-rose-400';
                } else if (log.severity === 'warn') {
                  badgeColor = 'text-amber-400';
                } else if (log.severity === 'success') {
                  badgeColor = 'text-emerald-400';
                }

                return (
                  <div key={log.id} className="text-xs space-y-1 pb-2.5 border-b border-slate-800/60 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-300">{log.agent}</span>
                      <span className="font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-xs ${badgeColor} font-mono leading-tight`}>
                      {log.message}
                    </p>

                    <div className="text-[10px] text-slate-500 truncate">
                      Runbook: {log.runbookTitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
