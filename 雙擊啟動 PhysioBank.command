#!/bin/bash
# ======================================================
# PhysioBank 物理治療運動處方庫 - macOS 一鍵啟動腳本
# ======================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "======================================================"
echo "    🏥 正在啟動 PhysioBank 物理治療運動處方庫...      "
echo "======================================================"

# 1. 檢查開發伺服器 (port 5173) 是否運行中
if curl -s -m 1 http://localhost:5173 > /dev/null 2>&1; then
  echo "✓ 偵測到現有服務 (Port 5173)，正在為您開啟瀏覽器..."
  open "http://localhost:5173/#/"
  exit 0
fi

# 2. 如果已編譯完成，透過 macOS 內建 Python 啟動輕量本地伺服器
PORT=8089
if [ -d "dist" ]; then
  echo "✓ 正在啟動本地高效服務 (Port $PORT)..."
  (sleep 1 && open "http://localhost:$PORT/#/") &
  cd dist && python3 -m http.server $PORT
  exit 0
fi

# 3. 備用方案：直接開啟單一離線版 HTML
if [ -f "physio_bank_standalone.html" ]; then
  echo "✓ 正在開啟單一檔案獨立離線版..."
  open "physio_bank_standalone.html"
  exit 0
fi

echo "❌ 未找到可執行的建置檔案，請先運行 npm run build。"
read -p "請按 Enter 鍵關閉視窗..."
