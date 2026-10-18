import React, { useState, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { getConditionById, exercisesForCondition, suggestedExercisesForCondition } from '../../data/selectors';
import { Exercise } from '../../types/exercise';
import { ExerciseCard } from '../library/ExerciseCard';
import { 
  ArrowLeft, AlertTriangle, ShieldAlert, Sparkles, BookOpen, 
  Layers, Clock, Info, CheckCircle2, ChevronRight, Stethoscope,
  HelpCircle, ExternalLink, Pin
} from 'lucide-react';
import { useNavStore } from '../../store/useNavStore';

export const ConditionDetailView: React.FC = () => {
  const [, params] = useRoute('/condition/:id');
  const conditionId = params?.id || '';
  const condition = getConditionById(conditionId);
  const { isConditionPinned, togglePinCondition, addRecentCondition } = useNavStore();

  const phaseGroups = useMemo(() => {
    return exercisesForCondition(conditionId);
  }, [conditionId]);

  const suggestedExercises = useMemo(() => {
    return suggestedExercisesForCondition(conditionId);
  }, [conditionId]);

  // Track recent condition visit
  React.useEffect(() => {
    if (conditionId) {
      addRecentCondition(conditionId);
    }
  }, [conditionId, addRecentCondition]);

  const isPinned = condition ? isConditionPinned(condition.id) : false;

  // Default to first phase with exercises
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  if (!condition) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">找不到此病症協定</h2>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">可能該病症識別碼不正確或尚未建立</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-amber-50 text-xs font-semibold shadow-sm transition">
          <ArrowLeft className="w-4 h-4" />
          <span>返回病症檢索</span>
        </Link>
      </div>
    );
  }

  const activeGroup = phaseGroups[activePhaseIndex] || phaseGroups[0];
  const isPhaseIncomplete = condition.phaseCoverage.length < 4 || condition.dataWarnings?.includes('phase-coverage-incomplete');
  const isMultiBundle = condition.bundleSize > 1 && condition.mentionTagging === 'none';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Academic Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200 dark:border-stone-800">
        <Link href="/" className="hover:text-amber-800 dark:hover:text-amber-400 transition shrink-0 flex items-center gap-1">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>病症檢索</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
        <Link href={`/?region=${encodeURIComponent(condition.region)}`} className="hover:text-amber-800 dark:hover:text-amber-400 transition shrink-0">
          {condition.region}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
        <span className="text-stone-800 dark:text-stone-200 font-bold truncate max-w-sm">
          {condition.nameZh}
        </span>
      </nav>

      {/* Condition Hero Header (Editorial Claude/Anthropic Style: Warm Beige, Stone, Serif) */}
      <div className="bg-[#FAF8F5] dark:bg-[#201D1A] border border-[#E7E3DC] dark:border-[#38332E] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFECE6] dark:bg-[#2D2924] text-stone-700 dark:text-stone-300 border border-[#DDD8CF] dark:border-[#403B34]">
              {condition.region}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              涵蓋 {phaseGroups.reduce((acc, g) => acc + g.items.length, 0)} 個處方動作
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePinCondition(condition.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm ${
                isPinned
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#2A2622] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-700'
              }`}
              title={isPinned ? '取消釘選此病症' : '釘選至導覽列常用病症'}
              aria-label={isPinned ? '取消釘選' : '釘選此病症'}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-700 text-amber-700 dark:text-amber-300' : 'text-stone-400'}`} />
              <span>{isPinned ? '已釘選' : '釘選此病症'}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>切換其他病症</span>
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
            {condition.nameZh}
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 font-mono mt-1">
            {condition.nameEn}
          </p>
        </div>

        {/* Aliases chips */}
        {condition.aliases && condition.aliases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-medium text-stone-400">搜尋關鍵字：</span>
            {condition.aliases.slice(0, 6).map((alias, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-[11px]"
              >
                {alias}
              </span>
            ))}
          </div>
        )}

        {/* Warning Banners if applicable */}
        <div className="space-y-2 pt-2">
          {isMultiBundle && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <Info className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-semibold block text-amber-800 dark:text-amber-300">
                  合集共用處方提醒 ({condition.bundleLabel})
                </strong>
                <p className="leading-relaxed opacity-90">
                  此處方於文獻中與同組相關病症共用；因個別解剖受損機轉不同，請物理治療師依患者當前疼痛與力學限制個別裁量。
                </p>
              </div>
            </div>
          )}

          {isPhaseIncomplete && (
            <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex items-start gap-3 text-xs text-stone-700 dark:text-stone-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="font-semibold block text-stone-800 dark:text-stone-200">
                  分期資料不完整提示
                </strong>
                <p className="leading-relaxed text-stone-600 dark:text-stone-400">
                  原始臨床文獻僅記錄部分分期（已覆蓋：{condition.phaseCoverage.join('、') || '無特定標註'}），缺失階段請依一般下肢組織癒合原則漸進。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Phase Tabs & Exercises */}
      {phaseGroups.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8F5] dark:bg-[#201D1A] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
          <HelpCircle className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">此病症目前尚無專屬分期運動</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            您可以查看下方的通用下肢護理運動，或透過「部位瀏覽」檢索相鄰關節的強化訓練。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Phase Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200 dark:border-stone-800">
            {phaseGroups.map((group, idx) => {
              const isActive = idx === activePhaseIndex;
              return (
                <button
                  key={group.phase}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-amber-800 text-amber-50 border-amber-800 shadow-sm'
                      : 'bg-white dark:bg-[#22201D] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <span>{group.phase}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-amber-900/60 text-amber-200' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}>
                    {group.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Phase Exercise Grid */}
          {activeGroup && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <span>{activeGroup.phase} · 處方動作清單 ({activeGroup.items.length})</span>
                </h2>
                <span className="text-xs text-stone-400 font-medium">依難度漸進排列</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeGroup.items.map(({ exercise, basis }) => (
                  <div key={exercise.id} className="relative group flex flex-col justify-between">
                    {/* Visual Evidence Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
                      {basis === 'mentioned' && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/90 text-amber-300 border border-amber-400/30 text-[10px] font-bold backdrop-blur-md shadow-sm">
                          📎 文中提及（非專屬）
                        </span>
                      )}
                      {basis === 'group' && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/90 text-stone-300 border border-stone-600/50 text-[10px] font-medium backdrop-blur-md shadow-sm">
                          👥 同組共用處方
                        </span>
                      )}
                      {basis === 'primary' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[10px] font-bold backdrop-blur-md shadow-sm">
                          ⭐ 核心處方
                        </span>
                      )}
                    </div>

                    <ExerciseCard exercise={exercise} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Section: Generic Ankle Suggested Exercises if applicable */}
      {suggestedExercises.length > 0 && (
        <div className="pt-8 mt-8 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
                  通用踝足庫建議動作 (待臨床個別確認)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  此處為非病症專屬之基礎關節活動度與踝足本體感覺動作，可依病患急性度選擇性納入
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestedExercises.map(ex => (
              <div key={ex.id} className="relative">
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-stone-900/90 text-stone-300 border border-stone-700 text-[10px] font-medium backdrop-blur-md">
                    ⏳ 建議・待臨床確認
                  </span>
                </div>
                <ExerciseCard exercise={ex} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
