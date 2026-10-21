import React from 'react';
import { StepStatus } from '../types/runbook';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldAlert, Play, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: StepStatus | 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'blocked' | 'resolved' | 'in_progress';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'completed':
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Completed</span>
        </span>
      );
    case 'verified':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-teal-300 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>Verified</span>
        </span>
      );
    case 'running':
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 ${className}`}>
          <Play className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-spin" />
          <span>In Progress</span>
        </span>
      );
    case 'needs_approval':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Needs Approval</span>
        </span>
      );
    case 'blocked':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Blocked</span>
        </span>
      );
    case 'failed':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-red-400 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>Failed</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 ${className}`}>
          <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'paused':
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Paused</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Pending</span>
        </span>
      );
  }
};
