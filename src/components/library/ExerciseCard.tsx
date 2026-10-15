import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Exercise } from '../../types/exercise';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { Eye, Bookmark, Plus, Check, Play, Dumbbell, Target } from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';

interface Props {
  exercise: Exercise;
  onQuickView?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, onQuickView }) => {
  const [, navigate] = useLocation();
  const { routine, addToRoutine, removeFromRoutine, bookmarks, toggleBookmark } = useRoutineStore();
  const [imgError, setImgError] = useState(false);

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);

  // Extract YouTube ID for authentic thumbnail preview
  const ytMatch = exercise.media.videoUrl?.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
  const ytId = ytMatch && ytMatch[1].length === 11 ? ytMatch[1] : null;
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : exercise.media.thumbnailUrl;

  // Difficulty color
  const diffBadge = {
    'Beginner (初階)': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-700/60',
    'Intermediate (中階)': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/60',
    'Advanced (進階)': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700/60'
  }[exercise.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  // Check if Chinese subtitle is distinct from English name
  const hasDistinctChinese = exercise.chineseName && exercise.chineseName.trim() !== exercise.name.trim();

  return (
    <div 
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        navigate(`/exercise/${exercise.id}`);
      }}
      className="group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/50 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-lg dark:shadow-md dark:hover:shadow-teal-500/10 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Banner & Media Thumbnail */}
      <div>
        <div className="relative mb-3 h-36 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
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
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

          {/* Top-Left: Video Badge */}
          {exercise.media.videoUrl && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-teal-300 border border-teal-500/40 shadow-sm">
              <Play className="w-3 h-3 fill-teal-400 text-teal-400" />
              <span>示範影片</span>
            </div>
          )}

          {/* Top-Right: Quick Actions (Quick View & Bookmark) */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(exercise);
                }}
                className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-teal-600 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/60 transition shadow-sm"
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
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-700/60'
              }`}
              title="儲存至學習書籤"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Bottom-Right: Kinetic Chain Pill */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-slate-700/60">
            {exercise.biomechanics.kineticChain}
          </div>
        </div>

        {/* Emphasized Clinical Badges (Difficulty & Phase only) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${diffBadge}`}>
            {exercise.difficulty}
          </span>
          {exercise.rehabPhase[0] && (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700 truncate max-w-[170px]">
              {exercise.rehabPhase[0].split(':')[0]}
            </span>
          )}
        </div>

        {/* Exercise Title: English + Chinese */}
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition line-clamp-2 leading-snug">
          {exercise.name}
        </h3>
        {hasDistinctChinese && (
          <span className="text-xs text-teal-700 dark:text-teal-400 font-medium block line-clamp-1 mt-1">
            {exercise.chineseName}
          </span>
        )}

        {/* 4 Core Parameters: Target Muscles & Equipment */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
          <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 line-clamp-1">
            <Dumbbell className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>
              <strong className="text-slate-700 dark:text-slate-200 font-medium">主動肌:</strong>{' '}
              {exercise.biomechanics.primaryMuscles.slice(0, 3).join(', ') || '目標肌群'}
            </span>
          </div>

          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 line-clamp-1">
            <Target className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>
              <strong className="text-slate-600 dark:text-slate-300 font-medium">器材:</strong>{' '}
              {exercise.equipment.length > 0 ? exercise.equipment.slice(0, 2).join(', ') : '徒手 / 無器材'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions: Primary Add-to-Routine Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <Link
          href={`/exercise/${exercise.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 transition py-1 px-1"
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
              ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20 active:scale-95'
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
