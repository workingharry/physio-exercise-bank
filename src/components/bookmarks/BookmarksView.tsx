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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60">
              <Bookmark className="w-5 h-5 fill-current" />
            </span>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
              研讀筆記與學習收藏
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            個人專屬離線研讀庫：快速複習精選動作條目、臨床筆記與近期閱讀足跡（完全儲存於本機瀏覽器，無需外部登入）
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#EFECE6] dark:bg-[#2A2622] p-1 rounded-xl border border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'bookmarks'
                ? 'bg-amber-800 text-amber-50 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>收藏清單 ({bookmarkedExercises.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-amber-800 text-amber-50 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="搜尋已收藏動作名稱、肌群或筆記關鍵字..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-xl text-xs focus:outline-none focus:border-amber-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 transition"
          />
        </div>

        {activeTab === 'history' && recentExercises.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-900 transition self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空瀏覽紀錄</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {filteredList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#201D1A] rounded-2xl border border-stone-200 dark:border-stone-800 px-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
            {activeTab === 'bookmarks' ? <Bookmark className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-serif font-bold text-stone-800 dark:text-stone-200">
            {activeTab === 'bookmarks' ? '目前尚無收藏的動作條目' : '目前尚無最近瀏覽紀錄'}
          </h3>
          <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto">
            {activeTab === 'bookmarks' 
              ? '在瀏覽運動百科百科條目時，點擊「⭐ 收藏至研讀筆記」，即可隨時在此集中研讀與新增私人學習筆記。'
              : '瀏覽各動作的詳細百科條目時，系統會自動在離線本機記錄最近研讀過的動作。'}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition shadow-sm"
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
                className="group flex flex-col justify-between bg-white dark:bg-[#201D1A] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 transition duration-200 overflow-hidden shadow-sm"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                          {exercise.subRegion}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {exercise.biomechanics.kineticChain}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {exercise.difficulty}
                        </span>
                      </div>
                      <Link
                        href={`/exercise/${exercise.id}`}
                        className="block font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition"
                      >
                        {exercise.chineseName}
                      </Link>
                      <p className="text-[11px] text-stone-400 font-mono line-clamp-1">
                        {exercise.name}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleBookmark(exercise.id)}
                      className={`p-2 rounded-xl border transition shrink-0 ${
                        isBookmarked
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                          : 'bg-stone-50 dark:bg-stone-800/50 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 border-stone-200 dark:border-stone-800'
                      }`}
                      title={isBookmarked ? '取消收藏' : '加入收藏'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Muscle tags */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-stone-400 font-medium">主動肌:</span>
                    {exercise.biomechanics.primaryMuscles.slice(0, 3).map((m: string, idx: number) => (
                      <span key={idx} className="font-semibold text-stone-700 dark:text-stone-300">
                        {m}{idx < Math.min(exercise.biomechanics.primaryMuscles.length, 3) - 1 ? '、' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Personal Study Note Section */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="寫下臨床觀察、操作要領或考試重點..."
                          rows={3}
                          className="w-full p-2.5 bg-stone-50 dark:bg-[#2A2622] border border-amber-700/50 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-700 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => saveNote(exercise.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-800 hover:bg-amber-900 text-amber-50 text-[11px] font-bold"
                          >
                            <Check className="w-3 h-3" />
                            <span>儲存筆記</span>
                          </button>
                        </div>
                      </div>
                    ) : noteText ? (
                      <div className="bg-[#FAF8F5] dark:bg-[#2A2622] border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-2.5 relative group/note">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <FileEdit className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            研讀筆記
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/note:opacity-100 transition">
                            <button
                              onClick={() => {
                                setEditingNoteId(exercise.id);
                                setTempNoteText(noteText);
                              }}
                              className="text-[10px] text-amber-800 dark:text-amber-300 hover:underline"
                            >
                              編輯
                            </button>
                            <span className="text-[10px] text-amber-400">·</span>
                            <button
                              onClick={() => deleteNote(exercise.id)}
                              className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                          {noteText}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNoteId(exercise.id);
                          setTempNoteText('');
                        }}
                        className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 transition"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>新增個人研讀筆記...</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="px-5 py-3 bg-stone-50/80 dark:bg-[#201D1A] border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">
                    ID: {exercise.id}
                  </span>
                  <Link
                    href={`/exercise/${exercise.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition"
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
