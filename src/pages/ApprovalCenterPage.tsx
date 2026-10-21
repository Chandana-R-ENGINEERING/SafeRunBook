import React, { useState } from 'react';
import { ApprovalRequest } from '../types/runbook';
import { RiskBadge } from '../components/RiskBadge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Terminal,
  AlertTriangle,
  CornerDownRight,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ApprovalCenterPageProps {
  pendingApprovals: ApprovalRequest[];
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onNavigateToRunbook: (runbookId: string) => void;
}

export const ApprovalCenterPage: React.FC<ApprovalCenterPageProps> = ({
  pendingApprovals,
  onApprove,
  onReject,
  onNavigateToRunbook,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    pendingApprovals[0]?.id || null
  );
  const [reason, setReason] = useState(
    'Authorized by operator after reviewing pod crash logs and confirming isolated config issue.'
  );
  const [rejectReason, setRejectReason] = useState(
    'Rollback rejected: opting for manual ConfigMap hotfix in place to preserve new features.'
  );
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const selectedRequest = pendingApprovals.find((a) => a.id === selectedRequestId) || pendingApprovals[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Human-in-the-Loop Safety Gate</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Operational Approval Center
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          High-impact or irreversible commands are paused here for explicit human authorization. Review observable evidence, expected blast radius, and safer alternatives before granting execution rights.
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-base font-semibold text-slate-200">
            No Pending Approvals
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All active workflows are either executing safe, reversible actions autonomously or have finished their verification suites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Requests List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Actions ({pendingApprovals.length})
            </span>

            <div className="space-y-2">
              {pendingApprovals.map((req) => {
                const isSelected = req.id === selectedRequest?.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setConfirmedCheck(false);
                      setIsRejecting(false);
                    }}
                    className={`p-4 rounded-xl bg-slate-900/60 border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-950/10 ring-1 ring-amber-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-100 line-clamp-1">
                        {req.stepName}
                      </h3>
                      <RiskBadge level={req.riskLevel} reversible={false} />
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {req.action}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                      <span>{req.environment}</span>
                      <span>Requested {new Date(req.requestedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Request Detail & Authorization (8 cols) */}
          {selectedRequest && (
            <div className="lg:col-span-8 p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{selectedRequest.environment}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={() => onNavigateToRunbook(selectedRequest.runbookId)}
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>Runbook: {selectedRequest.runbookTitle}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {selectedRequest.action}
                  </h2>
                </div>

                <RiskBadge level={selectedRequest.riskLevel} reversible={false} />
              </div>

              {/* Exact Command */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Operation / CLI Command
                </span>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                  <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="select-all break-all">{selectedRequest.exactCommand}</span>
                </div>
              </div>

              {/* Grid: Why Necessary & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Why This Action Is Necessary</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedRequest.whyNecessary}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expected Impact & Blast Radius</span>
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedRequest.expectedImpact}
                  </p>
                </div>
              </div>

              {/* Evidence gathered */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Evidence Discovered by Diagnostic Agents
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedRequest.evidenceSoFar.map((ev, i) => (
                    <div key={i} className="p-3 rounded bg-slate-950 border border-slate-800 text-xs">
                      <div className="text-slate-400 font-medium mb-1">{ev.label}</div>
                      <div className="text-slate-200 font-mono text-[11px] leading-snug break-words">
                        {ev.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Scenarios & Safer Alternatives */}
              <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs space-y-2">
                <div>
                  <span className="font-semibold text-amber-300">Potential Risk Scenario: </span>
                  <span className="text-slate-300">{selectedRequest.potentialFailureScenarios}</span>
                </div>
                {selectedRequest.saferAlternative && (
                  <div className="pt-2 border-t border-amber-500/10">
                    <span className="font-semibold text-emerald-300">Safer Alternative Available: </span>
                    <span className="text-slate-300">{selectedRequest.saferAlternative}</span>
                  </div>
                )}
              </div>

              {/* Explicit Confirmation Checkbox */}
              {selectedRequest.riskLevel === 'high' && !isRejecting && (
                <label className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-950 border border-rose-500/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedCheck}
                    onChange={(e) => setConfirmedCheck(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500"
                  />
                  <div className="text-xs space-y-0.5">
                    <span className="font-semibold text-slate-200">
                      I authorize executing this high-risk modification in {selectedRequest.environment}
                    </span>
                    <p className="text-slate-400">
                      The execution agent will dispatch the command through the sandboxed adapter and monitor verification probes.
                    </p>
                  </div>
                </label>
              )}

              {/* Rationale Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">
                  {isRejecting ? 'Rejection Reason (Recorded to Audit Trail)' : 'Approval Rationale / Audit Comment'}
                </label>
                <input
                  type="text"
                  value={isRejecting ? rejectReason : reason}
                  onChange={(e) => (isRejecting ? setRejectReason(e.target.value) : setReason(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsRejecting(!isRejecting)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 text-left"
                >
                  {isRejecting ? '← Switch to Approval Mode' : 'Want to reject instead? Switch to Reject mode'}
                </button>

                <div className="flex items-center gap-3">
                  {isRejecting ? (
                    <button
                      onClick={() => onReject(selectedRequest.id, rejectReason)}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Rejection & Halt Workflow</span>
                    </button>
                  ) : (
                    <button
                      disabled={selectedRequest.riskLevel === 'high' && !confirmedCheck}
                      onClick={() => onApprove(selectedRequest.id, reason)}
                      className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                        selectedRequest.riskLevel === 'high' && !confirmedCheck
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Authorize Execution</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
