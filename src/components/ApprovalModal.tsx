import React, { useState } from 'react';
import { ApprovalRequest } from '../types/runbook';
import { AlertOctagon, CheckCircle2, XCircle, ShieldCheck, Terminal, AlertTriangle, ArrowRight, CornerDownRight } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface ApprovalModalProps {
  request: ApprovalRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (requestId: string, reason: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [reason, setReason] = useState('Authorized by operator after reviewing pod crash logs and confirming isolated config issue.');
  const [rejectReason, setRejectReason] = useState('Rollback rejected: opting for manual ConfigMap hotfix in place to preserve new features.');
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen) return null;

  const isDestructive = request.riskLevel === 'high';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-xl border border-rose-500/30 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950/30 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>Human-in-the-Loop Approval Checkpoint</span>
                <span className="text-xs font-mono text-slate-400">· {request.environment}</span>
              </h3>
              <p className="text-xs text-slate-400">
                The agent has paused workflow execution awaiting explicit human authorization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Action and exact command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Proposed Action
              </span>
              <RiskBadge level={request.riskLevel} reversible={false} />
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-sm font-semibold text-slate-100">{request.action}</div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-slate-900/90 px-3 py-2 rounded border border-slate-800">
                <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="select-all break-all">{request.exactCommand}</span>
              </div>
            </div>
          </div>

          {/* Why necessary & Expected impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Why This Action Is Necessary</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {request.whyNecessary}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Expected Impact & Blast Radius</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {request.expectedImpact}
              </p>
            </div>
          </div>

          {/* Evidence collected so far */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Observable Evidence Gathered by Agents
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {request.evidenceSoFar.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-slate-400 font-medium mb-1">{item.label}</div>
                  <div className="text-slate-200 font-mono text-[11px] leading-tight break-words">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Failure & Safer Alternatives */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Potential Risk / Failure Scenario: </span>
                <span className="text-slate-300">{request.potentialFailureScenarios}</span>
              </div>
            </div>
            {request.saferAlternative && (
              <div className="flex items-start gap-2 pt-1 border-t border-amber-500/10 text-slate-300">
                <CornerDownRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300">Safer Alternative Considered: </span>
                  <span>{request.saferAlternative}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmation Checklist for High Risk */}
          {isDestructive && !isRejecting && (
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-950 border border-rose-500/30 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedCheck}
                onChange={(e) => setConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-medium text-slate-200">
                  I explicitly authorize executing this {request.riskLevel.toUpperCase()}-risk operation in {request.environment}
                </span>
                <p className="text-slate-400">
                  I understand this command will replace active running pods and apply direct cluster state changes.
                </p>
              </div>
            </label>
          )}

          {/* Decision Reason Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {isRejecting ? 'Rejection Reason (Recorded in Immutable Audit Log)' : 'Approval Rationale / Audit Comment'}
            </label>
            <input
              type="text"
              value={isRejecting ? rejectReason : reason}
              onChange={(e) => (isRejecting ? setRejectReason(e.target.value) : setReason(e.target.value))}
              placeholder="Enter operational rationale..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIsRejecting(!isRejecting)}
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors"
          >
            {isRejecting ? '← Switch to Approval View' : 'Want to reject instead? Click here'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>

            {isRejecting ? (
              <button
                onClick={() => {
                  onReject(request.id, rejectReason);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection & Stop Safely</span>
              </button>
            ) : (
              <button
                disabled={isDestructive && !confirmedCheck}
                onClick={() => {
                  onApprove(request.id, reason);
                  onClose();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                  isDestructive && !confirmedCheck
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorize & Execute Step</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
