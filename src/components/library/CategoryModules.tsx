import React from 'react';
import { Exercise } from '../../types/exercise';
import { LibraryUrlFilters } from '../../hooks/useHashSearchParams';
import { Grid, Activity, Dumbbell, ShieldCheck } from 'lucide-react';

interface Props {
  exercises: Exercise[];
  filters: LibraryUrlFilters;
  onUpdateFilters: (next: Partial<LibraryUrlFilters>) => void;
}

export const CategoryModules: React.FC<Props> = ({ exercises, filters, onUpdateFilters }) => {
  // Movement Type Counts
  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach(e => {
      e.movementType.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [exercises]);

  // Phase Counts
  const phaseCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach(e => {
      e.rehabPhase.forEach(p => {
        const short = p.split(':')[0] || p;
        counts[short] = (counts[short] || 0) + 1;
      });
    });
    return counts;
  }, [exercises]);

  // Equipment Counts
  const equipCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach(e => {
      e.equipment.forEach(eq => {
        const simple = eq.split(' ')[0];
        counts[simple] = (counts[simple] || 0) + 1;
      });
    });
    return counts;
  }, [exercises]);

  const movementOptions = [
    'Isometric', 'Concentric', 'Eccentric', 'Plyometric', 'Mobility', 'Proprioception', 'Stability'
  ];

  const phaseOptions = [
    { id: 'Phase 1: 急性保護/神經肌肉活化', label: 'Phase 1', key: 'Phase 1' },
    { id: 'Phase 2: 次急性控制負荷', label: 'Phase 2', key: 'Phase 2' },
    { id: 'Phase 3: 後期肌力與肥大強化', label: 'Phase 3', key: 'Phase 3' },
    { id: 'Phase 4: 增強式與重返運動', label: 'Phase 4', key: 'Phase 4' }
  ];

  const commonEquipments = [
    '徒手', '彈力帶', '啞鈴', '階梯/踏板', '平衡墊/平衡盤', '牆面', '斜板'
  ];

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
            百科分類模組 (Category Modules)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500 dark:text-stone-400">
          點擊任一標籤直接多向交叉篩選
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* Module 1: Movement Types */}
        <div className="space-y-1.5 bg-white dark:bg-[#26221E] p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-amber-700" />
            <span>動作收縮型態 (Type)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {movementOptions.map(type => {
              const active = filters.movementTypes.includes(type);
              const count = typeCounts[type] || 0;
              return (
                <button
                  key={type}
                  onClick={() => {
                    const current = filters.movementTypes;
                    const updated = active ? current.filter(t => t !== type) : [...current, type];
                    onUpdateFilters({ movementTypes: updated });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border ${
                    active
                      ? 'bg-amber-800 text-white border-amber-800 font-bold shadow-xs'
                      : 'bg-[#FBF9F5] dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-700/50'
                  }`}
                >
                  <span>{type}</span>
                  <span className={`text-[10px] font-mono ${active ? 'text-amber-200' : 'text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 2: Rehab Phases */}
        <div className="space-y-1.5 bg-white dark:bg-[#26221E] p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>復健分期進程 (Phase)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {phaseOptions.map(phase => {
              const active = filters.rehabPhases.includes(phase.id);
              const count = phaseCounts[phase.key] || 0;
              return (
                <button
                  key={phase.id}
                  onClick={() => {
                    const current = filters.rehabPhases;
                    const updated = active ? current.filter(p => p !== phase.id) : [...current, phase.id];
                    onUpdateFilters({ rehabPhases: updated });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border ${
                    active
                      ? 'bg-amber-800 text-white border-amber-800 font-bold shadow-xs'
                      : 'bg-[#FBF9F5] dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-700/50'
                  }`}
                >
                  <span>{phase.label}</span>
                  <span className={`text-[10px] font-mono ${active ? 'text-amber-200' : 'text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 3: Common Equipments */}
        <div className="space-y-1.5 bg-white dark:bg-[#26221E] p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 text-[11px]">
            <Dumbbell className="w-3.5 h-3.5 text-amber-700" />
            <span>常用器材要求 (Equipment)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {commonEquipments.map(eq => {
              const active = filters.equipment.some(e => e.includes(eq));
              const count = equipCounts[eq] || 0;
              return (
                <button
                  key={eq}
                  onClick={() => {
                    const current = filters.equipment;
                    const updated = active ? current.filter(e => !e.includes(eq)) : [...current, eq];
                    onUpdateFilters({ equipment: updated });
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border ${
                    active
                      ? 'bg-amber-800 text-white border-amber-800 font-bold shadow-xs'
                      : 'bg-[#FBF9F5] dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-700/50'
                  }`}
                >
                  <span>{eq}</span>
                  <span className={`text-[10px] font-mono ${active ? 'text-amber-200' : 'text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
