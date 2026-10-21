import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode2, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalViewerProps {
  logs?: string[];
  output?: Record<string, any>;
  title?: string;
  className?: string;
}

export const TerminalViewer: React.FC<TerminalViewerProps> = ({
  logs = [],
  output,
  title = 'Execution Logs',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'output'>('logs');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const copyContent = () => {
    const textToCopy =
      activeTab === 'logs'
        ? logs.join('\n')
        : JSON.stringify(output, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLogLine = (line: string, index: number) => {
    let textColor = 'text-slate-300';
    if (line.includes('[CRITICAL]') || line.includes('[FATAL]') || line.includes('[FAIL]')) {
      textColor = 'text-rose-400 font-medium';
    } else if (line.includes('[WARN]')) {
      textColor = 'text-amber-300';
    } else if (line.includes('[SUCCESS]') || line.includes('[PASS]')) {
      textColor = 'text-emerald-400 font-medium';
    } else if (line.includes('[EXEC]')) {
      textColor = 'text-sky-300';
    } else if (line.includes('[AUTH CHECK]')) {
      textColor = 'text-purple-300 font-medium';
    }

    return (
      <div key={index} className="flex items-start gap-3 py-0.5 leading-relaxed hover:bg-slate-900/60 px-2 rounded">
        <span className="text-slate-600 select-none text-[11px] font-mono w-7 text-right shrink-0">
          {index + 1}
        </span>
        <span className={`font-mono text-xs ${textColor} break-all select-text`}>
          {line}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg border border-slate-800 bg-slate-950 flex flex-col overflow-hidden transition-all duration-200 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : className
      }`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Tab selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Standard Output ({logs.length})</span>
            </button>

            {output && (
              <button
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                  activeTab === 'output'
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Structured Output (JSON)</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyContent}
            title="Copy content"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand full screen'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-auto p-3 font-mono text-xs max-h-[380px] bg-slate-950/90 text-slate-200">
        {activeTab === 'logs' ? (
          logs.length > 0 ? (
            <div className="space-y-0.5">{logs.map(formatLogLine)}</div>
          ) : (
            <div className="text-slate-500 py-6 text-center italic font-mono text-xs">
              No logs recorded yet. Execution will stream logs in real-time.
            </div>
          )
        ) : output ? (
          <pre className="text-slate-300 font-mono text-xs p-2 overflow-x-auto whitespace-pre">
            {JSON.stringify(output, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-500 py-6 text-center italic font-mono text-xs">
            No structured output payload available.
          </div>
        )}
      </div>
    </div>
  );
};
