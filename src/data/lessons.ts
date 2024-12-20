import { Lesson } from '../types/lesson'

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "基礎函數入門",
    description: "學習 Excel 中最基本的 SUM、AVERAGE、COUNT 等函數",
    content: `
      <h2 class="text-xl font-semibold mb-4">基礎函數概述</h2>
      <p class="mb-4">在 Excel 中，基礎函數是處理數據的重要工具。讓我們來了解幾個最常用的函數：</p>
      
      <h3 class="text-lg font-semibold mb-2">SUM 函數</h3>
      <p class="mb-2">用於計算一組數值的總和。</p>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =SUM(number1, [number2], ...)
      </pre>
      <p class="mb-4">
        使用範例：
        - 計算月度銷售總額
        - 統計年度支出
        - 加總學生成績
      </p>
      
      <h3 class="text-lg font-semibold mb-2">AVERAGE 函數</h3>
      <p class="mb-2">計算一組數值的平均值。</p>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =AVERAGE(number1, [number2], ...)
      </pre>
      <p class="mb-4">
        常見應用：
        - 計算班級平均分數
        - 分析每月平均支出
        - 評估員工績效
      </p>

      <h3 class="text-lg font-semibold mb-2">COUNT 函數</h3>
      <p class="mb-2">計算一個範圍內包含數字的儲存格數量。</p>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =COUNT(value1, [value2], ...)
      </pre>
      <p class="mb-4">
        實用技巧：
        - 統計有效數據數量
        - 計算參與人數
        - 追蹤完成項目數
      </p>
      <p class="mb-4">注意：COUNT 函數只計算包含數字的儲存格，如果要計算所有非空儲存格，可以使用 COUNTA 函數。</p>
    `,
    excelExample: `
A1: 銷售額
A2: 100
A3: 200
A4: 300
A5: 400
A6: 500

B1: 函數示例
B2: =SUM(A2:A6)
B3: =AVERAGE(A2:A6)
B4: =COUNT(A2:A6)
    `,
    questions: [
      {
        id: 1,
        description: "根據範例數據，使用 SUM 函數計算 A2:A6 範圍內的總和",
        answer: "1500",
        hint: "請使用 =SUM(A2:A6) 函數"
      }
    ]
  },
  {
    id: 2,
    title: "VLOOKUP 函數應用",
    description: "掌握 VLOOKUP 函數的使用方法",
    content: `
      <h2 class="text-xl font-semibold mb-4">VLOOKUP 函數詳解</h2>
      <p class="mb-4">VLOOKUP 函數是 Excel 中最常用的查找函數之一，它可以在表格的第一列中查找指定的值，並返回該值所在行中其他列的值。</p>
      
      <h3 class="text-lg font-semibold mb-2">語法結構</h3>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
      </pre>
      
      <h3 class="text-lg font-semibold mb-2">參數說明</h3>
      <ul class="list-disc pl-6 mb-4">
        <li>lookup_value：要查找的值</li>
        <li>table_array：要在其中查找的範圍</li>
        <li>col_index_num：要返回的列號</li>
        <li>range_lookup：TRUE 表示近似匹配，FALSE 表示精確匹配</li>
      </ul>

      <h3 class="text-lg font-semibold mb-2">使用技巧</h3>
      <ul class="list-disc pl-6 mb-4">
        <li>確保查找範圍的第一列包含查找值</li>
        <li>使用 FALSE 進行精確匹配更安全</li>
        <li>注意列號從左到右從 1 開始計數</li>
      </ul>
    `,
    excelExample: `
A1: 產品代碼  B1: 產品名稱  C1: 單價
A2: P001      B2: 筆記本    C2: 50
A3: P002      B3: 鉛筆      C3: 10
A4: P003      B4: 橡皮擦    C4: 5

D1: 查找示例
D2: =VLOOKUP("P001", A2:C4, 3, FALSE)
    `,
    questions: [
      {
        id: 1,
        description: "使用 VLOOKUP 函數查找產品代碼 'P002' 的單價",
        answer: "10",
        hint: "使用 =VLOOKUP(\"P002\", A2:C4, 3, FALSE)"
      }
    ]
  },
  {
    id: 3,
    title: "IF 條件函數",
    description: "學習使用 IF 函數進行條件判斷",
    content: `
      <h2 class="text-xl font-semibold mb-4">IF 條件函數應用</h2>
      <p class="mb-4">IF 函數允許我們在 Excel 中進行條件判斷，根據不同條件返回不同的結果。</p>
      
      <h3 class="text-lg font-semibold mb-2">基本語法</h3>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =IF(logical_test, value_if_true, value_if_false)
      </pre>
      
      <h3 class="text-lg font-semibold mb-2">參數說明</h3>
      <ul class="list-disc pl-6 mb-4">
        <li>logical_test：要測試的條件</li>
        <li>value_if_true：條件為真時返回的值</li>
        <li>value_if_false：條件為假時返回的值</li>
      </ul>

      <h3 class="text-lg font-semibold mb-2">進階應用</h3>
      <p class="mb-2">巢狀 IF 函數：</p>
      <pre class="bg-gray-100 p-4 rounded-md mb-4 text-black">
        =IF(condition1, value1, IF(condition2, value2, value3))
      </pre>
    `,
    excelExample: `
A1: 分數  B1: 評級
A2: 85    B2: =IF(A2>=90,"優秀",IF(A2>=80,"良好",IF(A2>=60,"及格","不及格")))
A3: 92
A4: 78
A5: 45
    `,
    questions: [
      {
        id: 1,
        description: "使用 IF 函數判斷分數 75 的評級（>=90優秀，>=80良好，>=60及格，<60不及格）",
        answer: "及格",
        hint: "使用巢狀 IF 函數進行多條件判斷"
      }
    ]
  },
  {
    id: 4,
    title: "樞紐分析表",
    description: "學習創建和使用樞紐分析表",
    content: `
      <h2 class="text-xl font-semibold mb-4">樞紐分析表基礎</h2>
      <p class="mb-4">樞紐分析表是 Excel 中最強大的數據分析工具之一，可以快速匯總和分析大量數據。</p>
      
      <h3 class="text-lg font-semibold mb-2">創建步驟</h3>
      <ol class="list-decimal pl-6 mb-4">
        <li>選擇數據範圍</li>
        <li>插入樞紐分析表</li>
        <li>設置行和列</li>
        <li>選擇彙總方式</li>
      </ol>
      
      <h3 class="text-lg font-semibold mb-2">常用操作</h3>
      <ul class="list-disc pl-6 mb-4">
        <li>篩選數據</li>
        <li>更改彙總方式</li>
        <li>刷新數據</li>
        <li>設置格式</li>
      </ul>

      <h3 class="text-lg font-semibold mb-2">進階技巧</h3>
      <ul class="list-disc pl-6 mb-4">
        <li>使用計算欄位</li>
        <li>建立樞紐圖表</li>
        <li>分組數據</li>
        <li>使用切片器</li>
      </ul>
    `,
    excelExample: `
A1: 日期      B1: 部門    C1: 銷售額
A2: 2024/1/1  B2: 銷售部  C2: 1000
A3: 2024/1/1  B3: 市場部  C3: 800
A4: 2024/1/2  B4: 銷售部  C4: 1200
A5: 2024/1/2  B5: 市場部  C5: 900

樞紐分析表：
行：部門
列：日期
值：銷售額（總和）
    `,
    questions: [
      {
        id: 1,
        description: "根據範例數據，計算銷售部的總銷售額",
        answer: "2200",
        hint: "使用樞紐分析表或 SUMIF 函數"
      }
    ]
  },
  {
    id: 5,
    title: "綜合測驗",
    description: "測試您對所有 Excel 函數的掌握程度",
    content: "",
    showGame: true,
    isFinal: true,
    questions: [
      {
        id: 1,
        description: "請輸入遊戲完成後獲得的最終答案",
        answer: "12345",
        hint: "完成所有遊戲關卡後，您將獲得一個數字代碼"
      }
    ]
  }
] 