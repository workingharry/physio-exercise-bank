# PhysioBank - 物理治療全身復健運動處方庫 (Whole-Body Rehabilitation Bank)

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

專為**物理治療系學生**、**臨床實習生**與**臨床教學導師**量身打造的現代化、全響應式運動處方庫與教學平台。提供嚴謹的解剖學標籤、生物力學運動學剖析、進退階決策樹、慢動作示範影片播放與可直接列印的 A4 居家運動計畫 (HEP)。

---

## 🌟 核心架構與功能亮點

### 1. 全身雙層解剖分類架構 (Whole-Body Taxonomy)
- **第一層：宏觀區域 (`MacroRegion`)**：
  - **【V1 核心資料庫】下肢 (`Lower Limb`)**：100% 完整收錄 **387 個** 實證臨床復健動作。
  - **【V2 擴充預留】上肢 (`Upper Limb`)**：肩胛、肘、腕手部動力鏈。
  - **【V3 擴充預留】脊椎與核心 (`Spine & Core`)**：頸椎、胸椎、腰椎薦髂與骨盆底肌。
  - **【V4 擴充預留】全身功能性 (`Full Body & Functional`)**：步態與全身敏捷訓練。
- **第二層：子區域 (`SubRegion`)**：
  - 腳踝與足部 (`Ankle & Foot`)：120 動作
  - 膝與髕股關節 (`Knee`)：147 動作
  - 髖與骨盆 (`Hip & Pelvis`)：120 動作
  - 下肢整合動力鏈 (`Lower Limb Kinetic Chain`)

### 2. 每個動作必備的四大核心模組
1. 🧬 **目標肌群與生物力學**：主動肌 (Prime Movers)、協同肌 (Synergists)、穩定肌、動作平面（矢狀面、額狀面、水平面、多平面）、開閉鎖動力鏈 (OKC/CKC)。
2. 📋 **分步動作指南**：起始姿勢、分步結構化指引 (Step 1, Step 2...)、臨床指導口訣 (Coaching Cues) 與常見代償錯誤 (Common Errors)。
3. 🖼️ **圖片示範與解剖向量圖**：關節生物力學解剖圖、分解動作圖片支援 Lightbox 點擊放大檢視。
4. 🎥 **慢動作影片播放器**：支援 YouTube / 本地影片示範，內建 **0.5x / 0.75x 慢動作播放**與**循環播放 (Loop Toggle)**，方便觀察關節力線細節。

### 3. 多視圖模組化功能
- **`/library` (首頁)**：全身部位雙層導覽、多屬性關鍵字即時模糊檢索、收縮型態/復健分期/器材多選抽屜。
- **`/exercise/:id`**：深度生物力學剖析、進退階決策樹、臨床劑量 (FITT) 與紅旗禁忌症警示。
- **`/protocols`**：預載下肢實證復健協定（外側踝扭傷 CAI、前十字韌帶重建 ACLR、急性膕旁肌拉傷 Askling L-Protocol），支援一鍵將整階段動作匯入處方。
- **`/builder`**：互動式病患處方組裝器，支援編輯組數/次數/維持秒數與衛教備註，並具備優化過的 **A4 列印 / 另存 PDF** 醫學版面。
- **`/custom`**：自訂運動工作室，可隨時為全身任何部位新增動作，並一鍵匯出 JSON 以提交至 GitHub。

---

## 🚀 本地端運行指南

### 環境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安裝步驟
```bash
# 1. 複製儲存庫
git clone https://github.com/your-username/physio-exercise-bank.git
cd physio-exercise-bank

# 2. 安裝依賴套件
npm install

# 3. 啟動開發伺服器
npm run dev
```

瀏覽器打開 `http://localhost:5173` 即可立即開始使用！

### 生產環境建置
```bash
npm run build
npm run preview
```

---

## 📁 專案目錄結構

```
physio-website/
├── src/
│   ├── components/
│   │   ├── common/           # VideoPlayer (慢動作/循環), Lightbox, AnatomySvgPlaceholder
│   │   ├── layout/           # Navbar, WholeBodyNav
│   │   ├── library/          # ExerciseCard, FilterDrawer, LibraryView
│   │   ├── detail/           # ExerciseDetailView
│   │   ├── protocols/        # ProtocolView
│   │   ├── builder/          # RoutineBuilderView
│   │   └── custom/           # CustomStudioView
│   ├── data/
│   │   ├── exercises.ts      # 387 個下肢運動資料庫導出
│   │   ├── protocols.ts      # 實證分期臨床協定 (Ankle, ACLR, Hamstring)
│   │   └── lowerLimbExercises.json
│   ├── types/
│   │   └── exercise.ts       # 全身可擴充之 TypeScript Schema
│   ├── store/
│   │   └── useRoutineStore.ts # LocalStorage 持久化狀態管理
│   ├── App.tsx               # 路由切換與主題模式
│   ├── main.tsx              # 應用程式入口
│   └── index.css             # Tailwind 樣式與 A4 @media print 列印樣式
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📄 授權條款與免責聲明

本專案採用 [MIT License](LICENSE) 開源授權。  
**臨床免責聲明**：本系統內容僅供物理治療學術教學、實習筆記與臨床研究複習參考，非直接醫療診斷替代方案。臨床處方應依據每位病患的個別評估進行客製化調整。
