import React from 'react';
import { countByRegion } from '../../data/selectors';
import { Exercise } from '../../types/exercise';
import { LibraryUrlFilters } from '../../hooks/useHashSearchParams';

interface Props {
  filters: LibraryUrlFilters;
  onSelectRegion: (region: 'all' | 'ankle' | 'knee' | 'hip') => void;
  exercisesPool?: Exercise[];
}

export const RegionChips: React.FC<Props> = ({ filters, onSelectRegion, exercisesPool }) => {
  // Calculate counts for each region under current non-region filters
  const counts = countByRegion({
    movementTypes: filters.movementTypes,
    rehabPhases: filters.rehabPhases,
    equipment: filters.equipment,
    difficulty: filters.difficulty,
    kineticChain: filters.kineticChain,
    search: filters.search
  }, exercisesPool);

  const regionOptions: { id: 'all' | 'ankle' | 'knee' | 'hip'; labelZh: string; labelEn: string; count: number }[] = [
    { id: 'all', labelZh: '全部部位', labelEn: 'All Regions', count: counts.all },
    { id: 'ankle', labelZh: '腳踝與足部', labelEn: 'Ankle & Foot', count: counts.ankle },
    { id: 'knee', labelZh: '膝與髕骨', labelEn: 'Knee & Patella', count: counts.knee },
    { id: 'hip', labelZh: '髖與骨盆', labelEn: 'Hip & Pelvis', count: counts.hip }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
      {regionOptions.map(opt => {
        const isSelected = filters.region === opt.id;
        const isDisabled = opt.count === 0 && !isSelected;

        return (
          <button
            key={opt.id}
            onClick={() => onSelectRegion(opt.id)}
            disabled={isDisabled}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-2 shrink-0 border ${
              isSelected
                ? 'bg-amber-800 text-white border-amber-800 shadow-sm font-bold'
                : isDisabled
                ? 'bg-stone-100 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-800/60 cursor-not-allowed'
                : 'bg-white dark:bg-[#201D1A] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
            }`}
          >
            <span>{opt.labelZh}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected
                  ? 'bg-amber-900/60 text-amber-100'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold'
              }`}
            >
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
