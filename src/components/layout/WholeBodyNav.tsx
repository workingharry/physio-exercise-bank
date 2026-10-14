import React from 'react';
import { MacroRegion, SubRegion } from '../../types/exercise';
import { Layers, ShieldCheck, Sparkles } from 'lucide-react';

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
    { id: 'Lower Limb', label: '下肢 (Lower Limb)', badge: 'V1 核心資料庫 (387 動作)', isReady: true },
    { id: 'Upper Limb', label: '上肢 (Upper Limb)', badge: 'V2 預留 (支援自訂新增)', isReady: false },
    { id: 'Spine & Core', label: '脊椎與核心 (Spine & Core)', badge: 'V3 預留 (支援自訂新增)', isReady: false },
    { id: 'Full Body & Functional', label: '全身功能性 (Functional)', badge: 'V4 預留', isReady: false },
  ];

  const lowerLimbSubRegions: { id: string; label: string }[] = [
    { id: 'ALL', label: '全部下肢部位' },
    { id: 'Ankle & Foot', label: '腳踝與足部 (Ankle & Foot)' },
    { id: 'Knee', label: '膝與髕股關節 (Knee)' },
    { id: 'Hip & Pelvis', label: '髖與骨盆 (Hip & Pelvis)' },
    { id: 'Lower Limb Kinetic Chain', label: '下肢整合動力鏈' },
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Tier 1: Macro Region Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            全身解剖階層導覽 (Whole-Body Taxonomy)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-teal-400 font-medium bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800/50">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>臨床實證物理治療分級</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
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
              className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-gradient-to-br from-teal-950/80 to-slate-900 border-teal-500/80 shadow-md shadow-teal-500/10'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                  {tab.label}
                </span>
                {tab.isReady ? (
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-400/80" />
                )}
              </div>
              <span className={`mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                tab.isReady
                  ? 'bg-teal-900/40 text-teal-300 border border-teal-700/50'
                  : 'bg-slate-800/80 text-amber-300/80 border border-amber-800/40'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tier 2: SubRegion Filters (when Lower Limb is selected) */}
      {selectedMacro === 'Lower Limb' && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">關節子區域:</span>
          {lowerLimbSubRegions.map((sub) => {
            const count = sub.id === 'ALL' 
              ? (exerciseCounts['Ankle & Foot'] || 0) + (exerciseCounts['Knee'] || 0) + (exerciseCounts['Hip & Pelvis'] || 0)
              : (exerciseCounts[sub.id] || 0);
            const isSubSelected = selectedSub === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSubSelected
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{sub.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSubSelected ? 'bg-slate-950 text-teal-300' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedMacro !== 'Lower Limb' && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>此解剖分區架構已完全就緒。您可以透過右上方「<strong>自訂工作室 (/custom)</strong>」直接新增運動並自動存入本地與匯出！</span>
          </div>
        </div>
      )}
    </div>
  );
};
