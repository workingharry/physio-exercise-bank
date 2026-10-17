# Phase Repair & Coverage Audit Report

> **產出日期**：2026-10-17  
> **資料來源**：`src/data/conditions.json` (98 病症) 與原始教案 Word 文檔比對  
> **臨床安全準則**：不以 AI 任意捏造或自動補齊處方動作，嚴格標記分期缺失並警示使用者。

---

## 一、 摘要統計

- **總收錄病症/協定數**：98 種
- **具備完整 4 期覆蓋 (Phase 1 ~ Phase 4) 之病症**：88 種
- **存在分期缺失或不完全 (Phase-Incomplete) 之病症**：10 種
  - 其中 1 項為「通用踝足運動庫（非病症）」，本質非單一病理協定，不計入分期。
  - 臨床病症分期不完全者共 9 種。

---

## 二、 缺失病症詳細清單與原始來源考證

| 病症 ID | 中文名稱 | 涵蓋解剖區 | 現有分期 | 缺失分期 | 原始文檔 (docx) 狀態與處置說明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `posterior-tibial-tendon-dysfunction-pttd` | 脛後肌腱功能不全 | Ankle & Foot | Phase 2 | Phase 1, Phase 3, Phase 4 | 原文於踝足篇僅針對 Phase 2 承重控制與足弓重塑列出動作，急性期與後期離心/增強未單獨表列。已於病症頁籤標註警示。 |
| `deltoid-ligament-injury` | 三角韌帶損傷 | Ankle & Foot | Phase 2 | Phase 1, Phase 3, Phase 4 | 原教案僅歸納 Phase 2 關節活動度與抗旋前穩定。 |
| `knee-osteoarthritis-oa` | 膝關節退化性關節炎 | Knee | Phase 1, 2, 3 | Phase 4 | 退化性關節炎教案終點著重肌力維持與關節減壓，未設運動員級重返運動/增強式 (Phase 4)。符合臨床常規。 |
| `total-knee-arthroplasty-tka` | 全膝關節置換術後 | Knee | Phase 1, 2, 3 | Phase 4 | TKA 術後復健以日常生活獨立與深屈曲活動度為導向，原教材無 Phase 4 增強式處方。符合臨床常規。 |
| `lcl-injury` | 外側副韌帶損傷 | Knee | Phase 3 | Phase 1, Phase 2, Phase 4 | 原文併入後期抗內翻肌力處方，急、亞急性期未獨立成章。已於 UI 加上「分期不完整」警示橫幅。 |
| `posterolateral-corner-plc-injury` | 後外側角損傷 | Knee | Phase 3 | Phase 1, Phase 2, Phase 4 | 與 LCL 共享同組處方 (Bundle)，原稿著重於 Phase 3 旋轉穩定。 |
| `popliteus-injury` | 膕肌損傷 | Knee | Phase 3 | Phase 1, Phase 2, Phase 4 | 共享處方群，原教材僅收錄 Phase 3 動作。 |
| `pcl-sprain` | 後十字韌帶扭傷 | Knee | Phase 2 | Phase 1, Phase 3, Phase 4 | 原教材主要強調避免後移之 Phase 2 早期控制，未細列 Phase 3/4。已加註警示。 |
| `mcl-sprain` | 內側副韌帶扭傷 | Knee | Phase 2 | Phase 1, Phase 3, Phase 4 | 原教材針對 Phase 2 外翻抗阻提供處方，其餘分期未提供。已加註警示。 |
| `generic-ankle-foot-bank-not-a-condition` | 通用踝足運動庫 | Ankle & Foot | (無分期) | 全部 | 補充動作庫，非疾病處方。獨立呈現於踝足區，不混入膝部。 |

---

## 三、 系統前端防護機制 (UI Guardrails)

1. **分期不完整警示橫幅 (`Phase-Incomplete Alert`)**：
   - 當治療師或患者進入上述 9 種病症詳情頁時，系統會在上方顯示警示：「⚠️ 此病症在原始教材中僅收錄部分分期（如僅 Phase 2 或 Phase 3），非完整 4 期協定。臨床操作請配合個別化評估補足其餘分期。」
2. **禁忌症空白防禦**：
   - 若特定動作在原始講義未載明禁忌症，系統**嚴禁假造禁忌症**，而是載明全域臨床防護免責宣告，提醒使用者在急性劇痛或未診斷狀態下尋求治療師評估。
