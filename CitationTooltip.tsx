import React, { useState } from 'react';
import { Citation } from '../../types/research';
import { ExternalLink } from 'lucide-react';

interface CitationTooltipProps {
  citationIndex: number;
  citation: Citation | undefined;
  children: React.ReactNode;
}

export const CitationTooltip: React.FC<CitationTooltipProps> = ({ citationIndex, citation, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!citation) {
    return <span className="text-gray-500 cursor-not-allowed">[{citationIndex}]</span>;
  }

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <a 
        href={`#citation-${citation.index}`} 
        className="text-primary-400 hover:text-primary-300 hover:underline px-0.5 rounded transition-colors text-xs align-super"
      >
        [{citation.index}]
      </a>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 z-50 animate-fade-in">
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4 shadow-xl">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h4 className="text-sm font-semibold text-gray-100 line-clamp-2 leading-tight">
                {citation.title}
              </h4>
              <a 
                href={citation.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 shrink-0 mt-0.5"
                title="Open original source"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            {citation.snippet && (
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                "{citation.snippet}"
              </p>
            )}
            <div className="mt-2 text-[10px] text-gray-500 truncate font-mono bg-surface-900 px-2 py-1 rounded">
              {new URL(citation.url).hostname}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface-800 border-b border-r border-surface-700 transform rotate-45"></div>
        </div>
      )}
    </span>
  );
};
