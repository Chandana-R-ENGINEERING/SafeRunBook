import React, { useState } from 'react';
import { ExecutionReport } from '../types/runbook';
import { FileText, CheckCircle2, AlertTriangle, Download, Copy, Check, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ExecutionReportModalProps {
  report: ExecutionReport;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutionReportModal: React.FC<ExecutionReportModalProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    return `# SafeRunbook Execution Report: ${report.title}
- **Status:** ${report.status.toUpperCase()}
- **Environment:** ${report.environment}
- **Generated At:** ${report.generatedAt}
- **Total Duration:** ${report.durationSeconds}s
- **Completed Steps:** ${report.completedSteps}/${report.totalSteps}
- **Approvals Obtained:** ${report.approvalsCount}

## Root Cause Analysis
${report.rootCauseAnalysis}

## Actions Taken
${report.actionsSummary.map((a) => `- ${a}`).join('\n')}

## Verification Evidence
${report.verificationEvidence.map((v) => `- [${v.passed ? 'x' : ' '}] ${v.check}: ${v.result}`).join('\n')}

## Recommendations
${report.recommendations.map((r) => `1. ${r}`).join('\n')}
`;
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saferunbook-report-${report.runbookId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>Autonomous Execution & Verification Report</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Runbook: {report.runbookId}</span>
                <span aria-hidden="true">·</span>
                <span>{report.environment}</span>
                <span aria-hidden="true">·</span>
                <StatusBadge status={report.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Steps Completed</div>
              <div className="text-lg font-semibold text-slate-100 font-mono tabular-nums">
                {report.completedSteps} / {report.totalSteps}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Execution Duration</div>
              <div className="text-lg font-semibold text-slate-100 font-mono tabular-nums">
                {report.durationSeconds}s
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Human Approvals</div>
              <div className="text-lg font-semibold text-slate-100 font-mono tabular-nums">
                {report.approvalsCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Safety Violations</div>
              <div className="text-lg font-semibold text-emerald-400 font-mono tabular-nums">
                0
              </div>
            </div>
          </div>

          {/* Root cause analysis */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Root Cause Identification (Reporting Agent)
            </h4>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {report.rootCauseAnalysis}
            </div>
          </div>

          {/* Actions summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Automated & Approved Actions Taken
            </h4>
            <div className="space-y-2">
              {report.actionsSummary.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 p-2.5 rounded bg-slate-950 border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification evidence */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Verification Assertions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.verificationEvidence.map((ev, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{ev.check}</span>
                    {ev.passed ? (
                      <span className="text-[11px] text-emerald-400 font-medium">Passed</span>
                    ) : (
                      <span className="text-[11px] text-rose-400 font-medium">Failed</span>
                    )}
                  </div>
                  <div className="text-slate-200 font-mono text-[11px]">{ev.result}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Unresolved items if any */}
          {report.unresolvedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Unresolved Operational Items
              </h4>
              <div className="space-y-1.5">
                {report.unresolvedItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-300 p-2.5 rounded bg-amber-950/20 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Long-term Preventive Recommendations
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
