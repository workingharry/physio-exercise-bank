import React, { useState } from 'react';
import { Link } from 'wouter';
import { useRoutineStore } from '../../store/useRoutineStore';
import { getExerciseById } from '../../data/exercises';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { 
  Printer, Trash2, ArrowLeft, Download, Plus, Sparkles, FileText, 
  User, Calendar, Stethoscope, ChevronUp, ChevronDown 
} from 'lucide-react';

export const RoutineBuilderView: React.FC = () => {
  const { routine, updateRoutineItem, removeFromRoutine, clearRoutine } = useRoutineStore();
  const [patientName, setPatientName] = useState<string>('');
  const [protocolTitle, setProtocolTitle] = useState<string>('下肢臨床復健居家運動計畫 (HEP)');
  const [therapistGeneralNotes, setTherapistGeneralNotes] = useState<string>('每日按時執行，若疼痛超過 4/10 或出現局部紅腫熱痛，請即刻暫停並與物理治療師聯繫。');

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const data = {
      title: protocolTitle,
      patientName: patientName || '匿名病患 / 學生小抄',
      date: new Date().toLocaleDateString('zh-TW'),
      therapistNotes: therapistGeneralNotes,
      items: routine.map(item => {
        const ex = getExerciseById(item.exerciseId);
        return {
          ...item,
          exerciseName: ex?.name,
          primaryMuscles: ex?.biomechanics.primaryMuscles,
          instructions: ex?.execution.steps.map(s => s.instruction)
        };
      })
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HEP_${protocolTitle}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    // In this basic version, order can be swapped
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Non-print Top Controls */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>臨床居家處方與複習表單組裝器</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            居家運動計畫 (HEP) 工作室
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            已加入 <strong className="text-teal-300 font-bold">{routine.length}</strong> 個動作，支援直接列印為 A4 醫療格式或匯出 JSON
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            <Plus className="w-4 h-4" />
            <span>繼續新增動作</span>
          </Link>

          {routine.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                title="匯出處方 JSON"
              >
                <Download className="w-4 h-4" />
                <span>匯出 JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/20 transition"
                title="列印或另存為 A4 PDF"
              >
                <Printer className="w-4 h-4" />
                <span>列印 / 匯出 PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Routine Metadata Settings (Print-Friendly header) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 print-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 no-print">
              處方計畫標題
            </label>
            <input
              type="text"
              value={protocolTitle}
              onChange={(e) => setProtocolTitle(e.target.value)}
              className="text-xl sm:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-teal-500 outline-none w-full transition print:text-black"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-400" />
              <input
                type="text"
                placeholder="輸入病患姓名或代號"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-teal-500 text-xs print:bg-transparent print:border-none print:text-black"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>{new Date().toLocaleDateString('zh-TW')}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 no-print">
            物理治療師總括臨床衛教與注意事項：
          </label>
          <textarea
            value={therapistGeneralNotes}
            onChange={(e) => setTherapistGeneralNotes(e.target.value)}
            rows={2}
            className="w-full text-xs text-slate-300 bg-slate-950/60 border border-slate-800 rounded-xl p-3 outline-none focus:border-teal-500 transition resize-none print:bg-transparent print:border-none print:text-slate-800"
          />
        </div>
      </div>

      {/* Routine Items List */}
      {routine.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-4">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">處方清單目前為空</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            您可以前往運動資料庫瀏覽，並點擊任何動作卡片上的「加入處方」，將動作加入此計畫。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>前往運動庫挑選動作</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {routine.map((item, index) => {
            const exercise = getExerciseById(item.exerciseId);
            if (!exercise) return null;

            return (
              <div
                key={item.exerciseId}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4 print-card"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-teal-300 border border-slate-700">
                        {exercise.subRegion}
                      </span>
                      <Link href={`/exercise/${exercise.id}`}>
                        <h4 className="font-bold text-base text-white hover:text-teal-300 transition cursor-pointer mt-1">
                          {exercise.name}
                        </h4>
                      </Link>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        目標肌群：{exercise.biomechanics.primaryMuscles.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="no-print flex items-center gap-2">
                    <button
                      onClick={() => removeFromRoutine(item.exerciseId)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-slate-700 transition"
                      title="自此處方移除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dosage Stepper & Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1">組數 (Sets):</span>
                    <input
                      type="text"
                      value={item.customSets || exercise.dosage.sets}
                      onChange={(e) => updateRoutineItem(item.exerciseId, { customSets: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-teal-300 font-bold text-xs outline-none focus:border-teal-500 print:border-none print:p-0"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1">次數 (Reps):</span>
                    <input
                      type="text"
                      value={item.customReps || exercise.dosage.reps}
                      onChange={(e) => updateRoutineItem(item.exerciseId, { customReps: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-teal-300 font-bold text-xs outline-none focus:border-teal-500 print:border-none print:p-0"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1">等長維持 (Hold):</span>
                    <input
                      type="text"
                      value={item.customHold || exercise.dosage.holdDuration || '3 秒'}
                      onChange={(e) => updateRoutineItem(item.exerciseId, { customHold: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-bold text-xs outline-none focus:border-teal-500 print:border-none print:p-0"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1">運動頻率:</span>
                    <span className="text-slate-200 font-medium block py-1">
                      {exercise.dosage.frequency}
                    </span>
                  </div>
                </div>

                {/* Therapist Specific Coaching Notes */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    針對該病患之特定指導口訣與備註：
                  </span>
                  <input
                    type="text"
                    value={item.therapistNotes || ''}
                    onChange={(e) => updateRoutineItem(item.exerciseId, { therapistNotes: e.target.value })}
                    placeholder="例如：右腳跟著地不可離地；核心收緊防代償..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-teal-500 transition print:bg-transparent print:border-none print:p-0"
                  />
                </div>

                {/* Print instructions summary */}
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <strong>分步執行重點：</strong>
                  <p className="line-clamp-2 text-slate-300">
                    {exercise.execution.steps.map(s => s.instruction).join(' ')}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Clear routine button */}
          <div className="no-print pt-4 flex justify-end">
            <button
              onClick={clearRoutine}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-slate-800 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空全部處方清單</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
