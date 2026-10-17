import React from 'react';
import { Link } from 'wouter';
import { Exercise } from '../../types/exercise';
import { useRoutineStore } from '../../store/useRoutineStore';
import { Eye, Plus, Check, Bookmark, Play, ChevronRight, Dumbbell, Scale } from 'lucide-react';

interface Props {
  exercises: Exercise[];
  onQuickView: (exercise: Exercise) => void;
}

export const CompactTableView: React.FC<Props> = ({ exercises, onQuickView }) => {
  const { 
    routine, 
    addToRoutine, 
    removeFromRoutine, 
    bookmarks, 
    toggleBookmark,
    comparisonIds,
    toggleComparison,
    addRecentlyViewed
  } = useRoutineStore();

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">運動名稱 / 部位</th>
              <th className="py-3.5 px-4 hidden md:table-cell">目標主動肌</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">收縮型態</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">復健分期</th>
              <th className="py-3.5 px-4 hidden xl:table-cell">難度 / 動力鏈</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">標準劑量</th>
              <th className="py-3.5 px-4 text-right">快捷操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {exercises.map((exercise) => {
              const isAdded = routine.some(item => item.exerciseId === exercise.id);
              const isBookmarked = bookmarks.includes(exercise.id);
              const isComparing = comparisonIds.includes(exercise.id);

              return (
                <tr
                  key={exercise.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group ${
                    isComparing ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Name & Region */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                          {exercise.subRegion}
                        </span>
                        {exercise.media.videoUrl && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#F5F2EB] text-amber-900 dark:bg-stone-800 dark:text-amber-300 border border-stone-200 dark:border-stone-750">
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>影片</span>
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/exercise/${exercise.id}`}
                        onClick={() => addRecentlyViewed(exercise.id)}
                      >
                        <span className="font-serif font-bold text-stone-900 dark:text-stone-100 hover:text-amber-800 dark:hover:text-amber-300 transition cursor-pointer text-sm line-clamp-1">
                          {exercise.name}
                        </span>
                      </Link>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {exercise.chineseName} · {exercise.targetPathologies[0] || ''}
                      </span>
                    </div>
                  </td>

                  {/* Target Muscles */}
                  <td className="py-3 px-4 hidden md:table-cell text-stone-700 dark:text-stone-300 font-medium">
                    <div className="line-clamp-2 max-w-xs">
                      {exercise.biomechanics.primaryMuscles.join(', ') || '下肢目標肌'}
                    </div>
                  </td>

                  {/* Movement Types */}
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {exercise.movementType.slice(0, 2).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-[#F5F2EB] text-amber-900 dark:bg-stone-800/80 dark:text-amber-300 border border-stone-200 dark:border-stone-700/80">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Rehab Phases */}
                  <td className="py-3 px-4 hidden lg:table-cell text-stone-600 dark:text-stone-300">
                    <span className="line-clamp-1 max-w-[150px]">
                      {exercise.rehabPhase[0]?.split(':')[0] || '一般復健'}
                    </span>
                  </td>

                  {/* Difficulty & Chain */}
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {exercise.difficulty.split(' ')[0]}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60">
                        {exercise.biomechanics.kineticChain.split(' ')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Dosage */}
                  <td className="py-3 px-4 hidden sm:table-cell text-stone-700 dark:text-stone-300 font-medium text-[11px]">
                    <div>{exercise.dosage.sets} x {exercise.dosage.reps}</div>
                    <div className="text-[10px] text-stone-400">{exercise.dosage.frequency}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Compare */}
                      <button
                        onClick={() => toggleComparison(exercise.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isComparing
                            ? 'bg-amber-800 text-white border-amber-700 shadow-sm'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                        }`}
                        title={isComparing ? '自對比移除' : '加入動作並排對比'}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>

                      {/* Bookmark */}
                      <button
                        onClick={() => toggleBookmark(exercise.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isBookmarked
                            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/40'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                        }`}
                        title="學習書籤"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick View Drawer */}
                      <button
                        onClick={() => {
                          addRecentlyViewed(exercise.id);
                          onQuickView(exercise);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-stone-700 transition"
                        title="快速側欄預覽"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                        <span className="hidden sm:inline">預覽</span>
                      </button>

                      {/* Add to Routine */}
                      <button
                        onClick={() => {
                          if (isAdded) {
                            removeFromRoutine(exercise.id);
                          } else {
                            addToRoutine(exercise.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isAdded
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                            : 'bg-amber-800 hover:bg-amber-900 text-amber-50'
                        }`}
                        title={isAdded ? '已在處方中' : '加入處方'}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
