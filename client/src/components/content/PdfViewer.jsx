import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Maximize2, Minimize2, Bookmark, Sparkles } from 'lucide-react';

const PdfViewer = ({ url, fileName, targetPage, page, focusTopic }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!url) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 text-xs font-semibold">
        No PDF document URL provided
      </div>
    );
  }

  const activePage = targetPage || page;
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000/${url.replace(/^\/+/, '')}`;
  const iframeSrc = activePage
    ? `${fullUrl}#page=${activePage}&toolbar=1&navpanes=0`
    : `${fullUrl}#toolbar=1&navpanes=0`;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-1 ring-slate-900/10' : 'w-full h-[650px]'
      }`}
    >
      {/* Header bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 shrink-0">
            <FileText size={18} />
          </div>
          <span className="text-xs font-bold text-gray-900 truncate max-w-sm">
            {fileName || 'PDF Document'}
          </span>

          {activePage && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <Bookmark size={11} className="text-amber-600" />
              Page {activePage}
            </span>
          )}

          {focusTopic && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full text-[10px] font-semibold hidden md:inline-flex">
              <Sparkles size={10} className="text-blue-600" />
              {focusTopic}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Open in New Tab</span>
          </a>

          <a
            href={fullUrl}
            download
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <Download size={13} />
            <span>Download</span>
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* PDF View Container */}
      <div className="flex-1 bg-slate-100 relative">
        <iframe
          src={iframeSrc}
          title={fileName || 'PDF Viewer'}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default PdfViewer;
