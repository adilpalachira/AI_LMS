import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';

const RiskBadge = ({ riskLevel, showIcon = true, size = 'md' }) => {
  const level = riskLevel || 'Unevaluated';

  const styles = {
    High: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: ShieldAlert,
      label: 'High Risk'
    },
    Medium: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      label: 'Medium Risk'
    },
    Low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Low Risk'
    },
    Unevaluated: {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: HelpCircle,
      label: 'Unevaluated'
    }
  };

  const config = styles[level] || styles.Unevaluated;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-bold gap-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <IconComponent size={iconSizes[size]} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export default RiskBadge;
