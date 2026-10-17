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
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Stethoscope className="w-4 h-4" />
          <span>實證物理治療分期復健指引</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          臨床復健協定學習庫 (Clinical Protocols)
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                  ? 'bg-teal-50/80 dark:bg-gradient-to-br dark:from-teal-950/80 dark:to-slate-900 border-teal-500 shadow-teal-500/10'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                  {p.subRegion}
                </span>
                <h3 className={`mt-2 font-bold text-sm ${isSelected ? 'text-teal-700 dark:text-teal-200' : 'text-slate-900 dark:text-slate-200'}`}>
                  {p.chineseName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {p.name}
                </p>
              </div>
              <span className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 italic block">
                {p.guidelineReference?.split(';')[0] || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Protocol Detailed Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">目前選擇協定</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{protocol.chineseName}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{protocol.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">適用病症 / 適應症：</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">{protocol.indication}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">實證指引文獻依據：</span>
            <span className="text-teal-700 dark:text-teal-300 font-medium">{protocol.guidelineReference}</span>
          </div>
        </div>
      </div>

      {/* Multi-Phase Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>分期復健進展時程與合格標準 (Milestones & Criteria)</span>
        </h3>

        <div className="space-y-6">
          {protocol.phases.map((phase) => {
            const phaseExercises = phase.exercises.map(id => getExerciseById(id)).filter(Boolean);

            return (
              <div
                key={phase.phaseNumber}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg space-y-5"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                        {phase.phaseNumber}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {phase.phaseName}
                      </h4>
                    </div>
                    <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold mt-1 inline-block">
                      預估臨床時間範圍: {phase.timeframe}
                    </span>
                  </div>

                  {/* One-Click Import Button */}
                  <button
                    onClick={() => handleImportPhase(phase.exercises)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>一鍵匯入本階段動作至處方 (HEP)</span>
                  </button>
                </div>

                {/* Goals & Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <h5 className="font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-teal-500" />
                      <span>本階段核心臨床目標 (Clinical Goals):</span>
                    </h5>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {phase.clinicalGoals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-2">
                    <h5 className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>進階至下一階段之合格標準 (Criteria to Progress):</span>
                    </h5>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
                      {phase.criteriaToProgress.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Phase Exercises */}
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
                    本階段推薦處方運動：
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {phaseExercises.map((ex) => {
                      if (!ex) return null;
                      const isAdded = routine.some(item => item.exerciseId === ex.id);

                      return (
                        <div
                          key={ex.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between gap-3 transition shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <Link href={`/exercise/${ex.id}`}>
                              <h6 className="font-bold text-xs text-slate-900 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-300 transition truncate cursor-pointer">
                                {ex.name}
                              </h6>
                            </Link>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                              {ex.chineseName} · {ex.biomechanics.primaryMuscles.join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                              href={`/exercise/${ex.id}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition"
                              title="查看詳情"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => addToRoutine(ex.id)}
                              className={`p-1.5 rounded-lg text-xs transition ${
                                isAdded
                                  ? 'bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-500/30'
                                  : 'bg-teal-600 hover:bg-teal-500 text-white'
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
