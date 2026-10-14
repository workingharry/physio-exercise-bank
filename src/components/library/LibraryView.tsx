import React, { useState, useMemo } from 'react';
import { allExercises } from '../../data/exercises';
import { useRoutineStore } from '../../store/useRoutineStore';
import { WholeBodyNav } from '../layout/WholeBodyNav';
import { FilterDrawer } from './FilterDrawer';
import { ExerciseCard } from './ExerciseCard';
import { MacroRegion } from '../../types/exercise';
import { Sparkles, Layers, BookOpen, AlertCircle } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { customExercises } = useRoutineStore();

  const combinedExercises = useMemo(() => {
    return [...customExercises, ...allExercises];
  }, [customExercises]);

  const [selectedMacro, setSelectedMacro] = useState<MacroRegion>('Lower Limb');
  const [selectedSub, setSelectedSub] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const [filters, setFilters] = useState({
    search: '',
    subRegion: 'ALL',
    movementTypes: [] as string[],
    rehabPhases: [] as string[],
    equipment: [] as string[],
    difficulty: 'ALL',
    kineticChain: 'ALL'
  });

  // Calculate counts per subregion
  const exerciseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedExercises.forEach(e => {
      counts[e.subRegion] = (counts[e.subRegion] || 0) + 1;
    });
    return counts;
  }, [combinedExercises]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return combinedExercises.filter(ex => {
      // MacroRegion filter
      if (ex.macroRegion !== selectedMacro) return false;

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

      return true;
    });
  }, [combinedExercises, selectedMacro, selectedSub, filters]);

  const displayedExercises = useMemo(() => {
    return filteredExercises.slice(0, visibleCount);
  }, [filteredExercises, visibleCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Whole-Body Anatomical Navigation */}
      <WholeBodyNav
        selectedMacro={selectedMacro}
        setSelectedMacro={setSelectedMacro}
        selectedSub={selectedSub}
        setSelectedSub={setSelectedSub}
        exerciseCounts={exerciseCounts}
      />

      {/* Multi-Attribute Filter & Search Engine */}
      <FilterDrawer
        filters={filters}
        setFilters={setFilters}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        totalFiltered={filteredExercises.length}
        totalCount={combinedExercises.length}
      />

      {/* Results Grid */}
      {displayedExercises.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">無符合當前條件的運動</h3>
          <p className="text-xs text-slate-400">
            請嘗試放寬篩選條件或重設搜尋關鍵字
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredExercises.length && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 shadow-md transition"
              >
                載入更多動作 ({visibleCount} / {filteredExercises.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
