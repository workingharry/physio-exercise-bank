import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { 
  X, CheckCircle2, AlertTriangle, VideoOff, Languages, 
  Sparkles, GitFork, Download, ExternalLink, Search, BarChart3, ShieldAlert
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
}

export type QualityFilter = 'all' | 'video' | 'translation' | 'cues' | 'tree';

interface ExerciseIssue {
  exercise: Exercise;
  missingVideo: boolean;
  unreviewedTranslation: boolean;
  missingCues: boolean;
  missingTree: boolean;
  issuesList: string[];
}

export const DataQualityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise
}) => {
  const [activeFilter, setActiveFilter] = useState<QualityFilter>('all');
  const [search, setSearch] = useState('');

  // Diagnostic Audit
  const auditReport = useMemo(() => {
    let videoCount = 0;
    let translationCount = 0;
    let cuesCount = 0;
    let treeCount = 0;

    const items: ExerciseIssue[] = exercises.map(ex => {
      const missingVideo = !ex.media.videoUrl || ex.media.videoUrl.trim() === '';
      const unreviewedTranslation = !ex.chineseName || ex.chineseName.trim() === ex.name.trim();
      const missingCues = !ex.execution?.coachingCues || ex.execution.coachingCues.length === 0;
      const missingTree = (!ex.progressions || ex.progressions.length === 0) && (!ex.regressions || ex.regressions.length === 0);

      if (!missingVideo) videoCount++;
      if (!unreviewedTranslation) translationCount++;
      if (!missingCues) cuesCount++;
      if (!missingTree) treeCount++;

      const issuesList: string[] = [];
      if (missingVideo) issuesList.push('缺少示範影片');
      if (unreviewedTranslation) issuesList.push('中英文名稱重複待審核');
      if (missingCues) issuesList.push('缺少臨床指導口訣');
      if (missingTree) issuesList.push('缺少進退階動作');

      return {
        exercise: ex,
        missingVideo,
        unreviewedTranslation,
        missingCues,
        missingTree,
        issuesList
      };
    });

    const issuesOnly = items.filter(item => item.issuesList.length > 0);

    return {
      total: exercises.length,
      videoCoverage: Math.round((videoCount / exercises.length) * 100),
      translationCoverage: Math.round((translationCount / exercises.length) * 100),
      cuesCoverage: Math.round((cuesCount / exercises.length) * 100),
      treeCoverage: Math.round((treeCount / exercises.length) * 100),
      items,
      issuesOnly
    };
  }, [exercises]);

  // Filtered List
  const filteredIssues = useMemo(() => {
    return auditReport.items.filter(item => {
      // Must have issue unless clean
      if (activeFilter === 'video' && !item.missingVideo) return false;
      if (activeFilter === 'translation' && !item.unreviewedTranslation) return false;
      if (activeFilter === 'cues' && !item.missingCues) return false;
      if (activeFilter === 'tree' && !item.missingTree) return false;
      if (activeFilter === 'all' && item.issuesList.length === 0) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchName = item.exercise.name.toLowerCase().includes(q);
        const matchZh = item.exercise.chineseName.toLowerCase().includes(q);
        const matchSub = item.exercise.subRegion.toLowerCase().includes(q);
        if (!matchName && !matchZh && !matchSub) return false;
      }

      return true;
    });
  }, [auditReport, activeFilter, search]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', '英文名稱', '中文譯名', '解剖子區域', '待處理問題清單'];
    const rows = auditReport.issuesOnly.map(item => [
      `"${item.exercise.id}"`,
      `"${item.exercise.name.replace(/"/g, '""')}"`,
      `"${item.exercise.chineseName.replace(/"/g, '""')}"`,
      `"${item.exercise.subRegion}"`,
      `"${item.issuesList.join('; ')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PhysioBank_資料品質審計報告_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>臨床資料庫品質審計工具 (Data Quality Audit)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-semibold">
                  全庫 {auditReport.total} 筆
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                自動排查缺少影片、未審核翻譯或待補齊口訣的動作，方便持續維護高品質復健庫
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              title="匯出待補齊清單為 CSV 試算表"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出待補清單 (CSV)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
              title="關閉審計工具"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Health Metrics Dashboard */}
        <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span>示範影片覆蓋率</span>
              <VideoOff className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-amber-800 dark:text-amber-400">{auditReport.videoCoverage}%</span>
              <span className="text-[10px] text-slate-400">({auditReport.total - auditReport.items.filter(i => i.missingVideo).length}/{auditReport.total})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span>繁中在地化完整度</span>
              <Languages className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{auditReport.translationCoverage}%</span>
              <span className="text-[10px] text-slate-400">({auditReport.total - auditReport.items.filter(i => i.unreviewedTranslation).length}/{auditReport.total})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span>治療師口訣覆蓋率</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{auditReport.cuesCoverage}%</span>
              <span className="text-[10px] text-slate-400">({auditReport.total - auditReport.items.filter(i => i.missingCues).length}/{auditReport.total})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span>進退階決策樹覆蓋</span>
              <GitFork className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{auditReport.treeCoverage}%</span>
              <span className="text-[10px] text-slate-400">({auditReport.total - auditReport.items.filter(i => i.missingTree).length}/{auditReport.total})</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              全部待改進 ({auditReport.issuesOnly.length})
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeFilter === 'video'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              缺少示範影片 ({auditReport.items.filter(i => i.missingVideo).length})
            </button>
            <button
              onClick={() => setActiveFilter('translation')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeFilter === 'translation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              待審核翻譯 ({auditReport.items.filter(i => i.unreviewedTranslation).length})
            </button>
            <button
              onClick={() => setActiveFilter('cues')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeFilter === 'cues'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              缺少口訣 ({auditReport.items.filter(i => i.missingCues).length})
            </button>
            <button
              onClick={() => setActiveFilter('tree')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                activeFilter === 'tree'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              缺少進退階 ({auditReport.items.filter(i => i.missingTree).length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋動作名稱或部位..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Issue Items Table / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredIssues.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                太棒了！此條件下沒有發現任何資料缺失
              </h3>
              <p className="text-xs text-slate-400 mt-1">目前所選類別之資料已 100% 齊全並通過審核</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredIssues.map((item) => (
                <div
                  key={item.exercise.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/60 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-amber-300">
                        {item.exercise.subRegion}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        #{item.exercise.id}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {item.exercise.name}
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium truncate mt-0.5">
                      {item.exercise.chineseName}
                    </p>

                    {/* Tags for specific issues */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.missingVideo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                          <VideoOff className="w-2.5 h-2.5" />
                          <span>缺示範影片</span>
                        </span>
                      )}
                      {item.unreviewedTranslation && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                          <Languages className="w-2.5 h-2.5" />
                          <span>中英重複待審</span>
                        </span>
                      )}
                      {item.missingCues && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>缺口訣</span>
                        </span>
                      )}
                      {item.missingTree && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                          <GitFork className="w-2.5 h-2.5" />
                          <span>缺進退階</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectExercise && (
                      <button
                        onClick={() => {
                          onSelectExercise(item.exercise);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-400 transition"
                      >
                        快速預覽
                      </button>
                    )}

                    <Link
                      href={`/exercise/${item.exercise.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      <span>前往詳情維護</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex items-center justify-between text-xs text-slate-500">
          <span>共找到 {filteredIssues.length} 筆符合條件的待審查動作。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
