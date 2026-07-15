import React from 'react';
import { PlayCircle, ExternalLink } from 'lucide-react';

const VideoPlayer = ({ url, title }) => {
  if (!url) {
    return (
      <div className="bg-gray-900 text-white rounded-2xl p-12 text-center space-y-3">
        <PlayCircle size={40} className="mx-auto text-gray-500 animate-pulse" />
        <p className="text-xs text-gray-400 font-medium">No video source provided</p>
      </div>
    );
  }

  // Check if YouTube URL
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  
  const getYouTubeEmbedUrl = (rawUrl) => {
    try {
      if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=0`;
      }
      if (rawUrl.includes('watch?v=')) {
        const id = rawUrl.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=0`;
      }
    } catch (e) {
      console.error('Failed to parse YouTube URL', e);
    }
    return rawUrl;
  };

  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000/${url.replace(/^\/+/, '')}`;

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-md border border-gray-800 space-y-0">
      {isYouTube ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={getYouTubeEmbedUrl(url)}
            title={title || 'YouTube Video'}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            controls
            controlsList="nodownload"
            className="w-full h-full object-contain"
            src={fullUrl}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
