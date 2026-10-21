import React, { useState } from 'react';
import { AuditEvent, AuditSeverity, AgentRole } from '../types/runbook';
import {
  History,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  Shield,
  FileCode2,
  ChevronDown,
  ChevronRight,
  Terminal,
} from 'lucide-react';

interface AuditLogPageProps {
  auditLogs: AuditEvent[];
  onNavigateToRunbook: (runbookId: string) => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({
  auditLogs,
  onNavigateToRunbook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const severities = ['All', 'info', 'warn', 'error', 'success'];
  const agents: Array<'All' | AgentRole> = [
    'All',
    'Planner Agent',
    'Risk Assessment Agent',
    'Execution Agent',
    'Verification Agent',
    'Reporting Agent',
    'Human Operator',
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.runbookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.runbookId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    const matchesAgent = agentFilter === 'All' || log.agent === agentFilter;

    return matchesSearch && matchesSeverity && matchesAgent;
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saferunbook-audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMarkdown = () => {
    const md = auditLogs
      .map(
        (l) =>
          `- [${l.timestamp}] **${l.agent}** [${l.severity.toUpperCase()}]: ${l.message} (Runbook: ${l.runbookId})`
      )
      .join('\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <History className="w-4 h-4" />
          <span>Compliance & Tamper-Proof Audit Records</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Execution History & Audit Trail
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Every autonomous action, risk classification, human decision, tool output, and verification probe is immutably logged with nanosecond timestamps.
        </p>
      </div>

      {/* Filter and Export Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, runbook ID, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Severity:</span>
            <div className="flex items-center gap-1">
              {severities.map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                    severityFilter === sev
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Agent:</span>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 text-xs border border-slate-800 rounded px-2 py-1"
            >
              {agents.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table / Feed */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              let sevColor = 'text-slate-400';
              let sevBg = 'bg-slate-800/40 text-slate-400 border-slate-700';

              if (log.severity === 'critical' || log.severity === 'error') {
                sevColor = 'text-rose-400';
                sevBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
              } else if (log.severity === 'warn') {
                sevColor = 'text-amber-400';
                sevBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              } else if (log.severity === 'success') {
                sevColor = 'text-emerald-400';
                sevBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              }

              return (
                <div key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer text-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button className="text-slate-500 hover:text-slate-300 mt-0.5 sm:mt-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>

                      <span className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded border shrink-0 ${sevBg}`}>
                        {log.severity}
                      </span>

                      <span className="font-semibold text-slate-300 shrink-0">
                        {log.agent}
                      </span>

                      <span className={`font-mono text-xs ${sevColor} truncate max-w-xl`}>
                        {log.message}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-500 pl-7 sm:pl-0">
                      <span>{log.eventType}</span>
                      <span aria-hidden="true">·</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToRunbook(log.runbookId);
                        }}
                        className="text-teal-400 hover:underline"
                      >
                        {log.runbookId}
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && log.details && (
                    <div className="px-10 pb-4 pt-1 bg-slate-950/60">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                        <div className="text-slate-500 font-semibold text-[10px] uppercase">
                          Event Metadata Payload:
                        </div>
                        <pre className="overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No audit records matched the filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
