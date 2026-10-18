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
      description: '踝關節背屈與足內翻主動肌，步態擺盪期腳趾離地 (Foot Clearance) 與足跟著地離心吸震關鍵肌。',
      keywords: ['tibialis anterior', 'tibialis ant', '脛前肌']
    },
    {
      id: 'peroneals',
      name: '腓骨肌群 (腓骨長/短肌)',
      nameEn: 'Peroneal / Fibularis Longus & Brevis',
      region: 'Ankle & Foot',
      description: '外側踝關節動態穩定防護肌，提供足外翻力矩抵消反覆外翻扭傷機制，維持第一蹠骨穩定貼地。',
      keywords: ['fibularis', 'peroneal', 'peroneus', '腓骨長肌', '腓骨短肌', '腓骨肌']
    },
    {
      id: 'glute-max',
      name: '臀大肌',
      nameEn: 'Gluteus Maximus',
      region: 'Hip & Pelvis',
      description: '人體最大伸髖與外旋爆發力肌群，支撐站姿垂直力線、深蹲推蹬與骨盆後傾控制核心。',
      keywords: ['gluteus maximus', 'glute max', '臀大肌']
    },
    {
      id: 'glute-med',
      name: '臀中肌與外展肌群',
      nameEn: 'Gluteus Medius & Minimus / Hip Abductors',
      region: 'Hip & Pelvis',
      description: '單腳站立額狀面骨盆水平防下墜 (Trendelenburg sign) 關鍵肌，防止膝外翻代償與髕骨股骨疼痛 (PFPS)。',
      keywords: ['gluteus medius', 'glute med', 'abductor', '臀中肌', '髖外展']
    },
    {
      id: 'deep-rotators',
      name: '深層髖外旋肌 (梨狀肌 / 閉孔肌)',
      nameEn: 'Deep Hip External Rotators (Piriformis, Obturators, Gemelli)',
      region: 'Hip & Pelvis',
      description: '股骨頭在髖臼內的「肩旋轉肌袖」微調系統，提供動態中心化控制 (Hip Centration) 並調節坐骨神經滑動空間。',
      keywords: ['piriformis', 'obturator', 'gemelli', 'quadratus femoris', '梨狀肌', '深層外旋']
    },
    {
      id: 'iliopsoas',
      name: '髂腰肌與髖屈肌',
      nameEn: 'Iliopsoas & Hip Flexors (Psoas Major, Iliacus, TFL)',
      region: 'Hip & Pelvis',
      description: '主要屈髖肌群，連接腰椎與股骨小轉子，維持骨盆前傾力偶平衡與步態推進。',
      keywords: ['iliopsoas', 'psoas', 'iliacus', 'tensor fasciae latae', 'tfl', '髂腰肌', '腰大肌', '闊筋膜張肌']
    },
    {
      id: 'adductors',
      name: '內收肌群',
      nameEn: 'Hip Adductors (Adductor Longus, Magnus, Brevis, Gracilis)',
      region: 'Hip & Pelvis',
      description: '骨盆內側穩定肌群，在跑步變向與單腳承重時提供跨矢狀面多平面輔助伸屈髖扭矩。',
      keywords: ['adductor', 'gracilis', 'pectineus', '內收肌', '內收長肌', '內收大肌', '股薄肌']
    },
    {
      id: 'foot-intrinsics',
      name: '足部內在肌群',
      nameEn: 'Foot Intrinsic Muscles (Plantar Fascia Dynamic Stabilizers)',
      region: 'Ankle & Foot',
      description: '足底深層短肌（外展拇肌、屈趾短肌等），構成足弓「核心肌群 (Foot Core)」，維持三點負重力學。',
      keywords: ['intrinsic', 'plantar', 'abductor hallucis', 'flexor digitorum brevis', '足底內在肌', '足弓']
    }
  ];

  // Pre-index muscle exercises
  const muscleExercisesMap = useMemo(() => {
    const map = new Map<string, Exercise[]>();

    for (const group of muscleGroups) {
      const matched = allExercises.filter(ex => {
        const fullBiomech = [
          ...ex.biomechanics.primaryMuscles,
          ...ex.biomechanics.secondaryMuscles,
          ex.name,
          ex.chineseName,
          ex.description
        ].join(' ').toLowerCase();

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
      <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>PhysioWiki · 解剖運動學索引 (Functional Anatomy Index)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          下肢核心肌群與功能解剖索引
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
          依據肌動學 (Kinesiology) 與生物力學分類，點選任一目標肌群即可迅速查閱全庫 373 篇實證訓練與伸展條目，方便教學查閱與動作比對。
        </p>
      </div>

      {/* Main Layout: 2-Column Desktop (Sidebar Muscle Selector + Main Article Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Muscle Group Directory */}
        <div className="lg:col-span-4 bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-sm space-y-1.5 sticky top-20">
          <div className="px-3 py-2 text-xs font-bold uppercase text-stone-400 border-b border-stone-100 dark:border-stone-800/80 mb-1 flex items-center justify-between">
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
                      ? 'bg-amber-800 text-amber-50 shadow-sm font-bold'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/70 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="truncate">
                    <span className="block truncate font-bold font-serif">{group.name}</span>
                    <span className={`text-[10px] block truncate mt-0.5 ${
                      isSelected ? 'text-amber-200' : 'text-stone-400'
                    }`}>
                      {group.nameEn.split('(')[0]}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isSelected
                      ? 'bg-amber-900 text-amber-100'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
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
          <div className="bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 mr-2">
                  {activeGroup.region}
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 inline align-middle">
                  {activeGroup.name}
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  {activeGroup.nameEn}
                </p>
              </div>

              {/* Instant Search in this Muscle */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`在${activeGroup.name}中篩選...`}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#2A2622] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-700 transition"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {activeGroup.description}
            </p>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800/80">
              <span>收錄詞條數：<strong className="text-amber-800 dark:text-amber-400 font-bold">{filteredExercises.length}</strong> 篇</span>
              <span className="text-[11px] text-stone-400">點擊條目可閱讀完整生物力學剖析與示範影片</span>
            </div>
          </div>

          {/* Exercise Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredExercises.map(ex => {
              const isBookmarked = bookmarks.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  className="bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 rounded-2xl p-4 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-amber-300 border border-stone-200 dark:border-stone-700">
                        {ex.subRegion}
                      </span>
                      <button
                        onClick={() => toggleBookmark(ex.id)}
                        className={`p-1 rounded-lg text-stone-400 hover:text-amber-600 transition ${
                          isBookmarked ? 'text-amber-600' : ''
                        }`}
                        title="收藏至研讀筆記"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <Link
                      href={`/exercise/${ex.id}`}
                      onClick={() => addRecentlyViewed(ex.id)}
                      className="block group-hover:text-amber-800 dark:group-hover:text-amber-300 transition"
                    >
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                        {ex.name}
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium line-clamp-1 mt-0.5">
                        {ex.chineseName}
                      </p>
                    </Link>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-2 leading-relaxed">
                      {ex.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate max-w-[150px]">
                      {ex.biomechanics.kineticChain} · {ex.difficulty.split(' ')[0]}
                    </span>
                    <Link
                      href={`/exercise/${ex.id}`}
                      onClick={() => addRecentlyViewed(ex.id)}
                      className="text-amber-800 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 shrink-0"
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
