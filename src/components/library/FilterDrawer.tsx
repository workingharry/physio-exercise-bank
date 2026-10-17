import React from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal, Dumbbell, Target } from 'lucide-react';

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

  const hasActiveFilters = 
    filters.search || 
    filters.subRegion !== 'ALL' || 
    filters.movementTypes.length > 0 || 
    filters.rehabPhases.length > 0 || 
    filters.equipment.length > 0 || 
    filters.targetMuscles.length > 0 ||
    filters.difficulty !== 'ALL' || 
    filters.kineticChain !== 'ALL' ||
    filters.loadingStatus !== 'ALL';

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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Drawer Toggle & Reset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition border ${
              isOpen || hasActiveFilters
                ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>進階臨床篩選</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition"
              title="重設全部篩選條件"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Attribute Filter Matrix */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Target Muscle Groups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
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
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              收縮型態 / 動作機制 (Contraction Type)
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

          {/* Rehab Phases */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              臨床復健分期 (Rehabilitation Phase)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {phaseOptions.map((phase) => {
                const active = filters.rehabPhases.includes(phase);
                return (
                  <button
                    key={phase}
                    onClick={() => handleToggle('rehabPhases', phase)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      active
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {phase}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment & Difficulty & Kinetic Chain & Loading Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
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

            {/* Loading / Weight-Bearing Status */}
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                負重 / 承重狀態
              </span>
              <div className="flex flex-wrap gap-1.5">
                {loadingStatusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, loadingStatus: status }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      filters.loadingStatus === status
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
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
