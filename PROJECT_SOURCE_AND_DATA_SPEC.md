# 📋 PhysioBank 原始碼、資料 Schema、轉換溯源與媒體檔案完整報告

本文件為針對 PhysioBank 物理治療運動資料庫的**原始程式碼**、**Schema 欄位定義**、**搜尋篩選演算法**、**核心元件**、**原始 docx 文件解析過程**與 **媒體/縮圖檔案存在性** 的深度排查與還原規格書。

---

## 📑 目錄
1. [核心真相快速答覆 (禁忌症預設值 / media 縮圖真相)](#一-核心真相快速答覆)
2. [原始 docx 文件分佈與欄位對照](#二-原始-docx-文件分佈與欄位對照)
3. [資料轉換腳本分析 (scripts/parse_lower_limb.py)](#三-資料轉換腳本分析)
4. [核心 TypeScript Schema 欄位定義 (src/types/exercise.ts)](#四-核心-typescript-schema-欄位定義)
5. [搜尋與多條件篩選邏輯 (Search & Filter Engine)](#五-搜尋與多條件篩選邏輯)
6. [動作卡片元件 (src/components/library/ExerciseCard.tsx)](#六-動作卡片元件)
7. [條目詳情頁元件 (src/components/detail/ExerciseDetailView.tsx)](#七-條目詳情頁元件)

---

## 一、 核心真相快速答覆

### 1. 通用禁忌症是不是轉換時補上的預設值？
> **答案：是的！完全被您料中了。**
- **原始 docx 檔中**：表格內**完全沒有**獨立的 `Contraindications`（禁忌症）欄位。原始 docx 僅有 `Precautions / common errors`（注意事項／常見代償錯誤）。
- **轉換過程**：在 [`scripts/parse_lower_limb.py`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/scripts/parse_lower_limb.py#L351) 第 351 行中，轉換器硬編碼注入了通用預設值：
  ```python
  'contraindications': ['患部急性劇烈撕裂痛', '疑似骨折未確診'],
  'precautions': [precautions_raw] if precautions_raw else ['在無痛或輕微無害痠痛範圍內操作'],
  ```
- **結論**：所有 387 筆資料的 `contraindications` 都是轉換腳本填入的統一保護性佔位符，而**真正的臨床警示與禁忌細節其實位在 `precautions` 欄位與 `execution.commonErrors` 中**。

---

### 2. `/media` 資料夾與縮圖本來是否存在？
> **答案：原始專案與 docx 中從來不存在實體 `/media` 圖檔。**
- **原始 docx 檔內部**：經解壓縮檢驗 `word/media/` 目錄為空，docx 內**沒有嵌入任何圖片二進制檔案**，僅列出搜尋關鍵字（例如 `Reference image keywords: Flat ground heel raise insertional Achilles tendinopathy physiotherapy`）。
- **轉換腳本虛擬路徑**：轉換腳本第 321 行自動合成了字串路徑：
  ```python
  'thumbnailUrl': f"/media/lower-limb/{prefix}/{slugify(name)}.jpg"
  ```
- **前端如何顯示縮圖**：
  在 [`src/components/library/ExerciseCard.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/library/ExerciseCard.tsx#L31-L35) 中，系統判斷：
  1. 若有 YouTube 影片連結，動態提取 11 碼 Video ID，直接從 YouTube CDN 讀取高品質封面：
     ```typescript
     const ytMatch = exercise.media.videoUrl?.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
     const ytId = ytMatch && ytMatch[1].length === 11 ? ytMatch[1] : null;
     const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : exercise.media.thumbnailUrl;
     ```
  2. 若無影片或圖片加載失敗（觸發 `onError`），則調用 [`AnatomySvgPlaceholder.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/common/AnatomySvgPlaceholder.tsx) 依據關節部位（踝/膝/髖）即時以 SVG 繪製力學向量佔位圖。

---

## 二、 原始 docx 文件分佈與欄位對照

原始臨床運動庫文件儲存於本機電腦：
**路徑**：`/Users/harryng/Downloads/Great project/physio-exercise-bank/`

### 1. 檔案分佈目錄
```
/Users/harryng/Downloads/Great project/physio-exercise-bank/
├── Lower limb/
│   ├── Ankle/ (15 份 docx，涵蓋 Achilles, Lateral Ankle Sprain, PTTD, Plantar Fasciopathy 等)
│   ├── Knee/  (16 份 docx，涵蓋 ACLR, Meniscal Tear, Patellar Tendinopathy, OA 等)
│   └── Hip/   (17 份 docx，涵蓋 FAI, Hamstring Strain, Gluteal Tendinopathy 等)
└── Upper limb/
    ├── Shoulder/ (17 份 docx)
    ├── elbow/ (11 份 docx)
    └── Elbow to wrist/ (10 份 docx)
```

### 2. 原始 docx 的表格結構對照表 (以 Ankle Achilles Tendinopathy 為例)
| 原始 docx 表格標籤 (Row Header) | docx 原始內容舉例 | 對應轉換後的 JSON 欄位 |
| :--- | :--- | :--- |
| **表格 0 (Overview Table)** | `1. Standing / seated isometric heel-raise hold` | `id`, `name`, `chineseName` |
| **Strength / training type** | `Closed chain; heavy isometric; Stage 1 tendon analgesia` | `movementType`, `biomechanics.kineticChain` |
| **Target muscles** | `Gastrocnemius (knee straight), soleus (knee bent)` | `biomechanics.primaryMuscles` |
| **Instructions** | `1) Stand on affected leg... 2) Hold static 45s...` | `execution.steps` (分步拆解), `startingPosition` |
| **Description** | `Heavy sustained isometric contractions provide...` | `description`, `clinicalNotes` |
| **Dosage (FITT)** | `5 reps x 45-second holds, 2 minutes rest...` | `dosage.sets`, `reps`, `holdDuration`, `rest` |
| **Progression** | `Perform unilaterally with external dumbbell...` | `progressions` |
| **Regression** | `Bilateral standing isometric hold...` | `regressions` |
| **Precautions / common errors** | `Holding stretch at bottom of step... Cues: "Rise halfway..."` | `precautions`, `execution.commonErrors`, `execution.coachingCues` |
| **Suitable injury & rehab stage** | `Stage 1 Mid-Portion & Insertional... Stage: ACUTE / EARLY` | `targetPathologies`, `rehabPhase` |
| **Video demonstration** | `Isometric Seated Calf Raises for Achilles... (YouTube URL)` | `media.videoUrl` |
| **Reference image keywords** | `Isometric calf raise hold Achilles tendinopathy physiotherapy` | *(僅供參考，無實體圖)* |

---

## 三、 資料轉換腳本分析

核心轉換工具位於 [`scripts/parse_lower_limb.py`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/scripts/parse_lower_limb.py)。

### 關鍵解析邏輯片段：
```python
# 1. 口訣 (Cues) 與代償錯誤 (Errors) 的正則拆分
if re.search(r'(?:cues|external cues?):\s*', precautions_raw, re.IGNORECASE):
    parts = re.split(r'(?:cues|external cues?):\s*', precautions_raw, flags=re.IGNORECASE)
    if parts[0].strip():
        errors.append(parts[0].strip())
    if len(parts) > 1 and parts[1].strip():
        cues.append(parts[1].strip())
elif precautions_raw:
    errors.append(precautions_raw)
    cues.append('保持骨盆中立與關節良好對齊')

# 2. 分步步驟的正則解析 (parse_steps_sequential)
# 支援 1), 2), 3) 或 Step 1, Step 2 循序拆解，並依關鍵字提煉 keyPoint
if 'avoid' in step_content.lower() or 'not' in step_content.lower():
    key_point = '注意避免代償動作'
elif 'hold' in step_content.lower() or 'freeze' in step_content.lower():
    key_point = '維持頂峰等長收縮'
elif 'slow' in step_content.lower() or 'eccentric' in step_content.lower():
    key_point = '離心控制慢速下放'

# 3. 禁忌症硬編碼 (第 351 行)
'contraindications': ['患部急性劇烈撕裂痛', '疑似骨折未確診'],
'precautions': [precautions_raw] if precautions_raw else ['在無痛或輕微無害痠痛範圍內操作']
```

---

## 四、 核心 TypeScript Schema 欄位定義

完整檔案位置：[`src/types/exercise.ts`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/types/exercise.ts)

```typescript
export type MacroRegion = 
  | 'Lower Limb' 
  | 'Upper Limb' 
  | 'Spine & Core' 
  | 'Full Body & Functional';

export type SubRegion =
  // Lower Limb (V1 現有)
  | 'Hip & Pelvis'
  | 'Knee'
  | 'Ankle & Foot'
  | 'Lower Limb Kinetic Chain';

export interface ExecutionStep {
  stepNumber: number;
  title?: string;
  instruction: string;
  stepImageUrl?: string;
  keyPoint?: string;
}

export interface ExerciseMedia {
  thumbnailUrl: string;
  galleryUrls?: string[];
  muscleDiagramUrl?: string;
  videoUrl?: string;
  videoType?: 'local' | 'youtube' | 'gif';
}

export interface Exercise {
  id: string;
  name: string;
  chineseName: string;
  macroRegion: MacroRegion;
  subRegion: SubRegion;
  movementType: ('Isometric' | 'Concentric' | 'Eccentric' | 'Plyometric' | 'Mobility' | 'Proprioception' | 'Stability' | 'Motor Control')[];
  rehabPhase: ('Phase 1: 急性保護/神經肌肉活化' | 'Phase 2: 次急性控制負荷' | 'Phase 3: 後期肌力與肥大強化' | 'Phase 4: 增強式與重返運動')[];
  targetPathologies: string[];
  equipment: string[];
  difficulty: 'Beginner (初階)' | 'Intermediate (中階)' | 'Advanced (進階)';
  media: ExerciseMedia;
  biomechanics: {
    primaryMuscles: string[];
    secondaryMuscles: string[];
    stabilizerMuscles: string[];
    planesOfMotion: ('矢狀面 (Sagittal)' | '額狀面 (Frontal)' | '水平面 (Transverse)' | '多平面 (Multi-planar)')[];
    jointActions: string[];
    kineticChain: '開放鏈 (OKC)' | '閉鎖鏈 (CKC)' | '混合鏈 (Mixed)';
  };
  description: string;
  execution: {
    startingPosition: string;
    description?: string;
    steps: ExecutionStep[];
    coachingCues: string[];
    commonErrors: string[];
  };
  regressions: { id?: string; name: string; rationale: string }[];
  progressions: { id?: string; name: string; rationale: string }[];
  dosage: {
    sets: string;
    reps: string;
    holdDuration?: string;
    frequency: string;
    rest: string;
    tempo?: string;
  };
  contraindications: string[];
  precautions: string[];
  clinicalNotes?: string;
}
```

---

## 五、 搜尋與多條件篩選邏輯

原始程式碼位於：[`src/components/library/LibraryView.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/library/LibraryView.tsx#L177-L255) 與 [`src/utils/similarity.ts`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/utils/similarity.ts)。

### 1. 多條件過濾引擎 (`filteredExercises`)
```typescript
const filteredExercises = useMemo(() => {
  let pool = combinedExercises;
  
  // 收藏與最近瀏覽範疇切換
  if (scopeMode === 'favorites') {
    pool = combinedExercises.filter(ex => bookmarks.includes(ex.id));
  } else if (scopeMode === 'recent') {
    const recentMap = new Map(recentlyViewed.map((id, idx) => [id, idx]));
    pool = combinedExercises
      .filter(ex => recentMap.has(ex.id))
      .sort((a, b) => (recentMap.get(a.id) ?? 999) - (recentMap.get(b.id) ?? 999));
  }

  return pool.filter(ex => {
    // 1. 次分區過濾 (Ankle / Knee / Hip)
    const activeSub = selectedSub !== 'ALL' ? selectedSub : filters.subRegion;
    if (activeSub !== 'ALL' && ex.subRegion !== activeSub) return false;

    // 2. 跨欄位關鍵字全文搜尋
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      const matchName = ex.name.toLowerCase().includes(query);
      const matchChinese = ex.chineseName.toLowerCase().includes(query);
      const matchMuscles = ex.biomechanics.primaryMuscles.some(m => m.toLowerCase().includes(query));
      const matchPathologies = ex.targetPathologies.some(p => p.toLowerCase().includes(query));
      const matchEquipment = ex.equipment.some(eq => eq.toLowerCase().includes(query));
      if (!matchName && !matchChinese && !matchMuscles && !matchPathologies && !matchEquipment) {
        return false;
      }
    }

    // 3. 目標肌群多選 (包含主動肌與協同肌)
    if (filters.targetMuscles.length > 0) {
      const hasMuscle = filters.targetMuscles.some(tm => {
        const key = tm.split(' ')[0].replace(/[\/\(\)]/g, '');
        return ex.biomechanics.primaryMuscles.some(m => m.includes(key)) ||
               ex.biomechanics.secondaryMuscles.some(m => m.includes(key));
      });
      if (!hasMuscle) return false;
    }

    // 4. 收縮型態 (Isometric / Concentric / Eccentric / Plyometric...)
    if (filters.movementTypes.length > 0) {
      if (!filters.movementTypes.some(t => ex.movementType.includes(t as any))) return false;
    }

    // 5. 復健分期 (Phase 1 至 Phase 4)
    if (filters.rehabPhases.length > 0) {
      if (!filters.rehabPhases.some(p => ex.rehabPhase.includes(p as any))) return false;
    }

    // 6. 器材需求
    if (filters.equipment.length > 0) {
      if (!filters.equipment.some(eq => ex.equipment.some(e => e.includes(eq.split(' ')[0])))) return false;
    }

    // 7. 難度等級
    if (filters.difficulty !== 'ALL' && ex.difficulty !== filters.difficulty) return false;

    // 8. 動力鏈 (OKC / CKC)
    if (filters.kineticChain !== 'ALL' && ex.biomechanics.kineticChain !== filters.kineticChain) return false;

    // 9. 負重與承重狀態
    if (filters.loadingStatus !== 'ALL') {
      if (filters.loadingStatus.includes('CKC') && ex.biomechanics.kineticChain !== '閉鎖鏈 (CKC)') return false;
      if (filters.loadingStatus.includes('OKC') && ex.biomechanics.kineticChain !== '開放鏈 (OKC)') return false;
      if (filters.loadingStatus.includes('徒手自重') && !ex.equipment.some(e => e.includes('徒手') || e.includes('Bodyweight'))) return false;
      if (filters.loadingStatus.includes('抗阻負重') && !ex.equipment.some(e => e.includes('啞鈴') || e.includes('彈力帶') || e.includes('負重') || e.includes('槓鈴') || e.includes('壺鈴'))) return false;
    }

    return true;
  });
}, [combinedExercises, selectedSub, filters, scopeMode, bookmarks, recentlyViewed]);
```

### 2. 相似動作推薦評分演算法 (`src/utils/similarity.ts`)
```typescript
export function findSimilarExercises(target: Exercise, all: Exercise[], topN = 4) {
  return all
    .filter(e => e.id !== target.id)
    .map(e => {
      let score = 0;
      const matchingPoints: string[] = [];

      // 相同解剖次區域 (+30 分)
      if (e.subRegion === target.subRegion) {
        score += 30;
        matchingPoints.push(e.subRegion);
      }

      // 共有主動肌群 (每個 +25 分)
      const sharedMuscles = e.biomechanics.primaryMuscles.filter(m =>
        target.biomechanics.primaryMuscles.includes(m)
      );
      if (sharedMuscles.length > 0) {
        score += sharedMuscles.length * 25;
        matchingPoints.push(sharedMuscles.join('、'));
      }

      // 相同動力鏈 OKC/CKC (+15 分)
      if (e.biomechanics.kineticChain === target.biomechanics.kineticChain) {
        score += 15;
        matchingPoints.push(e.biomechanics.kineticChain);
      }

      // 共有收縮模式 (+10 分)
      const sharedMovements = e.movementType.filter(m => target.movementType.includes(m));
      if (sharedMovements.length > 0) {
        score += sharedMovements.length * 10;
      }

      return { exercise: e, score, matchingPoints };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
```

---

## 六、 動作卡片元件

完整檔案位置：[`src/components/library/ExerciseCard.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/library/ExerciseCard.tsx)

```tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Exercise } from '../../types/exercise';
import { AnatomySvgPlaceholder } from '../common/AnatomySvgPlaceholder';
import { Bookmark, Play, Scale } from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';

interface Props {
  exercise: Exercise;
  onQuickView?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<Props> = ({ exercise, onQuickView }) => {
  const [, navigate] = useLocation();
  const { bookmarks, toggleBookmark, comparisonIds, toggleComparison, addRecentlyViewed } = useRoutineStore();
  const [imgError, setImgError] = useState(false);

  const isBookmarked = bookmarks.includes(exercise.id);
  const isComparing = comparisonIds.includes(exercise.id);

  // 解析 YouTube ID 提取真實在線封面
  const ytMatch = exercise.media.videoUrl?.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
  const ytId = ytMatch && ytMatch[1].length === 11 ? ytMatch[1] : null;
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : exercise.media.thumbnailUrl;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    addRecentlyViewed(exercise.id);
    navigate(`/exercise/${exercise.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-lg flex flex-col justify-between cursor-pointer ${
        isComparing ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-teal-500/60'
      }`}
    >
      <div>
        {/* 縮圖展示：優先讀取 YouTube 封面，無影片或加載失敗降級為 SVG 向量圖 */}
        <div className="relative mb-3 h-36 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
          {thumbnailUrl && !imgError ? (
            <img
              src={thumbnailUrl}
              alt={exercise.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <AnatomySvgPlaceholder subRegion={exercise.subRegion} className="h-full w-full" badge={exercise.subRegion} />
          )}

          {exercise.media.videoUrl && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-teal-300 border border-teal-500/40">
              <Play className="w-3 h-3 fill-teal-400 text-teal-400" />
              <span>示範影片</span>
            </div>
          )}

          {/* 快捷對比與收藏按鈕 */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); toggleComparison(exercise.id); }}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition ${isComparing ? 'bg-indigo-600 text-white' : 'bg-slate-950/80 text-slate-300'}`}
              title="加入並排對比"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleBookmark(exercise.id); }}
              className={`p-1.5 rounded-lg border backdrop-blur-md transition ${isBookmarked ? 'bg-amber-500 text-white' : 'bg-slate-950/80 text-slate-300'}`}
              title="收藏條目"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* 標題與中英對照 */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition line-clamp-1">
            {exercise.chineseName || exercise.name}
          </h3>
          <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
            {exercise.name}
          </p>
        </div>

        {/* 主動肌標籤 */}
        <div className="mt-2.5 flex flex-wrap gap-1 text-[11px]">
          <span className="text-slate-400 font-medium">主動肌:</span>
          {exercise.biomechanics.primaryMuscles.map((m, idx) => (
            <span key={idx} className="font-semibold text-slate-700 dark:text-slate-300">
              {m}{idx < exercise.biomechanics.primaryMuscles.length - 1 ? '、' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* 底部劑量與動力鏈資訊 */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>{exercise.biomechanics.kineticChain}</span>
        <span className="font-semibold text-teal-600 dark:text-teal-400">{exercise.dosage.sets} × {exercise.dosage.reps}</span>
      </div>
    </div>
  );
};
```

---

## 七、 條目詳情頁元件

完整檔案位置：[`src/components/detail/ExerciseDetailView.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/detail/ExerciseDetailView.tsx)

### 結構大綱：
- **右側固定資訊盒 (Canonical Infobox)**：
  - 影片播放器 ([`VideoPlayer.tsx`](file:///Users/harryng/Downloads/AI%20gen%20auto%20tool/Physio%20website/src/components/common/VideoPlayer.tsx)) / 解剖向量圖切換
  - 核心規格表（英文名、次分區、OKC/CKC、動作平面、器材、難度）
  - FITT 標準劑量（組數/次數/等長秒數/頻率）
- **左側主體章節目錄與平滑跳轉 (TOC)**：
  - `#mechanism`：臨床機制與生物力學原理
  - `#anatomy`：功能解剖與目標肌群（主動肌標籤可直接跳轉 `/anatomy?muscle=...`）
  - `#technique`：分步操作技術與起始擺位（步驟 0 起始預備 + 依序拆解）
  - `#cues`：物理治療師指導口訣
  - `#errors`：常見代償錯誤與校正防線（紅旗警示）
  - `#safety`：禁忌症與安全操作守則
  - `#progressions`：進階與退階決策樹（可跳轉庫內對應動作）
  - `#see-also`：相關條目與替代動作（相似度評分推薦）

---

## 八、 建議與後續維護指引

1. **若欲調整禁忌症 (Contraindications)**：
   目前資料庫中 387 筆的 `contraindications` 均為通用預設值（`患部急性劇烈撕裂痛`, `疑似骨折未確診`）。若需更細緻的病症專屬禁忌症，可直接從各動作的 `precautions`（此欄位保存了 docx 原文的真實臨床注意事項）進一步提煉或更新 `src/data/lowerLimbExercises.json`。
2. **若欲替換示範影片**：
   可直接於 `src/data/lowerLimbExercises.json` 搜尋目標動作的 `id`，替換其 `media.videoUrl`。修改後執行 `npm run build` 即可於 1 秒內自動重新生成單一離線 HTML `physio_bank_standalone.html`。
