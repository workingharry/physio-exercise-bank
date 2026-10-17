import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Exercise } from '../../types/exercise';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { Eye, Bookmark, Plus, Check, Play, Dumbbell, Target, Scale } from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';

interface Props {
  exercise: Exercise;
  onQuickView?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, onQuickView }) => {
  const [, navigate] = useLocation();
  const { 
    routine, 
    addToRoutine, 
    removeFromRoutine, 
    bookmarks, 
    toggleBookmark, 
    comparisonIds, 
    toggleComparison, 
    addRecentlyViewed 
  } = useRoutineStore();
  const [imgError, setImgError] = useState(false);

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);
  const isComparing = comparisonIds.includes(exercise.id);

  // Extract YouTube ID for authentic thumbnail preview
  const ytMatch = exercise.media.videoUrl?.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
  const ytId = ytMatch && ytMatch[1].length === 11 ? ytMatch[1] : null;
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : exercise.media.thumbnailUrl;

  // Difficulty color
  const diffBadge = {
    'Beginner (初階)': 'bg-[#F5F2EB] text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    'Intermediate (中階)': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    'Advanced (進階)': 'bg-stone-200 text-stone-900 border-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:border-stone-600'
  }[exercise.difficulty] || 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';

  // Check if Chinese subtitle is distinct from English name
  const hasDistinctChinese = exercise.chineseName && exercise.chineseName.trim() !== exercise.name.trim();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    addRecentlyViewed(exercise.id);
    navigate(`/exercise/${exercise.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-[#201D1A] hover:bg-[#FAF8F5] dark:hover:bg-[#26221E] border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer ${
        isComparing 
          ? 'border-amber-700 ring-2 ring-amber-700/30' 
          : 'border-stone-200 dark:border-stone-800 hover:border-amber-700/60 dark:hover:border-amber-600/60'
      }`}
    >
      {/* Top Banner & Media Thumbnail */}
      <div>
        <div className="relative mb-3 h-36 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-900">
          {thumbnailUrl && !imgError ? (
            <img
              src={thumbnailUrl}
              alt={exercise.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-full w-full" badge={exercise.subRegion} />
          )}

          {/* Dark gradient overlay for bottom badge readability */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-stone-950/80 to-transparent pointer-events-none" />

          {/* Top-Left: Video Badge */}
          {exercise.media.videoUrl && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-950/85 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-amber-600/40 shadow-sm">
              <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>示範影片</span>
            </div>
          )}

          {/* Top-Right: Quick Actions (Compare, Quick View, Bookmark) */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleComparison(exercise.id);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition shadow-sm border ${
                isComparing
                  ? 'bg-amber-800 text-white border-amber-700 shadow-amber-900/30'
                  : 'bg-stone-950/80 text-stone-300 hover:text-white border-stone-700/60 hover:bg-amber-800/80'
              }`}
              title={isComparing ? '自動作對比中移除' : '加入動作並排對比 (最多3個)'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            {onQuickView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addRecentlyViewed(exercise.id);
                  onQuickView(exercise);
                }}
                className="p-1.5 rounded-lg bg-stone-950/80 hover:bg-amber-800 backdrop-blur-md text-stone-300 hover:text-white border border-stone-700/60 transition shadow-sm"
                title="快速抽屜預覽"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(exercise.id);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition shadow-sm border ${
                isBookmarked
                  ? 'bg-amber-700 text-white border-amber-600'
                  : 'bg-stone-950/80 text-stone-300 hover:text-white border-stone-700/60'
              }`}
              title="儲存至學習書籤"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Bottom-Right: Kinetic Chain Pill */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-[11px] font-medium text-stone-300 border border-stone-700/60">
            {exercise.biomechanics.kineticChain}
          </div>
        </div>

        {/* Emphasized Clinical Badges (Difficulty & Phase only) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${diffBadge}`}>
            {exercise.difficulty}
          </span>
          {exercise.rehabPhase[0] && (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#F5F2EB] dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-stone-200 dark:border-stone-700 truncate max-w-[170px]">
              {exercise.rehabPhase[0].split(':')[0]}
            </span>
          )}
        </div>

        {/* Exercise Title: English + Chinese */}
        <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition line-clamp-2 leading-snug">
          {exercise.name}
        </h3>
        {hasDistinctChinese && (
          <span className="text-xs text-amber-800 dark:text-amber-400 font-medium block line-clamp-1 mt-1">
            {exercise.chineseName}
          </span>
        )}

        {/* 4 Core Parameters: Target Muscles & Equipment */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 space-y-1.5 text-xs">
          <div className="text-stone-600 dark:text-stone-300 flex items-center gap-1.5 line-clamp-1">
            <Dumbbell className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              <strong className="text-stone-700 dark:text-stone-200 font-medium">主動肌:</strong>{' '}
              {exercise.biomechanics.primaryMuscles.slice(0, 3).join(', ') || '目標肌群'}
            </span>
          </div>

          <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 line-clamp-1">
            <Target className="w-3.5 h-3.5 text-amber-800/70 shrink-0" />
            <span>
              <strong className="text-stone-600 dark:text-stone-300 font-medium">器材:</strong>{' '}
              {exercise.equipment.length > 0 ? exercise.equipment.slice(0, 2).join(', ') : '徒手 / 無器材'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions: Primary Add-to-Routine Button & Details */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <Link
          href={`/exercise/${exercise.id}`}
          onClick={(e) => {
            e.stopPropagation();
            addRecentlyViewed(exercise.id);
          }}
          className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 transition py-1 px-1"
        >
          查看詳情 →
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAdded) {
              removeFromRoutine(exercise.id);
            } else {
              addToRoutine(exercise.id);
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
            isAdded
              ? 'bg-amber-100/70 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-stone-200 dark:hover:bg-stone-800'
              : 'bg-amber-800 hover:bg-amber-900 text-amber-50 shadow-amber-900/20 active:scale-95'
          }`}
          title={isAdded ? '點擊自處方移除' : '加入病患處方 (HEP)'}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>已加處方</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>加入處方</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
