import React from 'react';
import { Shield, ShieldAlert, Sparkles, Plus, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  onLaunchDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onLaunchDemo,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0 sticky top-0 z-40">
      {/* Zone 1: Single text element Brand wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left text-slate-100 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
            SafeRunbook
          </span>
        </button>

        <span className="hidden sm:inline-flex text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Agents That Act
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('executions')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'executions' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Execution Workspace
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-1.5 hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'approvals' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          <span>Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'library' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Runbook Library
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'audit' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'integrations' ? 'text-emerald-400 font-semibold' : ''
          }`}
        >
          Integrations & Safety
        </button>
      </nav>

      {/* Zone 3: 1 primary action & demo runner */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onLaunchDemo}
          title="Run featured end-to-end deployment recovery scenario"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Run Featured Demo</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 font-semibold"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Runbook</span>
        </button>
      </div>
    </header>
  );
};
