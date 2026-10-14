import React, { useState } from 'react';
import { useRoutineStore } from '../../store/useRoutineStore';
import { Exercise, MacroRegion, SubRegion } from '../../types/exercise';
import { PlusCircle, Download, Upload, Trash2, CheckCircle2, Sparkles, FolderPlus, Info } from 'lucide-react';

export const CustomStudioView: React.FC = () => {
  const { customExercises, addCustomExercise, deleteCustomExercise } = useRoutineStore();

  const [name, setName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [macroRegion, setMacroRegion] = useState<MacroRegion>('Lower Limb');
  const [subRegion, setSubRegion] = useState<SubRegion>('Ankle & Foot');
  const [movementType, setMovementType] = useState<string>('Isometric');
  const [primaryMuscles, setPrimaryMuscles] = useState('');
  const [instructions, setInstructions] = useState('');
  const [coachingCues, setCoachingCues] = useState('');
  const [commonErrors, setCommonErrors] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sets, setSets] = useState('3 組');
  const [reps, setReps] = useState('12 次');
  const [holdDuration, setHoldDuration] = useState('3 秒');
  const [precautions, setPrecautions] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      chineseName: chineseName.trim() || name.trim(),
      macroRegion,
      subRegion,
      movementType: [movementType as any],
      rehabPhase: ['Phase 2: 次急性控制負荷'],
      targetPathologies: ['臨床自訂適應症'],
      equipment: ['徒手 (Bodyweight)'],
      difficulty: 'Intermediate (中階)',
      description: instructions ? instructions.slice(0, 150) : '臨床自訂復健動作與功能性強化機制。',
      media: {
        thumbnailUrl: `/media/custom/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        videoUrl: videoUrl.trim() || undefined,
        videoType: 'youtube'
      },
      biomechanics: {
        primaryMuscles: primaryMuscles.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        secondaryMuscles: [],
        stabilizerMuscles: ['核心深層穩定肌'],
        planesOfMotion: ['矢狀面 (Sagittal)'],
        jointActions: ['關節主動穩定與功能性強化'],
        kineticChain: '閉鎖鏈 (CKC)'
      },
      execution: {
        startingPosition: '採標準臨床起始擺位。',
        steps: instructions.split('\n').filter(Boolean).map((line, idx) => ({
          stepNumber: idx + 1,
          instruction: line.trim()
        })),
        coachingCues: coachingCues ? coachingCues.split('\n').filter(Boolean) : ['動作流暢穩定'],
        commonErrors: commonErrors ? commonErrors.split('\n').filter(Boolean) : ['代償動作']
      },
      regressions: [{ name: '減輕負重', rationale: '退回雙腳支撐' }],
      progressions: [{ name: '增加阻力', rationale: '增加重量或彈力帶強度' }],
      dosage: {
        sets,
        reps,
        holdDuration,
        frequency: '每週 3 次',
        rest: '60 秒',
        tempo: '2-0-2-0'
      },
      contraindications: ['患處急性發炎紅腫熱痛'],
      precautions: precautions ? [precautions] : ['無痛範圍內操作']
    };

    addCustomExercise(newExercise);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);

    // Reset form
    setName('');
    setChineseName('');
    setPrimaryMuscles('');
    setInstructions('');
    setCoachingCues('');
    setCommonErrors('');
    setVideoUrl('');
    setPrecautions('');
  };

  const handleExportAllCustom = () => {
    const blob = new Blob([JSON.stringify(customExercises, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CustomExercises_PhysioBank_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
          <FolderPlus className="w-4 h-4" />
          <span>全身部位自訂運動與 GitHub 數據管理</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          自訂運動與媒體工作室 (Custom Studio)
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          支援為全身任一部位（下肢、上肢、脊椎、核心）新增臨床運動，並可一鍵匯出 JSON 供 GitHub 儲存庫同步
        </p>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-teal-400" />
            <span>新增臨床復健運動</span>
          </h2>
          {submitted && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-950 px-3 py-1 rounded-lg border border-teal-700/60 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>成功儲存至本機資料庫！</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">運動名稱 (英文 / 學名) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: Copenhagen Adduction Plank"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">運動中文名稱</label>
              <input
                type="text"
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                placeholder="例如: 哥本哈根內收肌側棒式"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">第一層：宏觀區域 (MacroRegion)</label>
              <select
                value={macroRegion}
                onChange={(e) => setMacroRegion(e.target.value as MacroRegion)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="Lower Limb">下肢 (Lower Limb)</option>
                <option value="Upper Limb">上肢 (Upper Limb)</option>
                <option value="Spine & Core">脊椎與核心 (Spine & Core)</option>
                <option value="Full Body & Functional">全身功能性 (Functional)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">第二層：關節子區域 (SubRegion)</label>
              <select
                value={subRegion}
                onChange={(e) => setSubRegion(e.target.value as SubRegion)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="Ankle & Foot">Ankle & Foot (腳踝與足部)</option>
                <option value="Knee">Knee (膝與髕骨)</option>
                <option value="Hip & Pelvis">Hip & Pelvis (髖與骨盆)</option>
                <option value="Lower Limb Kinetic Chain">下肢整合動力鏈</option>
                <option value="Shoulder & Scapula">Shoulder & Scapula (肩與肩胛)</option>
                <option value="Lumbar & SIJ">Lumbar & SIJ (腰椎薦髂)</option>
                <option value="Cervical Spine">Cervical Spine (頸椎)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">動作收縮型態</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none focus:border-teal-500"
              >
                <option value="Isometric">Isometric (等長)</option>
                <option value="Concentric">Concentric (向心)</option>
                <option value="Eccentric">Eccentric (離心)</option>
                <option value="Plyometric">Plyometric (增強式/快速反應)</option>
                <option value="Mobility">Mobility (活動度)</option>
                <option value="Proprioception">Proprioception (本體感覺平衡)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">目標主動肌群 (以逗號分隔)</label>
            <input
              type="text"
              value={primaryMuscles}
              onChange={(e) => setPrimaryMuscles(e.target.value)}
              placeholder="例如: 臀中肌, 內收大肌, 股四頭肌"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">分步執行步驟 (每行一步驟)</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. 側躺於瑜珈墊上，上方腳踝置於長凳&#10;2. 啟動內收肌群將骨盆抬離地面&#10;3. 維持頂峰等長收縮 30 秒"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">臨床指導口訣 (Coaching Cues)</label>
              <input
                type="text"
                value={coachingCues}
                onChange={(e) => setCoachingCues(e.target.value)}
                placeholder="例如: 肚臍微縮，肋骨不外翻"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">常見代償錯誤 (Common Errors)</label>
              <input
                type="text"
                value={commonErrors}
                onChange={(e) => setCommonErrors(e.target.value)}
                placeholder="例如: 骨盆過度前傾或側向塌陷"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">示範影片路徑或 YouTube 網址</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="例如: https://www.youtube.com/watch?v=... 或 /media/custom/my-video.mp4"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg shadow-teal-600/30 transition text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>儲存自訂運動</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Custom Exercises List & GitHub Export */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              已建立之自訂運動庫 ({customExercises.length})
            </h3>
            <p className="text-xs text-slate-400">儲存於瀏覽器 LocalStorage，支援匯出 JSON 以提交至 GitHub 專案</p>
          </div>

          {customExercises.length > 0 && (
            <button
              onClick={handleExportAllCustom}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>匯出所有自訂動作 JSON</span>
            </button>
          )}
        </div>

        {customExercises.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">目前尚無自訂運動，請填寫上方表單新增。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-teal-300 border border-slate-700">
                    {ex.subRegion}
                  </span>
                  <h4 className="font-bold text-sm text-slate-200 mt-1">{ex.name}</h4>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {ex.biomechanics.primaryMuscles.join(', ')}
                  </span>
                </div>

                <button
                  onClick={() => deleteCustomExercise(ex.id)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-800 transition"
                  title="刪除自訂運動"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
