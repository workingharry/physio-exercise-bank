import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ExternalLink, Gauge, Repeat } from 'lucide-react';

interface Props {
  videoUrl?: string;
  videoType?: 'local' | 'youtube' | 'gif';
  title?: string;
}

export const VideoPlayer: React.FC<Props> = ({ videoUrl, videoType = 'youtube', title }) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        <Play className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">此運動暫無直接影片連結，可點擊上方關鍵字搜尋</p>
      </div>
    );
  }

  // Extract YouTube ID if applicable
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(videoUrl);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        {ytId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=0&loop=${isLooping ? '1' : '0'}&playlist=${ytId}&rel=0`}
            title={title || "Exercise Demonstration"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <video
              className="w-full h-full object-contain"
              src={videoUrl}
              loop={isLooping}
              autoPlay={isPlaying}
              muted
              playsInline
              ref={(ref) => {
                if (ref) ref.playbackRate = playbackRate;
              }}
            />
          </div>
        )}
      </div>

      {/* Clinical Video Control Bar */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-teal-400" />
            慢動作分析:
          </span>
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            {[0.5, 0.75, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  playbackRate === rate
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Loop toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
              isLooping
                ? 'bg-teal-950/60 border-teal-500/50 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="循環播放生物力學分解"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{isLooping ? '循環中' : '單次'}</span>
          </button>

          {/* External YouTube link */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>開新分頁播放</span>
          </a>
        </div>
      </div>
    </div>
  );
};
