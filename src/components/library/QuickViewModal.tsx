import React from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { VideoPlayer } from '../common/VideoPlayer';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { useRoutineStore } from '../../store/useRoutineStore';
import { 
  X, ExternalLink, Plus, Check, Bookmark, Target, Dumbbell, 
  Compass, Clock, Sparkles, AlertTriangle, ShieldAlert, ArrowRight 
} from 'lucide-react';

interface Props {
  exercise: Exercise | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<Props> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  const { routine, addToRoutine, removeFromRoutine, bookmarks, toggleBookmark } = useRoutineStore();
  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);

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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {exercise.chineseName}
            </p>
            {exercise.targetPathologies.length > 0 && (
              <p className="mt-2 text-xs text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 shrink-0" />
                <span>適應症：{exercise.targetPathologies.join(' / ')}</span>
              </p>
            )}
          </div>

          {/* Demonstration Video with 0.5x/0.75x Slow Motion */}
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
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800/60 pb-2">
              <Dumbbell className="w-3.5 h-3.5 text-teal-500" />
              <span>生物力學概要</span>
            </h4>

            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">主要主動肌群:</span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.biomechanics.primaryMuscles.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-300 pt-1">
              <span><strong>動作平面：</strong> {exercise.biomechanics.planesOfMotion.join(', ')}</span>
              <span><strong>動力鏈：</strong> {exercise.biomechanics.kineticChain}</span>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>執行步驟與臨床要點</span>
            </h4>

            {exercise.description && (
              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-slate-800 dark:text-slate-200">
                <strong className="text-teal-700 dark:text-teal-300 block mb-1 font-bold">
                  臨床動作機制與生物力學目的:
                </strong>
                <p className="leading-relaxed font-medium">{exercise.description}</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-teal-700 dark:text-teal-400 block mb-0.5">起始位置：</strong>
              <p>{exercise.execution.startingPosition}</p>
            </div>

            <div className="space-y-2">
              {exercise.execution.steps.slice(0, 3).map(s => (
                <div key={s.stepNumber} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-xs flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-700 dark:bg-teal-600/30 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/20">
                    {s.stepNumber}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{s.instruction}</p>
                    {s.keyPoint && <span className="text-[11px] text-amber-700 dark:text-amber-300/90 font-medium block">⚡ {s.keyPoint}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Cues & Common Errors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50">
              <strong className="text-teal-700 dark:text-teal-300 uppercase tracking-wide block mb-1">指導口訣 (Cues):</strong>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside text-[11px]">
                {exercise.execution.coachingCues.slice(0, 2).map((c, i) => (
                  <li key={i}>{c}</li>
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
            onClick={onClose}
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
