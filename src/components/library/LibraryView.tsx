import React, { useState, useMemo } from 'react';
import { allExercises } from '../../data/exercises';
import { genericAnkleLibrary } from '../../data/selectors';
import { useRoutineStore } from '../../store/useRoutineStore';
import { FilterDrawer, FilterState } from './FilterDrawer';
import { ExerciseCard } from './ExerciseCard';
import { CompactTableView } from './CompactTableView';
import { QuickViewModal } from './QuickViewModal';
import { ExerciseCompareModal } from './ExerciseCompareModal';
import { DataQualityModal } from './DataQualityModal';
import { ConditionSearchView } from '../home/ConditionSearchView';
import { Exercise } from '../../types/exercise';
import { 
  AlertCircle, X, Check, Flame, Scale, Trash2, 
  ChevronRight, BarChart3, Dumbbell, Search, Compass, ShieldAlert, Sparkles
} from 'lucide-react';

interface ScenarioPreset {
  id: string;
  label: string;
  subRegion?: string;
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

  // Dual mode: 'search' (default condition search) vs 'review' (joint review)
  const [homeMode, setHomeMode] = useState<'search' | 'review'>('search');

  const combinedExercises = useMemo(() => {
    return [...customExercises, ...allExercises];
  }, [customExercises]);

  const [selectedSub, setSelectedSub] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Scope Mode: 'all' | 'favorites' | 'recent'
  const [scopeMode, setScopeMode] = useState<ScopeMode>('all');

  // Modals
  const [quickViewExercise, setQuickViewExercise] = useState<Exercise | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState<boolean>(false);

  // Active Scenario Chip
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    subRegion: 'ALL',
    movementTypes: [],
    rehabPhases: [],
    equipment: [],
    targetMuscles: [],
    difficulty: 'ALL',
    kineticChain: 'ALL',
    loadingStatus: 'ALL'
  });

  // SubRegion Chips
  const subRegionOptions = [
    { id: 'ALL', label: '全部部位' },
    { id: 'Ankle & Foot', label: '腳踝與足部' },
    { id: 'Knee', label: '膝與髕骨' },
    { id: 'Hip & Pelvis', label: '髖與骨盆' }
  ];

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
      subRegion: 'Ankle & Foot',
      search: 'Achilles',
      movementTypes: ['Eccentric', 'Isometric']
    },
    {
      id: 'aclr-early',
      label: 'ACL 早期對齊',
      subRegion: 'Knee',
      search: 'ACLR',
      rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
    },
    {
      id: 'cai-balance',
      label: '外側踝穩定',
      subRegion: 'Ankle & Foot',
      movementTypes: ['Proprioception', 'Stability']
    },
    {
      id: 'hip-knee-valgus',
      label: '臀肌防膝外翻',
      subRegion: 'Hip & Pelvis',
      movementTypes: ['Stability', 'Concentric']
    },
    {
      id: 'plantar-fascia',
      label: '足底筋膜負載',
      subRegion: 'Ankle & Foot',
      search: 'Plantar'
    },
    {
      id: 'hamstring-askling',
      label: '膕旁肌離心',
      subRegion: 'Hip & Pelvis',
      search: 'Askling',
      movementTypes: ['Eccentric']
    }
  ];

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    if (activeScenarioId === scenario.id) {
      setActiveScenarioId(null);
      setFilters(prev => ({
        ...prev,
        search: '',
        movementTypes: [],
        rehabPhases: []
      }));
      setSelectedSub('ALL');
      return;
    }

    setActiveScenarioId(scenario.id);
    if (scenario.subRegion) {
      setSelectedSub(scenario.subRegion);
    } else {
      setSelectedSub('ALL');
    }

    setFilters(prev => ({
      ...prev,
      search: scenario.search || '',
      movementTypes: scenario.movementTypes || [],
      rehabPhases: scenario.rehabPhases || [],
      difficulty: 'ALL',
      kineticChain: 'ALL',
      loadingStatus: 'ALL'
    }));
  };

  // Calculate counts per subregion
  const exerciseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedExercises.forEach(e => {
      counts[e.subRegion] = (counts[e.subRegion] || 0) + 1;
    });
    return counts;
  }, [combinedExercises]);

  // Comparison Exercises
  const comparisonExercises = useMemo(() => {
    return comparisonIds
      .map(id => combinedExercises.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => Boolean(ex));
  }, [comparisonIds, combinedExercises]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    let pool = combinedExercises;
    if (scopeMode === 'favorites') {
      pool = combinedExercises.filter(ex => bookmarks.includes(ex.id));
    } else if (scopeMode === 'recent') {
      const recentMap = new Map(recentlyViewed.map((id, idx) => [id, idx]));
      pool = combinedExercises
        .filter(ex => recentMap.has(ex.id))
        .sort((a, b) => (recentMap.get(a.id) ?? 999) - (recentMap.get(b.id) ?? 999));
    }

    return pool.filter(ex => {
      // SubRegion filter
      const activeSub = selectedSub !== 'ALL' ? selectedSub : filters.subRegion;
      if (activeSub !== 'ALL' && ex.subRegion !== activeSub) return false;

      // Search keyword
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchName = ex.name.toLowerCase().includes(query);
        const matchChinese = ex.chineseName.toLowerCase().includes(query);
        const matchMuscles = ex.biomechanics.primaryMuscles.some(m => m.toLowerCase().includes(query));
        const matchPathologies = ex.targetPathologies.some(p => p.toLowerCase().includes(query));
        const matchEquipment = ex.equipment.some(eq => eq.toLowerCase().includes(query));
        if (!matchName && !matchChinese && !matchMuscles && !matchPathologies && !matchEquipment) {
          return false;
        }
      }

      // Target Muscles filter
      if (filters.targetMuscles.length > 0) {
        const hasMuscle = filters.targetMuscles.some(tm => {
          const key = tm.split(' ')[0].replace(/[\/\(\)]/g, '');
          return ex.biomechanics.primaryMuscles.some(m => m.includes(key)) ||
                 ex.biomechanics.secondaryMuscles.some(m => m.includes(key));
        });
        if (!hasMuscle) return false;
      }

      // Movement types
      if (filters.movementTypes.length > 0) {
        const hasMovement = filters.movementTypes.some(t => ex.movementType.includes(t as any));
        if (!hasMovement) return false;
      }

      // Rehab phases
      if (filters.rehabPhases.length > 0) {
        const hasPhase = filters.rehabPhases.some(p => ex.rehabPhase.includes(p as any));
        if (!hasPhase) return false;
      }

      // Equipment
      if (filters.equipment.length > 0) {
        const hasEquipment = filters.equipment.some(eq => ex.equipment.some(e => e.includes(eq.split(' ')[0])));
        if (!hasEquipment) return false;
      }

      // Difficulty
      if (filters.difficulty !== 'ALL' && ex.difficulty !== filters.difficulty) {
        return false;
      }

      // Kinetic Chain
      if (filters.kineticChain !== 'ALL' && ex.biomechanics.kineticChain !== filters.kineticChain) {
        return false;
      }

      // Loading Status
      if (filters.loadingStatus !== 'ALL') {
        if (filters.loadingStatus.includes('CKC') && ex.biomechanics.kineticChain !== '閉鎖鏈 (CKC)') return false;
        if (filters.loadingStatus.includes('OKC') && ex.biomechanics.kineticChain !== '開放鏈 (OKC)') return false;
        if (filters.loadingStatus.includes('徒手自重') && !ex.equipment.some(e => e.includes('徒手') || e.includes('Bodyweight'))) return false;
        if (filters.loadingStatus.includes('抗阻負重') && !ex.equipment.some(e => e.includes('啞鈴') || e.includes('彈力帶') || e.includes('負重') || e.includes('槓鈴') || e.includes('壺鈴'))) return false;
      }

      return true;
    });
  }, [combinedExercises, selectedSub, filters, scopeMode, bookmarks, recentlyViewed]);

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  // Generic Ankle Library items (isolated for Ankle & Foot in Review mode)
  const genericAnkles = useMemo(() => {
    return genericAnkleLibrary();
  }, []);

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
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
          {/* 🌟 1. Single Unified Command Bar (Search + Scope + Filter + View Mode) */}
          <FilterDrawer
            filters={filters}
            setFilters={setFilters}
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

          {/* 🌟 2. Single-Row Integrated Horizontal Track: Joint SubRegions + Hot Clinical Scenarios */}
          <div className="flex items-center justify-between gap-3 text-xs overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* SubRegion Chips */}
              {subRegionOptions.map((sub) => {
                const isSubSelected = selectedSub === sub.id;
                const count = sub.id === 'ALL'
                  ? combinedExercises.length
                  : (exerciseCounts[sub.id] || 0);

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub.id);
                      setActiveScenarioId(null);
                    }}
                    className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 ${
                      isSubSelected && !activeScenarioId
                        ? 'bg-amber-800 text-white shadow-sm'
                        : 'bg-white dark:bg-[#201D1A] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <span className={`text-[10px] font-normal opacity-80 ${
                      isSubSelected && !activeScenarioId ? 'text-amber-100' : 'text-stone-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Subtle Vertical Divider */}
              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 shrink-0" />

              {/* Quick Scenario Chips */}
              <div className="flex items-center gap-1 shrink-0">
                {clinicalScenarios.map((scenario) => {
                  const isActive = activeScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleSelectScenario(scenario)}
                      className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1 shrink-0 ${
                        isActive
                          ? 'bg-amber-700 text-white font-bold shadow-sm'
                          : 'bg-[#FAF8F5] dark:bg-stone-900/60 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 border border-transparent'
                      }`}
                    >
                      <Flame className={`w-3 h-3 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                      <span>{scenario.label}</span>
                      {isActive && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {activeScenarioId && (
                <button
                  onClick={() => {
                    setActiveScenarioId(null);
                    setFilters(prev => ({ ...prev, search: '', movementTypes: [], rehabPhases: [] }));
                    setSelectedSub('ALL');
                  }}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 shrink-0"
                  title="清除情境"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Count & Quality Modal Entry Point */}
            <div className="hidden lg:flex items-center gap-2 text-stone-500 shrink-0 text-[11px]">
              <span>顯示 <strong>{filteredExercises.length}</strong> 項</span>
              <button
                onClick={() => setIsQualityModalOpen(true)}
                className="text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 underline underline-offset-2 flex items-center gap-1"
                title="查看全庫資料完整度"
              >
                <BarChart3 className="w-3 h-3" />
                <span>資料審計</span>
              </button>
            </div>
          </div>

          {/* 🌟 Isolated Section for Generic Ankle Library when viewing Ankle & Foot */}
          {(selectedSub === 'Ankle & Foot' || filters.subRegion === 'Ankle & Foot') && (
            <div className="p-3.5 rounded-2xl bg-[#F5F2EB] dark:bg-[#25211D] border border-amber-900/20 dark:border-amber-700/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <strong className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
                    通用踝足動作庫 (Generic Ankle Library · 13 個動作)
                  </strong>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium">
                  獨立收錄 · 嚴禁混入膝關節
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                原文件將此 13 個運動作為通用踝足復健動作補充，本系統獨立保留於踝足庫中，並在特定病症頁籤下方列為「建議・待臨床確認」提供治療師參考。
              </p>
            </div>
          )}

          {/* 🌟 3. Exercises Content: Grid or Compact Table */}
          {displayedExercises.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#FAF8F5] dark:bg-[#201D1A] border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">無符合條件的動作</h3>
              <p className="text-xs text-stone-400">
                {scopeMode === 'favorites' 
                  ? '您尚未收藏任何動作，請在卡片右上角點擊書籤圖示。'
                  : scopeMode === 'recent'
                    ? '尚無最近瀏覽紀錄。'
                    : '請嘗試放寬篩選條件或重設搜尋關鍵字'}
              </p>
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

      {/* Floating Compare Action Bar (Appears when >= 1 exercise selected) */}
      {comparisonIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 border border-amber-700/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 max-w-xl w-[92vw]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-lg bg-amber-800 text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold">動作對比</span>
              <span className="ml-1 text-amber-300">({comparisonIds.length}/3)</span>
            </div>
          </div>

          {/* Mini thumbnails of selected */}
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
