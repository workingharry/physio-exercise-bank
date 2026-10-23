import React, { useState } from 'react';
import { Link } from 'wouter';
import { useRoutineStore } from '../../store/useRoutineStore';
import { getExerciseById } from '../../data/exercises';
import { 
  Printer, Trash2, ArrowLeft, Download, Plus, Sparkles, FileText, 
  User, Calendar, Stethoscope, ChevronUp, ChevronDown, GripVertical,
  Minus, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';

export const RoutineBuilderView: React.FC = () => {
  const { routine, updateRoutineItem, removeFromRoutine, clearRoutine, reorderRoutine, moveRoutineItem } = useRoutineStore();
  const [patientName, setPatientName] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [protocolTitle, setProtocolTitle] = useState<string>('下肢關節復健居家運動處方 (HEP)');
  const [therapistGeneralNotes, setTherapistGeneralNotes] = useState<string>(
    '請遵照物理治療師指示每日定時執行。若運動期間或運動後疼痛指數超過 4/10，或出現局部關節急性紅腫熱痛，請即刻暫停並與治療師聯繫。'
  );

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const data = {
      title: protocolTitle,
      patientName: patientName || '匿名病患',
      patientId: patientId || 'N/A',
      date: new Date().toLocaleDateString('zh-TW'),
      therapistNotes: therapistGeneralNotes,
      items: routine.map(item => {
        const ex = getExerciseById(item.exerciseId);
        return {
          ...item,
          exerciseName: ex?.name,
          chineseName: ex?.chineseName,
          subRegion: ex?.subRegion,
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

  // Helper function to step numeric sets
  const stepSets = (exerciseId: string, currentVal: string | undefined, delta: number) => {
    const num = parseInt(currentVal || '3', 10) || 3;
    const next = Math.max(1, num + delta);
    updateRoutineItem(exerciseId, { customSets: `${next} 組` });
  };

  // Helper function to step numeric reps
  const stepReps = (exerciseId: string, currentVal: string | undefined, delta: number) => {
    const num = parseInt(currentVal || '10', 10) || 10;
    const next = Math.max(1, num + delta);
    updateRoutineItem(exerciseId, { customReps: `${next} 次` });
  };

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderRoutine(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const holdOptions = ['依節奏', '3 秒', '5 秒', '10 秒', '30 秒', '45 秒'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Non-print Top Controls */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>臨床居家處方與複習表單組裝器</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            居家運動計畫 (HEP) 工作室
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            已加入 <strong className="text-amber-800 dark:text-amber-300 font-bold">{routine.length}</strong> 個動作，支援拖曳排序、劑量步進微調與 A4 雙欄醫療單據列印
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition"
          >
            <Plus className="w-4 h-4 text-amber-700" />
            <span>繼續新增動作</span>
          </Link>

          {routine.length > 0 && (
            <>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition"
                title="匯出處方 JSON"
              >
                <Download className="w-4 h-4" />
                <span>匯出 JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-lg shadow-amber-800/20 transition"
                title="列印或另存為 A4 PDF"
              >
                <Printer className="w-4 h-4" />
                <span>列印 / 另存 A4 PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Routine Metadata Settings (Print-Friendly header) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 shadow-sm dark:shadow-xl space-y-4 print-card">
        {/* Print Only Hospital/Clinic Logo & Title */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="font-extrabold text-base tracking-tight text-stone-900">
              PhysioBank 物理治療復健運動處方 (Home Exercise Program)
            </div>
          </div>
          <div className="text-[10px] text-stone-600">
            臨床實證運動處方體系 · 依循 JOSPT / Aspetar 臨床指引
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 no-print">
              處方計畫標題
            </label>
            <input
              type="text"
              value={protocolTitle}
              onChange={(e) => setProtocolTitle(e.target.value)}
              className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-white bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-amber-700 outline-none w-full transition print:text-black print:text-base print:font-bold"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <input
                type="text"
                placeholder="病患姓名"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1 text-stone-800 dark:text-stone-200 outline-none focus:border-amber-700 text-xs w-24 print:bg-transparent print:border-none print:text-black print:w-auto"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-stone-500">病歷/編號:</span>
              <input
                type="text"
                placeholder="可選填"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 rounded-lg px-2 py-1 text-stone-800 dark:text-stone-200 outline-none focus:border-amber-700 text-xs w-20 print:bg-transparent print:border-none print:text-black print:w-auto"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>開單日：{new Date().toLocaleDateString('zh-TW')}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 no-print">
            物理治療師總括衛教與安全警示 (Therapist Precautions)：
          </label>
          <textarea
            value={therapistGeneralNotes}
            onChange={(e) => setTherapistGeneralNotes(e.target.value)}
            rows={2}
            className="w-full text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 outline-none focus:border-amber-700 transition resize-none print:bg-transparent print:border-none print:p-0 print:text-stone-900"
          />
        </div>
      </div>

      {/* Routine Items List */}
      {routine.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-stone-900/50 border border-dashed border-stone-200 dark:border-stone-800 text-center space-y-4">
          <Stethoscope className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">處方清單目前為空</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            您可以前往運動資料庫瀏覽，並點擊任何動作卡片上的「加入處方」，將動作加入此計畫。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>前往運動庫挑選動作</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Instructions for user about Drag & Drop */}
          <div className="no-print flex items-center justify-between text-xs text-stone-400 px-1">
            <span className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-amber-700" />
              <span>小提示：可直接拖曳左側把手或點擊上下箭頭調整動作順序</span>
            </span>
            <span>共 {routine.length} 個處方動作</span>
          </div>

          {/* Cards Container: In print mode, switches to 2-column compact grid */}
          <div className="space-y-3.5 print:space-y-0 print-grid">
            {routine.map((item, index) => {
              const exercise = getExerciseById(item.exerciseId);
              if (!exercise) return null;

              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={item.exerciseId}
                  draggable={true}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  onDrop={(e) => onDrop(e, index)}
                  className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900/90 border transition shadow-sm dark:shadow-md print-card ${
                    isOver 
                      ? 'border-amber-700 ring-2 ring-amber-700/30' 
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  } ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {/* Drag Grip handle & Order buttons (Screen Only) */}
                      <div className="no-print flex flex-col items-center gap-0.5 mt-0.5 text-stone-400">
                        <button
                          onClick={() => moveRoutineItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-stone-400 transition"
                          title="往上移"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1 text-stone-400 hover:text-stone-200" 
                          title="按住拖曳排序"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          onClick={() => moveRoutineItem(index, 'down')}
                          disabled={index === routine.length - 1}
                          className="p-1 hover:text-amber-400 disabled:opacity-20 disabled:hover:text-stone-400 transition"
                          title="往下移"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Number Badge */}
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-700/30 mt-0.5 print:bg-stone-200 print:text-black">
                        {index + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-amber-300 border border-stone-200 dark:border-stone-700 print:border-none print:p-0 print:text-stone-700">
                            {exercise.subRegion}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 no-print">
                            {exercise.biomechanics.kineticChain}
                          </span>
                        </div>
                        <Link href={`/exercise/${exercise.id}`}>
                          <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer mt-0.5 print:text-black">
                            {exercise.name}
                            <span className="ml-1.5 text-xs text-stone-500 dark:text-stone-400 font-normal">
                              ({exercise.chineseName})
                            </span>
                          </h4>
                        </Link>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                          目標肌群：{exercise.biomechanics.primaryMuscles.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Delete Action (Screen Only) */}
                    <div className="no-print flex items-center gap-1">
                      <button
                        onClick={() => removeFromRoutine(item.exerciseId)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/60 text-stone-400 hover:text-red-500 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition"
                        title="自處方移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dosage Steppers & Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2">
                    {/* Sets with +/- Stepper */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-1">組數 (Sets):</span>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => stepSets(item.exerciseId, item.customSets || exercise.dosage.sets, -1)}
                          className="no-print w-6 h-6 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition"
                          title="減少 1 組"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={item.customSets || exercise.dosage.sets}
                          onChange={(e) => updateRoutineItem(item.exerciseId, { customSets: e.target.value })}
                          className="w-full text-center bg-transparent text-amber-800 dark:text-amber-300 font-bold text-xs outline-none focus:ring-1 focus:ring-amber-700 rounded py-0.5 print:text-black"
                        />
                        <button
                          onClick={() => stepSets(item.exerciseId, item.customSets || exercise.dosage.sets, 1)}
                          className="no-print w-6 h-6 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition"
                          title="增加 1 組"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Reps with +/- Stepper */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-1">次數 (Reps):</span>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => stepReps(item.exerciseId, item.customReps || exercise.dosage.reps, -2)}
                          className="no-print w-6 h-6 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition"
                          title="減少 2 次"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={item.customReps || exercise.dosage.reps}
                          onChange={(e) => updateRoutineItem(item.exerciseId, { customReps: e.target.value })}
                          className="w-full text-center bg-transparent text-amber-800 dark:text-amber-300 font-bold text-xs outline-none focus:ring-1 focus:ring-amber-700 rounded py-0.5 print:text-black"
                        />
                        <button
                          onClick={() => stepReps(item.exerciseId, item.customReps || exercise.dosage.reps, 2)}
                          className="no-print w-6 h-6 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition"
                          title="增加 2 次"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Hold Duration */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-1">等長維持 (Hold):</span>
                      <input
                        type="text"
                        value={item.customHold || exercise.dosage.holdDuration || '依節奏'}
                        onChange={(e) => updateRoutineItem(item.exerciseId, { customHold: e.target.value })}
                        className="w-full text-center bg-transparent text-stone-700 dark:text-stone-300 font-bold text-xs outline-none focus:ring-1 focus:ring-amber-700 rounded py-0.5 print:text-black"
                      />
                    </div>

                    {/* Frequency */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-1">頻率 (Frequency):</span>
                      <span className="text-center text-stone-700 dark:text-stone-200 font-medium py-0.5 block print:text-black">
                        {exercise.dosage.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Hold presets capsule bar (Screen only) */}
                  <div className="no-print flex items-center gap-1.5 pt-1 text-[11px] text-stone-400 overflow-x-auto">
                    <span className="shrink-0 text-stone-500">維持快選:</span>
                    {holdOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => updateRoutineItem(item.exerciseId, { customHold: opt })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                          (item.customHold || exercise.dosage.holdDuration) === opt
                            ? 'bg-amber-800 text-white font-bold'
                            : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Therapist Specific Notes */}
                  <div className="pt-2">
                    <label className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold block mb-0.5">
                      個人化執行要點與防代償提醒 (Therapist Specific Cue):
                    </label>
                    <input
                      type="text"
                      value={item.therapistNotes || ''}
                      onChange={(e) => updateRoutineItem(item.exerciseId, { therapistNotes: e.target.value })}
                      placeholder="例：右腳尖向前不可外八、核心收緊骨盆防後傾..."
                      className="w-full bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-amber-700 transition print:bg-transparent print:border-none print:p-0 print:text-stone-900"
                    />
                  </div>

                  {/* Step Summary (Compact for A4 print) */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                    <strong className="text-stone-700 dark:text-stone-300">執行重點：</strong>
                    {exercise.execution.steps.map(s => s.instruction).join(' ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Patient Compliance Checkbox Sheet (Print Only) */}
          <div className="hidden print:block pt-4 page-break-inside: avoid">
            <h5 className="font-bold text-xs text-stone-900 mb-1 flex items-center gap-1">
              <span>每週執行簽到表記錄 (Patient Weekly Adherence Checklist)</span>
            </h5>
            <p className="text-[9px] text-stone-500 mb-2">每次完成運動後，請於對應日期方格內打勾簽到：</p>
            <table className="print-table w-full">
              <thead>
                <tr>
                  <th className="text-left w-2/5">處方動作名稱</th>
                  <th>目標組數/次數</th>
                  <th>週一</th>
                  <th>週二</th>
                  <th>週三</th>
                  <th>週四</th>
                  <th>週五</th>
                  <th>週六</th>
                  <th>週日</th>
                  <th>治療師覆核</th>
                </tr>
              </thead>
              <tbody>
                {routine.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  return (
                    <tr key={item.exerciseId}>
                      <td className="text-left font-semibold">
                        {idx + 1}. {ex?.name} ({ex?.chineseName})
                      </td>
                      <td>
                        {item.customSets || ex?.dosage.sets} × {item.customReps || ex?.dosage.reps}
                      </td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td>[ ]</td>
                      <td></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Clear routine button (Screen Only) */}
          <div className="no-print pt-4 flex justify-end">
            <button
              onClick={clearRoutine}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-red-50 dark:hover:bg-red-950/50 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 border border-stone-200 dark:border-stone-800 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>清空所有已選處方</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
