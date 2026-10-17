import React from 'react';
import { 
  Search, SlidersHorizontal, RotateCcw, X, Target, 
  Bookmark, Clock, LayoutGrid, Table, Trash2, Check
} from 'lucide-react';
import { ScopeMode } from './LibraryView';

export interface FilterState {
  search: string;
  subRegion: string;
  movementTypes: string[];
  rehabPhases: string[];
  equipment: string[];
  targetMuscles: string[];
  difficulty: string;
  kineticChain: string;
  loadingStatus: string;
}

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  scopeMode: ScopeMode;
  setScopeMode: (val: ScopeMode) => void;
  bookmarksCount: number;
  recentCount: number;
  clearRecentlyViewed: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (val: 'grid' | 'table') => void;
  totalFiltered: number;
  totalCount: number;
}

export const FilterDrawer: React.FC<Props> = ({
  filters,
  setFilters,
  isOpen,
  setIsOpen,
  scopeMode,
  setScopeMode,
  bookmarksCount,
  recentCount,
  clearRecentlyViewed,
  viewMode,
  setViewMode,
  totalFiltered,
  totalCount
}) => {
  const movementOptions = [
    'Isometric', 'Concentric', 'Eccentric', 'Plyometric', 'Mobility', 'Proprioception', 'Stability', 'Motor Control'
  ];

  const phaseOptions = [
    'Phase 1: 急性保護/神經肌肉活化',
    'Phase 2: 次急性控制負荷',
    'Phase 3: 後期肌力與肥大強化',
    'Phase 4: 增強式與重返運動'
  ];

  const muscleOptions = [
    '腓腸肌 / 比目魚肌 (Calf)',
    '脛前肌 (Tibialis Anterior)',
    '脛後肌 (Tibialis Posterior)',
    '腓骨長短肌 (Peroneals)',
    '股四頭肌 (Quadriceps)',
    '膕旁肌 (Hamstrings)',
    '臀大肌 (Gluteus Maximus)',
    '臀中肌 / 髖外展 (Gluteus Medius)',
    '髖內收肌 (Hip Adductors)',
    '足底小肌 (Foot Intrinsics)'
  ];

  const equipmentOptions = [
    '徒手 (Bodyweight)',
    '彈力帶 (Resistance Band)',
    '啞鈴 (Dumbbell)',
    '階梯/踏板 (Step/Box)',
    '平衡墊/平衡盤 (Balance Pad/Disc)',
    '牆面 (Wall)',
    '斜板 (Slant Board)'
  ];

  const difficultyOptions = ['ALL', 'Beginner (初階)', 'Intermediate (中階)', 'Advanced (進階)'];
  const chainOptions = ['ALL', '閉鎖鏈 (CKC)', '開放鏈 (OKC)'];
  const loadingStatusOptions = [
    'ALL',
    '閉鎖鏈承重 (CKC)',
    '開放鏈非承重 (OKC)',
    '徒手自重 (Bodyweight)',
    '抗阻負重 (Resisted)'
  ];

  const handleToggle = (key: 'movementTypes' | 'rehabPhases' | 'equipment' | 'targetMuscles', val: string) => {
    setFilters(prev => {
      const exists = prev[key].includes(val);
      return {
        ...prev,
        [key]: exists ? prev[key].filter(item => item !== val) : [...prev[key], val]
      };
    });
  };

  const handleReset = () => {
    setFilters({
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
  };

  const hasActiveAdvancedFilters = 
    filters.movementTypes.length > 0 || 
    filters.rehabPhases.length > 0 || 
    filters.equipment.length > 0 || 
    filters.targetMuscles.length > 0 ||
    filters.difficulty !== 'ALL' || 
    filters.kineticChain !== 'ALL' ||
    filters.loadingStatus !== 'ALL';

  const activeFilterCount = 
    filters.movementTypes.length + 
    filters.rehabPhases.length + 
    filters.equipment.length + 
    filters.targetMuscles.length + 
    (filters.difficulty !== 'ALL' ? 1 : 0) + 
    (filters.kineticChain !== 'ALL' ? 1 : 0) + 
    (filters.loadingStatus !== 'ALL' ? 1 : 0);

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm transition-colors space-y-2">
      {/* 🌟 Unified Command Bar: Search + Scope + Filter Toggle + View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="搜尋運動名稱、肌群 (如: 腓骨肌、膕旁肌) 或器材..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center / Right: Scope Pill Toggle (All / Favorites / Recent) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => setScopeMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'all'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              全部
            </button>

            <button
              onClick={() => setScopeMode('favorites')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'favorites'
                  ? 'bg-amber-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3 h-3 fill-current" />
              <span>收藏</span>
              {bookmarksCount > 0 && <span className="text-[10px]">({bookmarksCount})</span>}
            </button>

            <button
              onClick={() => setScopeMode('recent')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'recent'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>最近</span>
              {recentCount > 0 && <span className="text-[10px]">({recentCount})</span>}
            </button>
          </div>

          {scopeMode === 'recent' && recentCount > 0 && (
            <button
              onClick={() => {
                if (confirm('確定清空所有最近瀏覽紀錄？')) {
                  clearRecentlyViewed();
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
              title="清空最近紀錄"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Advanced Filter Drawer Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isOpen || hasActiveAdvancedFilters
                ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>篩選</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Filter Button */}
          {hasActiveAdvancedFilters && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 text-slate-500 border border-slate-200 dark:border-slate-700 transition"
              title="重設全部條件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* View Mode (Grid vs Table) */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="網格卡片視圖"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="緊湊清單表格"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Expanded Multi-Attribute Filter Matrix (Only shows when user clicks '篩選') */}
      {isOpen && (
        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 animate-in slide-in-from-top-2 duration-200 text-xs">
          
          {/* Target Muscle Groups */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-500" />
                <span>目標肌群篩選 (Target Muscles)</span>
              </span>
              {filters.targetMuscles.length > 0 && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, targetMuscles: [] }))}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                >
                  清除肌群
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {muscleOptions.map((muscle) => {
                const active = filters.targetMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    onClick={() => handleToggle('targetMuscles', muscle)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                      active
                        ? 'bg-teal-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {muscle.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Movement Types (Contraction) */}
          <div>
            <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              收縮型態 / 機制 (Contraction)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {movementOptions.map((type) => {
                const active = filters.movementTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleToggle('movementTypes', type)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                      active
                        ? 'bg-cyan-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment & Difficulty & Kinetic Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Equipment */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                所需器材
              </span>
              <div className="flex flex-wrap gap-1">
                {equipmentOptions.map((eq) => {
                  const active = filters.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      onClick={() => handleToggle('equipment', eq)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        active
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {eq.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                難易度
              </span>
              <div className="flex flex-wrap gap-1">
                {difficultyOptions.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilters(prev => ({ ...prev, difficulty: diff }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      filters.difficulty === diff
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {diff === 'ALL' ? '不限' : diff.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Kinetic Chain */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                動力鏈
              </span>
              <div className="flex flex-wrap gap-1">
                {chainOptions.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setFilters(prev => ({ ...prev, kineticChain: chain }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      filters.kineticChain === chain
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {chain === 'ALL' ? '不限' : chain}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Status */}
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                負重/承重
              </span>
              <div className="flex flex-wrap gap-1">
                {loadingStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, loadingStatus: status }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      filters.loadingStatus === status
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {status === 'ALL' ? '不限' : status.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
