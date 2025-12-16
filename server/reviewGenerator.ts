/**
 * 評語生成服務
 * 使用 LLM 根據學生特質生成正向輔導性評語
 */

import { invokeLLM } from "./_core/llm";
import { getAllQuotes } from "./db";
import type { Quote } from "../drizzle/schema";

export interface ReviewGenerationInput {
  studentName: string;
  positiveTraits: string[];
  weaknesses: string[];
  impressivePoints?: string;
  suggestions: string[];
}

export interface GeneratedReview {
  review: string;
  usedQuotes: Quote[];
}

/**
 * 生成學生評語
 * 使用 LLM 根據輸入的學生特質生成正向輔導性評語
 */
export async function generateStudentReview(
  input: ReviewGenerationInput
): Promise<GeneratedReview> {
  const allQuotes = await getAllQuotes();

  // 構建提示詞
  const prompt = buildPrompt(input, allQuotes);

  // 調用 LLM
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `你是一位經驗豐富的國小教師，擅長撰寫正向、鼓勵性的學生評語。
你的評語應該：
1. 以正向積極的口吸，肯定學生的優點和進步
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
    ],
  });

  const content = response.choices[0]?.message.content;
  const reviewText = typeof content === "string" ? content : "";

  // 從評語中提取使用的名言
  const usedQuotes = extractUsedQuotes(reviewText, allQuotes);

  return {
    review: reviewText,
    usedQuotes,
  };
}

/**
 * 構建 LLM 提示詞
 */
function buildPrompt(input: ReviewGenerationInput, quotes: Quote[]): string {
  const quotesText = quotes
    .slice(0, 10)
    .map((q) => `- "${q.text}" - ${q.author}`)
    .join("\n");

  const impressivePointsText = input.impressivePoints
    ? `\n\n令人印象深刻的地方：\n${input.impressivePoints}`
    : "\n\n令人印象深刻的地方：\n（未提供，請根據學生的正向特質和建議推斷其可能的亮點）";

  return `請為以下學生撰寫一份正向輔導性的評語。評語字數必須严格控制在180-200字之間，不超過200字。即使未提供令人印象深刻的地方，也應根據正向特質和建議撰寫完整的評語。

學生名稱：${input.studentName}

正向特質：
${input.positiveTraits.map((t) => `- ${t}`).join("\n")}

需要改進的地方：
${input.weaknesses.map((w) => `- ${w}`).join("\n")}${impressivePointsText}

建議：
${input.suggestions.map((s) => `- ${s}`).join("\n")}

可用的名言佳句（請在評語中適當引用1-2句）：
${quotesText}

請撰寫一份溫暖、鼓勵性的評語，融入適當的名言佳句，幫助學生和家長了解學生的優點和改進方向。`;
}

/**
 * 從評語中提取使用的名言
 */
function extractUsedQuotes(reviewText: string, quotes: Quote[]): Quote[] {
  const usedQuotes: Quote[] = [];

  for (const quote of quotes) {
    // 檢查評語中是否包含名言的部分內容
    if (reviewText.includes(quote.text.substring(0, 20))) {
      usedQuotes.push(quote);
    }
  }

  return usedQuotes;
}

/**
 * 生成評語預覽（用於測試）
 */
export async function previewReview(input: ReviewGenerationInput): Promise<string> {
  const { review } = await generateStudentReview(input);
  return review;
}
