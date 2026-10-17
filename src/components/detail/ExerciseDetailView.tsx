import React, { useState, useEffect, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { getExerciseById, allExercises } from '../../data/exercises';
import { applyConditionContext, getConditionById } from '../../data/selectors';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { VideoPlayer } from '../common/VideoPlayer';
import { Lightbox } from '../common/Lightbox';
import { useRoutineStore } from '../../store/useRoutineStore';
import { findSimilarExercises } from '../../utils/similarity';
import { 
  ArrowLeft, ArrowRight, Bookmark, AlertTriangle, ShieldAlert,
  Dumbbell, Compass, Target, ArrowUpRight, ArrowDownRight,
  Clock, Repeat, Play, Info, Sparkles, ZoomIn, Search, CheckCircle2,
  ChevronRight, Scale, BookOpen, Layers, ExternalLink, ListChecks,
  FileText, Activity, ShieldCheck, Stethoscope
} from 'lucide-react';

export const ExerciseDetailView: React.FC = () => {
  const [, params] = useRoute('/exercise/:id');
  const exerciseId = params?.id || '';
  const rawExercise = getExerciseById(exerciseId);

  // Read condition context if passed via ?c=<conditionId>
  const conditionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('c') || null;
    }
    return null;
  }, []);

  const activeCondition = useMemo(() => {
    return conditionId ? getConditionById(conditionId) : null;
  }, [conditionId]);

  // Apply clinical condition context overrides if present
  const exercise = useMemo(() => {
    if (!rawExercise) return null;
    if (!conditionId) return rawExercise;
    return applyConditionContext(rawExercise, conditionId);
  }, [rawExercise, conditionId]);

  const { 
    bookmarks, 
    toggleBookmark, 
    comparisonIds, 
    toggleComparison, 
    addRecentlyViewed 
  } = useRoutineStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'anatomy'>('video');

  useEffect(() => {
    if (exercise?.id) {
      addRecentlyViewed(exercise.id);
    }
  }, [exercise?.id]);

  if (!exercise) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">找不到此運動百科條目</h2>
        <p className="mt-2 text-sm text-stone-400">可能該運動代碼不正確或已被移除</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 text-amber-50 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>返回運動百科目錄</span>
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(exercise.id);
  const isComparing = comparisonIds.includes(exercise.id);

  const similarExercises = useMemo(() => {
    return findSimilarExercises(exercise, allExercises, 4);
  }, [exercise]);

  // Helper to match progression/regression names to actual database exercises
  const findMatchingExercise = (targetName: string) => {
    if (!targetName) return null;
    const clean = targetName.toLowerCase().trim();
    const byId = allExercises.find(e => e.id.toLowerCase() === clean);
    if (byId) return byId;
    const byName = allExercises.find(e => e.name.toLowerCase() === clean);
    if (byName) return byName;
    const byChinese = allExercises.find(e => e.chineseName.toLowerCase() === clean);
    if (byChinese) return byChinese;
    const normClean = clean.replace(/[-_()]/g, ' ').replace(/\s+/g, ' ');
    return allExercises.find(e => {
      const eNorm = e.name.toLowerCase().replace(/[-_()]/g, ' ').replace(/\s+/g, ' ');
      return eNorm.includes(normClean) || normClean.includes(eNorm);
    }) || null;
  };

  // Step Deduplication: Check if Step 1 is identical to Starting Position
  const rawStartingPos = exercise.execution.startingPosition?.trim() || '';
  const isStep1SameAsStart = exercise.execution.steps.length > 0 &&
    exercise.execution.steps[0].instruction.trim().toLowerCase() === rawStartingPos.toLowerCase();

  const executionSteps = isStep1SameAsStart
    ? exercise.execution.steps.slice(1)
    : exercise.execution.steps;

  const tableOfContents = [
    { id: 'mechanism', label: '1. 臨床機制與生物力學原理' },
    { id: 'anatomy', label: '2. 功能解剖與目標肌群' },
    { id: 'technique', label: '3. 分步操作技術與起始擺位' },
    { id: 'cues', label: '4. 物理治療師指導口訣' },
    { id: 'errors', label: '5. 常見代償錯誤與校正防線' },
    { id: 'safety', label: '6. 禁忌症與臨床安全考量' },
    { id: 'progressions', label: '7. 進階與退階決策樹' },
    { id: 'see-also', label: '8. 相關條目與替代動作' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Academic Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-amber-800 dark:hover:text-amber-400 transition shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>運動百科</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <Link href={`/?macro=${encodeURIComponent(exercise.macroRegion)}`} className="hover:text-amber-800 dark:hover:text-amber-400 transition shrink-0">
            {exercise.macroRegion}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <Link href={`/anatomy`} className="hover:text-amber-800 dark:hover:text-amber-400 transition shrink-0">
            {exercise.subRegion}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <span className="text-amber-900 dark:text-amber-300 font-bold truncate max-w-xs">
            {exercise.chineseName || exercise.name}
          </span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleComparison(exercise.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isComparing
                ? 'bg-amber-800 text-white border-amber-700 shadow-sm'
                : 'bg-white dark:bg-[#201D1A] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
            title="加入並排對比 (最多 3 個動作)"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? '已加入對比' : '並排對比'}</span>
          </button>

          <button
            onClick={() => toggleBookmark(exercise.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isBookmarked
                ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-white dark:bg-[#201D1A] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>{isBookmarked ? '已收錄在研讀筆記' : '⭐ 收藏至研讀筆記'}</span>
          </button>
        </div>
      </div>

      {/* Active Condition Context Banner (When viewed in context of a specific pathology) */}
      {activeCondition && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-800 text-white shrink-0 mt-0.5">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  當前病症協定視角：{activeCondition.nameZh} ({activeCondition.nameEn})
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200 font-semibold">
                  情境參數已套用
                </span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                此處方劑量與臨床要點已依據 {activeCondition.nameZh} 的臨床指引進行特化調整。
              </p>
            </div>
          </div>

          <Link
            href={`/condition/${activeCondition.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline shrink-0"
          >
            <span>返回病症完整處方</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Two-Column Academic Layout: Left Article Body (7 cols) + Right Canonical Infobox (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Academic Article Body */}
        <article className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Article Header */}
          <header className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#F5F2EB] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {exercise.subRegion}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FAF8F5] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {exercise.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F5F2EB] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {exercise.biomechanics.kineticChain}
              </span>
              {exercise.movementType.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F5F2EB] text-amber-900 dark:bg-stone-800/80 dark:text-amber-300 border border-stone-200 dark:border-stone-700/80">
                  {t}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-stone-900 dark:text-white tracking-tight leading-tight">
              {exercise.chineseName || exercise.name}
            </h1>
            
            <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 font-mono">
              {exercise.name}
            </p>

            {exercise.targetPathologies.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                <Target className="w-4 h-4 text-amber-700 shrink-0" />
                <span>相關臨床病症協定：</span>
                {exercise.targetPathologies.map((pathology, idx) => (
                  <Link
                    key={idx}
                    href={`/?search=${encodeURIComponent(pathology)}`}
                    className="px-2 py-0.5 rounded-md bg-[#F5F2EB] dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-stone-200 dark:border-stone-700 hover:border-amber-700 transition"
                  >
                    {pathology}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Table of Contents (TOC - Wikipedia Style) */}
          <nav aria-label="條目目錄" className="p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#201D1A] rounded-2xl border border-stone-200 dark:border-stone-800 text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200 mb-2.5">
              <ListChecks className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>條目章節目錄 (Contents)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 transition hover:underline"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Section 1: 臨床機制與生物力學原理 */}
          <section id="mechanism" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>1. 臨床機制與生物力學原理 (Biomechanical Rationale)</span>
            </h2>
            
            {exercise.description && (
              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                {exercise.description}
              </p>
            )}

            {exercise.clinicalNotes && (
              <div className="p-4 rounded-xl bg-[#F5F2EB] dark:bg-[#25211D] border border-amber-900/15 dark:border-amber-700/30 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                <strong className="font-bold block mb-1 flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <Activity className="w-4 h-4" />
                  臨床學術註記 (Clinical Note):
                </strong>
                {exercise.clinicalNotes}
              </div>
            )}
          </section>

          {/* Section 2: 功能解剖與目標肌群 */}
          <section id="anatomy" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>2. 功能解剖與目標肌群 (Functional Anatomy)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block">
                  主要作用肌 (Prime Movers):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.biomechanics.primaryMuscles.map(m => (
                    <Link
                      key={m}
                      href={`/anatomy?muscle=${encodeURIComponent(m)}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F5F2EB] dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-stone-200 dark:border-stone-700 hover:border-amber-700 transition"
                      title="點擊查看肌群解剖索引"
                    >
                      {m}
                    </Link>
                  ))}
                </div>
              </div>

              {exercise.biomechanics.secondaryMuscles.length > 0 && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block">
                    協同穩定肌 (Synergists & Stabilizers):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.biomechanics.secondaryMuscles.map(m => (
                      <span key={m} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FAF8F5] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {exercise.biomechanics.jointActions.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-1.5">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold block">
                  關節運動學機制 (Joint Arthrokinematics):
                </span>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {exercise.biomechanics.jointActions.join('；')}
                </p>
              </div>
            )}
          </section>

          {/* Section 3: 分步操作技術與起始擺位 */}
          <section id="technique" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>3. 分步操作技術與起始擺位 (Technique & Setup)</span>
            </h2>

            {/* Starting Position (Step 0) */}
            {rawStartingPos && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-800 text-amber-50 font-bold text-[10px]">
                    起始預備 (Setup)
                  </span>
                  <strong className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    患者體位與關節對齊
                  </strong>
                </div>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {rawStartingPos}
                </p>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 flex items-start gap-3.5 shadow-sm"
                >
                  <span className="w-7 h-7 rounded-lg bg-[#F5F2EB] dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                      {step.instruction}
                    </p>
                    {step.keyPoint && (
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium flex items-center gap-1.5 pt-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>生物力學要點：{step.keyPoint}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: 物理治療師指導口訣 */}
          <section id="cues" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>4. 物理治療師臨床指導口訣 (Coaching Cues)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exercise.execution.coachingCues.map((cue, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl bg-[#F5F2EB] dark:bg-[#25211D] border border-stone-200 dark:border-stone-800 flex items-start gap-3 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-md bg-amber-800 text-amber-50 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    “
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                    {cue}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: 常見代償錯誤與校正防線 */}
          <section id="errors" className="space-y-3 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-800 rounded-full"></span>
              <span>5. 常見代償錯誤與校正防線 (Common Compensations & Red Flags)</span>
            </h2>

            <div className="space-y-2.5">
              {exercise.execution.commonErrors.map((err, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>代償紅旗 #{i + 1}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                    {err}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: 禁忌症與臨床安全考量 */}
          <section id="safety" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>6. 禁忌症與臨床安全考量 (Safety & Precautions)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contraindications */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  絕對/相對禁忌症 (Contraindications):
                </span>
                {exercise.contraindications && exercise.contraindications.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 dark:text-stone-300">
                    {exercise.contraindications.map((c, idx) => (
                      <li key={idx} className="leading-relaxed">{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                    原教材未列具體禁忌症；本處方遵循常規下肢保護期原則，遇未診斷之急性劇痛應先停練並尋求物理治療師臨床鑑別。
                  </p>
                )}
              </div>

              {/* Precautions */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  操作安全注意事項 (Precautions):
                </span>
                {exercise.precautions && exercise.precautions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 dark:text-stone-300">
                    {exercise.precautions.map((p, idx) => (
                      <li key={idx} className="leading-relaxed">{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    保持軀幹中立位，動作全程在無痛或輕微牽拉範圍內執行。
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 7: 進階與退階臨床決策樹 */}
          <section id="progressions" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>7. 進階與退階臨床決策樹 (Progressions & Regressions)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regressions */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-xs font-bold">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>退階方案 (症狀急性發作或肌力不足):</span>
                </div>

                <div className="space-y-2">
                  {exercise.regressions.map((reg, i) => {
                    const matched = findMatchingExercise(reg.name);
                    return (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-stone-900 dark:text-white font-bold text-xs sm:text-sm">
                            {reg.name}
                          </strong>
                          {matched && (
                            <Link 
                              href={`/exercise/${matched.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold transition shrink-0"
                            >
                              <span>跳轉條目</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                          {reg.rationale}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progressions */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 text-xs font-bold">
                  <ArrowUpRight className="w-4 h-4 text-amber-700" />
                  <span>進階方案 (無痛達標與負荷提升):</span>
                </div>

                <div className="space-y-2">
                  {exercise.progressions.map((prog, i) => {
                    const matched = findMatchingExercise(prog.name);
                    return (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-stone-900 dark:text-white font-bold text-xs sm:text-sm">
                            {prog.name}
                          </strong>
                          {matched && (
                            <Link 
                              href={`/exercise/${matched.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition shrink-0"
                            >
                              <span>跳轉條目</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                          {prog.rationale}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: 相關條目與替代動作 (See Also) */}
          <section id="see-also" className="space-y-4 scroll-mt-24">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="w-1.5 h-5 bg-amber-700 rounded-full"></span>
              <span>8. 相關條目與替代動作 (See Also & Similar Exercises)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {similarExercises.map(({ exercise: simEx, matchingPoints, score }) => (
                <Link
                  key={simEx.id}
                  href={`/exercise/${simEx.id}`}
                  className="group p-3.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 transition flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F5F2EB] dark:bg-stone-800 text-amber-900 dark:text-amber-300 border border-stone-200 dark:border-stone-700">
                        {simEx.subRegion}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400">
                        匹配 {Math.min(99, score)}%
                      </span>
                    </div>
                    <strong className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-300 transition block">
                      {simEx.chineseName || simEx.name}
                    </strong>
                    <span className="text-[11px] text-stone-400 font-mono block mt-0.5">
                      {simEx.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-100 dark:border-stone-800">
                    {matchingPoints.map((pt, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </article>

        {/* Right Column: Physiopedia Canonical Infobox (Sticky) */}
        <aside className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-20">
          
          <div className="bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Infobox Header */}
            <div className="p-3 bg-[#F5F2EB] dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-center font-serif font-bold text-xs text-stone-800 dark:text-stone-200">
              百科資訊盒 (Canonical Infobox)
            </div>

            {/* Media Tabs */}
            <div className="p-2 bg-[#FAF8F5] dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeMediaTab === 'video'
                    ? 'bg-amber-800 text-amber-50 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>動作示範影片</span>
              </button>
              <button
                onClick={() => setActiveMediaTab('anatomy')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeMediaTab === 'anatomy'
                    ? 'bg-amber-800 text-amber-50 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>解剖向量圖</span>
              </button>
            </div>

            {/* Media Content */}
            <div className="p-3">
              {activeMediaTab === 'video' ? (
                <VideoPlayer
                  videoUrl={exercise.media.videoUrl}
                  videoType={exercise.media.videoType || 'youtube'}
                  title={exercise.name}
                />
              ) : (
                <div
                  onClick={() => setSelectedImage(exercise.media.thumbnailUrl)}
                  className="cursor-pointer group relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950"
                >
                  <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-64 w-full" badge={exercise.name} />
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-xl bg-stone-900/90 text-white text-xs font-bold shadow border border-amber-700/50 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>全螢幕檢視</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Table */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">英文原名</span>
                <span className="font-mono text-stone-800 dark:text-stone-200 text-right">{exercise.name}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">解剖次分區</span>
                <span className="font-bold text-amber-800 dark:text-amber-400 text-right">{exercise.subRegion}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">動力鏈形態</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 text-right">{exercise.biomechanics.kineticChain}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">動作平面</span>
                <span className="text-stone-700 dark:text-stone-300 text-right">{exercise.biomechanics.planesOfMotion.join('、')}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">所需器材</span>
                <span className="text-stone-700 dark:text-stone-300 text-right">{exercise.equipment.join('、') || '無器材 (徒手)'}</span>
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <span className="text-stone-400 font-medium shrink-0">動作難度</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 text-right">{exercise.difficulty}</span>
              </div>
            </div>

            {/* Standard FITT Dosage Box */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-stone-950/70 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                標準臨床處方參考 (FITT)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 text-[10px] block">建議組數</span>
                  <strong className="text-amber-800 dark:text-amber-300 font-bold">{exercise.dosage.sets}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 text-[10px] block">建議次數</span>
                  <strong className="text-amber-800 dark:text-amber-300 font-bold">{exercise.dosage.reps}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 text-[10px] block">等長維持</span>
                  <strong className="text-stone-700 dark:text-stone-200 font-bold">{exercise.dosage.holdDuration || '依節奏'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 text-[10px] block">訓練頻率</span>
                  <strong className="text-stone-700 dark:text-stone-200 font-bold">{exercise.dosage.frequency}</strong>
                </div>
              </div>
            </div>

            {/* Infobox Footer Link */}
            <div className="p-3 bg-[#F5F2EB]/60 dark:bg-stone-900/40 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
              <span>PhysioBank 條目</span>
              <Link href="/notebook" className="text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1">
                <span>檢視我的研讀筆記</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

      </div>

      {/* Lightbox for Zoomed Anatomy Viewing */}
      {selectedImage && (
        <Lightbox
          isOpen={Boolean(selectedImage)}
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};
