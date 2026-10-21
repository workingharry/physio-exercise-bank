import React, { useState, useRef } from 'react';
import { Play, RotateCcw, ExternalLink, Gauge, Repeat, Search, AlertCircle, Video, Image as ImageIcon } from 'lucide-react';

interface Props {
  videoUrl?: string;
  videoType?: 'local' | 'youtube' | 'gif';
  title?: string;
}

// Extract YouTube ID if applicable
export const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const VideoPlayer: React.FC<Props> = ({ videoUrl, videoType = 'youtube', title }) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [useDirectMode, setUseDirectMode] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#FAF8F5] dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl text-stone-600 dark:text-stone-400">
        <Play className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">此運動暫無直接影片連結，可點擊上方關鍵字搜尋</p>
      </div>
    );
  }

  const ytId = getYouTubeId(videoUrl);
  const ytThumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
  const directWatchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : videoUrl;

  // Check if it's a YouTube search query URL
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
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [rate] }),
        '*'
      );
    }
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {ytId ? (
          useDirectMode ? (
            /* Direct Thumbnail Fallback Mode: Clean, prominent, no grey empty iframe */
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-stone-950">
              {ytThumbnail && (
                <img
                  src={ytThumbnail}
                  alt={title || 'YouTube Demonstration'}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
                />
              )}
              <div className="absolute inset-0 bg-stone-950/60" />
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <a
                  href={directWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-600/40 hover:scale-110 transition mb-4 group"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </a>
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-2">
                  {title || '觀看 YouTube 臨床示範影片'}
                </h4>
                <p className="text-xs text-stone-300 mb-4 leading-relaxed">
                  原頻道設有外部嵌入保護，點擊下方按鈕即可直接於 YouTube 開啟高畫質示範。
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={directWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>在 YouTube 觀看</span>
                  </a>
                  <button
                    onClick={() => setUseDirectMode(false)}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition"
                  >
                    嘗試內嵌播放
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Embedded iframe */
            <>
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&rel=0&loop=${isLooping ? '1' : '0'}&playlist=${ytId}`}
                title={title || "Exercise Demonstration"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              {/* Quick direct watch pill in corner */}
              <a
                href={directWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-lg backdrop-blur-md transition"
                title="若內嵌播放被頻道版權限制，點此直接開啟"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>在 YouTube 觀看</span>
              </a>
            </>
          )
        ) : isSearchUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1C1917] via-stone-900 to-amber-950/20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3 shadow-lg shadow-amber-900/10">
              <Search className="w-7 h-7" />
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              YouTube 臨床示範檢索
            </span>
            <h4 className="text-sm font-bold text-stone-200 mb-1 max-w-md">
              {searchQuery ? decodeURIComponent(searchQuery) : (title || '示範影片')}
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mb-4 leading-relaxed">
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
          <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
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

      {/* Helpful Fallback Prompt when in iframe mode */}
      {ytId && !useDirectMode && (
        <div className="px-3.5 py-2 bg-stone-100 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>畫面若顯示「無法在此播放」，係因原頻道限制外部嵌入：</span>
          </div>
          <button
            onClick={() => setUseDirectMode(true)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-semibold underline underline-offset-2 shrink-0"
          >
            切換為縮圖直連模式
          </button>
        </div>
      )}

      {/* Clinical Video Control Bar */}
      <div className="p-3.5 bg-stone-50 dark:bg-[#1C1917] border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            慢動作分析:
          </span>
          <div className="flex items-center bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-300 dark:border-stone-700">
            {[0.5, 0.75, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${
                  playbackRate === rate
                    ? 'bg-amber-600 dark:bg-amber-800 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
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
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
            title="循環播放生物力學分解"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{isLooping ? '循環中' : '單次'}</span>
          </button>

          {/* External YouTube link */}
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium border border-red-500/30 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>在 YouTube 觀看</span>
          </a>
        </div>
      </div>
    </div>
  );
};
