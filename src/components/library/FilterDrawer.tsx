import React from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal } from 'lucide-react';

interface FilterState {
  search: string;
  subRegion: string;
  movementTypes: string[];
  rehabPhases: string[];
  equipment: string[];
  difficulty: string;
  kineticChain: string;
}

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  totalFiltered: number;
  totalCount: number;
}

export const FilterDrawer: React.FC<Props> = ({
  filters,
  setFilters,
  isOpen,
  setIsOpen,
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
      difficulty: 'ALL',
      kineticChain: 'ALL'
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.subRegion !== 'ALL' || 
    filters.movementTypes.length > 0 || 
    filters.rehabPhases.length > 0 || 
    filters.equipment.length > 0 || 
    filters.difficulty !== 'ALL' || 
    filters.kineticChain !== 'ALL';

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-xl transition-colors">
      {/* Search Bar & Drawer Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="多屬性檢索：運動名稱、目標肌群 (如: 腓骨肌、膕旁肌)、病症或器材..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              isOpen
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-600/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>臨床進階篩選</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700/80 transition"
              title="重設全部條件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">重設</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Attribute Filter Panel */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
          {/* Movement Types */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              動作收縮型態 (Contraction / Movement Type)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {movementOptions.map((type) => {
                const active = filters.movementTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleToggle('movementTypes', type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      active
                        ? 'bg-teal-600 text-white font-bold border border-teal-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
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
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              復健臨床分期 (Rehabilitation Phase)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {phaseOptions.map((phase) => {
                const active = filters.rehabPhases.includes(phase);
                return (
                  <button
                    key={phase}
                    onClick={() => handleToggle('rehabPhases', phase)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium text-left transition ${
                      active
                        ? 'bg-cyan-600 text-white font-bold border border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {phase}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment & Difficulty & Kinetic Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Equipment */}
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                所需器材
              </span>
              <div className="flex flex-wrap gap-1.5">
                {equipmentOptions.map((eq) => {
                  const active = filters.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      onClick={() => handleToggle('equipment', eq)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                        active
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
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
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                難易度
              </span>
              <div className="flex flex-wrap gap-1.5">
                {difficultyOptions.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilters(prev => ({ ...prev, difficulty: diff }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      filters.difficulty === diff
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    {diff === 'ALL' ? '不限' : diff.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Kinetic Chain */}
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                動力鏈型態
              </span>
              <div className="flex flex-wrap gap-1.5">
                {chainOptions.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setFilters(prev => ({ ...prev, kineticChain: chain }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      filters.kineticChain === chain
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {chain === 'ALL' ? '不限' : chain}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter status summary count */}
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          顯示符合條件的動作：<strong className="text-teal-600 dark:text-teal-300 font-bold">{totalFiltered}</strong> / {totalCount} 個
        </span>
        {hasActiveFilters && (
          <span className="text-teal-600 dark:text-teal-400/90 text-[11px] font-medium">篩選器生效中</span>
        )}
      </div>
    </div>
  );
};
