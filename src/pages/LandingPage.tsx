import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  Terminal,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Play,
  RotateCcw,
  Layers,
  Activity,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onExploreDemo,
}) => {
  const [demoCheckpointState, setDemoCheckpointState] = useState<'pending' | 'approved' | 'rejected'>('pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar following 3-Zone Contract */}
      <header className="flex items-center justify-between gap-8 px-8 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <Shield className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            SafeRunbook
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#workflow" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">How It Works</a>
          <a href="#checkpoint" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Approval Checkpoint</a>
          <a href="#principles" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Safety Principles</a>
          <a href="#sample-report" className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0">Verified Reports</a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLaunchDashboard}
            className="px-4 py-2 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 font-semibold"
          >
            Launch Dashboard
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-20 lg:py-28 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Theme: Agents That Act</span>
            <span aria-hidden="true">·</span>
            <span>Plan Intelligently. Act Safely. Verify Everything.</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight text-balance">
            AI agents that do the work. <span className="text-emerald-400">Safely.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
            Turn operational problems into executable runbooks. Automate safe actions, approve risky changes, and verify every outcome.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onLaunchDashboard}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4 text-teal-400" />
              <span>Explore Featured Demo</span>
            </button>
          </div>

          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span>Deterministic Safety Guard</span>
            <span aria-hidden="true">·</span>
            <span>Zero Unsupervised Destructive Commands</span>
            <span aria-hidden="true">·</span>
            <span>Observable Telemetry Verification</span>
          </div>
        </section>

        {/* Visual Workflow: Plan -> Assess Risk -> Execute -> Verify */}
        <section id="workflow" className="px-6 py-16 border-y border-slate-900 bg-slate-950/60">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Autonomous Operational Pipeline
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                How SafeRunbook Agents Act in Real Workflows
              </h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                A 5-agent coordinated system that balances high operational autonomy with strict human safeguards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center text-xs font-mono font-bold">
                  01
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Planner Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Translates natural-language incidents into sequential, targeted operational steps with specific tools and clear success criteria.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Input: Anomaly report
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-mono font-bold">
                  02
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Risk Assessment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Classifies each action (Low, Medium, High). Detects irreversible operations and inserts mandatory human approval checkpoints.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Guard: Policy enforcement
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-xs font-mono font-bold">
                  03
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Execution Agent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Executes low-risk diagnostic tasks autonomously. Pauses on dangerous commands until cryptographic human confirmation is granted.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Action: Real tools & sandboxes
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-mono font-bold">
                  04
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Verification & Report</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Probes endpoints to independently verify real recovery. Compiles an executive post-mortem with immutable audit logs.
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                  Output: Verified recovery
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="px-6 py-20 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              The Fundamental Challenge
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Why Existing AI Assistants Fall Short in Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>The Unsafe or Passive Assistants</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span><strong>Suggest without executing:</strong> Dumps 30 paragraphs of terminal commands into chat; engineers still have to run everything manually.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span><strong>Blind execution risks:</strong> Unguarded agents can delete databases, truncate caches, or drop production traffic without asking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span><strong>Hallucinated success:</strong> Assumes a fix worked without checking synthetic health probes or pod states.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>The SafeRunbook Architecture</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Agents that act:</strong> Autonomous investigation of logs, git diffs, and container metrics without human toil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Enforced approval checkpoints:</strong> High-risk and irreversible operations pause and require explicit sign-off with blast radius context.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Observable verification:</strong> Probes real telemetry and health endpoints before declaring an incident resolved.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Checkpoint Demo Widget */}
        <section id="checkpoint" className="px-6 py-16 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Interactive Demonstration
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Experience the Human Approval Checkpoint
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Test how the agent halts at destructive boundaries and adapts dynamically whether you approve or reject.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
              <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">Execution Checkpoint: Step 4 of 6</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-400 font-medium">Needs Approval (High Risk)</span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">Production Environment</span>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Proposed Action</div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-sm font-semibold text-slate-100">
                      Rollback Deployment api-gateway to ReplicaSet v2.4.0
                    </div>
                    <div className="text-xs font-mono text-amber-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                      kubectl rollout undo deployment/api-gateway -n production --to-revision=v2.4.0
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-1">Evidence Discovered:</span>
                    <span className="text-slate-400">3/5 pods in CrashLoopBackOff due to missing JWT_SECRET_V2 variable in v2.4.1.</span>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-1">Expected Blast Radius:</span>
                    <span className="text-slate-400">Restores 5 healthy v2.4.0 pods. Zero customer downtime; rollout takes ~25s.</span>
                  </div>
                </div>

                {/* State result */}
                {demoCheckpointState === 'approved' ? (
                  <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorization Granted by Human Operator</span>
                    </div>
                    <p className="text-slate-300">
                      The Execution Agent rolled back the cluster to v2.4.0. The Verification Agent probed /healthz and confirmed HTTP 200 OK. Incident marked RESOLVED.
                    </p>
                    <button
                      onClick={() => setDemoCheckpointState('pending')}
                      className="text-emerald-400 underline text-[11px] pt-1 block"
                    >
                      Reset checkpoint demo
                    </button>
                  </div>
                ) : demoCheckpointState === 'rejected' ? (
                  <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-rose-400">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Action Rejected by Human Operator</span>
                    </div>
                    <p className="text-slate-300">
                      The agent obeyed the safety directive and did not touch production. It recorded the rejection in the audit trail and proposed a safe alternative: in-place ConfigMap hotfix.
                    </p>
                    <button
                      onClick={() => setDemoCheckpointState('pending')}
                      className="text-rose-400 underline text-[11px] pt-1 block"
                    >
                      Reset checkpoint demo
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDemoCheckpointState('rejected')}
                      className="px-4 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 rounded-lg transition-colors"
                    >
                      Reject Proposed Action
                    </button>
                    <button
                      onClick={() => setDemoCheckpointState('approved')}
                      className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
                    >
                      Approve & Execute Rollback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Safety Principles */}
        <section id="principles" className="px-6 py-20 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Built on First Principles
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              The SafeRunbook Safety Constitution
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                <span>Deterministic Safety Guard</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Risk rules are enforced at the execution engine level. An LLM prompt cannot bypass security checks or trigger destructive commands without human sign-off.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Activity className="w-4 h-4" />
                <span>Evidence-Based Verification</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The agent never marks a step verified based on assumption. It probes external APIs, checks metrics, and verifies return codes.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Layers className="w-4 h-4" />
                <span>Immutable Auditability</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every tool invocation, approval decision, timestamp, and operator identity is written to a structured audit ledger for compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20 bg-slate-900/30 border-t border-slate-800/80 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white max-w-xl mx-auto">
            Ready to bring safe autonomous runbooks to your team?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
            Try the interactive demonstration or create a custom runbook for your services now.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onLaunchDashboard}
              className="px-6 py-3 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              Launch Dashboard Workspace
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>SafeRunbook · Autonomous Operational Automation with Human Oversight</div>
        <div className="font-mono text-[11px] text-slate-600">Simulated & Connected Integration Environment</div>
      </footer>
    </div>
  );
};
