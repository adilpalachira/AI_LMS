import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

const PdfViewer = ({ url, fileName }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!url) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 text-xs font-semibold">
        No PDF document URL provided
      </div>
    );
  }

  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000/${url.replace(/^\/+/, '')}`;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl ring-1 ring-slate-900/10' : 'w-full h-[650px]'
      }`}
    >
      {/* Header bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 shrink-0">
            <FileText size={18} />
          </div>
          <span className="text-xs font-bold text-gray-900 truncate max-w-sm">
            {fileName || 'PDF Document'}
          </span>
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
          src={`${fullUrl}#toolbar=1&navpanes=0`}
          title={fileName || 'PDF Viewer'}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default PdfViewer;
