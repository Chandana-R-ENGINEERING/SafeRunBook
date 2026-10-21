import React from 'react';
import {
  LayoutDashboard,
  PlaySquare,
  ShieldAlert,
  BookOpen,
  History,
  SlidersHorizontal,
  PlusCircle,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount: number;
  onResetDemo: () => void;
  selectedEnvironment: string;
  setSelectedEnvironment: (env: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  onResetDemo,
  selectedEnvironment,
  setSelectedEnvironment,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Runbook', icon: PlusCircle },
    { id: 'executions', label: 'Execution Workspace', icon: PlaySquare },
    { id: 'approvals', label: 'Approval Center', icon: ShieldAlert, badge: pendingApprovalsCount },
    { id: 'library', label: 'Runbook Library', icon: BookOpen },
    { id: 'audit', label: 'Audit & Event Logs', icon: History },
    { id: 'integrations', label: 'Integrations & Policy', icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0">
      {/* Scope / Environment Selector */}
      <div className="p-4 border-b border-slate-800/80 space-y-2">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Scope</span>
          <span className="text-[10px] text-teal-400 font-mono">Demo Mode</span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {(['Development', 'Staging', 'Production'] as const).map((env) => (
            <button
              key={env}
              onClick={() => setSelectedEnvironment(env)}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                selectedEnvironment === env
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {env === 'Production' ? 'Prod' : env === 'Development' ? 'Dev' : 'Stage'}
            </button>
          ))}
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          External & Views
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'landing'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span>Public Landing Page</span>
          </div>
        </button>
      </div>

      {/* Safety Policy Status & Reset */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Safety Guard Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Low-risk actions automated. High-risk actions require human approval checkpoint.
          </p>
        </div>

        <button
          onClick={onResetDemo}
          title="Restore fresh pre-seeded demo state"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Environment</span>
        </button>
      </div>
    </aside>
  );
};
