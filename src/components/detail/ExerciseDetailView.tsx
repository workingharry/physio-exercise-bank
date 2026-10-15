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
  Clock, Repeat, Play, Info, Sparkles, ZoomIn, Search, CheckCircle2
} from 'lucide-react';

export const ExerciseDetailView: React.FC = () => {
  const [, params] = useRoute('/exercise/:id');
  const exerciseId = params?.id || '';
  const exercise = getExerciseById(exerciseId);

  const { routine, addToRoutine, removeFromRoutine, bookmarks, toggleBookmark } = useRoutineStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'anatomy'>('video');

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">找不到此運動項目</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">可能該運動代碼不正確或已被移除</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>返回運動資料庫</span>
        </Link>
      </div>
    );
  }

  const isAdded = routine.some(item => item.exerciseId === exercise.id);
  const isBookmarked = bookmarks.includes(exercise.id);

  // Helper to match progression/regression names to actual database exercises
  const findMatchingExercise = (targetName: string) => {
    if (!targetName) return null;
    const clean = targetName.toLowerCase().trim();
    // 1. Direct ID match
    const byId = allExercises.find(e => e.id.toLowerCase() === clean);
    if (byId) return byId;

    // 2. Exact English name match
    const byName = allExercises.find(e => e.name.toLowerCase() === clean);
    if (byName) return byName;

    // 3. Exact Chinese name match
    const byChinese = allExercises.find(e => e.chineseName.toLowerCase() === clean);
    if (byChinese) return byChinese;

    // 4. Fuzzy match by normalized words
    const normClean = clean.replace(/[-_()]/g, ' ').replace(/\s+/g, ' ');
    return allExercises.find(e => {
      const eNorm = e.name.toLowerCase().replace(/[-_()]/g, ' ').replace(/\s+/g, ' ');
      return eNorm.includes(normClean) || normClean.includes(eNorm);
    }) || null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回運動列表</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(exercise.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isBookmarked
                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/40 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
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
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60">
            {exercise.subRegion}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {exercise.difficulty}
          </span>
          {exercise.movementType.map(t => (
            <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/80 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700/80">
              {t}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-slate-800/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-700/60">
            {exercise.biomechanics.kineticChain}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {exercise.name}
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-1">
          {exercise.chineseName}
        </p>

        {exercise.targetPathologies.length > 0 && (
          <p className="mt-3 text-xs sm:text-sm text-teal-600 dark:text-teal-400 font-medium flex items-center gap-2">
            <Target className="w-4 h-4 shrink-0" />
            <span>臨床適應症 / 目標病理：{exercise.targetPathologies.join(' / ')}</span>
          </p>
        )}
      </div>

      {/* Media & Biomechanics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Demonstrations (7 cols) with Tabbed Switcher */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            {/* Media Tabs Header */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeMediaTab === 'video'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>臨床影片示範</span>
                </button>
                <button
                  onClick={() => setActiveMediaTab('anatomy')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeMediaTab === 'anatomy'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>關節生物力學透視圖</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                {activeMediaTab === 'video' ? '支援 0.5x 慢動作分析' : '點擊圖片可放大燈箱'}
              </span>
            </div>

            {/* Media Content */}
            <div className="p-4">
              {activeMediaTab === 'video' ? (
                <VideoPlayer
                  videoUrl={exercise.media.videoUrl}
                  videoType={exercise.media.videoType}
                  title={exercise.name}
                />
              ) : (
                <div 
                  onClick={() => setSelectedImage(exercise.media.thumbnailUrl)}
                  className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950"
                >
                  <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-80 w-full" badge={exercise.name} />
                  <div className="absolute inset-0 bg-teal-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-teal-500/50 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
                      <span>放大全螢幕檢視</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Biomechanical Profile & Dosage (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Biomechanics Card */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-teal-500" />
              <span>生物力學剖析 (Biomechanical Profile)</span>
            </h3>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">主要主動肌 (Prime Movers):</span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.biomechanics.primaryMuscles.map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {exercise.biomechanics.secondaryMuscles.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">協同肌 (Synergists):</span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.biomechanics.secondaryMuscles.map(m => (
                    <span key={m} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">動作平面 (Planes of Motion):</span>
              <div className="flex flex-wrap gap-1.5">
                {exercise.biomechanics.planesOfMotion.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {exercise.biomechanics.jointActions.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">關節運動學機制 (Joint Arthrokinematics):</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                  {exercise.biomechanics.jointActions.join('；')}
                </p>
              </div>
            )}
          </div>

          {/* Standard Clinical Dosage (FITT) */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>標準臨床處方劑量 (FITT Prescription)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">組數 (Sets):</span>
                <strong className="text-teal-600 dark:text-teal-300 font-bold text-sm">{exercise.dosage.sets}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">次數 (Reps):</span>
                <strong className="text-teal-600 dark:text-teal-300 font-bold text-sm">{exercise.dosage.reps}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">等長維持 (Hold):</span>
                <strong className="text-cyan-600 dark:text-cyan-300 font-bold text-sm">{exercise.dosage.holdDuration || '依節奏'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block mb-0.5">訓練頻率 (Frequency):</span>
                <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm">{exercise.dosage.frequency}</strong>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs flex justify-between text-slate-600 dark:text-slate-300">
              <span>組間休息：{exercise.dosage.rest}</span>
              <span>節奏 (Tempo)：{exercise.dosage.tempo || '2-0-2-0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Clinical Execution Rules */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Info className="w-5 h-5 text-teal-500" />
          <span>分步動作指引與臨床執行規則 (Step-by-Step Execution)</span>
        </h3>

        {/* Clinical Biomechanical Purpose / Description */}
        {exercise.description && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-1.5">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold uppercase tracking-wider text-xs">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>臨床動作機制與生物力學目的 (Biomechanical Mechanism & Clinical Rationale):</span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {exercise.description}
            </p>
          </div>
        )}

        {/* Starting Position */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <strong className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide block mb-1">
            起始骨盆與關節擺位 (Starting Position):
          </strong>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {exercise.execution.startingPosition}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            動作分解步驟 (Execution Steps):
          </h4>
          {exercise.execution.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 transition flex items-start gap-4"
            >
              <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-700 dark:bg-teal-600/30 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                {step.stepNumber}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {step.instruction}
                </p>
                {step.keyPoint && (
                  <p className="text-xs text-amber-700 dark:text-amber-300/90 font-medium flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>生物力學重點：{step.keyPoint}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Red Flag Compensation Cards & Prominent Coaching Cues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Coaching Cues Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>物理治療師臨床指導口訣 (Coaching Cues)</span>
            </h4>
            <div className="space-y-2.5">
              {exercise.execution.coachingCues.map((cue, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl bg-teal-50 dark:bg-gradient-to-r dark:from-teal-950/40 dark:to-slate-950 border border-teal-200 dark:border-teal-800/60 flex items-start gap-3 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    “
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-0.5">
                      臨床口訣 #{i + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-teal-100 font-semibold leading-relaxed">
                      {cue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flag Compensation Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>防代償紅旗警示卡片 (Compensation Red Flags)</span>
            </h4>
            <div className="space-y-2.5">
              {exercise.execution.commonErrors.map((err, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>代償紅旗 #{i + 1} ⚠️ 常見錯誤</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {err}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 pt-1 border-t border-red-200 dark:border-red-900/30 flex items-center gap-1">
                    <span>糾正要點：提示病患放慢離心節奏，維持骨盆水平，避免相鄰關節產生代償力矩。</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progression & Regression Decision Tree with Interactive Linking */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-cyan-500" />
            <span>臨床進階與退階決策樹 (Progression & Regression)</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">點擊卡片可直接跳轉動作</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regressions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ArrowDownRight className="w-4 h-4" />
              <span>退階方案 (Regressions - 症狀急性發作或肌力不足時):</span>
            </div>

            <div className="space-y-3">
              {exercise.regressions.map((reg, i) => {
                const matched = findMatchingExercise(reg.name);
                return (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 transition space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 dark:text-white font-bold text-sm block">
                          {reg.name}
                        </strong>
                        {matched && (
                          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            {matched.chineseName} · {matched.subRegion}
                          </span>
                        )}
                      </div>

                      {matched ? (
                        <Link 
                          href={`/exercise/${matched.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition border border-amber-500/30 shrink-0"
                        >
                          <span>查看此動作</span>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/?q=${encodeURIComponent(reg.name)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition hover:bg-slate-300 shrink-0"
                        >
                          <Search className="w-3 h-3" />
                          <span>搜尋此動作</span>
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {reg.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progressions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ArrowUpRight className="w-4 h-4" />
              <span>進階方案 (Progressions - 達成負荷準則與無痛要求時):</span>
            </div>

            <div className="space-y-3">
              {exercise.progressions.map((prog, i) => {
                const matched = findMatchingExercise(prog.name);
                return (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition space-y-2 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 dark:text-white font-bold text-sm block">
                          {prog.name}
                        </strong>
                        {matched && (
                          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            {matched.chineseName} · {matched.subRegion}
                          </span>
                        )}
                      </div>

                      {matched ? (
                        <Link 
                          href={`/exercise/${matched.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition border border-emerald-500/30 shrink-0"
                        >
                          <span>查看此動作</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/?q=${encodeURIComponent(prog.name)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition hover:bg-slate-300 shrink-0"
                        >
                          <Search className="w-3 h-3" />
                          <span>搜尋此動作</span>
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {prog.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Precautions & Contraindications Banner */}
      <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold uppercase tracking-wider text-sm">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>紅旗警示與臨床安全禁忌症 (Precautions & Contraindications)</span>
        </div>
        <p className="text-slate-800 dark:text-slate-300 leading-relaxed">
          <strong>禁忌症：</strong> {exercise.contraindications.join('；') || '急性未確診之劇烈劇痛或骨折疑慮。'}
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>臨床注意事項：</strong> {exercise.precautions.join('；')}
        </p>
        {exercise.clinicalNotes && (
          <p className="mt-2 text-slate-800 dark:text-slate-300 italic border-t border-red-200 dark:border-red-900/40 pt-2">
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
