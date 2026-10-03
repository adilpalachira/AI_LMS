import React, { useRef, useEffect } from 'react';
import { PlayCircle, Clock, Sparkles } from 'lucide-react';

const VideoPlayer = ({ url, title, startTime, focusTopic }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (startTime && videoRef.current) {
      const seekTime = Number(startTime);
      if (!isNaN(seekTime) && seekTime > 0) {
        const handleLoaded = () => {
          videoRef.current.currentTime = seekTime;
        };
        if (videoRef.current.readyState >= 1) {
          videoRef.current.currentTime = seekTime;
        } else {
          videoRef.current.addEventListener('loadedmetadata', handleLoaded, { once: true });
        }
      }
    }
  }, [startTime, url]);

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
      const startParam = startTime ? `&start=${Math.floor(Number(startTime))}` : '';
      if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=0${startParam}`;
      }
      if (rawUrl.includes('watch?v=')) {
        const id = rawUrl.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}?autoplay=0${startParam}`;
      }
    } catch (e) {
      console.error('Failed to parse YouTube URL', e);
    }
    return rawUrl;
  };

  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000/${url.replace(/^\/+/, '')}`;
  const videoMediaSrc = startTime ? `${fullUrl}#t=${Math.floor(Number(startTime))}` : fullUrl;

  const formattedTimestamp = startTime
    ? `${Math.floor(Number(startTime) / 60)}:${String(Math.floor(Number(startTime) % 60)).padStart(2, '0')}`
    : null;

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-md border border-gray-800 space-y-0">
      {(formattedTimestamp || focusTopic) && (
        <div className="bg-slate-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white truncate">{title || 'Video Lecture'}</span>
            {focusTopic && (
              <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <Sparkles size={10} />
                {focusTopic}
              </span>
            )}
          </div>
          {formattedTimestamp && (
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <Clock size={11} />
              Jumped to {formattedTimestamp}
            </span>
          )}
        </div>
      )}

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
            ref={videoRef}
            controls
            controlsList="nodownload"
            className="w-full h-full object-contain"
            src={videoMediaSrc}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
