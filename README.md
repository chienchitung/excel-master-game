# Excel Master Game 互動式學習平台

這是一個基於 Next.js 開發的互動式 Excel 學習平台，旨在通過遊戲化的方式幫助用戶學習 Excel 的各種函數和數據分析技巧。

## 功能特點

- 🎮 遊戲化學習體驗
  - 關卡式學習進度
  - 星星獎勵系統
  - 經驗值和等級提升
  - 每日學習目標
  - 學習連續打卡

- 🤖 AI 助教支援
  - 即時問答功能
  - 智能學習指導
  - 隨時可用的懸浮按鈕

- 📚 完整的課程內容
  - 基礎函數入門
  - VLOOKUP 函數應用
  - IF 條件函數
  - 樞紐分析表
  - 綜合測驗

- 💫 響應式設計
  - 支援桌面、平板和手機
  - 優化的使用者介面
  - 流暢的動畫效果

## 專案結構

```
src/
├── app/                    # Next.js 應用程式主要目錄
│   ├── layout.tsx         # 全局布局組件
│   ├── page.tsx           # 首頁組件
│   └── lessons/[id]/      # 課程頁面
├── components/            # UI 組件
│   └── ui/
│       ├── button.tsx     # 按鈕組件
│       └── ...           # 其他 UI 組件
├── data/                  # 數據文件
│   └── lessons.ts        # 課程內容配置
├── lib/                   # 工具函數
│   └── progress.ts       # 進度管理邏輯
└── types/                # TypeScript 類型定義
    └── lesson.ts         # 課程相關類型
```

## 技術棧

- **框架**: Next.js 14
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **字體**: Geist Font
- **圖標**: Lucide Icons
- **狀態管理**: React Hooks + LocalStorage

## 開始使用

1. 安裝依賴：
```bash
npm install
```

2. 運行開發服務器：
```bash
npm run dev
```

3. 打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 學習路徑

1. **基礎函數入門**
   - SUM、AVERAGE、COUNT 等基礎函數
   - 實際應用場景
   - 互動練習

2. **VLOOKUP 函數應用**
   - 函數語法和參數
   - 查找技巧
   - 實戰練習

3. **IF 條件函數**
   - 條件判斷
   - 巢狀 IF 函數
   - 實例演練

4. **樞紐分析表**
   - 創建和使用方法
   - 數據分析技巧
   - 實務應用

5. **綜合測驗**
   - 知識整合
   - 實戰挑戰
   - 技能驗證

## 部署

本專案可以輕鬆部署到 Vercel 平台：

1. Fork 本專案到你的 GitHub
2. 在 Vercel 中導入專案
3. 自動部署完成

## 開發團隊

- 設計與開發：Jackie Tung
- 技術支援：Cursor AI

## 授權

本專案採用 MIT 授權條款
