import React from 'react';
import { MacroRegion } from '../../types/exercise';
import { Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  selectedMacro: MacroRegion;
  setSelectedMacro: (macro: MacroRegion) => void;
  selectedSub: string;
  setSelectedSub: (sub: string) => void;
  exerciseCounts: Record<string, number>;
}

export const WholeBodyNav: React.FC<Props> = ({
  selectedMacro,
  setSelectedMacro,
  selectedSub,
  setSelectedSub,
  exerciseCounts
}) => {
  const macroTabs: { id: MacroRegion; label: string; badge: string; isReady: boolean }[] = [
    { id: 'Lower Limb', label: '下肢 (Lower Limb)', badge: '387 動作', isReady: true },
    { id: 'Upper Limb', label: '上肢 (Upper Limb)', badge: 'V2 預留', isReady: false },
    { id: 'Spine & Core', label: '脊椎與核心 (Spine)', badge: 'V3 預留', isReady: false },
    { id: 'Full Body & Functional', label: '全身功能性 (Functional)', badge: 'V4 預留', isReady: false },
  ];

  const lowerLimbSubRegions: { id: string; label: string; isAvailable: boolean }[] = [
    { id: 'ALL', label: '全部部位', isAvailable: true },
    { id: 'Ankle & Foot', label: '腳踝與足部', isAvailable: true },
    { id: 'Knee', label: '膝與髕骨', isAvailable: true },
    { id: 'Hip & Pelvis', label: '髖與骨盆', isAvailable: true },
    { id: 'Lower Limb Kinetic Chain', label: '下肢動力鏈', isAvailable: false },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-sm transition-colors space-y-2.5">
      {/* Tier 1: Compact Horizontal Macro Region Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 dark:text-stone-400 shrink-0 pr-1">
          <Layers className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">解剖區域:</span>
        </div>

        {macroTabs.map((tab) => {
          const isSelected = selectedMacro === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedMacro(tab.id);
                if (tab.id === 'Lower Limb') {
                  setSelectedSub('ALL');
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isSelected
                  ? 'bg-amber-800 text-white shadow-sm font-bold'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                isSelected
                  ? 'bg-amber-800 text-amber-100 font-bold'
                  : tab.isReady
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-stone-200 dark:bg-stone-900 text-stone-500 dark:text-stone-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tier 2: Sub-Region Filter Chips (with disabled empty state for Kinetic Chain) */}
      {selectedMacro === 'Lower Limb' && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100 dark:border-stone-800/60">
          <span className="text-[11px] font-semibold text-stone-400 shrink-0 mr-1 hidden sm:inline">關節:</span>
          {lowerLimbSubRegions.map((sub) => {
            const count = sub.id === 'ALL'
              ? (exerciseCounts['Ankle & Foot'] || 0) + (exerciseCounts['Knee'] || 0) + (exerciseCounts['Hip & Pelvis'] || 0)
              : (exerciseCounts[sub.id] || 0);

            const isSubSelected = selectedSub === sub.id;
            const isEmpty = count === 0;

            if (isEmpty) {
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100/60 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 border border-dashed border-stone-200 dark:border-stone-800 cursor-not-allowed shrink-0 opacity-60"
                  title="該分類動作庫尚在擴充整合中"
                >
                  <span>{sub.label}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-500">
                    即將推出
                  </span>
                </div>
              );
            }

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                  isSubSelected
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-950/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800'
                }`}
              >
                <span>{sub.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSubSelected
                    ? 'bg-stone-800 text-amber-300 dark:bg-stone-300 dark:text-stone-900 font-bold'
                    : 'bg-stone-200 dark:bg-stone-900 text-stone-600 dark:text-stone-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
