/**
 * 前端 LLM 集成模組
 * 使用 Manus 內建 LLM API 生成評語
 */

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 調用 LLM API 生成評語
 */
export async function generateReviewWithLLM(
  studentName: string,
  positiveTraits: string[],
  weaknesses: string[],
  impressivePoints: string | undefined,
  suggestions: string[],
  quotes: Array<{ text: string; author: string }>
): Promise<string> {
  const quotesText = quotes
    .slice(0, 10)
    .map((q) => `- "${q.text}" - ${q.author}`)
    .join("\n");

  const impressivePointsText = impressivePoints
    ? `\n\n令人印象深刻的地方：\n${impressivePoints}`
    : "\n\n令人印象深刻的地方：\n（未提供，請根據學生的正向特質和建議推斷其可能的亮點）";

  const prompt = `請為以下學生撰寫一份正向輔導性的評語。評語字數必須严格控制在180-200字之間，不超過200字。不要在評語中包含字數統計。即使未提供令人印象深刻的地方，也應根據正向特質和建議撰寫完整的評語。

學生名稱：${studentName}

正向特質：
${positiveTraits.map((t) => `- ${t}`).join("\n")}

可以改進的地方：
${weaknesses.map((w) => `- ${w}`).join("\n")}${impressivePointsText}

建議：
${suggestions.map((s) => `- ${s}`).join("\n")}

可用的名言佳句（請在評語中適當引用1-2句）：
${quotesText}

請撰寫一份溫暖、鼓勵性的評語，融入適當的名言佳句，幫助學生和家長了解學生的優點和改進方向。`;

  const messages: LLMMessage[] = [
    {
      role: "system",
      content: `你是一位經驗豐富的國小教師，擅長撰寫正向、鼓勵性的學生評語。
你的評語應該：
1. 以正向積極的口吻，肯定學生的優點和進步
2. 用溫和、妥整的語氣提出學生可以繌續加強的領域
3. 融入適當的名言佳句，增加評語的啟發性
4. 結構清晰，邏輯連賫，語言簡潔易懂
5. 長度必須严格控制在180-200字之間，不超過200字
6. 避免使用過於複雜的詞彙，保持訪切感`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const response = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API 錯誤: ${response.statusText}`);
    }

    const data: LLMResponse = await response.json();
    const reviewText = data.choices[0]?.message.content || "";

    return reviewText;
  } catch (error) {
    console.error("LLM 調用失敗:", error);
    throw new Error("無法生成評語，請稍後重試");
  }
}

/**
 * 從評語中提取使用的名言
 */
export function extractUsedQuotes(
  reviewText: string,
  quotes: Array<{ text: string; author: string }>
): Array<{ text: string; author: string }> {
  const usedQuotes: Array<{ text: string; author: string }> = [];

  for (const quote of quotes) {
    // 檢查評語中是否包含名言的部分內容
    if (reviewText.includes(quote.text.substring(0, 20))) {
      usedQuotes.push(quote);
    }
  }

  return usedQuotes;
}
