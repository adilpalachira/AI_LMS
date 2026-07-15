import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, X, Film, FileText, Image as ImageIcon, Archive } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';

const FileUpload = ({ onFileSelect, uploadProgress = null, maxSizeBytes = 100 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypesRegex = /jpeg|jpg|png|webp|gif|pdf|ppt|pptx|doc|docx|mp4|webm|mkv|avi|mov|zip|rar/;

  const validateAndSelectFile = (file) => {
    setError('');
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedTypesRegex.test(ext)) {
      setError('Invalid file type. Allowed formats: PDF, PPT, DOCX, Images, Videos, ZIP.');
      return;
    }

    if (file.size > maxSizeBytes) {
      const mbLimit = Math.round(maxSizeBytes / (1024 * 1024));
      setError(`File size exceeds maximum allowed limit of ${mbLimit}MB.`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return <Film size={20} className="text-purple-600" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <ImageIcon size={20} className="text-emerald-600" />;
    if (['zip', 'rar'].includes(ext)) return <Archive size={20} className="text-amber-600" />;
    return <FileText size={20} className="text-blue-600" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 w-full">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            className="hidden"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mkv,.avi,.mov,.zip,.rar"
          />
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
            <UploadCloud size={22} />
          </div>
          <p className="text-xs font-bold text-gray-800">
            Click to upload <span className="font-normal text-gray-500">or drag and drop</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Supported: PDF, PPTX, DOCX, MP4, Images, ZIP (Max 100MB)
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl shrink-0">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-gray-400 font-mono">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {uploadProgress !== null && uploadProgress >= 0 && (
            <ProgressIndicator percentage={uploadProgress} label="Uploading file..." size="sm" />
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-150 p-3 rounded-xl">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
