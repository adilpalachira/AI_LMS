import React from 'react';
import PdfViewer from './PdfViewer';
import VideoPlayer from './VideoPlayer';
import DocumentCard from './DocumentCard';
import { FileText, Link as LinkIcon, FileCode } from 'lucide-react';

const FilePreview = ({ lesson, materials = [] }) => {
  if (!lesson) return null;

  const { contentType, textNote, externalUrl } = lesson;

  // Render YouTube or External URL
  if (contentType === 'YouTube' || contentType === 'External URL') {
    if (contentType === 'YouTube' && externalUrl) {
      return <VideoPlayer url={externalUrl} title={lesson.title} />;
    }
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <LinkIcon size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{lesson.title}</h4>
            <p className="text-xs text-gray-500">External Resource Link</p>
          </div>
        </div>

        {externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-xs"
          >
            <span>Visit External Resource</span>
            <LinkIcon size={14} />
          </a>
        ) : (
          <p className="text-xs text-gray-400 font-medium">No external link provided.</p>
        )}
      </div>
    );
  }

  // Render Text Note
  if (contentType === 'Text Note') {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <FileText size={16} className="text-blue-600" />
          Lesson Note
        </div>
        <div className="prose prose-slate max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-line font-normal bg-gray-50/50 p-6 rounded-xl border border-gray-150">
          {textNote || 'No note text provided for this lesson.'}
        </div>
      </div>
    );
  }

  // Render Video content
  if (contentType === 'Video') {
    const videoMat = materials.find(m => m.fileType === 'video' || m.mimeType?.includes('video'));
    if (videoMat) {
      return <VideoPlayer url={videoMat.fileUrl} title={lesson.title} />;
    }
  }

  // Render PDF content
  if (contentType === 'PDF') {
    const pdfMat = materials.find(m => m.fileType === 'pdf' || m.mimeType?.includes('pdf'));
    if (pdfMat) {
      return <PdfViewer url={pdfMat.fileUrl} fileName={pdfMat.fileName} />;
    }
  }

  // Render Image content
  if (contentType === 'Image') {
    const imgMat = materials.find(m => m.fileType === 'image' || m.mimeType?.includes('image'));
    if (imgMat) {
      const fullUrl = imgMat.fileUrl.startsWith('http') ? imgMat.fileUrl : `http://localhost:5000/${imgMat.fileUrl.replace(/^\/+/, '')}`;
      return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="max-h-[600px] overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
            <img
              src={fullUrl}
              alt={imgMat.fileName || lesson.title}
              className="max-h-[600px] w-auto object-contain"
            />
          </div>
          <p className="text-xs font-bold text-gray-700 text-center">{imgMat.fileName}</p>
        </div>
      );
    }
  }

  // Generic fallback if material list available
  if (materials.length > 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Attached Learning Materials ({materials.length})
        </h4>
        <div className="space-y-2.5">
          {materials.map(mat => (
            <DocumentCard key={mat._id} file={mat} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-2">
      <FileCode size={32} className="mx-auto text-gray-400" />
      <h4 className="text-sm font-bold text-gray-900">No Content Preview Available</h4>
      <p className="text-xs text-gray-500">No material files or text notes have been uploaded to this lesson yet.</p>
    </div>
  );
};

export default FilePreview;
