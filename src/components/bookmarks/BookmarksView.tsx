import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useRoutineStore } from '../../store/useRoutineStore';
import { allExercises } from '../../data/exercises';
import { Exercise } from '../../types/exercise';
import { 
  Bookmark, Clock, Search, Trash2, ArrowRight, BookOpen, 
  ExternalLink, FileEdit, Check, Sparkles, Layers, Dumbbell, 
  Tag, ShieldCheck
} from 'lucide-react';

const STUDY_NOTES_KEY = 'physiobank_study_notes_v1';

export const BookmarksView: React.FC = () => {
  const { bookmarks, toggleBookmark, recentlyViewed, clearRecentlyViewed } = useRoutineStore();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for personal study notes per exercise
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STUDY_NOTES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  const saveNote = (id: string) => {
    const updated = { ...notes, [id]: tempNoteText };
    setNotes(updated);
    try {
      localStorage.setItem(STUDY_NOTES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingNoteId(null);
  };

  const deleteNote = (id: string) => {
    const updated = { ...notes };
    delete updated[id];
    setNotes(updated);
    try {
      localStorage.setItem(STUDY_NOTES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve exercises
  const bookmarkedExercises = useMemo(() => {
    return bookmarks
      .map(id => allExercises.find(e => e.id === id))
      .filter((e): e is Exercise => Boolean(e));
  }, [bookmarks]);

  const recentExercises = useMemo(() => {
    return recentlyViewed
      .map(id => allExercises.find(e => e.id === id))
      .filter((e): e is Exercise => Boolean(e));
  }, [recentlyViewed]);

  const currentList = activeTab === 'bookmarks' ? bookmarkedExercises : recentExercises;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();
    return currentList.filter(e => 
      e.chineseName.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.subRegion.toLowerCase().includes(q) ||
      e.biomechanics.primaryMuscles.some((m: string) => m.toLowerCase().includes(q)) ||
      (notes[e.id] && notes[e.id].toLowerCase().includes(q))
    );
  }, [currentList, searchQuery, notes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/80">
              <Bookmark className="w-5 h-5 fill-current" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              研讀筆記與學習收藏
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            個人專屬離線研讀庫：快速複習精選動作條目、臨床筆記與近期閱讀足跡（完全儲存於本機瀏覽器，無需外部登入）
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'bookmarks'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>收藏清單 ({bookmarkedExercises.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>最近研讀 ({recentExercises.length})</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋已收藏動作名稱、肌群或筆記關鍵字..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {activeTab === 'history' && recentExercises.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900 transition self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空瀏覽紀錄</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {filteredList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 px-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            {activeTab === 'bookmarks' ? <Bookmark className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {activeTab === 'bookmarks' ? '目前尚無收藏的動作條目' : '目前尚無最近瀏覽紀錄'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'bookmarks' 
              ? '在瀏覽運動百科百科條目時，點擊「⭐ 收藏至研讀筆記」，即可隨時在此集中研讀與新增私人學習筆記。'
              : '瀏覽各動作的詳細百科條目時，系統會自動在離線本機記錄最近研讀過的動作。'}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>前往運動百科目錄</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((exercise) => {
            const noteText = notes[exercise.id] || '';
            const isEditing = editingNoteId === exercise.id;
            const isBookmarked = bookmarks.includes(exercise.id);

            return (
              <div
                key={exercise.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition duration-200 overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {exercise.subRegion}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {exercise.biomechanics.kineticChain}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {exercise.difficulty}
                        </span>
                      </div>
                      <Link
                        href={`/exercise/${exercise.id}`}
                        className="block font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition"
                      >
                        {exercise.chineseName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                        {exercise.name}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBookmark(exercise.id)}
                      className={`p-2 rounded-xl border transition shrink-0 ${
                        isBookmarked
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                      }`}
                      title={isBookmarked ? '取消收藏' : '加入收藏'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Muscle tags */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-400 font-medium">主動肌:</span>
                    {exercise.biomechanics.primaryMuscles.slice(0, 3).map((m: string, idx: number) => (
                      <span key={idx} className="font-semibold text-slate-700 dark:text-slate-300">
                        {m}{idx < Math.min(exercise.biomechanics.primaryMuscles.length, 3) - 1 ? '、' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Personal Study Note Section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="寫下臨床觀察、操作要領或考試重點..."
                          rows={3}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-teal-500/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => saveNote(exercise.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold"
                          >
                            <Check className="w-3 h-3" />
                            <span>儲存筆記</span>
                          </button>
                        </div>
                      </div>
                    ) : noteText ? (
                      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 relative group/note">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                            <FileEdit className="w-3 h-3" />
                            研讀筆記
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition">
                            <button
                              onClick={() => {
                                setEditingNoteId(exercise.id);
                                setTempNoteText(noteText);
                              }}
                              className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline"
                            >
                              編輯
                            </button>
                            <span className="text-[10px] text-amber-400">·</span>
                            <button
                              onClick={() => deleteNote(exercise.id)}
                              className="text-[10px] text-red-600 dark:text-red-400 hover:underline"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                          {noteText}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNoteId(exercise.id);
                          setTempNoteText('');
                        }}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>新增個人研讀筆記...</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {exercise.id}
                  </span>
                  <Link
                    href={`/exercise/${exercise.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                  >
                    <span>閱讀百科條目</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
