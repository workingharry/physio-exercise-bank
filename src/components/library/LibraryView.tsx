import React, { useState, useMemo } from 'react';
import { allExercises } from '../../data/exercises';
import { useRoutineStore } from '../../store/useRoutineStore';
import { WholeBodyNav } from '../layout/WholeBodyNav';
import { FilterDrawer } from './FilterDrawer';
import { ExerciseCard } from './ExerciseCard';
import { CompactTableView } from './CompactTableView';
import { QuickViewModal } from './QuickViewModal';
import { Exercise, MacroRegion } from '../../types/exercise';
import { LayoutGrid, Table, Flame, AlertCircle, X, Check } from 'lucide-react';

interface ScenarioPreset {
  id: string;
  label: string;
  badge: string;
  subRegion?: string;
  search?: string;
  movementTypes?: string[];
  rehabPhases?: string[];
}

export const LibraryView: React.FC = () => {
  const { customExercises } = useRoutineStore();

  const combinedExercises = useMemo(() => {
    return [...customExercises, ...allExercises];
  }, [customExercises]);

  const [selectedMacro, setSelectedMacro] = useState<MacroRegion>('Lower Limb');
  const [selectedSub, setSelectedSub] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // View Mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Quick View Drawer Modal
  const [quickViewExercise, setQuickViewExercise] = useState<Exercise | null>(null);

  // Active Scenario Chip
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    subRegion: 'ALL',
    movementTypes: [] as string[],
    rehabPhases: [] as string[],
    equipment: [] as string[],
    difficulty: 'ALL',
    kineticChain: 'ALL'
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
      // Toggle off
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
      kineticChain: 'ALL'
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

      {/* One-Click Clinical Scenario Pills */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>一鍵臨床情境快捷膠囊 (Clinical Scenario Quick-Filters)</span>
          </div>
          {activeScenarioId && (
            <button
              onClick={() => {
                setActiveScenarioId(null);
                setFilters(prev => ({ ...prev, search: '', movementTypes: [], rehabPhases: [] }));
                setSelectedSub('ALL');
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>清除情境快捷</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {clinicalScenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold border border-teal-300'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{scenario.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-teal-400 border border-teal-800/50'
                }`}>
                  {scenario.badge}
                </span>
                {isActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Attribute Filter & Search Engine */}
      <FilterDrawer
        filters={filters}
        setFilters={setFilters}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        totalFiltered={filteredExercises.length}
        totalCount={combinedExercises.length}
      />

      {/* Results Header: Count & View Mode Switcher */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-300">
          共找到 <strong className="text-teal-400 font-bold text-sm">{filteredExercises.length}</strong> 個符合臨床條件的動作
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
                : 'text-slate-400 hover:text-slate-200'
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
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">無符合當前條件的運動</h3>
          <p className="text-xs text-slate-400">
            請嘗試放寬篩選條件或重設搜尋關鍵字
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
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 shadow-md transition"
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
      />
    </div>
  );
};
