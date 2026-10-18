import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { allExercises } from '../../data/exercises';
import { useRoutineStore } from '../../store/useRoutineStore';
import { VideoPlayer } from '../common/VideoPlayer';
import { 
  X, Check, Plus, ExternalLink, Bookmark, Scale, 
  Repeat, Sparkles, ArrowRight, Target, Dumbbell, ShieldAlert 
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

  const isBookmarked = exercise ? bookmarks.includes(exercise.id) : false;
  const isAdded = exercise ? routine.some(item => item.exerciseId === exercise.id) : false;
  const isComparing = exercise ? comparisonIds.includes(exercise.id) : false;

  // Find clinically similar exercises (same subregion, overlapping prime movers)
  const similarExercises = useMemo(() => {
    if (!exercise) return [];

    return allExercises
      .filter(ex => ex.id !== exercise.id && ex.subRegion === exercise.subRegion)
      .map(ex => {
        let score = 0;
        const matchingPoints: string[] = [];

        // Check primary muscles overlap
        const sharedMuscles = ex.biomechanics.primaryMuscles.filter(m =>
          exercise.biomechanics.primaryMuscles.includes(m)
        );
        if (sharedMuscles.length > 0) {
          score += sharedMuscles.length * 3;
          matchingPoints.push(sharedMuscles.join('/'));
        }

        // Check kinetic chain match
        if (ex.biomechanics.kineticChain === exercise.biomechanics.kineticChain) {
          score += 2;
        }

        return { exercise: ex, score, matchingPoints };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over Drawer Container */}
      <div className="relative w-full max-w-2xl h-full bg-[#FAF8F5] dark:bg-[#1C1917] border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#201D1A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              {exercise.subRegion}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              {exercise.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {exercise.biomechanics.kineticChain}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              onClick={() => toggleComparison(exercise.id)}
              className={`p-2 rounded-xl border transition ${
                isComparing
                  ? 'bg-amber-800 text-amber-50 border-amber-700 shadow-sm'
                  : 'bg-white dark:bg-[#2A2622] border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
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
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#2A2622] border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="加入學習書籤"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-[#2A2622] hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition"
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
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              {exercise.name}
            </h2>
            {exercise.chineseName && exercise.chineseName !== exercise.name && (
              <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold mt-1">
                {exercise.chineseName}
              </p>
            )}
            {exercise.targetPathologies.length > 0 && (
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>適應症：{exercise.targetPathologies.join(' / ')}</span>
              </p>
            )}
          </div>

          {/* Demonstration Video */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2 block">
              動作示範與慢動作控制
            </span>
            <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950">
              <VideoPlayer
                videoUrl={exercise.media.videoUrl}
                videoType={exercise.media.videoType}
                title={exercise.name}
              />
            </div>
          </div>

          {/* Biomechanical Profile Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400 block mb-1">主要主動肌群：</span>
              <strong className="text-amber-900 dark:text-amber-300 font-bold block">
                {exercise.biomechanics.primaryMuscles.join(', ') || '目標肌群'}
              </strong>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400 block mb-1">所需器材：</span>
              <strong className="text-stone-800 dark:text-stone-200 font-semibold block">
                {exercise.equipment.join(', ') || '徒手'}
              </strong>
            </div>
          </div>

          {/* Coaching Cues & Error Prevention */}
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#F0ECE1] dark:bg-[#25211E] border border-stone-200 dark:border-stone-800">
              <strong className="text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>物理治療師臨床指導口訣 (Coaching Cues):</span>
              </strong>
              <ul className="space-y-1.5 text-stone-700 dark:text-stone-300 list-disc list-inside">
                {exercise.execution.coachingCues.slice(0, 3).map((cue, i) => (
                  <li key={i}>{cue}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
              <strong className="text-rose-700 dark:text-rose-400 uppercase tracking-wide block mb-1">防代償紅旗:</strong>
              <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside text-[11px]">
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
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>相似替換動作推薦 (Similar Alternatives)</span>
                </span>
                <span className="text-[11px] text-stone-400">同肌群/力學目標</span>
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
                    className="p-2.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 cursor-pointer transition group"
                  >
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block truncate">
                      {simEx.subRegion}
                    </span>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition line-clamp-1 mt-0.5">
                      {simEx.name}
                    </h5>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                      {simEx.chineseName}
                    </p>
                    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {matchingPoints[0] || '力學相近'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dosage (FITT) */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-semibold block mb-1.5">推薦臨床處方劑量：</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">組數</span>
                <strong className="text-amber-800 dark:text-amber-300 font-bold">{exercise.dosage.sets}</strong>
              </div>
              <div className="p-2 rounded-lg bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">次數/維持</span>
                <strong className="text-amber-800 dark:text-amber-300 font-bold">{exercise.dosage.reps}</strong>
              </div>
              <div className="p-2 rounded-lg bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">頻率</span>
                <strong className="text-stone-700 dark:text-stone-200">{exercise.dosage.frequency}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#201D1A] flex items-center justify-between gap-3">
          <Link
            href={`/exercise/${exercise.id}`}
            onClick={() => {
              addRecentlyViewed(exercise.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition"
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isAdded
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'bg-amber-800 hover:bg-amber-900 text-amber-50'
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
