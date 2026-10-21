import React, { useState } from 'react';
import { Runbook, RunbookStep, Environment, ExecutionMode } from '../types/runbook';
import { planRunbook } from '../services/agentEngine';
import { addAuditEvent, saveRunbook } from '../services/storage';
import { RiskBadge } from '../components/RiskBadge';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Trash2,
  Plus,
  MoveUp,
  MoveDown,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface CreateRunbookPageProps {
  defaultEnvironment: Environment;
  onRunbookCreated: (runbook: Runbook) => void;
}

const EXAMPLE_PROMPTS = [
  'Investigate why my application health check is failing.',
  'Diagnose a service that is responding slowly.',
  'Check a failed deployment and suggest a safe recovery plan.',
  'Investigate high CPU usage and identify possible causes.',
];

export const CreateRunbookPage: React.FC<CreateRunbookPageProps> = ({
  defaultEnvironment,
  onRunbookCreated,
}) => {
  const [prompt, setPrompt] = useState('Check a failed deployment and suggest a safe recovery plan.');
  const [environment, setEnvironment] = useState<Environment>(defaultEnvironment);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('simulation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<string | null>(null);

  // Generated Plan state
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [targetService, setTargetService] = useState('api-gateway');
  const [steps, setSteps] = useState<RunbookStep[]>([]);
  const [hasPlan, setHasPlan] = useState(false);

  // Generate plan
  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await planRunbook(prompt, environment, executionMode);
      setTitle(result.title);
      setObjective(result.objective);
      setTargetService(result.targetService);
      setSteps(result.steps);
      setGenerationSource(result.source);
      setHasPlan(true);
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Reorder step up
  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index - 1];
    newSteps[index - 1] = newSteps[index];
    newSteps[index] = temp;
    setSteps(newSteps);
  };

  // Reorder step down
  const handleMoveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index + 1];
    newSteps[index + 1] = newSteps[index];
    newSteps[index] = temp;
    setSteps(newSteps);
  };

  // Remove step
  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  // Toggle approval requirement
  const handleToggleApproval = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].requiresApproval = !newSteps[index].requiresApproval;
    setSteps(newSteps);
  };

  // Change risk level
  const handleChangeRisk = (index: number, risk: 'low' | 'medium' | 'high') => {
    const newSteps = [...steps];
    newSteps[index].riskLevel = risk;
    if (risk === 'high') {
      newSteps[index].requiresApproval = true;
      newSteps[index].reversible = false;
    }
    setSteps(newSteps);
  };

  // Add custom step
  const handleAddCustomStep = () => {
    const newStep: RunbookStep = {
      id: `step-${steps.length + 1}`,
      name: 'Custom Verification / Diagnostic Step',
      purpose: 'Execute targeted health verification or telemetry probe.',
      riskLevel: 'low',
      reversible: true,
      requiresApproval: false,
      status: 'pending',
      tool: 'http.healthCheck',
      toolParams: { url: 'https://api.internal/healthz' },
      successCriteria: 'Response status 200 OK',
      contingencyPlan: 'Notify on-call team',
    };
    setSteps([...steps, newStep]);
  };

  // Start workflow
  const handleStartWorkflow = () => {
    const newRunbook: Runbook = {
      id: `rb-${Date.now().toString(36).slice(-6)}`,
      title: title || 'Operational Runbook',
      objective: objective || prompt,
      targetService,
      environment,
      executionMode,
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps,
      currentStepIndex: 0,
      approvals: [],
    };

    saveRunbook(newRunbook);

    addAuditEvent({
      runbookId: newRunbook.id,
      runbookTitle: newRunbook.title,
      agent: 'Planner Agent',
      eventType: 'PLAN_CREATED',
      severity: 'info',
      message: `Created runbook "${newRunbook.title}" with ${steps.length} steps in ${environment}`,
      details: { stepsCount: steps.length, targetService, environment },
    });

    onRunbookCreated(newRunbook);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Create Operational Runbook
        </h1>
        <p className="text-xs text-slate-400">
          Describe the incident in natural language. SafeRunbook Planner & Risk Agents will construct a structured, risk-classified execution plan.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-5">
        {/* Natural Language Prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Natural-Language Problem Description
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. My application is unhealthy after a recent deployment. Investigate the problem and prepare a safe recovery plan."
            className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans"
          />

          {/* Prompt Suggestions */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Or choose an operational scenario:</span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="px-2.5 py-1 text-[11px] rounded bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Environment & Execution Mode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          {/* Environment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Target Environment
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {(['Development', 'Staging', 'Production'] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`py-1.5 text-xs font-medium rounded transition-colors ${
                    environment === env
                      ? 'bg-slate-800 text-slate-100 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Execution Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setExecutionMode('simulation')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  executionMode === 'simulation'
                    ? 'bg-slate-800 text-teal-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Simulation Sandbox
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('connected')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  executionMode === 'connected'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Connected Execution
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-500 font-mono">
            Mode: {executionMode === 'simulation' ? 'Deterministic Sandboxed Tools' : 'Real Cluster Endpoints'}
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing Runbook Plan...' : 'Generate Action Plan'}</span>
          </button>
        </div>
      </div>

      {/* Review, Edit, Reorder Proposed Steps */}
      {hasPlan && (
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-emerald-400">
                Plan Generated by {generationSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'SafeRunbook Planner'}
              </div>
              <h2 className="text-base font-bold text-slate-100">{title}</h2>
              <p className="text-xs text-slate-400">{objective}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAddCustomStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[idx].name = e.target.value;
                          setSteps(newSteps);
                        }}
                        className="text-xs font-semibold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-slate-500 focus:outline-none w-full"
                      />
                      <input
                        type="text"
                        value={step.purpose}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[idx].purpose = e.target.value;
                          setSteps(newSteps);
                        }}
                        className="text-[11px] text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-slate-500 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* Actions / Ordering */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveStepUp(idx)}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 rounded hover:bg-slate-900"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveStepDown(idx)}
                      disabled={idx === steps.length - 1}
                      title="Move Down"
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 rounded hover:bg-slate-900"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      title="Remove Step"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      <span>{step.tool}</span>
                    </div>

                    <div className="h-3 w-px bg-slate-800" />

                    <select
                      value={step.riskLevel}
                      onChange={(e) => handleChangeRisk(idx, e.target.value as any)}
                      className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded px-2 py-0.5"
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step.requiresApproval}
                      onChange={() => handleToggleApproval(idx)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-300">
                      Require Human Approval Checkpoint
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Launch Controls */}
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-300 space-y-0.5">
              <span className="font-semibold text-emerald-400 block">
                Plan ready for execution
              </span>
              <p className="text-[11px] text-slate-400">
                Low-risk diagnostic steps will execute automatically. High-risk operations will halt at approval checkpoints.
              </p>
            </div>

            <button
              onClick={handleStartWorkflow}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Runbook Execution</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
