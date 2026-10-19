import React from 'react';
import { 
  Search, SlidersHorizontal, RotateCcw, X, Target, 
  Bookmark, Clock, LayoutGrid, Table, Trash2, Check
} from 'lucide-react';
import { ScopeMode } from './LibraryView';
import { LibraryUrlFilters } from '../../hooks/useHashSearchParams';

interface Props {
  filters: LibraryUrlFilters;
  onUpdateFilters: (next: Partial<LibraryUrlFilters>) => void;
  onResetFilters: () => void;
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
  onUpdateFilters,
  onResetFilters,
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

  const handleToggle = (key: 'movementTypes' | 'rehabPhases' | 'equipment', val: string) => {
    const current = filters[key] || [];
    const exists = current.includes(val);
    const updated = exists ? current.filter(item => item !== val) : [...current, val];
    onUpdateFilters({ [key]: updated });
  };

  const hasActiveAdvancedFilters = 
    filters.movementTypes.length > 0 || 
    filters.rehabPhases.length > 0 || 
    filters.equipment.length > 0 || 
    (filters.difficulty && filters.difficulty !== 'ALL') || 
    (filters.kineticChain && filters.kineticChain !== 'ALL');

  const activeFilterCount = 
    filters.movementTypes.length + 
    filters.rehabPhases.length + 
    filters.equipment.length + 
    (filters.difficulty && filters.difficulty !== 'ALL' ? 1 : 0) + 
    (filters.kineticChain && filters.kineticChain !== 'ALL' ? 1 : 0);

  return (
    <div className="w-full bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl p-2.5 sm:p-3 shadow-sm transition-colors space-y-2">
      {/* 🌟 Unified Command Bar: Search + Scope + Filter Toggle + View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 dark:text-stone-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="搜尋運動名稱、肌群或器材..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 outline-none transition"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center / Right: Scope Pill Toggle (All / Favorites / Recent) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center bg-[#F5F2EB] dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs">
            <button
              onClick={() => setScopeMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'all'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-sm font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              全部
            </button>

            <button
              onClick={() => setScopeMode('favorites')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'favorites'
                  ? 'bg-amber-700 text-white shadow-sm font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3 h-3 fill-current" />
              <span>收藏</span>
              {bookmarksCount > 0 && <span className="text-[10px] font-mono">({bookmarksCount})</span>}
            </button>

            <button
              onClick={() => setScopeMode('recent')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition ${
                scopeMode === 'recent'
                  ? 'bg-stone-800 text-white shadow-sm font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>最近</span>
              {recentCount > 0 && <span className="text-[10px] font-mono">({recentCount})</span>}
            </button>
          </div>

          {scopeMode === 'recent' && recentCount > 0 && (
            <button
              onClick={() => {
                if (confirm('確定清空所有最近瀏覽紀錄？')) {
                  clearRecentlyViewed();
                }
              }}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
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
                ? 'bg-amber-800 text-white border-amber-700 shadow-sm'
                : 'bg-[#FAF8F5] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>篩選</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-stone-950 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Filter Button */}
          {hasActiveAdvancedFilters && (
            <button
              onClick={onResetFilters}
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition"
              title="重設全部條件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* View Mode (Grid vs Table) */}
          <div className="hidden sm:flex items-center bg-[#F5F2EB] dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="網格檢視"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
              title="精簡表格檢視"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Collapsible Advanced Filter Drawer Panel */}
      {isOpen && (
        <div className="pt-3 pb-2 border-t border-stone-100 dark:border-stone-800/80 space-y-3.5 animate-in fade-in duration-150 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Movement Types */}
            <div>
              <span className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                動作收縮型態
              </span>
              <div className="flex flex-wrap gap-1">
                {movementOptions.map((type) => {
                  const active = filters.movementTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleToggle('movementTypes', type)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        active
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rehab Phases */}
            <div>
              <span className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                臨床復健階段
              </span>
              <div className="flex flex-wrap gap-1">
                {phaseOptions.map((phase) => {
                  const active = filters.rehabPhases.includes(phase);
                  return (
                    <button
                      key={phase}
                      onClick={() => handleToggle('rehabPhases', phase)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        active
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {phase.split(':')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <span className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                器材需求
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
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {eq.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty & Kinetic Chain */}
            <div className="space-y-3">
              <div>
                <span className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  難易度
                </span>
                <div className="flex flex-wrap gap-1">
                  {difficultyOptions.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => onUpdateFilters({ difficulty: diff })}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        filters.difficulty === diff
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {diff === 'ALL' ? '不限' : diff.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  動力鏈
                </span>
                <div className="flex flex-wrap gap-1">
                  {chainOptions.map((chain) => (
                    <button
                      key={chain}
                      onClick={() => onUpdateFilters({ kineticChain: chain })}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        filters.kineticChain === chain
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-[#FAF8F5] dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {chain === 'ALL' ? '不限' : chain}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
