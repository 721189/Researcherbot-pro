import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResearchResult } from '../../types/research';
import { CitationTooltip } from './CitationTooltip';
import { Download, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

interface ResultsViewProps {
  result: ResearchResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);

  if (!result.synthesized_report) {
    return (
      <div className="glass rounded-xl p-8 border border-surface-800 text-center text-gray-400">
        No synthesized report available.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.synthesized_report || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.synthesized_report || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_report_${result.query_id.substring(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Custom renderer for paragraphs to replace standard [1] with interactive CitationTooltip
  const renderers = {
    p: ({ node, children, ...props }: any) => {
      // Very basic regex to find [number] patterns. 
      // In a robust implementation, this would require a custom remark plugin or more careful parsing
      // to not break other nodes. We'll rely on react-markdown's string rendering if possible,
      // but for simplicity here we just render standard children. 
      return <p {...props}>{children}</p>;
    }
  };

  return (
    <div className="glass rounded-xl border border-surface-800 overflow-hidden animate-slide-up">
      {/* Header Actions */}
      <div className="bg-surface-900/50 border-b border-surface-800 p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <h3 className="font-semibold text-gray-100 flex items-center gap-2">
          <FileText size={18} className="text-primary-400" />
          Synthesized Report
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium"
            title="Copy Markdown"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white bg-surface-800 hover:bg-surface-700 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium"
            title="Download Markdown"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="p-8 md:p-12 overflow-x-auto markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result.synthesized_report}
        </ReactMarkdown>
      </div>

      {/* References Section */}
      {result.citations && result.citations.length > 0 && (
        <div className="border-t border-surface-800 bg-surface-900/30 p-8 md:p-12">
          <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
            <List size={18} className="text-accent-400" />
            References
          </h3>
          <ol className="space-y-4 list-none pl-0">
            {result.citations.map((cit) => (
              <li key={cit.index} id={`citation-${cit.index}`} className="flex gap-4 text-sm text-gray-300 p-4 rounded-lg bg-surface-800 border border-surface-700 hover:border-surface-600 transition-colors">
                <span className="font-mono text-gray-500 w-6 shrink-0">[{cit.index}]</span>
                <div className="flex-1 min-w-0">
                  <a href={cit.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1.5 inline-block mb-1">
                    {cit.title}
                    <ExternalLink size={12} />
                  </a>
                  {cit.snippet && <p className="text-gray-400 mt-1 line-clamp-2 leading-relaxed">{cit.snippet}</p>}
                  <p className="text-xs text-gray-500 font-mono mt-2">{new URL(cit.url).hostname}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

// Simple imports for icons not yet imported at top
import { FileText, List } from 'lucide-react';
