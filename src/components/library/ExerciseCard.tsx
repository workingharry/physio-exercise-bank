import React from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { Eye, Bookmark, Plus, Check, Play, ChevronRight, AlertCircle, Dumbbell } from 'lucide-react';
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
    'Beginner (初階)': 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
    'Intermediate (中階)': 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    'Advanced (進階)': 'bg-purple-950/80 text-purple-300 border-purple-700/60'
  }[exercise.difficulty] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 transition-all duration-200 shadow-lg hover:shadow-teal-500/5 flex flex-col justify-between">
      {/* Top Banner & Bookmark */}
      <div>
        <div className="relative mb-3 rounded-xl overflow-hidden">
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
                : 'bg-slate-900/80 text-slate-400 hover:text-white'
            }`}
            title="儲存至學習書籤"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Video Demonstration Pill */}
          {exercise.media.videoUrl && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] text-teal-300 border border-teal-500/30">
              <Play className="w-3 h-3 fill-current" />
              <span>示範影片</span>
            </div>
          )}

          {/* Kinetic Chain Pill */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 border border-slate-700/60">
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
              className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-teal-300 border border-slate-700/80"
            >
              {type}
            </span>
          ))}
          {exercise.rehabPhase[0] && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 truncate max-w-[150px]">
              {exercise.rehabPhase[0].split(':')[0]}
            </span>
          )}
        </div>

        {/* Exercise Title */}
        <Link href={`/exercise/${exercise.id}`}>
          <h3 className="font-bold text-sm text-slate-100 hover:text-teal-300 transition line-clamp-2 cursor-pointer mb-1">
            {exercise.name}
          </h3>
        </Link>

        {/* Target Muscles */}
        <div className="mt-2 text-xs text-slate-400 flex items-start gap-1.5 line-clamp-2">
          <Dumbbell className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 font-medium">主動肌:</strong>{' '}
            {exercise.biomechanics.primaryMuscles.join(', ') || '下肢目標肌群'}
          </span>
        </div>

        {/* Pathologies */}
        {exercise.targetPathologies.length > 0 && (
          <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-1">
            <span className="text-teal-400/90 font-medium">適應症:</span> {exercise.targetPathologies[0]}
          </p>
        )}
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
        {onQuickView && (
          <button
            onClick={() => onQuickView(exercise)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition"
            title="側欄快速預覽"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>預覽</span>
          </button>
        )}

        <Link
          href={`/exercise/${exercise.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition truncate"
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
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-red-950/40 hover:text-red-300 hover:border-red-500/40'
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
