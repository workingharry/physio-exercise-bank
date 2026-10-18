import React, { useState } from 'react';
import { Link } from 'wouter';
import { lowerLimbProtocols } from '../../data/protocols';
import { getExerciseById } from '../../data/exercises';
import { useRoutineStore } from '../../store/useRoutineStore';
import { Stethoscope, CheckCircle2, ChevronRight, Plus, ExternalLink, Calendar, Target, Award } from 'lucide-react';

export const ProtocolView: React.FC = () => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(lowerLimbProtocols[0].id);
  const { addToRoutine, routine } = useRoutineStore();

  const protocol = lowerLimbProtocols.find(p => p.id === selectedProtocolId) || lowerLimbProtocols[0];

  const handleImportPhase = (exerciseIds: string[]) => {
    exerciseIds.forEach(id => addToRoutine(id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Stethoscope className="w-4 h-4" />
          <span>實證物理治療分期復健指引</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          臨床復健協定學習庫 (Clinical Protocols)
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          依據國際物理治療臨床指引 (JOSPT CPG, Melbourne ACL, Aspetar) 規劃的準則導向分期復健路徑
        </p>
      </div>

      {/* Protocol Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {lowerLimbProtocols.map((p) => {
          const isSelected = p.id === protocol.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProtocolId(p.id)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-800/40 dark:border-amber-700/60 shadow-amber-900/5'
                  : 'bg-white dark:bg-[#201D1A] border-stone-200 dark:border-stone-800 hover:border-amber-700/40 hover:bg-stone-50 dark:hover:bg-stone-900/60'
              }`}
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {p.subRegion}
                </span>
                <h3 className={`mt-2 font-serif font-bold text-sm ${isSelected ? 'text-amber-900 dark:text-amber-200' : 'text-stone-900 dark:text-stone-200'}`}>
                  {p.chineseName}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {p.name}
                </p>
              </div>
              <span className="mt-3 text-[11px] text-stone-400 dark:text-stone-500 italic block">
                {p.guidelineReference?.split(';')[0] || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Protocol Detailed Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">目前選擇協定</span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">{protocol.chineseName}</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{protocol.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block mb-1 font-semibold">適用病症 / 適應症：</span>
            <span className="text-stone-800 dark:text-stone-200 font-medium">{protocol.indication}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800">
            <span className="text-stone-500 dark:text-stone-400 block mb-1 font-semibold">實證指引文獻依據：</span>
            <span className="text-amber-800 dark:text-amber-300 font-medium">{protocol.guidelineReference}</span>
          </div>
        </div>
      </div>

      {/* Multi-Phase Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          <span>分期復健進展時程與合格標準 (Milestones & Criteria)</span>
        </h3>

        <div className="space-y-6">
          {protocol.phases.map((phase) => {
            const phaseExercises = phase.exercises.map(id => getExerciseById(id)).filter(Boolean);

            return (
              <div
                key={phase.phaseNumber}
                className="p-6 rounded-2xl bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 shadow-sm space-y-5"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-800 text-amber-50 font-extrabold text-xs flex items-center justify-center">
                        {phase.phaseNumber}
                      </span>
                      <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                        {phase.phaseName}
                      </h4>
                    </div>
                    <span className="text-xs text-amber-800 dark:text-amber-400 font-semibold mt-1 inline-block">
                      預估臨床時間範圍: {phase.timeframe}
                    </span>
                  </div>

                  {/* One-Click Import Button */}
                  <button
                    onClick={() => handleImportPhase(phase.exercises)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-semibold shadow-sm transition self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>一鍵匯入本階段動作至處方 (HEP)</span>
                  </button>
                </div>

                {/* Goals & Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800 space-y-2">
                    <h5 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>本階段核心臨床目標 (Clinical Goals):</span>
                    </h5>
                    <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                      {phase.clinicalGoals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800 space-y-2">
                    <h5 className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>進階至下一階段之合格標準 (Criteria to Progress):</span>
                    </h5>
                    <ul className="space-y-1 text-stone-700 dark:text-stone-300 list-disc list-inside">
                      {phase.criteriaToProgress.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Phase Exercises */}
                <div>
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-3">
                    本階段推薦處方運動：
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {phaseExercises.map((ex) => {
                      if (!ex) return null;
                      const isAdded = routine.some(item => item.exerciseId === ex.id);

                      return (
                        <div
                          key={ex.id}
                          className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#25211E] border border-stone-200 dark:border-stone-800 hover:border-amber-700/40 flex items-center justify-between gap-3 transition shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <Link href={`/exercise/${ex.id}`}>
                              <h6 className="font-bold text-xs text-stone-900 dark:text-stone-200 hover:text-amber-800 dark:hover:text-amber-300 transition truncate cursor-pointer">
                                {ex.name}
                              </h6>
                            </Link>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate block mt-0.5">
                              {ex.chineseName} · {ex.biomechanics.primaryMuscles.join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                              href={`/exercise/${ex.id}`}
                              className="p-1.5 rounded-lg bg-white hover:bg-stone-100 dark:bg-[#2A2622] dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs transition border border-stone-200 dark:border-stone-800"
                              title="查看詳情"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => addToRoutine(ex.id)}
                              className={`p-1.5 rounded-lg text-xs transition ${
                                isAdded
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                                  : 'bg-amber-800 hover:bg-amber-900 text-amber-50'
                              }`}
                              title={isAdded ? '已加入處方' : '加入處方'}
                            >
                              {isAdded ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
