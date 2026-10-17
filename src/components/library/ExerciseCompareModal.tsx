import React from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { useRoutineStore } from '../../store/useRoutineStore';
import { VideoPlayer } from '../common/VideoPlayer';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { 
  X, Scale, Plus, Check, ExternalLink, Dumbbell, 
  Target, AlertTriangle, ShieldAlert, Sparkles, ArrowRight, Trash2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
}

export const ExerciseCompareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exercises
}) => {
  const { 
    routine, 
    addToRoutine, 
    removeFromRoutine, 
    removeFromComparison, 
    clearComparison 
  } = useRoutineStore();

  if (!isOpen || exercises.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>臨床動作多維度並排對比</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-semibold">
                  {exercises.length} 個動作
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                橫向分析目標肌群、開閉鎖鏈、代償風險與處方劑量，輔助臨床決策與病患教學
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('確定清空所有對比項目？')) {
                  clearComparison();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空對比</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
              title="關閉對比"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className={`grid gap-4 sm:gap-6 ${
            exercises.length === 1 
              ? 'grid-cols-1 max-w-xl mx-auto' 
              : exercises.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {exercises.map((ex) => {
              const isAdded = routine.some(item => item.exerciseId === ex.id);

              return (
                <div
                  key={ex.id}
                  className="bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  {/* Column Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60">
                        {ex.subRegion}
                      </span>
                      <button
                        onClick={() => removeFromComparison(ex.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="自對比清單移除"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5 line-clamp-1">
                      {ex.chineseName}
                    </p>
                  </div>

                  {/* Thumbnail / Video */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                    <VideoPlayer
                      videoUrl={ex.media.videoUrl}
                      videoType={ex.media.videoType}
                      title={ex.name}
                    />
                  </div>

                  {/* Comparison Metrics */}
                  <div className="space-y-3 text-xs divide-y divide-slate-200 dark:divide-slate-800/80">
                    {/* Difficulty & Chain */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">難度 / 動力鏈：</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {ex.difficulty.split(' ')[0]}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                          {ex.biomechanics.kineticChain}
                        </span>
                      </div>
                    </div>

                    {/* Target Muscles */}
                    <div className="pt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                        主要主動肌 (Prime Movers)：
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ex.biomechanics.primaryMuscles.map(m => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-semibold border border-teal-200/80 dark:border-teal-800/60 text-[11px]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contraction Type */}
                    <div className="pt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                        收縮型態 (Contraction)：
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ex.movementType.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="pt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                        所需器材 (Equipment)：
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {ex.equipment.join('、') || '徒手無須器材'}
                      </p>
                    </div>

                    {/* Coaching Cues */}
                    <div className="pt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>治療師口訣 (Coaching Cues)：</span>
                      </span>
                      <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 pl-1">
                        {ex.execution.coachingCues.slice(0, 2).map((cue, idx) => (
                          <li key={idx} className="line-clamp-2">{cue}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Contraindications / Red Flags */}
                    <div className="pt-2">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        <span>防代償與禁忌：</span>
                      </span>
                      <p className="text-rose-600 dark:text-rose-400 text-[11px] leading-relaxed line-clamp-2">
                        {ex.contraindications[0] || ex.execution.commonErrors[0] || '無特殊禁忌，注意無痛範圍執行'}
                      </p>
                    </div>

                    {/* FITT Dosage */}
                    <div className="pt-2 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">組數</span>
                        <strong className="text-teal-600 dark:text-teal-400 font-bold">{ex.dosage.sets}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block">次數/維持</span>
                        <strong className="text-teal-600 dark:text-teal-400 font-bold">{ex.dosage.reps}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => isAdded ? removeFromRoutine(ex.id) : addToRoutine(ex.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                        isAdded
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-teal-300'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? '已在處方中' : '加入處方'}</span>
                    </button>

                    <Link
                      href={`/exercise/${ex.id}`}
                      onClick={onClose}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition"
                      title="前往完整動作詳情頁"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>提示：您可以隨時在動作卡片上點擊「+ 對比」替換比對項目（上限 3 個）。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition"
          >
            完成檢視
          </button>
        </div>

      </div>
    </div>
  );
};
