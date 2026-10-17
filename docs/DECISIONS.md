# Architecture & Technical Decisions Record (ADR)

> **專案版本**：PhysioBank v2.0 (Dual-Mode Clinical Exercise Encyclopedia)  
> **更新日期**：2026-10-17  
> **分支**：`feat/condition-search-v2`  
> **指導方針**：Ponytail（最小必要程式碼、高可維護性）、Anthropic/Claude Frontend Design（溫暖米色、石材灰、琥珀色調、無綠色）、Grill-With-Docs。

---

## ADR-001: 獨立 Git 分支與資料庫備份

- **決策**：在 `feat/condition-search-v2` 分支進行改造，並將原本的 `src/data/lowerLimbExercises.json` 完整備份為 `src/data/lowerLimbExercises.json.bak`。
- **理由**：確保既有 v1 的動作庫結構與歷史紀錄完全可逆，隔離 v2 雙模架構重構的風險。

---

## ADR-002: 雙模首頁架構（病症檢索模式 vs 部位瀏覽模式）

- **決策**：
  1. 首頁預設為「**病症檢索模式 (Condition Search)**」，讓治療師與使用者在 30 秒內透過口語症狀或病症名稱（支援繁簡容錯）精準定位至臨床處方。
  2. 首頁頂部提供**高對比、顯眼的模式切換器 (Mode Toggle)**，使用者可一鍵切換至「**部位瀏覽模式 (Anatomy Review)**」。
  3. 雙模狀態保存在頂層元件記憶體中，切換時即時切換視圖，零延遲且不需重新請求網路資源。
- **理由**：滿足治療師以「病症為導向」開立處方的核心需求，同時保留原有依「部位/關節」瀏覽全庫 373 個動作的完整性。

---

## ADR-003: 輕量級純 TypeScript 選擇器層 (`selectors.ts`)

- **決策**：
  1. 避免引入大型搜尋引擎函式庫或冗餘的 Redux 中介層，以純 TypeScript 撰寫 `src/data/selectors.ts`。
  2. 建立記憶體映射快取（`Map<string, Condition>`、`Map<string, Exercise>`、`Map<string, string>` 追蹤 legacy IDs）。
  3. 實作包含前綴匹配、子字串權重、全名精確匹配的評分演算法，並內建繁簡容錯比對。
- **理由**：符合 Ponytail 原則，運行於本機瀏覽器與單一 HTML 檔案時幾乎不佔額外記憶體（Zero System Bloat），查詢速度達毫秒級。

---

## ADR-004: 證據等級與處方群體標籤 (Evidence & Bundle Badges)

- **決策**：
  - `primary`：核心處方（★ 核心專屬）
  - `mentioned`：文中提及（📎 文中提及・非專屬）——嚴格禁止描述為該病專屬
  - `group`：群組共用（👥 同組共用處方）——若病症所屬 Bundle 大於 1 且未有單獨標記，頁面頂端必須顯示同組共用處方橫幅
  - `suggested-pending-review`：建議確認（⏳ 建議・待臨床確認）——通用踝足運動等補充動作標註此標籤
- **理由**：臨床專業嚴謹性。治療師需清楚區分何者為原著專屬處方、何者為文獻關聯提及、何者為通用建議。

---

## ADR-005: 繁體中文名稱回退策略與色彩系統重構

- **決策**：
  1. **中文名稱處置**：對於 `exercises.v2.json` 中標記為 `chineseNameIsFallback: true` 的 149 筆項目，遵照使用者指示：「**先儲存為英文，在之後版本一次性更新**」，同時匯出 `docs/chinese_name_drafts.csv` 供治療師團隊審閱。
  2. **色彩系統**：全面淘汰原本的綠色/藍綠色系 (`teal-*`, `emerald-*`, `cyan-*`)，改採 **Anthropic / Claude Frontend Design** 美學：
     - 背景：暖米色 (`#FAF8F5`, `#F5F2EB`, `#FBF9F5`)
     - 深色背景：暖石褐黑 (`#201D1A`, `#1C1917`)
     - 文字與邊框：暖石材灰 (`stone-200` 至 `stone-900`)
     - 點綴與主色：琥珀暖棕與赤褐色 (`amber-700`, `amber-800`, `amber-900`)

---

## ADR-006: 通用踝足庫 (Generic Ankle Library) 的隔離與呈現

- **決策**：
  - 13 個通用踝足運動嚴禁混入膝關節或髖關節。
  - 在部位瀏覽模式下，當選取「腳踝與足部」時，以獨立警告橫幅呈現在獨立區塊。
  - 在病症詳情頁中，於底部獨立區塊列為「建議・待臨床確認」，輔助治療師擴充處方。
