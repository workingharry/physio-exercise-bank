import React, { useState, useRef } from 'react';
import { Play, RotateCcw, ExternalLink, Gauge, Repeat, Search, AlertCircle, Video } from 'lucide-react';

interface Props {
  videoUrl?: string;
  videoType?: 'local' | 'youtube' | 'gif';
  title?: string;
}

export const VideoPlayer: React.FC<Props> = ({ videoUrl, videoType = 'youtube', title }) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
        <Play className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">此運動暫無直接影片連結，可點擊上方關鍵字搜尋</p>
      </div>
    );
  }

  // Extract YouTube ID if applicable (supports watch?v=, youtu.be/, embed/, etc.)
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYouTubeId(videoUrl);

  // Check if it's a YouTube search query URL (26 exercises in database)
  const isSearchUrl = videoUrl.includes('youtube.com/results') || videoUrl.includes('/results?search_query=');
  let searchQuery = '';
  if (isSearchUrl) {
    try {
      const urlObj = new URL(videoUrl);
      searchQuery = urlObj.searchParams.get('search_query') || '';
    } catch {
      searchQuery = title || '';
    }
  }

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    // If local HTML5 video
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    // If YouTube iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [rate] }),
        '*'
      );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black">
        {ytId ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&rel=0&loop=${isLooping ? '1' : '0'}&playlist=${ytId}`}
            title={title || "Exercise Demonstration"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : isSearchUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3 shadow-lg shadow-red-900/10">
              <Search className="w-7 h-7" />
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
              YouTube 臨床示範檢索
            </span>
            <h4 className="text-sm font-bold text-slate-200 mb-1 max-w-md">
              {searchQuery ? decodeURIComponent(searchQuery) : (title || '示範影片')}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              此運動在文獻資料庫中以關鍵字檢索提供，點擊下方即可直接在 YouTube 觀看實證治療師之分解示範。
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-lg shadow-red-600/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>在 YouTube 上搜尋觀看示範</span>
            </a>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoUrl}
              loop={isLooping}
              autoPlay
              muted
              playsInline
            />
          </div>
        )}
      </div>

      {/* Clinical Notice on YouTube Embed Limitations */}
      {ytId && (
        <div className="px-3.5 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="flex-1">
            若影片顯示「無法在此播放」，係因原醫學頻道設定了版權防外部嵌入保護，請點擊下方 <span className="text-teal-300 font-medium">【在 YouTube 開新分頁播放】</span> 即可完整觀看。
          </p>
        </div>
      )}

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
                onClick={() => handleRateChange(rate)}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-medium border border-red-500/30 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>在 YouTube 開新分頁播放</span>
          </a>
        </div>
      </div>
    </div>
  );
};
