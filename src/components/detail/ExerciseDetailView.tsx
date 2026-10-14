import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { getExerciseById, allExercises } from '../../data/exercises';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { VideoPlayer } from '../common/VideoPlayer';
import { Lightbox } from '../common/Lightbox';
import { useRoutineStore } from '../../store/useRoutineStore';
import { 
  ArrowLeft, Plus, Check, Bookmark, AlertTriangle, ShieldAlert,
  Dumbbell, Compass, Target, ArrowUpRight, ArrowDownRight,
  Clock, Repeat, Play, Info, Sparkles, ZoomIn
} from 'lucide-react';

export const ExerciseDetailView: React.FC = () => {
  const [, params] = useRoute('/exercise/:id');
  const exerciseId = params?.id || '';
  const exercise = getExerciseById(exerciseId);

  const { routine, addToRoutine, removeFromRoutine, bookmarks, toggleBookmark } = useRoutineStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-100">找不到此運動項目</h2>
        <p className="mt-2 text-sm text-slate-400">可能該運動代碼不正確或已被移除</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>返回運動資料庫</span>
        </Link>
      </div>
    );
  }

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回運動列表</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(exercise.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{isBookmarked ? '已收藏' : '加入學習書籤'}</span>
          </button>

          <button
            onClick={() => {
              if (isAdded) {
                removeFromRoutine(exercise.id);
              } else {
                addToRoutine(exercise.id);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow-md ${
              isAdded
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 hover:bg-red-950/40 hover:text-red-300'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>已在處方清單中</span>
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

      {/* Main Clinical Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-700/60">
            {exercise.subRegion}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {exercise.difficulty}
          </span>
          {exercise.movementType.map(t => (
            <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-cyan-300 border border-slate-700/80">
              {t}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-purple-300 border border-slate-700/60">
            {exercise.biomechanics.kineticChain}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {exercise.name}
        </h1>

        {exercise.targetPathologies.length > 0 && (
          <p className="mt-2 text-sm text-teal-400 font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>臨床適應症 / 目標病理：{exercise.targetPathologies.join(' / ')}</span>
          </p>
        )}
      </div>

      {/* Media & Biomechanics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video & Media Demonstrations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Demonstration with Slow-motion controls */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-teal-400" />
              <span>臨床影片示範與生物力學慢動作播放</span>
            </h3>
            <VideoPlayer
              videoUrl={exercise.media.videoUrl}
              videoType={exercise.media.videoType}
              title={exercise.name}
            />
          </div>

          {/* Breakdown Picture / Anatomy Vector Slot */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-cyan-400" />
                <span>關節生物力學解剖透視圖</span>
              </h4>
              <span className="text-[11px] text-slate-400">點擊可放大檢視</span>
            </div>
            <div 
              onClick={() => setSelectedImage(exercise.media.thumbnailUrl)}
              className="cursor-pointer group relative rounded-xl overflow-hidden"
            >
              <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-64 w-full" badge={exercise.name} />
              <div className="absolute inset-0 bg-teal-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-teal-500/50">
                  放大生物力學圖
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Biomechanical Profile & Dosage (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Biomechanics Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>生物力學剖析 (Biomechanical Profile)</span>
            </h3>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">主要主動肌 (Prime Movers):</span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.biomechanics.primaryMuscles.map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-950 text-teal-300 border border-teal-700/60">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {exercise.biomechanics.secondaryMuscles.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">協同肌 (Synergists):</span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.biomechanics.secondaryMuscles.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-1">動作平面 (Planes of Motion):</span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.biomechanics.planesOfMotion.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {exercise.biomechanics.jointActions.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-1">關節運動學機制 (Joint Arthrokinematics):</span>
                <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {exercise.biomechanics.jointActions.join('；')}
                </p>
              </div>
            )}
          </div>

          {/* Standard Clinical Dosage (FITT) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>標準臨床處方劑量 (FITT Prescription)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">組數 (Sets):</span>
                <strong className="text-teal-300 font-bold text-sm">{exercise.dosage.sets}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">次數 (Reps):</span>
                <strong className="text-teal-300 font-bold text-sm">{exercise.dosage.reps}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">等長維持 (Hold):</span>
                <strong className="text-cyan-300 font-bold text-sm">{exercise.dosage.holdDuration || '依節奏'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block mb-0.5">訓練頻率 (Frequency):</span>
                <strong className="text-slate-200 font-bold text-sm">{exercise.dosage.frequency}</strong>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex justify-between text-slate-300">
              <span>組間休息：{exercise.dosage.rest}</span>
              <span>節奏 (Tempo)：{exercise.dosage.tempo || '2-0-2-0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Clinical Execution Rules */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Info className="w-5 h-5 text-teal-400" />
          <span>分步動作指引與臨床執行規則 (Step-by-Step Execution)</span>
        </h3>

        {/* Starting Position */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <strong className="text-xs font-bold text-teal-400 uppercase tracking-wide block mb-1">
            起始骨盆與關節擺位 (Starting Position):
          </strong>
          <p className="text-sm text-slate-200 leading-relaxed">
            {exercise.execution.startingPosition}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3 pt-2">
          {exercise.execution.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl bg-slate-950/50 hover:bg-slate-950/80 border border-slate-800/80 transition flex items-start gap-4"
            >
              <span className="w-7 h-7 rounded-lg bg-teal-600/30 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-500/40">
                {step.stepNumber}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {step.instruction}
                </p>
                {step.keyPoint && (
                  <p className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生物力學重點：{step.keyPoint}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Coaching Cues & Common Errors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-900/60">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>臨床指導口訣 (Coaching Cues):</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {exercise.execution.coachingCues.map((cue, i) => (
                <li key={i}>{cue}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>常見代償錯誤 (Common Errors):</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {exercise.execution.commonErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Progression & Regression Tree (Crucial for Physio Students) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Repeat className="w-5 h-5 text-cyan-400" />
          <span>臨床進階與退階決策樹 (Progression & Regression)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regressions */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ArrowDownRight className="w-4 h-4" />
              <span>退階方案 (Regressions - 症狀發作或肌力不足時):</span>
            </div>
            {exercise.regressions.map((reg, i) => (
              <div key={i} className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <strong className="text-slate-100 font-semibold block mb-0.5">{reg.name}</strong>
                <p className="text-slate-400 leading-relaxed">{reg.rationale}</p>
              </div>
            ))}
          </div>

          {/* Progressions */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ArrowUpRight className="w-4 h-4" />
              <span>進階方案 (Progressions - 達成負荷準則後):</span>
            </div>
            {exercise.progressions.map((prog, i) => (
              <div key={i} className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <strong className="text-slate-100 font-semibold block mb-0.5">{prog.name}</strong>
                <p className="text-slate-400 leading-relaxed">{prog.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Precautions & Contraindications Banner */}
      <div className="p-5 rounded-2xl bg-red-950/30 border border-red-900/60 text-xs space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>紅旗警示與禁忌症 (Precautions & Contraindications)</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>禁忌症：</strong> {exercise.contraindications.join('；') || '急性未確診之劇烈劇痛或骨折疑慮。'}
        </p>
        <p className="text-slate-400 leading-relaxed">
          <strong>注意事項：</strong> {exercise.precautions.join('；')}
        </p>
        {exercise.clinicalNotes && (
          <p className="mt-2 text-slate-300 italic border-t border-red-900/40 pt-2">
            <strong>導師臨床備註：</strong> {exercise.clinicalNotes}
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={exercise.name}
      >
        <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-96 w-full" badge={exercise.name} />
      </Lightbox>
    </div>
  );
};
