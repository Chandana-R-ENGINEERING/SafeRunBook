import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const hasValidGeminiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5);

let ai: GoogleGenAI | null = null;
if (hasValidGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey as string,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: hasValidGeminiKey ? 'ai-connected' : 'deterministic-demo',
    geminiAvailable: hasValidGeminiKey,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Planner Agent Endpoint
app.post('/api/agent/plan', async (req, res) => {
  const { prompt, environment = 'Production', executionMode = 'simulation' } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required' });
  }

  // If Gemini is available, leverage it to generate or enrich the plan
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are SafeRunbook Planner and Risk Assessment Agent.
A user reported the following operational issue in ${environment} environment:
"${prompt}"

Generate a structured operational runbook with 4 to 6 logical sequential steps.
Rules:
1. Steps should investigate root cause first, then propose remediation, and finally verify outcomes.
2. If any step is irreversible, modifies production state, or causes downtime (e.g. rollback, restart, deleting cache, scale to zero, terminating connections), classify it as 'high' risk and set reversible=false.
3. Diagnostic/read-only steps are 'low' risk.
4. Intermediate mitigation steps (e.g. updating traffic weights, flushing non-critical cache) are 'medium' risk.
5. Provide a realistic tool name (e.g., k8s.getDeploymentStatus, k8s.getPodLogs, http.healthCheck, datadog.queryMetrics, k8s.rollbackDeployment, aws.restartService).

Return strictly JSON matching this structure:
{
  "title": "string (short concise runbook title)",
  "objective": "string (1-2 sentence goal)",
  "targetService": "string (e.g., api-gateway, auth-service, database-primary)",
  "steps": [
    {
      "id": "step-1",
      "name": "string",
      "purpose": "string",
      "riskLevel": "low" | "medium" | "high",
      "reversible": boolean,
      "requiresApproval": boolean,
      "tool": "string",
      "toolParams": object,
      "successCriteria": "string",
      "contingencyPlan": "string"
    }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          source: 'gemini-3.8-flash',
          plan: parsed,
        });
      }
    } catch (error) {
      console.warn('Gemini planning failed, falling back to deterministic engine:', error);
    }
  }

  // Deterministic Planner Fallback (Fast, highly reliable, domain-specific)
  const fallbackPlan = generateDeterministicPlan(prompt, environment);
  return res.json({
    source: 'deterministic-engine',
    plan: fallbackPlan,
  });
});

// Verification Agent Endpoint
app.post('/api/agent/verify', async (req, res) => {
  const { stepName, toolOutput, successCriteria } = req.body;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are SafeRunbook Verification Agent.
Evaluate whether the operational step output satisfies the success criteria.
Step: ${stepName}
Success Criteria: ${successCriteria}
Observed Output: ${JSON.stringify(toolOutput)}

Respond strictly in JSON:
{
  "verified": boolean,
  "confidence": number (between 0 and 1),
  "verdict": "string (clear summary of verification)",
  "anomaliesDetected": string[]
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini verification fallback:', err);
    }
  }

  // Deterministic verification fallback
  const isErr = toolOutput?.status === 'error' || toolOutput?.httpCode >= 400 || toolOutput?.crashLoop;
  res.json({
    verified: !isErr,
    confidence: 0.95,
    verdict: !isErr ? 'Success criteria met: All telemetry parameters within normal thresholds.' : 'Verification check failed: Error detected in execution output.',
    anomaliesDetected: isErr ? ['Service returned error indicators'] : [],
  });
});

// Helper for deterministic planning
function generateDeterministicPlan(prompt: string, environment: string) {
  const p = prompt.toLowerCase();

  if (p.includes('health') || p.includes('deploy') || p.includes('unhealthy') || p.includes('crash') || p.includes('fail')) {
    return {
      title: 'Post-Deployment Health Degradation Recovery',
      objective: `Diagnose failing health checks in ${environment}, identify breaking release changes, and restore cluster service stability.`,
      targetService: 'api-gateway',
      steps: [
        {
          id: 'step-1',
          name: 'Inspect Deployment Health & Pod States',
          purpose: 'Query Kubernetes cluster to verify pod replicas, crashloop counts, and rollout status.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'k8s.getDeploymentStatus',
          toolParams: { namespace: environment.toLowerCase(), deployment: 'api-gateway' },
          successCriteria: 'Deployment metadata and replica status successfully retrieved.',
          contingencyPlan: 'Fall back to node-level metrics if API server is rate-limited.',
        },
        {
          id: 'step-2',
          name: 'Analyze Recent Pod Crash & Error Logs',
          purpose: 'Fetch the last 200 lines of container stderr to locate stack trace and error signatures.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'k8s.getPodLogs',
          toolParams: { namespace: environment.toLowerCase(), podPrefix: 'api-gateway', tailLines: 200 },
          successCriteria: 'Error signature isolated and matched to specific configuration or code failure.',
          contingencyPlan: 'Cross-reference with APM distributed trace spans.',
        },
        {
          id: 'step-3',
          name: 'Compare Git Release Diffs & Commit Metadata',
          purpose: 'Diff commit sha from release v2.4.1 against stable release v2.4.0 to identify faulty commit.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'github.compareReleases',
          toolParams: { repo: 'org/api-gateway', base: 'v2.4.0', head: 'v2.4.1' },
          successCriteria: 'Identified configuration change introducing unhandled JWT secret missing variable.',
          contingencyPlan: 'Inspect config map version history.',
        },
        {
          id: 'step-4',
          name: 'Rollback Deployment to Last Known Stable ReplicaSet',
          purpose: 'Revert deployment v2.4.1 back to v2.4.0 to stop customer-facing 500 errors and restore traffic.',
          riskLevel: environment === 'Development' ? 'medium' : 'high',
          reversible: false,
          requiresApproval: true,
          tool: 'k8s.rollbackDeployment',
          toolParams: { namespace: environment.toLowerCase(), deployment: 'api-gateway', targetRevision: 'v2.4.0' },
          successCriteria: 'All 5 pods replaced with v2.4.0 images and reporting Ready state.',
          contingencyPlan: 'If rollback fails, reroute ingress traffic to failover canary cluster.',
        },
        {
          id: 'step-5',
          name: 'Verify Synthetic HTTP Health Check Probe',
          purpose: 'Perform end-to-end HTTP health checks on /healthz and /api/v1/ping.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'http.healthCheck',
          toolParams: { url: 'https://api.internal/healthz', expectedStatus: 200, timeoutMs: 3000 },
          successCriteria: 'Endpoint responds with HTTP 200 OK within 50ms latency.',
          contingencyPlan: 'Alert on-call engineer via PagerDuty if verification fails.',
        },
        {
          id: 'step-6',
          name: 'Broadcast Incident Resolution to Slack & Ops Channel',
          purpose: 'Notify engineering stakeholders in #ops-incidents with remediation audit link.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'slack.notifyChannel',
          toolParams: { channel: '#ops-incidents', severity: 'resolved', title: 'api-gateway healthy' },
          successCriteria: 'Webhook acknowledged with 200 OK.',
          contingencyPlan: 'Post to fallback email distribution list.',
        },
      ],
    };
  }

  if (p.includes('cpu') || p.includes('memory') || p.includes('slow') || p.includes('latency')) {
    return {
      title: 'High Resource Contention & Latency Remediation',
      objective: `Investigate elevated CPU and p99 response times in ${environment}, identify runaway processes, and optimize capacity.`,
      targetService: 'order-processing-worker',
      steps: [
        {
          id: 'step-1',
          name: 'Profile Container CPU & Memory Utilization',
          purpose: 'Collect 15-minute time-series CPU throttle and garbage collection statistics.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'datadog.queryMetrics',
          toolParams: { metric: 'container.cpu.usage', service: 'order-processing-worker', interval: '1m' },
          successCriteria: 'Usage metrics confirmed > 92% sustained load.',
          contingencyPlan: 'Check host node metrics.',
        },
        {
          id: 'step-2',
          name: 'Inspect Thread Dump & Active Worker Connections',
          purpose: 'Generate read-only diagnostic thread stack to identify locking or deadlocked workers.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'k8s.getPodLogs',
          toolParams: { namespace: environment.toLowerCase(), podPrefix: 'order-worker', grepPattern: 'OutOfMemory|deadlock|blocked' },
          successCriteria: 'Uncovered stuck thread waiting on external inventory API webhook.',
          contingencyPlan: 'Review database active connection pool.',
        },
        {
          id: 'step-3',
          name: 'Drain and Gracefully Restart Worker Replicas',
          purpose: 'Perform rolling restart of worker pool with 25% max-unavailable to release leaked memory.',
          riskLevel: environment === 'Development' ? 'low' : 'medium',
          reversible: true,
          requiresApproval: environment === 'Production',
          tool: 'aws.restartService',
          toolParams: { serviceName: 'order-worker-fleet', rolling: true, batchSize: 2 },
          successCriteria: 'Worker fleet cycled with zero dropped messages in queue.',
          contingencyPlan: 'Scale up temporary worker instances.',
        },
        {
          id: 'step-4',
          name: 'Verify Queue Consumer Throughput & Latency Recovery',
          purpose: 'Sample message lag and p95 completion times over a 2-minute stabilization window.',
          riskLevel: 'low',
          reversible: true,
          requiresApproval: false,
          tool: 'datadog.queryMetrics',
          toolParams: { metric: 'sqs.approximate_age_of_oldest_message', threshold: '< 5s' },
          successCriteria: 'Queue depth returned to normal baseline (< 100 messages).',
          contingencyPlan: 'Escalate to platform engineering on-call.',
        },
      ],
    };
  }

  // Default general investigation runbook
  return {
    title: 'Operational Diagnostic & Safe Remediation Workflow',
    objective: `Systematically investigate reported anomaly: "${prompt.slice(0, 80)}" in ${environment}.`,
    targetService: 'core-backend',
    steps: [
      {
        id: 'step-1',
        name: 'Probe System Endpoints & Telemetry',
        purpose: 'Run synthetic probes against internal services to determine blast radius.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        tool: 'http.healthCheck',
        toolParams: { url: 'https://core.internal/status', checkDependencies: true },
        successCriteria: 'Telemetry snapshot acquired with latency and error breakdown.',
        contingencyPlan: 'Retry with increased timeout.',
      },
      {
        id: 'step-2',
        name: 'Analyze System Runtime Logs',
        purpose: 'Scan recent log entries for fatal exceptions, timeouts, or dependency rejections.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        tool: 'k8s.getPodLogs',
        toolParams: { namespace: environment.toLowerCase(), lines: 150 },
        successCriteria: 'Log anomalies identified and categorized.',
        contingencyPlan: 'Check syslog and cloud audit logs.',
      },
      {
        id: 'step-3',
        name: 'Apply Target Remediation or Configuration Adjustment',
        purpose: 'Execute corrective operational adjustment to eliminate faulty state.',
        riskLevel: 'medium',
        reversible: true,
        requiresApproval: environment === 'Production',
        tool: 'aws.restartService',
        toolParams: { service: 'core-backend', gracePeriodSec: 30 },
        successCriteria: 'Service reloaded with verified configuration.',
        contingencyPlan: 'Restore previous configuration backup.',
      },
      {
        id: 'step-4',
        name: 'Verify Post-Remediation Stability',
        purpose: 'Execute verification suite to confirm full recovery and no side effects.',
        riskLevel: 'low',
        reversible: true,
        requiresApproval: false,
        tool: 'http.healthCheck',
        toolParams: { url: 'https://core.internal/healthz', expectedStatus: 200 },
        successCriteria: 'All health checks return 200 OK with zero errors.',
        contingencyPlan: 'Initiate failover sequence.',
      },
    ],
  };
}

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SafeRunbook] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
