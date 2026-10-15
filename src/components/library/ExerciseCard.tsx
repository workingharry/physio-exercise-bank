import React from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { Eye, Bookmark, Plus, Check, Play, ChevronRight, Dumbbell } from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';

interface Props {
  exercise: Exercise;
  onQuickView?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, onQuickView }) => {
  const { routine, addToRoutine, removeFromRoutine, bookmarks, toggleBookmark } = useRoutineStore();

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);

  // Difficulty color
  const diffBadge = {
    'Beginner (初階)': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-700/60',
    'Intermediate (中階)': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700/60',
    'Advanced (進階)': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700/60'
  }[exercise.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  return (
    <div className="group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500/50 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-teal-500/5 flex flex-col justify-between">
      {/* Top Banner & Bookmark */}
      <div>
        <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
          <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-36 w-full" badge={exercise.subRegion} />

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(exercise.id);
            }}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition ${
              isBookmarked
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="儲存至學習書籤"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Video Demonstration Pill */}
          {exercise.media.videoUrl && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-[10px] text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
              <Play className="w-3 h-3 fill-current" />
              <span>示範影片</span>
            </div>
          )}

          {/* Kinetic Chain Pill */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
            {exercise.biomechanics.kineticChain}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${diffBadge}`}>
            {exercise.difficulty}
          </span>
          {exercise.movementType.slice(0, 2).map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-teal-50 text-teal-800 dark:bg-slate-800 dark:text-teal-300 border border-teal-100 dark:border-slate-700/80"
            >
              {type}
            </span>
          ))}
          {exercise.rehabPhase[0] && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 truncate max-w-[150px]">
              {exercise.rehabPhase[0].split(':')[0]}
            </span>
          )}
        </div>

        {/* Exercise Title */}
        <Link href={`/exercise/${exercise.id}`}>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-300 transition line-clamp-2 cursor-pointer mb-1">
            {exercise.name}
          </h3>
        </Link>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
          {exercise.chineseName}
        </span>

        {/* Target Muscles */}
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 line-clamp-2">
          <Dumbbell className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-700 dark:text-slate-300 font-medium">主動肌:</strong>{' '}
            {exercise.biomechanics.primaryMuscles.join(', ') || '下肢目標肌群'}
          </span>
        </div>

        {/* Pathologies */}
        {exercise.targetPathologies.length > 0 && (
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            <span className="text-teal-600 dark:text-teal-400/90 font-medium">適應症:</span> {exercise.targetPathologies[0]}
          </p>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
        {onQuickView && (
          <button
            onClick={() => onQuickView(exercise)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            title="側欄快速預覽"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>預覽</span>
          </button>
        )}

        <Link
          href={`/exercise/${exercise.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition truncate border border-slate-200 dark:border-transparent"
        >
          <span>完整分析</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </Link>

        <button
          onClick={() => {
            if (isAdded) {
              removeFromRoutine(exercise.id);
            } else {
              addToRoutine(exercise.id);
            }
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
            isAdded
              ? 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-500/30 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20'
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
