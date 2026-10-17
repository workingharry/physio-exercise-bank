# PhysioBank v2 Domain Glossary

物理治療臨床運動處方庫 (PhysioBank v2) 之核心領域模型與術語規範。

## Clinical Taxonomy (臨床分類)

**Condition (病症)**:
單一經臨床鑑別之病理診斷或術候群（如「外側踝扭傷」、「前十字韌帶重建術後」），擁有專屬別名列表與分期定義。
_Avoid_: Diagnosis, Pathology, Disease, Issue

**Bundle (病症合集)**:
原始 docx 文檔中合併撰寫之相關病症群組（例如「脛後肌腱功能不全與三角韌帶扭傷」共用一份處方）。
_Avoid_: Group, Cluster, Category

**Rehab Phase (復健分期)**:
運動於特定病症下所處之組織癒合與功能推進時序（Phase 1 急性保護、Phase 2 次急性、Phase 3 肌力肥大、Phase 4 增強與重返運動）。
_Avoid_: Stage, Level, Step

## Evidence & Verification (實證與可信度)

**Evidence Level (標註依據分級)**:
運動與特定病症關聯之可信度等級，包含 `primary`（核心專屬）、`mentioned`（原文提及/跨病症關聯）、`group`（合集共用）與 `suggested-pending-review`（通用庫建議待審）。
_Avoid_: Trust score, Priority, Confidence

**Condition Context (病症特異性覆蓋)**:
同一運動在不同病症下產生力學差異時之專屬擺位、口訣、注意事項或劑量覆蓋值。
_Avoid_: Variant, Custom parameters, Dynamic override

**Generic Ankle Library (通用踝足庫)**:
非針對單一特定病理、適用於踝關節早期活動度與基底啟動之通用基礎運動集合（共 13 筆）。
_Avoid_: Baseline, General pool, Default exercises

## Navigation & Modes (導覽與模式)

**Search Mode (病症搜尋模式)**:
以使用者口語詞或醫學名詞即時檢索病症、直達分期處方之首頁預設模式。
_Avoid_: Symptom checker, Query mode

**Review Mode (部位瀏覽模式)**:
依解剖分區（踝足／膝／髖）與器材、動力鏈等多維條件進行百科條目探索之傳統瀏覽模式。
_Avoid_: Directory mode, Anatomy filter, Browse mode
