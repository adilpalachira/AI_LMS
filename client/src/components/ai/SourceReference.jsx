import React from 'react';
import { FileText, Bookmark, ExternalLink } from 'lucide-react';

export default function SourceReference({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
        <Bookmark className="w-3.5 h-3.5 text-blue-600" />
        <span>Course Sources & References ({sources.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sources.map((src, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{src.fileName}</span>
            {src.lessonName && (
              <span className="text-slate-400 font-normal">({src.lessonName})</span>
            )}
            {src.pageNumber && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold">
                Page {src.pageNumber}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
