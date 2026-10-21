import React from 'react';
import { RiskLevel } from '../types/runbook';
import { ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  reversible?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, reversible = true, className = '' }) => {
  if (level === 'high') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 ${className}`}>
        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span>High Risk</span>
        {!reversible && (
          <span className="text-rose-300 text-[11px] font-normal">
            (Irreversible)
          </span>
        )}
      </div>
    );
  }

  if (level === 'medium') {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Medium Risk</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>Low Risk (Reversible)</span>
    </div>
  );
};
