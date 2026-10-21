import React, { useState } from 'react';
import { IntegrationItem, SafetySettings } from '../types/runbook';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  Lock,
  Server,
  Layers,
  Terminal,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface IntegrationsSettingsPageProps {
  integrations: IntegrationItem[];
  safetySettings: SafetySettings;
  onUpdateSafetySettings: (settings: SafetySettings) => void;
  onTestIntegration: (id: string) => void;
}

export const IntegrationsSettingsPage: React.FC<IntegrationsSettingsPageProps> = ({
  integrations,
  safetySettings,
  onUpdateSafetySettings,
  onTestIntegration,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      onTestIntegration(id);
      setTestingId(null);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <SlidersHorizontal className="w-4 h-4" />
          <span>System Adapters & Autonomous Policy</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Integrations & Safety Policy Governance
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Manage operational adapters and configure strict guardrails. SafeRunbook clearly differentiates real external connections from simulated evaluation sandboxes.
        </p>
      </div>

      {/* Safety Policy Settings */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Execution Policy & Safety Controls</span>
          </h2>
          <p className="text-xs text-slate-400">
            Rules governing what the agent is allowed to execute autonomously vs when it must halt for human authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule 1 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200">
                Auto-Execute Low-Risk Diagnostic Actions
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Permits read-only queries, log analysis, and telemetry gathering without human pause.
              </p>
            </div>
            <input
              type="checkbox"
              checked={safetySettings.autoExecuteLowRisk}
              onChange={(e) =>
                onUpdateSafetySettings({ ...safetySettings, autoExecuteLowRisk: e.target.checked })
              }
              className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
            />
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200">
                Require Approval for Medium-Risk in Production
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Actions like cache warmups or non-blocking restarts require approval when targeted at Prod.
              </p>
            </div>
            <input
              type="checkbox"
              checked={safetySettings.requireApprovalMediumInProd}
              onChange={(e) =>
                onUpdateSafetySettings({ ...safetySettings, requireApprovalMediumInProd: e.target.checked })
              }
              className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
            />
          </div>

          {/* Rule 3 (Locked Constitution) */}
          <div className="p-4 rounded-lg bg-slate-950 border border-rose-500/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Always Require Approval for High-Risk Operations</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Enforced by the SafeRunbook Constitution. Rollbacks, restarts, and schema modifications never run autonomously.
              </p>
            </div>
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Locked ON
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200">
                Halt Workflow on Verification Failure
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                If a synthetic probe or telemetry assertion fails post-action, halt immediately and alert on-call.
              </p>
            </div>
            <input
              type="checkbox"
              checked={safetySettings.haltOnVerificationFailure}
              onChange={(e) =>
                onUpdateSafetySettings({ ...safetySettings, haltOnVerificationFailure: e.target.checked })
              }
              className="mt-1 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Max Autonomous Steps Slider */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Maximum Autonomous Steps Before Checkpoint
            </span>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              {safetySettings.maxAutonomousSteps} Steps
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={safetySettings.maxAutonomousSteps}
            onChange={(e) =>
              onUpdateSafetySettings({ ...safetySettings, maxAutonomousSteps: Number(e.target.value) })
            }
            className="w-full accent-emerald-400 bg-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            The agent will pause and prompt for status review after executing this number of uninterrupted safe steps.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Tool & Service Adapters
            </h2>
            <p className="text-xs text-slate-400">
              Live status of cluster, monitoring, and version control integrations.
            </p>
          </div>

          <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
            Honest Status Policy Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => {
            const isDemo = item.status === 'demo';
            const isConnected = item.status === 'connected';
            const isDisconnected = item.status === 'disconnected';

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span>{item.name}</span>
                    </h3>
                    <div className="text-[11px] font-mono text-slate-500">
                      {item.authType}
                    </div>
                  </div>

                  {/* Status Indicator Pair */}
                  {isDemo ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" />
                      <span>Demo Sandbox</span>
                    </span>
                  ) : isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Live Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-slate-800/60 border border-slate-700 rounded">
                      <XCircle className="w-3 h-3 text-slate-500" />
                      <span>Disconnected</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  {item.description}
                </p>

                {/* Capabilities */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Exposed Tool Actions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Test Connection Button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Last Checked: {item.lastChecked}
                  </span>

                  <button
                    onClick={() => handleTest(item.id)}
                    disabled={testingId === item.id}
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingId === item.id ? 'animate-spin' : ''}`} />
                    <span>{testingId === item.id ? 'Probing...' : 'Probe Adapter'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
