import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { LibraryUrlFilters } from '../../hooks/useHashSearchParams';

interface Props {
  filters: LibraryUrlFilters;
  totalFiltered: number;
  totalInRegion: number;
  onRemoveFilter: (key: keyof LibraryUrlFilters, value?: string) => void;
  onClearAll: () => void;
}

export const ActiveFilterBar: React.FC<Props> = ({
  filters,
  totalFiltered,
  totalInRegion,
  onRemoveFilter,
  onClearAll
}) => {
  const activeChips: { key: keyof LibraryUrlFilters; label: string; value?: string }[] = [];

  // Movement Types
  for (const mt of filters.movementTypes) {
    activeChips.push({ key: 'movementTypes', label: `型態: ${mt}`, value: mt });
  }

  // Rehab Phases
  for (const rp of filters.rehabPhases) {
    const short = rp.split(':')[0] || rp;
    activeChips.push({ key: 'rehabPhases', label: short, value: rp });
  }

  // Equipment
  for (const eq of filters.equipment) {
    activeChips.push({ key: 'equipment', label: `器材: ${eq}`, value: eq });
  }

  // Difficulty
  if (filters.difficulty && filters.difficulty !== 'ALL') {
    activeChips.push({ key: 'difficulty', label: `難度: ${filters.difficulty}` });
  }

  // Kinetic Chain
  if (filters.kineticChain && filters.kineticChain !== 'ALL') {
    activeChips.push({ key: 'kineticChain', label: filters.kineticChain });
  }

  // Search
  if (filters.search && filters.search.trim()) {
    activeChips.push({ key: 'search', label: `關鍵字: "${filters.search}"` });
  }

  const hasChips = activeChips.length > 0;
  const hasUnknown = filters.unknownParams.length > 0;

  return (
    <div className="space-y-2">
      {hasUnknown && (
        <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>已忽略無法辨識的篩選條件：{filters.unknownParams.join(', ')}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        {/* Results Count Header */}
        <div className="text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1.5">
          <span>
            顯示 <strong>{totalFiltered}</strong>／共 {totalInRegion} 筆動作
          </span>
        </div>

        {/* Chips and Clear All */}
        {hasChips && (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium"
              >
                <span>{chip.label}</span>
                <button
                  onClick={() => onRemoveFilter(chip.key, chip.value)}
                  className="p-0.5 hover:text-stone-900 dark:hover:text-white rounded transition"
                  title="移除此條件"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清除全部篩選</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
