import React, { useState, useEffect, useRef } from 'react';
import { Runbook, RunbookStep, ApprovalRequest, ExecutionReport } from '../types/runbook';
import { StatusBadge } from '../components/StatusBadge';
import { RiskBadge } from '../components/RiskBadge';
import { TerminalViewer } from '../components/TerminalViewer';
import { ApprovalModal } from '../components/ApprovalModal';
import { ExecutionReportModal } from '../components/ExecutionReportModal';
import { executeStep, generateExecutionReport } from '../services/agentEngine';
import { saveRunbook, addAuditEvent } from '../services/storage';
import {
  Play,
  Pause,
  RotateCcw,
  Ban,
  ShieldAlert,
  FileText,
  Clock,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Zap,
  Server,
  Layers,
  ArrowRight,
  CornerDownRight,
} from 'lucide-react';

interface ExecutionWorkspacePageProps {
  runbook: Runbook | null;
  onUpdateRunbook: (runbook: Runbook) => void;
  onNavigateToRunbook: (id: string) => void;
  allRunbooks: Runbook[];
  onOpenApprovalCenter: () => void;
}

export const ExecutionWorkspacePage: React.FC<ExecutionWorkspacePageProps> = ({
  runbook,
  onUpdateRunbook,
  onNavigateToRunbook,
  allRunbooks,
  onOpenApprovalCenter,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 5x, 100x (Instant)
  const [activeApprovalRequest, setActiveApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  const executionLoopRef = useRef<boolean>(false);

  // Sync execution status with runbook
  useEffect(() => {
    if (runbook?.status === 'running') {
      executionLoopRef.current = true;
      setIsExecuting(true);
      runExecutionLoop();
    } else {
      executionLoopRef.current = false;
      setIsExecuting(false);
    }
  }, [runbook?.id]);

  if (!runbook) {
    return (
      <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-4 max-w-xl mx-auto my-12">
        <Layers className="w-8 h-8 text-slate-500 mx-auto" />
        <h2 className="text-base font-semibold text-slate-200">No Runbook Selected</h2>
        <p className="text-xs text-slate-400">
          Select an existing runbook execution from the dropdown or launch the featured demonstration scenario.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          {allRunbooks.length > 0 && (
            <select
              onChange={(e) => onNavigateToRunbook(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>Select an execution...</option>
              {allRunbooks.map((rb) => (
                <option key={rb.id} value={rb.id}>
                  {rb.title} ({rb.environment}) - {rb.status}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  }

  // Execution Step Runner
  const runExecutionLoop = async () => {
    if (!runbook) return;

    let currentRb = { ...runbook };
    let idx = currentRb.currentStepIndex;

    while (idx < currentRb.steps.length && executionLoopRef.current) {
      const step = currentRb.steps[idx];

      // If already verified or rejected, skip forward
      if (step.status === 'verified' || step.status === 'completed') {
        idx++;
        continue;
      }

      // Check if step requires approval
      const existingApproval = currentRb.approvals?.find((a) => a.stepId === step.id);
      if (step.requiresApproval && !existingApproval?.decision) {
        // Pause execution and ask for approval
        const { approvalRequest } = await executeStep(currentRb, idx);
        currentRb.status = 'paused';
        currentRb.currentStepIndex = idx;
        currentRb.steps[idx].status = 'needs_approval';
        if (approvalRequest) {
          currentRb.approvals = [...(currentRb.approvals || []), approvalRequest];
          setActiveApprovalRequest(approvalRequest);
        }
        saveRunbook(currentRb);
        onUpdateRunbook(currentRb);
        setIsExecuting(false);
        executionLoopRef.current = false;
        setSelectedStepIndex(idx);
        return;
      }

      // Step execution delay based on speed
      const delayMs = speedMultiplier >= 100 ? 50 : Math.max(300, 1500 / speedMultiplier);
      currentRb.steps[idx].status = 'running';
      currentRb.steps[idx].startedAt = new Date().toISOString();
      currentRb.status = 'running';
      onUpdateRunbook({ ...currentRb });
      setSelectedStepIndex(idx);

      await new Promise((res) => setTimeout(res, delayMs));
      if (!executionLoopRef.current) break;

      const isApproved = existingApproval?.decision === 'approved';
      const { step: executedStep } = await executeStep(currentRb, idx, { rollbackApproved: isApproved });

      currentRb.steps[idx] = executedStep;
      currentRb.currentStepIndex = idx + 1;
      saveRunbook(currentRb);
      onUpdateRunbook({ ...currentRb });

      // If step failed or was rejected, halt workflow
      if (executedStep.status === 'failed' || executedStep.status === 'rejected') {
        currentRb.status = executedStep.status === 'rejected' ? 'paused' : 'failed';
        const finalRep = generateExecutionReport(currentRb);
        currentRb.finalReport = finalRep;
        saveRunbook(currentRb);
        onUpdateRunbook(currentRb);
        setIsExecuting(false);
        executionLoopRef.current = false;
        return;
      }

      idx++;
    }

    // Workflow finished all steps
    if (idx >= currentRb.steps.length) {
      currentRb.status = 'completed';
      currentRb.completedAt = new Date().toISOString();
      const finalRep = generateExecutionReport(currentRb);
      currentRb.finalReport = finalRep;
      saveRunbook(currentRb);
      onUpdateRunbook(currentRb);
      setIsExecuting(false);
      executionLoopRef.current = false;
    }
  };

  // Controls
  const handlePause = () => {
    executionLoopRef.current = false;
    setIsExecuting(false);
    const updated = { ...runbook, status: 'paused' as const };
    saveRunbook(updated);
    onUpdateRunbook(updated);
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Human Operator',
      eventType: 'WORKFLOW_PAUSED',
      severity: 'warn',
      message: 'Workflow paused by human operator',
    });
  };

  const handleResume = () => {
    executionLoopRef.current = true;
    setIsExecuting(true);
    const updated = { ...runbook, status: 'running' as const };
    saveRunbook(updated);
    onUpdateRunbook(updated);
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Human Operator',
      eventType: 'WORKFLOW_RESUMED',
      severity: 'info',
      message: 'Workflow resumed by human operator',
    });
    runExecutionLoop();
  };

  const handleCancel = () => {
    executionLoopRef.current = false;
    setIsExecuting(false);
    const updated = { ...runbook, status: 'blocked' as const };
    saveRunbook(updated);
    onUpdateRunbook(updated);
    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Human Operator',
      eventType: 'WORKFLOW_CANCELLED',
      severity: 'error',
      message: 'Workflow cancelled by human operator',
    });
  };

  const handleRetry = () => {
    executionLoopRef.current = false;
    setIsExecuting(false);

    // Reset steps from current onwards
    const updatedSteps = runbook.steps.map((s, idx) => {
      if (idx >= selectedStepIndex) {
        return {
          ...s,
          status: 'pending' as const,
          output: undefined,
          rawLogs: undefined,
          verified: undefined,
          error: undefined,
        };
      }
      return s;
    });

    const updated: Runbook = {
      ...runbook,
      status: 'running',
      currentStepIndex: selectedStepIndex,
      steps: updatedSteps,
    };

    saveRunbook(updated);
    onUpdateRunbook(updated);
    executionLoopRef.current = true;
    setIsExecuting(true);
    runExecutionLoop();
  };

  // Approval Handlers
  const handleApproveAction = (requestId: string, reason: string) => {
    const updatedApprovals = (runbook.approvals || []).map((appr) => {
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
      ...runbook,
      status: 'running',
      approvals: updatedApprovals,
    };

    saveRunbook(updated);
    onUpdateRunbook(updated);

    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Human Operator',
      eventType: 'APPROVAL_GRANTED',
      severity: 'success',
      message: `Operator authorized high-risk step: "${activeApprovalRequest?.stepName}"`,
      details: { requestId, reason },
    });

    setActiveApprovalRequest(null);

    // Resume execution
    executionLoopRef.current = true;
    setIsExecuting(true);
    runExecutionLoop();
  };

  const handleRejectAction = (requestId: string, reason: string) => {
    const updatedApprovals = (runbook.approvals || []).map((appr) => {
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

    // Mark current step as rejected
    const updatedSteps = [...runbook.steps];
    const targetIdx = runbook.steps.findIndex((s) => s.id === activeApprovalRequest?.stepId);
    if (targetIdx >= 0) {
      updatedSteps[targetIdx].status = 'rejected';
      updatedSteps[targetIdx].error = `Operation rejected by Human Operator: "${reason}"`;
    }

    const updated: Runbook = {
      ...runbook,
      status: 'paused',
      steps: updatedSteps,
      approvals: updatedApprovals,
    };

    const rep = generateExecutionReport(updated);
    updated.finalReport = rep;

    saveRunbook(updated);
    onUpdateRunbook(updated);

    addAuditEvent({
      runbookId: runbook.id,
      runbookTitle: runbook.title,
      agent: 'Human Operator',
      eventType: 'APPROVAL_REJECTED',
      severity: 'error',
      message: `Operator rejected high-risk step: "${activeApprovalRequest?.stepName}". Safe termination engaged.`,
      details: { requestId, reason },
    });

    setActiveApprovalRequest(null);
  };

  const selectedStep = runbook.steps[selectedStepIndex] || runbook.steps[0];
  const pendingApproval = runbook.approvals?.find((a) => !a.decision);

  const completedCount = runbook.steps.filter((s) => s.status === 'verified' || s.status === 'completed').length;
  const progressPct = Math.round((completedCount / runbook.steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header & Controls Strip */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">{runbook.id}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs font-mono text-slate-400">{runbook.targetService}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{runbook.environment}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {runbook.executionMode === 'simulation' ? 'Simulation Sandbox' : 'Connected API'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{runbook.title}</span>
              <StatusBadge status={runbook.status} />
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {runbook.objective}
            </p>
          </div>

          {/* Workflow Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Speed selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              <span className="px-1.5 text-slate-500 font-mono">Speed:</span>
              {[1, 2, 5, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2 py-0.5 rounded font-mono transition-colors ${
                    speedMultiplier === s
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s === 100 ? 'Instant' : `${s}x`}
                </button>
              ))}
            </div>

            {/* Play/Pause/Resume */}
            {isExecuting ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : runbook.status !== 'completed' && runbook.status !== 'failed' ? (
              <button
                onClick={handleResume}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runbook.currentStepIndex === 0 ? 'Start Execution' : 'Resume'}</span>
              </button>
            ) : null}

            {/* Retry Button */}
            <button
              onClick={handleRetry}
              title="Retry current step"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Step</span>
            </button>

            {/* Cancel Button */}
            {runbook.status === 'running' || runbook.status === 'paused' ? (
              <button
                onClick={handleCancel}
                title="Cancel execution safely"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 rounded-lg transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            ) : null}

            {/* View Final Report */}
            {runbook.finalReport && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Execution Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Execution Progress: {completedCount} / {runbook.steps.length} Steps
            </span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Human Approval Alert Banner (When Paused at High Risk Checkpoint) */}
      {pendingApproval && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>Approval Required Before Dangerous Operation</span>
                <span className="text-[11px] font-mono text-slate-400">· {pendingApproval.stepName}</span>
              </h2>
              <p className="text-xs text-slate-300">
                Action: <span className="font-mono text-amber-200">{pendingApproval.exactCommand}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveApprovalRequest(pendingApproval)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Open Approval Review
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Split: Timeline (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Step-by-Step Execution Timeline */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Step-by-Step Execution Timeline
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Click step to inspect telemetry
            </span>
          </div>

          <div className="space-y-2.5">
            {runbook.steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isRunning = step.status === 'running';
              const isNeedsApproval = step.status === 'needs_approval';
              const isVerified = step.status === 'verified';
              const isRejected = step.status === 'rejected';
              const isFailed = step.status === 'failed';

              let borderColor = 'border-slate-800';
              if (isSelected) borderColor = 'border-slate-600 ring-1 ring-slate-600/50';
              if (isNeedsApproval) borderColor = 'border-amber-500/40 bg-amber-950/10';
              if (isRunning) borderColor = 'border-sky-500/40 bg-sky-950/10';
              if (isRejected) borderColor = 'border-slate-800 bg-slate-950/40 opacity-70';

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-4 rounded-xl bg-slate-900/60 border ${borderColor} hover:border-slate-700 transition-all cursor-pointer space-y-2.5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded text-xs font-mono flex items-center justify-center shrink-0 ${
                          isVerified
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : isNeedsApproval
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : isRunning
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-100">
                            {step.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          {step.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={step.status} />
                      {step.durationMs && (
                        <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                          {step.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Terminal className="w-3 h-3 text-slate-500" />
                        <span>{step.tool}</span>
                      </div>
                      <div className="h-3 w-px bg-slate-800" />
                      <RiskBadge level={step.riskLevel} reversible={step.reversible} />
                    </div>

                    {isNeedsApproval && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const appr = runbook.approvals?.find((a) => a.stepId === step.id) || pendingApproval;
                          if (appr) setActiveApprovalRequest(appr);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded transition-colors"
                      >
                        Review Approval Gate →
                      </button>
                    )}
                  </div>

                  {/* Verification verdict preview if available */}
                  {step.verificationVerdict && (
                    <div className="flex items-start gap-1.5 p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 font-mono leading-tight">
                        {step.verificationVerdict}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Step Telemetry Inspector */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Step Telemetry Inspector
                </span>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <span>Step {selectedStepIndex + 1}: {selectedStep.name}</span>
                </h3>
              </div>
              <StatusBadge status={selectedStep.status} />
            </div>

            {/* Success criteria & Contingency */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verification Criteria</span>
                </span>
                <p className="text-[11px] text-slate-300 font-mono leading-normal">
                  {selectedStep.successCriteria}
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3 text-teal-400" />
                  <span>Contingency Fallback</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {selectedStep.contingencyPlan}
                </p>
              </div>
            </div>

            {/* Terminal Logs & Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 text-[11px]">
                  Observable Evidence & Sandbox Console
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Tool: {selectedStep.tool}
                </span>
              </div>

              <TerminalViewer
                logs={selectedStep.rawLogs || []}
                output={selectedStep.output}
                title={selectedStep.name}
              />
            </div>

            {/* Error banner if step failed */}
            {selectedStep.error && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Execution Notice / Failure</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px]">
                  {selectedStep.error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeApprovalRequest && (
        <ApprovalModal
          request={activeApprovalRequest}
          isOpen={Boolean(activeApprovalRequest)}
          onClose={() => setActiveApprovalRequest(null)}
          onApprove={handleApproveAction}
          onReject={handleRejectAction}
        />
      )}

      {runbook.finalReport && isReportOpen && (
        <ExecutionReportModal
          report={runbook.finalReport}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
};
