import React, { useState, useMemo } from 'react';
import { allExercises } from '../../data/exercises';
import { useRoutineStore } from '../../store/useRoutineStore';
import { WholeBodyNav } from '../layout/WholeBodyNav';
import { FilterDrawer, FilterState } from './FilterDrawer';
import { ExerciseCard } from './ExerciseCard';
import { CompactTableView } from './CompactTableView';
import { QuickViewModal } from './QuickViewModal';
import { ExerciseCompareModal } from './ExerciseCompareModal';
import { DataQualityModal } from './DataQualityModal';
import { Exercise, MacroRegion } from '../../types/exercise';
import { 
  LayoutGrid, Table, Flame, AlertCircle, X, Check, 
  Bookmark, Clock, Sparkles, Scale, BarChart3, Trash2
} from 'lucide-react';

interface ScenarioPreset {
  id: string;
  label: string;
  badge: string;
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

  const combinedExercises = useMemo(() => {
    return [...customExercises, ...allExercises];
  }, [customExercises]);

  const [selectedMacro, setSelectedMacro] = useState<MacroRegion>('Lower Limb');
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

  // Clinical Scenario Presets
  const clinicalScenarios: ScenarioPreset[] = [
    {
      id: 'acute-peace',
      label: '急性期消腫與保護',
      badge: 'PEACE & LOVE',
      rehabPhases: ['Phase 1: 急性保護/神經肌肉活化'],
      movementTypes: ['Isometric', 'Mobility']
    },
    {
      id: 'achilles-eccentric',
      label: '阿基里斯腱離心負重',
      badge: 'Alfredson / HSR',
      subRegion: 'Ankle & Foot',
      search: 'Achilles',
      movementTypes: ['Eccentric', 'Isometric']
    },
    {
      id: 'aclr-early',
      label: 'ACL 術後早期對齊',
      badge: '0° Ext & AMI',
      subRegion: 'Knee',
      search: 'ACLR',
      rehabPhases: ['Phase 1: 急性保護/神經肌肉活化']
    },
    {
      id: 'cai-balance',
      label: '外側踝扭傷與 CAI 穩定',
      badge: 'Peroneal / Proprio',
      subRegion: 'Ankle & Foot',
      movementTypes: ['Proprioception', 'Stability']
    },
    {
      id: 'hip-knee-valgus',
      label: '臀肌強化與防膝外翻',
      badge: 'Hip Abduction',
      subRegion: 'Hip & Pelvis',
      movementTypes: ['Stability', 'Concentric']
    },
    {
      id: 'plantar-fascia',
      label: '足底筋膜風向標負載',
      badge: 'Windlass Protocol',
      subRegion: 'Ankle & Foot',
      search: 'Plantar'
    },
    {
      id: 'hamstring-askling',
      label: '膕旁肌長力臂離心',
      badge: 'Askling L-Protocol',
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
    setSelectedMacro('Lower Limb');
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
    // 1. Initial pool according to Scope Mode
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
      // MacroRegion filter (unless searching favorites or recent)
      if (scopeMode === 'all' && ex.macroRegion !== selectedMacro) return false;

      // SubRegion filter from WholeBodyNav or Drawer
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
  }, [combinedExercises, selectedMacro, selectedSub, filters, scopeMode, bookmarks, recentlyViewed]);

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 animate-in fade-in duration-200">
      
      {/* 1. Multi-Attribute Filter & Search Engine (Top Placement) */}
      <FilterDrawer
        filters={filters}
        setFilters={setFilters}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        totalFiltered={filteredExercises.length}
        totalCount={combinedExercises.length}
      />

      {/* 2. Scope Tabs: All / Favorites / Recently Viewed + Data Quality Tool */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Scope Pill Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
          <button
            onClick={() => setScopeMode('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
              scopeMode === 'all'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>全部動作</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-700/80 text-teal-100">
              {combinedExercises.length}
            </span>
          </button>

          <button
            onClick={() => setScopeMode('favorites')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
              scopeMode === 'favorites'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>我的收藏</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              scopeMode === 'favorites' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {bookmarks.length}
            </span>
          </button>

          <button
            onClick={() => setScopeMode('recent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition ${
              scopeMode === 'recent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>最近使用</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              scopeMode === 'recent' ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {recentlyViewed.length}
            </span>
          </button>
        </div>

        {/* Right Utility: Data Quality Audit Tool & Clear Recent */}
        <div className="flex items-center gap-2">
          {scopeMode === 'recent' && recentlyViewed.length > 0 && (
            <button
              onClick={() => {
                if (confirm('確定清空所有最近瀏覽紀錄？')) {
                  clearRecentlyViewed();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-slate-500 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空紀錄</span>
            </button>
          )}

          <button
            onClick={() => setIsQualityModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-bold transition shadow-sm"
            title="開啟 387 筆動作資料品質審計工具"
          >
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span>資料品質審計</span>
          </button>
        </div>
      </div>

      {/* 3. Compact Whole-Body Taxonomy Navigation (Visible in 'all' mode) */}
      {scopeMode === 'all' && (
        <WholeBodyNav
          selectedMacro={selectedMacro}
          setSelectedMacro={setSelectedMacro}
          selectedSub={selectedSub}
          setSelectedSub={setSelectedSub}
          exerciseCounts={exerciseCounts}
        />
      )}

      {/* 4. Streamlined Horizontal Clinical Scenario Chips Strip */}
      {scopeMode === 'all' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 shrink-0 pr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">臨床情境膠囊:</span>
          </div>

          {clinicalScenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-bold border border-teal-500'
                    : 'bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{scenario.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isActive ? 'bg-teal-700 text-teal-100 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400'
                }`}>
                  {scenario.badge}
                </span>
                {isActive && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}

          {activeScenarioId && (
            <button
              onClick={() => {
                setActiveScenarioId(null);
                setFilters(prev => ({ ...prev, search: '', movementTypes: [], rehabPhases: [] }));
                setSelectedSub('ALL');
              }}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2 shrink-0 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>清除情境</span>
            </button>
          )}
        </div>
      )}

      {/* Results Header: Count & View Mode Switcher */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          共找到 <strong className="text-teal-600 dark:text-teal-400 font-bold text-sm">{filteredExercises.length}</strong> 個符合臨床條件的動作
          {scopeMode === 'favorites' && <span className="ml-1 text-amber-500 font-semibold">(已篩選收藏)</span>}
          {scopeMode === 'recent' && <span className="ml-1 text-indigo-500 font-semibold">(依最近瀏覽排序)</span>}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="大卡片網格視圖"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">大卡片網格</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="臨床緊湊清單表格視圖"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">臨床緊湊清單</span>
          </button>
        </div>
      </div>

      {/* Results View: Grid or Compact Table */}
      {displayedExercises.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">無符合當前條件的運動</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {scopeMode === 'favorites' 
              ? '您尚未收藏任何動作，請在運動卡片上點擊書籤圖示進行收藏。'
              : scopeMode === 'recent'
                ? '尚未有瀏覽紀錄，點擊任何動作即可自動儲存至最近使用。'
                : '請嘗試放寬篩選條件或重設搜尋關鍵字'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition"
              >
                載入更多動作 ({visibleCount} / {filteredExercises.length})
              </button>
            </div>
          )}
        </>
      )}

      {/* Quick View Drawer / Modal */}
      <QuickViewModal
        exercise={quickViewExercise}
        onClose={() => setQuickViewExercise(null)}
        onSelectSimilar={(sim) => setQuickViewExercise(sim)}
      />

      {/* Floating Compare Action Bar (Appears when >= 1 exercise selected) */}
      {comparisonIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-900/95 text-white border border-indigo-500/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 max-w-xl w-[92vw]">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold">動作對比</span>
              <span className="ml-1 text-indigo-300">({comparisonIds.length}/3)</span>
            </div>
          </div>

          {/* Mini thumbnails of selected */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 no-scrollbar">
            {comparisonExercises.map((ex) => (
              <div 
                key={ex.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] truncate max-w-[130px]"
              >
                <span className="truncate">{ex.name}</span>
                <button
                  onClick={() => removeFromComparison(ex.id)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
            >
              開始對比
            </button>
            <button
              onClick={clearComparison}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
