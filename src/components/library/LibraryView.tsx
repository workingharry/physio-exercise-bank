import React, { useState, useMemo, useEffect } from 'react';
import { allExercises } from '../../data/exercises';
import { genericAnkleLibrary, filterExercises, countByRegion } from '../../data/selectors';
import { useRoutineStore } from '../../store/useRoutineStore';
import { FilterDrawer } from './FilterDrawer';
import { RegionChips } from './RegionChips';
import { ActiveFilterBar } from './ActiveFilterBar';
import { ExerciseCard } from './ExerciseCard';
import { CompactTableView } from './CompactTableView';
import { QuickViewModal } from './QuickViewModal';
import { ExerciseCompareModal } from './ExerciseCompareModal';
import { DataQualityModal } from './DataQualityModal';
import { ConditionSearchView } from '../home/ConditionSearchView';
import { Exercise } from '../../types/exercise';
import { useHashSearchParams, LibraryUrlFilters } from '../../hooks/useHashSearchParams';
import { 
  AlertCircle, X, Check, Flame, Scale, Trash2, 
  ChevronRight, BarChart3, Dumbbell, Search, Compass, ShieldAlert, Sparkles, RotateCcw
} from 'lucide-react';

interface ScenarioPreset {
  id: string;
  label: string;
  region?: 'all' | 'ankle' | 'knee' | 'hip';
  search?: string;
  movementTypes?: string[];
  rehabPhases?: string[];
}

export type ScopeMode = 'all' | 'favorites' | 'recent';

export const LibraryView: React.FC = () => {
  const { 
    customExercises, 
    bookmarks, 
    recentlyViewed, 
    clearRecentlyViewed,
    comparisonIds,
    removeFromComparison,
    clearComparison
  } = useRoutineStore();

  const { filters, updateFilters, clearAllFilters } = useHashSearchParams();

  // Dual mode: 'search' (default condition search) vs 'review' (joint review)
  const [homeMode, setHomeMode] = useState<'search' | 'review'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('browse') || hash.includes('/library')) return 'review';
      if (hash.includes('conditions') || hash.includes('mode=search')) return 'search';
    }
    return 'search';
  });

  // Listen to hash changes to sync homeMode
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('browse') || hash.includes('/library')) {
        setHomeMode('review');
      } else if (hash.includes('conditions') || hash.includes('mode=search')) {
        setHomeMode('search');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const combinedExercises = useMemo(() => {
    return [...customExercises, ...allExercises];
  }, [customExercises]);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('all');

  // Modals
  const [quickViewExercise, setQuickViewExercise] = useState<Exercise | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState<boolean>(false);

  // Active Scenario Chip
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // Clinical Scenario Presets
  const clinicalScenarios: ScenarioPreset[] = [
    {
      id: 'acute-peace',
      label: '急性期消腫',
      rehabPhases: ['Phase 1: 急性保護/神經肌肉活化'],
      movementTypes: ['Isometric', 'Mobility']
    },
    {
      id: 'achilles-eccentric',
      label: '阿基里斯腱負重',
      region: 'ankle',
      search: 'Achilles',
      movementTypes: ['Eccentric', 'Isometric']
    },
    {
      id: 'aclr-early',
      label: 'ACL 早期對齊',
      region: 'knee',
      search: 'ACLR',
      rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
    },
    {
      id: 'cai-balance',
      label: '外側踝穩定',
      region: 'ankle',
      movementTypes: ['Proprioception', 'Stability']
    },
    {
      id: 'hip-knee-valgus',
      label: '臀肌防膝外翻',
      region: 'hip',
      movementTypes: ['Stability', 'Concentric']
    },
    {
      id: 'plantar-fascia',
      label: '足底筋膜負載',
      region: 'ankle',
      search: 'Plantar'
    },
    {
      id: 'hamstring-askling',
      label: '膕旁肌離心',
      region: 'hip',
      search: 'Askling',
      movementTypes: ['Eccentric']
    }
  ];

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    if (activeScenarioId === scenario.id) {
      setActiveScenarioId(null);
      updateFilters({
        search: '',
        movementTypes: [],
        rehabPhases: []
      });
      return;
    }

    setActiveScenarioId(scenario.id);
    updateFilters({
      region: scenario.region || filters.region,
      search: scenario.search || '',
      movementTypes: scenario.movementTypes || [],
      rehabPhases: scenario.rehabPhases || []
    });
  };

  // Comparison Exercises
  const comparisonExercises = useMemo(() => {
    return comparisonIds
      .map(id => combinedExercises.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => Boolean(ex));
  }, [comparisonIds, combinedExercises]);

  // Scope-filtered exercise pool
  const scopedPool = useMemo(() => {
    let pool = combinedExercises;
    if (scopeMode === 'favorites') {
      pool = combinedExercises.filter(ex => bookmarks.includes(ex.id));
    } else if (scopeMode === 'recent') {
      const recentMap = new Map(recentlyViewed.map((id, idx) => [id, idx]));
      pool = combinedExercises
        .filter(ex => recentMap.has(ex.id))
        .sort((a, b) => (recentMap.get(a.id) ?? 999) - (recentMap.get(b.id) ?? 999));
    }
    return pool;
  }, [combinedExercises, scopeMode, bookmarks, recentlyViewed]);

  // Derived filtered exercises strictly from URL filters
  const filteredExercises = useMemo(() => {
    return filterExercises({
      region: filters.region,
      movementTypes: filters.movementTypes,
      rehabPhases: filters.rehabPhases,
      equipment: filters.equipment,
      difficulty: filters.difficulty,
      kineticChain: filters.kineticChain,
      search: filters.search
    }, scopedPool);
  }, [filters, scopedPool]);

  // Count in current region without non-region filters
  const totalInRegion = useMemo(() => {
    const regionCounts = countByRegion({}, scopedPool);
    return regionCounts[filters.region];
  }, [filters.region, scopedPool]);

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  const handleRemoveFilter = (key: keyof LibraryUrlFilters, value?: string) => {
    if (key === 'movementTypes' && value) {
      updateFilters({ movementTypes: filters.movementTypes.filter(t => t !== value) });
    } else if (key === 'rehabPhases' && value) {
      updateFilters({ rehabPhases: filters.rehabPhases.filter(p => p !== value) });
    } else if (key === 'equipment' && value) {
      updateFilters({ equipment: filters.equipment.filter(eq => eq !== value) });
    } else if (key === 'difficulty') {
      updateFilters({ difficulty: 'ALL' });
    } else if (key === 'kineticChain') {
      updateFilters({ kineticChain: 'ALL' });
    } else if (key === 'search') {
      updateFilters({ search: '' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-4 animate-in fade-in duration-150">
      
      {/* 🌟 Highlighted Dual-Mode Toggle: Search vs Review */}
      <div className="flex justify-center pt-1 pb-1">
        <div className="inline-flex p-1 rounded-2xl bg-[#F0ECE1] dark:bg-[#201D1A] border border-amber-900/15 dark:border-stone-800 shadow-inner">
          <button
            onClick={() => setHomeMode('search')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all ${
              homeMode === 'search'
                ? 'bg-amber-800 text-amber-50 shadow-md ring-1 ring-amber-900/20'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>病症檢索模式 (98 種病症)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-700/60 text-amber-100 hidden sm:inline">
              預設推薦
            </span>
          </button>

          <button
            onClick={() => setHomeMode('review')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all ${
              homeMode === 'review'
                ? 'bg-amber-800 text-amber-50 shadow-md ring-1 ring-amber-900/20'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>部位瀏覽模式 (373 動作)</span>
          </button>
        </div>
      </div>

      {homeMode === 'search' ? (
        /* 🔍 Search Mode: Mounted Condition Search View */
        <ConditionSearchView onSwitchToReview={() => setHomeMode('review')} />
      ) : (
        /* 🧭 Review Mode: Joint/Anatomy Exercise Bank */
        <div className="space-y-3">
          
          {/* 🌟 1. Single Unified Command Bar */}
          <FilterDrawer
            filters={filters}
            onUpdateFilters={updateFilters}
            onResetFilters={clearAllFilters}
            isOpen={isFilterOpen}
            setIsOpen={setIsFilterOpen}
            scopeMode={scopeMode}
            setScopeMode={setScopeMode}
            bookmarksCount={bookmarks.length}
            recentCount={recentlyViewed.length}
            clearRecentlyViewed={clearRecentlyViewed}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalFiltered={filteredExercises.length}
            totalCount={combinedExercises.length}
          />

          {/* 🌟 2. Region Chips (Derived dynamically, disables 0-count chips) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-stone-200 dark:border-stone-800/80 pb-2.5">
            <RegionChips
              filters={filters}
              onSelectRegion={(reg) => updateFilters({ region: reg })}
              exercisesPool={scopedPool}
            />

            {/* Quick Clinical Scenarios */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {clinicalScenarios.map((scenario) => {
                const isActive = activeScenarioId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleSelectScenario(scenario)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'bg-amber-700 text-white font-bold shadow-sm'
                        : 'bg-[#FAF8F5] dark:bg-stone-900/60 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <Flame className={`w-3 h-3 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                    <span>{scenario.label}</span>
                    {isActive && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🌟 3. Active Filter Bar: Active Chips & Result Counts */}
          <ActiveFilterBar
            filters={filters}
            totalFiltered={filteredExercises.length}
            totalInRegion={totalInRegion}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={clearAllFilters}
          />

          {/* 🌟 4. Isolated Section for Generic Ankle Library when viewing Ankle & Foot */}
          {filters.region === 'ankle' && (
            <div className="p-3.5 rounded-2xl bg-[#F5F2EB] dark:bg-[#25211D] border border-amber-900/20 dark:border-amber-700/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <strong className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                    通用踝足動作庫 (Generic Ankle Library · 13 個動作)
                  </strong>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold">
                  獨立收錄 · 嚴禁混入膝關節
                </span>
              </div>
              <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                原文件將此 13 個運動作為通用踝足復健動作補充，本系統獨立保留於踝足庫中，並在特定病症頁籤下方列為「建議・待臨床確認」提供治療師參考。
              </p>
            </div>
          )}

          {/* 🌟 5. Exercises Content: Grid or Compact Table */}
          {displayedExercises.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#FAF8F5] dark:bg-[#201D1A] border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">無符合條件的動作</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {scopeMode === 'favorites' 
                  ? '您尚未收藏任何動作，請在卡片右上角點擊書籤圖示。'
                  : scopeMode === 'recent'
                    ? '尚無最近瀏覽紀錄。'
                    : '目前篩選條件下無動作，您可以點擊下方按鈕清空所有篩選。'}
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清除全部篩選條件</span>
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
                  {displayedExercises.map((exercise) => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise} 
                      onQuickView={(ex) => setQuickViewExercise(ex)}
                    />
                  ))}
                </div>
              ) : (
                <CompactTableView
                  exercises={displayedExercises}
                  onQuickView={(ex) => setQuickViewExercise(ex)}
                />
              )}

              {/* Load More Button */}
              {visibleCount < filteredExercises.length && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 24)}
                    className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 font-bold text-xs border border-stone-200 dark:border-stone-700 shadow-sm transition"
                  >
                    載入更多 ({visibleCount} / {filteredExercises.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Quick View Drawer / Modal */}
      <QuickViewModal
        exercise={quickViewExercise}
        onClose={() => setQuickViewExercise(null)}
        onSelectSimilar={(sim) => setQuickViewExercise(sim)}
      />

      {/* Floating Compare Action Bar */}
      {comparisonIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 border border-amber-700/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 max-w-xl w-[92vw]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-lg bg-amber-800 text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold">動作對比</span>
              <span className="ml-1 text-amber-300 font-mono">({comparisonIds.length}/3)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 no-scrollbar">
            {comparisonExercises.map((ex) => (
              <div 
                key={ex.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-800 border border-stone-700 text-[11px] truncate max-w-[130px]"
              >
                <span className="truncate">{ex.name}</span>
                <button
                  onClick={() => removeFromComparison(ex.id)}
                  className="text-stone-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md shadow-amber-900/30"
            >
              開始對比
            </button>
            <button
              onClick={clearComparison}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              title="清空對比"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Exercise Comparison Modal */}
      <ExerciseCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        exercises={comparisonExercises}
      />

      {/* Data Quality Modal */}
      <DataQualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        exercises={combinedExercises}
        onSelectExercise={(ex) => setQuickViewExercise(ex)}
      />

    </div>
  );
};
