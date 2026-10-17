import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { allExercises } from '../../data/exercises';
import { Exercise } from '../../types/exercise';
import { useRoutineStore } from '../../store/useRoutineStore';
import { 
  Dumbbell, Target, ChevronRight, Bookmark, Play, 
  Search, Layers, Sparkles, ArrowRight
} from 'lucide-react';

interface MuscleGroupDefinition {
  id: string;
  name: string;
  nameEn: string;
  region: 'Ankle & Foot' | 'Knee' | 'Hip & Pelvis';
  description: string;
  keywords: string[];
}

export const AnatomyIndexView: React.FC = () => {
  const { bookmarks, toggleBookmark, addRecentlyViewed } = useRoutineStore();
  const [selectedMuscleId, setSelectedMuscleId] = useState<string>('quadriceps');
  const [search, setSearch] = useState<string>('');

  const muscleGroups: MuscleGroupDefinition[] = [
    {
      id: 'quadriceps',
      name: '股四頭肌',
      nameEn: 'Quadriceps Femoris (Rectus Femoris, VMO, VL, VI)',
      region: 'Knee',
      description: '大腿前側主要伸膝肌群，包含股直肌、股內側肌 (VMO)、股外側肌與股中間肌，為髕骨軌跡對齊與術後抗抑制核心。',
      keywords: ['quadriceps', 'rectus femoris', 'vastus', 'vmo', '股四頭', '股直肌', '股內側肌', '股外側肌']
    },
    {
      id: 'hamstrings',
      name: '膕旁肌群',
      nameEn: 'Hamstrings (Biceps Femoris, Semitendinosus, Semimembranosus)',
      region: 'Knee',
      description: '大腿後側屈膝與伸髖肌群，控制膝關節終末伸展煞車與跑步離心拉力，ACL 術後保護脛骨前移之協同肌。',
      keywords: ['hamstring', 'biceps femoris', 'semitendinosus', 'semimembranosus', '膕旁肌', '股二頭肌', '半腱肌', '半膜肌']
    },
    {
      id: 'calves',
      name: '小腿三頭肌 (腓腸肌 / 比目魚肌)',
      nameEn: 'Triceps Surae (Gastrocnemius & Soleus)',
      region: 'Ankle & Foot',
      description: '踝關節蹠屈與阿基里斯腱動力之核心肌群。膝打直主攻雙關節腓腸肌；屈膝主攻深層單關節比目魚肌。',
      keywords: ['gastrocnemius', 'soleus', 'calf', 'calves', '腓腸肌', '比目魚肌', '小腿三頭肌']
    },
    {
      id: 'tibialis-post',
      name: '脛後肌',
      nameEn: 'Tibialis Posterior',
      region: 'Ankle & Foot',
      description: '足內側縱弓動態支撐與距下關節內翻主動肌，防止扁平足代償、足過度旋前與脛骨內側壓力症候群 (MTSS)。',
      keywords: ['tibialis posterior', 'tibialis post', '脛後肌']
    },
    {
      id: 'tibialis-ant',
      name: '脛前肌',
      nameEn: 'Tibialis Anterior',
      region: 'Ankle & Foot',
      description: '踝關節主要背屈肌群，控制步態著地時足跟著地之離心下放與下坡減震。',
      keywords: ['tibialis anterior', 'tibialis ant', '脛前肌']
    },
    {
      id: 'peroneals',
      name: '腓骨長短肌',
      nameEn: 'Fibularis / Peroneus Longus & Brevis',
      region: 'Ankle & Foot',
      description: '踝外側動態防翻穩定肌，足外翻主動肌，防止急停轉向外側踝關節內翻扭傷 (Inversion Sprain) 之第一道神經肌肉防線。',
      keywords: ['peroneal', 'peroneus', 'fibularis', '腓骨肌', '腓骨長肌', '腓骨短肌']
    },
    {
      id: 'glute-max',
      name: '臀大肌',
      nameEn: 'Gluteus Maximus',
      region: 'Hip & Pelvis',
      description: '人體最大伸髖動力肌與骨盆後傾穩定肌，提供深蹲、硬舉、衝刺與單腳推進時之最大動力輸出。',
      keywords: ['gluteus maximus', 'glute max', '臀大肌']
    },
    {
      id: 'glute-med',
      name: '臀中肌與髖外展肌群',
      nameEn: 'Gluteus Medius & Minimus, Tensor Fasciae Latae (TFL)',
      region: 'Hip & Pelvis',
      description: '額狀面骨盆穩定與單腳承重防垂 (Trendelenburg) 之核心肌群，有效阻絕下肢動力鏈之膝外翻 (Knee Valgus) 代償。',
      keywords: ['gluteus medius', 'glute med', 'abductor', 'tfl', '臀中肌', '髖外展', '臀小肌', '闊筋膜張肌']
    },
    {
      id: 'adductors',
      name: '髖內收肌群',
      nameEn: 'Hip Adductors (Adductor Longus, Magnus, Brevis, Gracilis)',
      region: 'Hip & Pelvis',
      description: '大腿內側穩定與多平面骨盆平衡肌群，在變向切入與 Copenhagen 訓練中提供恥骨聯合防護。',
      keywords: ['adductor', 'gracilis', 'copenhagen', '內收肌', '內收長肌', '內收大肌', '股薄肌']
    },
    {
      id: 'foot-core',
      name: '足底內在肌與筋膜 (Foot Core)',
      nameEn: 'Intrinsic Foot Musculature & Plantar Fascia',
      region: 'Ankle & Foot',
      description: '足底穹窿微調與絞盤機制 (Windlass Mechanism) 之第一層本體感覺感測器，強化抓地與推進槓桿剛性。',
      keywords: ['foot core', 'intrinsic', 'plantar', 'fascia', 'flexor digitorum', 'abductor hallucis', '足底', '外展拇肌', '屈趾短肌']
    }
  ];

  // Match exercises for each muscle group
  const muscleExercisesMap = useMemo(() => {
    const map = new Map<string, Exercise[]>();

    for (const group of muscleGroups) {
      const matched = allExercises.filter(ex => {
        const primeStr = ex.biomechanics.primaryMuscles.join(' ').toLowerCase();
        const secStr = ex.biomechanics.secondaryMuscles.join(' ').toLowerCase();
        const fullBiomech = `${primeStr} ${secStr} ${ex.name.toLowerCase()} ${ex.chineseName.toLowerCase()}`;

        return group.keywords.some(k => fullBiomech.includes(k.toLowerCase()));
      });
      map.set(group.id, matched);
    }

    return map;
  }, []);

  const activeGroup = muscleGroups.find(g => g.id === selectedMuscleId) || muscleGroups[0];
  const activeExercises = muscleExercisesMap.get(activeGroup.id) || [];

  const filteredExercises = useMemo(() => {
    if (!search) return activeExercises;
    const q = search.toLowerCase();
    return activeExercises.filter(ex => 
      ex.name.toLowerCase().includes(q) || 
      ex.chineseName.toLowerCase().includes(q) ||
      ex.targetPathologies.some(p => p.toLowerCase().includes(q))
    );
  }, [activeExercises, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Wiki Category Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>PhysioWiki · 解剖運動學索引 (Functional Anatomy Index)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          下肢核心肌群與功能解剖索引
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
          依據肌動學 (Kinesiology) 與生物力學分類，點選任一目標肌群即可迅速查閱全庫 387 篇實證訓練與伸展條目，方便教學查閱與動作比對。
        </p>
      </div>

      {/* Main Layout: 2-Column Desktop (Sidebar Muscle Selector + Main Article Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Muscle Group Directory */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-1.5 sticky top-20">
          <div className="px-3 py-2 text-xs font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span>選擇目標解剖肌群</span>
            <span>{muscleGroups.length} 大肌群</span>
          </div>

          <div className="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
            {muscleGroups.map(group => {
              const count = muscleExercisesMap.get(group.id)?.length || 0;
              const isSelected = selectedMuscleId === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedMuscleId(group.id);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate font-bold">{group.name}</span>
                    <span className={`text-[10px] block truncate mt-0.5 ${
                      isSelected ? 'text-teal-100' : 'text-slate-400'
                    }`}>
                      {group.nameEn.split('(')[0]}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isSelected
                      ? 'bg-teal-700 text-teal-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Selected Muscle Profile & Exercise Directory */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Muscle Profile Card (Physiopedia Style Summary Box) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/60 mr-2">
                  {activeGroup.region}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white inline align-middle">
                  {activeGroup.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {activeGroup.nameEn}
                </p>
              </div>

              {/* Instant Search in this Muscle */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`在${activeGroup.name}中篩選...`}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeGroup.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <span>收錄詞條數：<strong className="text-teal-600 dark:text-teal-400 font-bold">{filteredExercises.length}</strong> 篇</span>
              <span className="text-[11px] text-slate-400">點擊條目可閱讀完整生物力學剖析與示範影片</span>
            </div>
          </div>

          {/* Exercise Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredExercises.map(ex => {
              const isBookmarked = bookmarks.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/50 rounded-2xl p-4 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                        {ex.subRegion}
                      </span>
                      <button
                        onClick={() => toggleBookmark(ex.id)}
                        className={`p-1 rounded-lg text-slate-400 hover:text-amber-500 transition ${
                          isBookmarked ? 'text-amber-500' : ''
                        }`}
                        title="收藏至研讀筆記"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <Link
                      href={`/exercise/${ex.id}`}
                      onClick={() => addRecentlyViewed(ex.id)}
                      className="block group-hover:text-teal-600 dark:group-hover:text-teal-300 transition"
                    >
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {ex.name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-medium line-clamp-1 mt-0.5">
                        {ex.chineseName}
                      </p>
                    </Link>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">
                      {ex.biomechanics.kineticChain} · {ex.difficulty.split(' ')[0]}
                    </span>
                    <Link
                      href={`/exercise/${ex.id}`}
                      onClick={() => addRecentlyViewed(ex.id)}
                      className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      <span>閱讀詞條</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
