import React from 'react';
import { FileText, Bookmark } from 'lucide-react';

export default function SourceReference({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3.5 border-t border-gray-100">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
        <Bookmark className="w-3.5 h-3.5 text-blue-600" />
        <span>Verified Course Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2.5 bg-white border border-gray-200/80 hover:border-blue-200 rounded-xl text-xs transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-100 transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-gray-900 truncate leading-snug">{src.fileName}</p>
                {src.lessonName && (
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{src.lessonName}</p>
                )}
              </div>
            </div>
            
            {src.pageNumber && (
              <span className="shrink-0 bg-blue-50 border border-blue-150 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono">
                p. {src.pageNumber}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
