import React from 'react';
import { FileText, Download, ExternalLink, FileSpreadsheet, Presentation, Archive, Image as ImageIcon } from 'lucide-react';

const DocumentCard = ({ file, onRemove = null, canManage = false }) => {
  if (!file) return null;

  const fileName = file.fileName || file.name || 'Attached File';
  const fileUrl = file.fileUrl || file.url || '';
  const fileSize = file.fileSize || file.size || 0;
  const ext = fileName.split('.').pop().toLowerCase();

  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000/${fileUrl.replace(/^\/+/, '')}`;

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDocBadge = (extension) => {
    switch (extension) {
      case 'pdf':
        return { icon: FileText, color: 'bg-red-50 text-red-600 border-red-150', label: 'PDF' };
      case 'ppt':
      case 'pptx':
        return { icon: Presentation, color: 'bg-amber-50 text-amber-600 border-amber-150', label: 'PPTX' };
      case 'doc':
      case 'docx':
        return { icon: FileText, color: 'bg-blue-50 text-blue-600 border-blue-150', label: 'DOCX' };
      case 'zip':
      case 'rar':
        return { icon: Archive, color: 'bg-purple-50 text-purple-600 border-purple-150', label: 'ZIP' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
        return { icon: ImageIcon, color: 'bg-emerald-50 text-emerald-600 border-emerald-150', label: 'IMAGE' };
      default:
        return { icon: FileText, color: 'bg-gray-50 text-gray-600 border-gray-150', label: extension.toUpperCase() };
    }
  };

  const docMeta = getDocBadge(ext);
  const IconComponent = docMeta.icon;

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-xs group">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`p-3 rounded-xl border ${docMeta.color} shrink-0`}>
          <IconComponent size={22} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {fileName}
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-mono">
              {docMeta.label}
            </span>
          </div>
          {fileSize > 0 && (
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              {formatFileSize(fileSize)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {fullUrl && (
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold border border-blue-150 transition-all shadow-2xs"
          >
            <Download size={14} />
            <span>Download</span>
          </a>
        )}

        {canManage && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(file._id || file.id)}
            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
            title="Delete File"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
