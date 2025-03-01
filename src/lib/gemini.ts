'use client';

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// 系統提示詞
const SYSTEM_PROMPT = `
你是一位友善、樂於助人的 Microsoft Excel 教師，專注於解答 Excel 相關問題。
你會根據學習科學原則，循序漸進地引導學生學習。

請使用 Markdown 格式來組織你的回覆：
- 使用 # ## ### 等標題層級
- 使用 * 或 - 來建立列表
- 使用 **粗體** 來強調重要概念
- 使用 \`code\` 來標示 Excel 函數或公式
- 使用 > 引用區塊來顯示重要提示
- 使用 --- 分隔線來區分不同段落
- 適當使用表格來組織資訊

#教學策略：
1. 理解學生的問題：務必確認理解學生的需求，必要時提出 clarifying questions。
2. 分步指導：不要直接提供答案，而是引導學生找到解決方案。
    * 提供提示和線索：引導學生思考相關的 Excel 功能和概念。
    * 使用示例和演示：用簡單的例子說明如何應用特定功能。
    * 推薦學習資源：提供官方文檔或其他學習資源的鏈接。

3. 鼓勵主動學習：鼓勵學生嘗試不同方法並分析結果，例如：
    * 提問："你認為哪個函數最適合這個任務？為什麼？"
    * 提問："嘗試修改一下公式，看看結果會如何變化？"
    * 提問："你能解釋一下這個公式是如何工作的嗎？"

4. 控制認知負荷：將複雜任務分解成更小、易於管理的步驟，並根據學生的學習進度調整指導難度。一次只提出一個問題。

5. 促進元認知：引導學生反思學習過程，例如：
    * 提問："你覺得你在這個過程中學到了什麼？"
    * 提問："你覺得哪些方面你掌握得比較好？哪些方面還需要改進？"
    * 提問："你下次遇到類似問題時，會如何應對？"

#限制
- 如果學生偏離主題，請溫和地將他們引導回 Excel 相關話題。
- 請以繁體中文進行回覆。
- 請勿提供完整代碼或公式，除非學生已經理解了基本概念並嘗試過自己解決問題。重點是引導學生理解和應用，而不是直接給出答案。
- 每次回覆都必須使用 Markdown 格式。
`;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

// 驗證 API key 格式
function isValidApiKey(apiKey: string): boolean {
  // Gemini API keys 通常以 "AIza" 開頭
  return apiKey.startsWith('AIza') && apiKey.length > 30;
}

export async function initializeGemini(apiKey: string): Promise<void> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!isValidApiKey(apiKey)) {
    throw new Error('Invalid API key format. API key should start with "AIza" and be longer than 30 characters.');
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "learnlm-1.5-pro-experimental" });
    console.log('Gemini API initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error);
    throw error;
  }
}

export async function getChatResponse(message: string): Promise<string> {
  if (!genAI || !model) {
    console.error('Gemini API not initialized');
    return '# 系統錯誤\n\n> 抱歉，AI 助教目前無法使用。請確認系統設定是否正確。';
  }

  try {
    console.log('Creating chat with message:', message);
    
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "我明白了，我會按照這些指導原則來扮演Excel教師，幫助學生學習。我會使用 Markdown 格式來組織我的回覆，確保內容清晰易讀。" }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    console.log('Sending message to chat...');
    const result = await chat.sendMessage(message);
    console.log('Received response from chat');
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat response:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.message.includes('API_KEY_INVALID')) {
        return '# 錯誤：API 金鑰無效\n\n> 抱歉，AI 助教的 API 金鑰無效。請聯繫系統管理員。';
      } else if (error.message.includes('not found') || error.message.includes('not supported')) {
        return '# 錯誤：模型不可用\n\n> 抱歉，AI 模型暫時無法使用。請聯繫系統管理員檢查模型配置。';
      } else if (error.message.includes('PERMISSION_DENIED')) {
        return '# 錯誤：權限不足\n\n> 抱歉，目前沒有權限使用此 AI 模型。請聯繫系統管理員確認 API 金鑰權限。';
      }
    }
    return '# 系統錯誤\n\n> 抱歉，我現在無法回應。請稍後再試。';
  }
}