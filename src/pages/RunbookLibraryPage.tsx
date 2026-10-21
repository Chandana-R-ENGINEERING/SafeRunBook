import React, { useState } from 'react';
import { RUNBOOK_TEMPLATES, RunbookTemplate } from '../services/mockData';
import { RiskBadge } from '../components/RiskBadge';
import {
  BookOpen,
  Play,
  Clock,
  Layers,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface RunbookLibraryPageProps {
  onUseTemplate: (template: RunbookTemplate) => void;
}

export const RunbookLibraryPage: React.FC<RunbookLibraryPageProps> = ({
  onUseTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Deployment Recovery', 'Observability', 'Performance', 'Database'];

  const filteredTemplates = RUNBOOK_TEMPLATES.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <BookOpen className="w-4 h-4" />
          <span>Validated Operational Playbooks</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Runbook Template Library
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Pre-audited, risk-classified incident investigation and remediation workflows ready for immediate execution or custom configuration.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {template.category}
                </span>
                <RiskBadge level={template.riskProfile} reversible={template.riskProfile !== 'high'} />
              </div>

              <h2 className="text-sm font-bold text-slate-100">
                {template.title}
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{template.stepsCount} Steps</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>~{template.estimatedDuration}</span>
                </span>
              </div>

              <button
                onClick={() => onUseTemplate(template)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
