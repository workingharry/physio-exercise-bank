import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { allConditions, allExercises } from '../../data/exercises';
import { genericAnkleLibrary } from '../../data/selectors';
import { Condition, Exercise } from '../../types/exercise';
import { 
  X, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, 
  Search, ChevronRight, Stethoscope, HelpCircle, Layers,
  ExternalLink, FileText, Filter
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export type ReviewTab = 'all' | 'mentioned' | 'group' | 'generic' | 'nameInferred' | 'fallbackZh' | 'incompletePhase';

export const DataStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ReviewTab>('all');
  const [search, setSearch] = useState('');

  // 1. Mentioned items in exercises
  const mentionedItems = useMemo(() => {
    const list: { exercise: Exercise; condition: Condition; phase: string }[] = [];
    allExercises.forEach(ex => {
      (ex.appliesTo || []).forEach(a => {
        if (a.basis === 'mentioned') {
          const cond = allConditions.find(c => c.id === a.conditionId);
          if (cond) {
            list.push({
              exercise: ex,
              condition: cond,
              phase: (a.rehabPhase && a.rehabPhase[0]) || 'Phase 1'
            });
          }
        }
      });
    });
    return list;
  }, []);

  // 2. Group items in exercises
  const groupItems = useMemo(() => {
    const list: { exercise: Exercise; condition: Condition; phase: string }[] = [];
    allExercises.forEach(ex => {
      (ex.appliesTo || []).forEach(a => {
        if (a.basis === 'group') {
          const cond = allConditions.find(c => c.id === a.conditionId);
          if (cond) {
            list.push({
              exercise: ex,
              condition: cond,
              phase: (a.rehabPhase && a.rehabPhase[0]) || 'Phase 1'
            });
          }
        }
      });
    });
    return list;
  }, []);

  // 3. Generic Ankle Library suggestions
  const genericAnkles = useMemo(() => {
    return genericAnkleLibrary();
  }, []);

  // 4. Inferred condition names
  const inferredConditions = useMemo(() => {
    return allConditions.filter(c => c.nameInferred);
  }, []);

  // 5. Chinese fallback / unreviewed names
  const fallbackChineseExercises = useMemo(() => {
    return allExercises.filter(e => e.chineseNameIsFallback || e.chineseName === e.name);
  }, []);

  // 6. Incomplete phase conditions (< 4 phases)
  const incompletePhaseConditions = useMemo(() => {
    return allConditions.filter(c => 
      c.dataWarnings?.includes('phase-coverage-incomplete') || 
      (c.phaseCoverage && c.phaseCoverage.length < 4)
    );
  }, []);

  const totalPending = 
    mentionedItems.length + 
    groupItems.length + 
    genericAnkles.length + 
    inferredConditions.length + 
    fallbackChineseExercises.length + 
    incompletePhaseConditions.length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-status-title"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#FAF8F5] dark:bg-[#1C1917] border border-stone-300 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#201D1A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="data-status-title" className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>臨床資料狀態與待審查項目</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-800 text-amber-50" aria-label={`共 ${totalPending} 項待審`}>
                  {totalPending} 筆
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                本清單供臨床專家審閱文獻對應精確度（文中提及、合集共用、通用動作庫、推論病症與分期覆蓋）
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#1E1B18] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'all'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              全部待確認 ({totalPending})
            </button>
            <button
              onClick={() => setActiveTab('mentioned')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'mentioned'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              文中提及 ({mentionedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'group'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              合集處方 ({groupItems.length})
            </button>
            <button
              onClick={() => setActiveTab('generic')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'generic'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              通用踝庫建議 ({genericAnkles.length})
            </button>
            <button
              onClick={() => setActiveTab('incompletePhase')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'incompletePhase'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              分期不完整 ({incompletePhaseConditions.length})
            </button>
            <button
              onClick={() => setActiveTab('nameInferred')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'nameInferred'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              推論病症 ({inferredConditions.length})
            </button>
            <button
              onClick={() => setActiveTab('fallbackZh')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'fallbackZh'
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80'
              }`}
            >
              中文名草稿 ({fallbackChineseExercises.length})
            </button>
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋待審項目關鍵字..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#201D1A] border border-stone-300 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 transition"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* 1. Incomplete Phase Conditions */}
          {(activeTab === 'all' || activeTab === 'incompletePhase') && incompletePhaseConditions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>分期資料不完整之病症 ({incompletePhaseConditions.length} 筆)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {incompletePhaseConditions
                  .filter(c => !search || c.nameZh.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase()))
                  .map(c => (
                    <Link
                      key={c.id}
                      href={`/condition/${c.id}`}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-white dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 hover:border-amber-700 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                            {c.nameZh}
                          </strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            僅 {c.phaseCoverage.length} 期
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">{c.nameEn}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition" />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* 2. Inferred Condition Names */}
          {(activeTab === 'all' || activeTab === 'nameInferred') && inferredConditions.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <HelpCircle className="w-4 h-4" />
                <span>臨床文獻標題推論病症 (nameInferred: {inferredConditions.length} 筆)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inferredConditions
                  .filter(c => !search || c.nameZh.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase()))
                  .map(c => (
                    <Link
                      key={c.id}
                      href={`/condition/${c.id}`}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-white dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 hover:border-amber-700 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                            {c.nameZh}
                          </strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {c.region}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">{c.nameEn}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition" />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* 3. Generic Ankle Library items */}
          {(activeTab === 'all' || activeTab === 'generic') && genericAnkles.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Layers className="w-4 h-4" />
                <span>通用腳踝庫動作與建議配對 ({genericAnkles.length} 個動作)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {genericAnkles
                  .filter(ex => !search || ex.name.toLowerCase().includes(search.toLowerCase()) || ex.chineseName.includes(search))
                  .map(ex => (
                    <Link
                      key={ex.id}
                      href={`/exercise/${ex.id}`}
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-white dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 hover:border-amber-700 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300">
                            {ex.name}
                          </strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {ex.subRegion}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{ex.chineseName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition" />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* 4. Mentioned basis sample list */}
          {(activeTab === 'all' || activeTab === 'mentioned') && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <FileText className="w-4 h-4" />
                <span>文獻次提及標註 (basis: mentioned, 共 {mentionedItems.length} 筆配對)</span>
              </div>
              <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-[#24201D] overflow-hidden max-h-72 overflow-y-auto">
                {mentionedItems
                  .filter(item => !search || item.exercise.name.toLowerCase().includes(search.toLowerCase()) || item.condition.nameZh.includes(search))
                  .slice(0, 50)
                  .map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {item.exercise.name}
                        </span>
                        <span className="mx-2 text-stone-400">→</span>
                        <span className="text-amber-800 dark:text-amber-300 font-medium">
                          {item.condition.nameZh}
                        </span>
                        <span className="ml-2 text-[10px] text-stone-400">({item.phase})</span>
                      </div>
                      <Link
                        href={`/condition/${item.condition.id}`}
                        onClick={onClose}
                        className="text-stone-500 hover:text-amber-800 dark:hover:text-amber-300 shrink-0 font-medium text-[11px]"
                      >
                        檢閱
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5. Chinese Name Fallback */}
          {(activeTab === 'all' || activeTab === 'fallbackZh') && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>中文翻譯草稿待潤飾 ({fallbackChineseExercises.length} 筆)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {fallbackChineseExercises
                  .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.chineseName.includes(search))
                  .slice(0, 60)
                  .map(ex => (
                    <Link
                      key={ex.id}
                      href={`/exercise/${ex.id}`}
                      onClick={onClose}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#24201D] border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <strong className="block text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-300">
                          {ex.name}
                        </strong>
                        <span className="text-[11px] text-stone-400 truncate block">{ex.chineseName}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 shrink-0" />
                    </Link>
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#201D1A] flex items-center justify-between text-xs text-stone-500">
          <span>所有資料儲存於本地，離線可用</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-semibold transition"
          >
            完成審視
          </button>
        </div>

      </div>
    </div>
  );
};
