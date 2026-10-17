import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { allExercises } from '../../data/exercises';
import { VideoPlayer } from '../common/VideoPlayer';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { useRoutineStore } from '../../store/useRoutineStore';
import { findSimilarExercises } from '../../utils/similarity';
import { 
  X, ExternalLink, Plus, Check, Bookmark, Target, Dumbbell, 
  Compass, Clock, Sparkles, AlertTriangle, ShieldAlert, ArrowRight, Scale, Repeat
} from 'lucide-react';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
  onSelectSimilar?: (exercise: Exercise) => void;
}

export const QuickViewModal: React.FC<Props> = ({ 
  exercise, 
  onClose,
  onSelectSimilar 
}) => {
  if (!exercise) return null;

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

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);
  const isComparing = comparisonIds.includes(exercise.id);

  // Compute similar exercises dynamically
  const similarExercises = useMemo(() => {
    return findSimilarExercises(exercise, allExercises, 3);
  }, [exercise]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Container */}
      <div className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60">
              {exercise.subRegion}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {exercise.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-700/60">
              {exercise.biomechanics.kineticChain}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              onClick={() => toggleComparison(exercise.id)}
              className={`p-2 rounded-xl border transition ${
                isComparing
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={isComparing ? '自動作對比中移除' : '加入動作並排對比'}
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={() => toggleBookmark(exercise.id)}
              className={`p-2 rounded-xl border transition ${
                isBookmarked
                  ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="加入學習書籤"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="關閉快速預覽"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {exercise.name}
            </h2>
            {exercise.chineseName && exercise.chineseName !== exercise.name && (
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
                {exercise.chineseName}
              </p>
            )}
            {exercise.targetPathologies.length > 0 && (
              <p className="mt-2 text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span>適應症：{exercise.targetPathologies.join(' / ')}</span>
              </p>
            )}
          </div>

          {/* Demonstration Video */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 block">
              動作示範與慢動作控制
            </span>
            <VideoPlayer
              videoUrl={exercise.media.videoUrl}
              videoType={exercise.media.videoType}
              title={exercise.name}
            />
          </div>

          {/* Biomechanical Profile Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">主要主動肌群：</span>
              <strong className="text-teal-600 dark:text-teal-300 font-bold block">
                {exercise.biomechanics.primaryMuscles.join(', ') || '目標肌群'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block mb-1">所需器材：</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold block">
                {exercise.equipment.join(', ') || '徒手'}
              </strong>
            </div>
          </div>

          {/* Coaching Cues & Error Prevention */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40">
              <strong className="text-teal-700 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>物理治療師臨床指導口訣 (Coaching Cues):</span>
              </strong>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                {exercise.execution.coachingCues.slice(0, 3).map((cue, i) => (
                  <li key={i}>{cue}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-red-50 dark:bg-amber-950/20 border border-red-200 dark:border-amber-900/40">
              <strong className="text-red-700 dark:text-amber-300 uppercase tracking-wide block mb-1">防代償紅旗:</strong>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside text-[11px]">
                {exercise.execution.commonErrors.slice(0, 2).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Similar Exercises (Clinical Alternatives) */}
          {similarExercises.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-teal-500" />
                  <span>相似替換動作推薦 (Similar Alternatives)</span>
                </span>
                <span className="text-[11px] text-slate-400">同肌群/力學目標</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {similarExercises.map(({ exercise: simEx, matchingPoints }) => (
                  <div
                    key={simEx.id}
                    onClick={() => {
                      addRecentlyViewed(simEx.id);
                      if (onSelectSimilar) {
                        onSelectSimilar(simEx);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/50 cursor-pointer transition group"
                  >
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block truncate">
                      {simEx.subRegion}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition line-clamp-1 mt-0.5">
                      {simEx.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {simEx.chineseName}
                    </p>
                    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                      {matchingPoints[0] || '力學相近'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dosage (FITT) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1.5">推薦臨床處方劑量：</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">組數</span>
                <strong className="text-teal-600 dark:text-teal-300">{exercise.dosage.sets}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">次數/維持</span>
                <strong className="text-teal-600 dark:text-teal-300">{exercise.dosage.reps}</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">頻率</span>
                <strong className="text-slate-700 dark:text-slate-200">{exercise.dosage.frequency}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between gap-3">
          <Link
            href={`/exercise/${exercise.id}`}
            onClick={() => {
              addRecentlyViewed(exercise.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
          >
            <span>完整生物力學詳情</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              if (isAdded) {
                removeFromRoutine(exercise.id);
              } else {
                addToRoutine(exercise.id);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
              isAdded
                ? 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-500/40 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>已在處方中 (點擊移除)</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>加入病患處方 (HEP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
