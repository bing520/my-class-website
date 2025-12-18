import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { generateReviewWithLLM, extractUsedQuotes } from "@/lib/llm";
import { QUOTES, POSITIVE_TRAITS, WEAKNESSES, SUGGESTIONS } from "@/lib/presets";

interface FormData {
  studentName: string;
  positiveTraits: string[];
  weaknesses: string[];
  impressivePoints: string;
  suggestions: string[];
}

export default function ReviewGenerator() {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    positiveTraits: [],
    weaknesses: [],
    impressivePoints: "",
    suggestions: [],
  });

  const [customTrait, setCustomTrait] = useState("");
  const [customWeakness, setCustomWeakness] = useState("");
  const [customSuggestion, setCustomSuggestion] = useState("");

  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [usedQuotes, setUsedQuotes] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 新增正向特質
  const addTrait = (trait: string) => {
    if (!formData.positiveTraits.includes(trait)) {
      setFormData({
        ...formData,
        positiveTraits: [...formData.positiveTraits, trait],
      });
    }
  };

  // 移除正向特質
  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      positiveTraits: formData.positiveTraits.filter((t) => t !== trait),
    });
  };

  // 新增自訂特質
  const addCustomTrait = () => {
    if (customTrait.trim()) {
      addTrait(customTrait);
      setCustomTrait("");
    }
  };

  // 新增缺點
  const addWeakness = (weakness: string) => {
    if (!formData.weaknesses.includes(weakness)) {
      setFormData({
        ...formData,
        weaknesses: [...formData.weaknesses, weakness],
      });
    }
  };

  // 移除缺點
  const removeWeakness = (weakness: string) => {
    setFormData({
      ...formData,
      weaknesses: formData.weaknesses.filter((w) => w !== weakness),
    });
  };

  // 新增自訂缺點
  const addCustomWeakness = () => {
    if (customWeakness.trim()) {
      addWeakness(customWeakness);
      setCustomWeakness("");
    }
  };

  // 新增建議
  const addSuggestion = (suggestion: string) => {
    if (!formData.suggestions.includes(suggestion)) {
      setFormData({
        ...formData,
        suggestions: [...formData.suggestions, suggestion],
      });
    }
  };

  // 移除建議
  const removeSuggestion = (suggestion: string) => {
    setFormData({
      ...formData,
      suggestions: formData.suggestions.filter((s) => s !== suggestion),
    });
  };

  // 新增自訂建議
  const addCustomSuggestion = () => {
    if (customSuggestion.trim()) {
      addSuggestion(customSuggestion);
      setCustomSuggestion("");
    }
  };

  // 生成評語
  const handleGenerateReview = async () => {
    if (!formData.studentName.trim()) {
      toast.error("請輸入學生名稱");
      return;
    }

    if (formData.positiveTraits.length === 0) {
      toast.error("請選擇至少一個正向特質");
      return;
    }

    if (formData.weaknesses.length === 0) {
      toast.error("請選擇至少一個可以改進的地方");
      return;
    }

    if (formData.suggestions.length === 0) {
      toast.error("請選擇至少一個建議");
      return;
    }

    setIsGenerating(true);
    try {
      const review = await generateReviewWithLLM(
        formData.studentName,
        formData.positiveTraits,
        formData.weaknesses,
        formData.impressivePoints || undefined,
        formData.suggestions,
        QUOTES
      );

      setGeneratedReview(review);
      const quotes = extractUsedQuotes(review, QUOTES);
      setUsedQuotes(quotes);
      toast.success("評語生成成功！");
    } catch (error) {
      console.error("評語生成失敗:", error);
      toast.error("評語生成失敗，請稍後重試");
    } finally {
      setIsGenerating(false);
    }
  };

  // 複製評語
  const handleCopyReview = () => {
    if (generatedReview) {
      navigator.clipboard.writeText(generatedReview);
      setCopied(true);
      toast.success("已複製到剪貼板");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 計算字數
  const wordCount = generatedReview ? generatedReview.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            國小學生正向評語生成器
          </h1>
          <p className="text-gray-600 text-lg">
            根據學生特質表現，快速生成正向輔導性評語
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：輸入表單 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 學生基本信息 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>學生基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="studentName" className="text-sm font-semibold">
                      學生名稱
                    </Label>
                    <Input
                      id="studentName"
                      placeholder="輸入學生名稱"
                      value={formData.studentName}
                      onChange={(e) =>
                        setFormData({ ...formData, studentName: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 正向特質 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>正向特質</CardTitle>
                  <CardDescription>
                    選擇或輸入學生的正向特質（可多選）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.positiveTraits.map((trait, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTrait(trait)}
                      >
                        {trait} ✕
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="輸入自訂特質"
                        value={customTrait}
                        onChange={(e) => setCustomTrait(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addCustomTrait();
                          }
                        }}
                      />
                      <Button onClick={addCustomTrait} variant="outline">
                        新增
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {POSITIVE_TRAITS.map((trait) => (
                      <Button
                        key={trait}
                        variant={
                          formData.positiveTraits.includes(trait)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => addTrait(trait)}
                        className="text-xs h-auto py-1"
                      >
                        + {trait}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 可以改進的地方 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>可以改進的地方</CardTitle>
                  <CardDescription>
                    選擇或輸入學生可以繌續加強的領域（可多選）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.weaknesses.map((weakness, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeWeakness(weakness)}
                      >
                        {weakness} ✕
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="輸入自訂改進地方"
                        value={customWeakness}
                        onChange={(e) => setCustomWeakness(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addCustomWeakness();
                          }
                        }}
                      />
                      <Button onClick={addCustomWeakness} variant="outline">
                        新增
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {WEAKNESSES.map((weakness) => (
                      <Button
                        key={weakness}
                        variant={
                          formData.weaknesses.includes(weakness)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => addWeakness(weakness)}
                        className="text-xs h-auto py-1"
                      >
                        + {weakness}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 令人印象深刻的地方 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>令人印象深刻的地方</CardTitle>
                  <CardDescription>
                    描述學生令人印象深刻的特點或事蹟（可選）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="例如：在班級活動中展現出色的領導力，或在某個學科上有突出的表現"
                    value={formData.impressivePoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        impressivePoints: e.target.value,
                      })
                    }
                    className="min-h-24"
                  />
                </CardContent>
              </Card>

              {/* 建議 */}
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>建議</CardTitle>
                  <CardDescription>
                    選擇或輸入給學生的建議（可多選）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeSuggestion(suggestion)}
                      >
                        {suggestion} ✕
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="輸入自訂建議"
                        value={customSuggestion}
                        onChange={(e) => setCustomSuggestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addCustomSuggestion();
                          }
                        }}
                      />
                      <Button onClick={addCustomSuggestion} variant="outline">
                        新增
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant={
                          formData.suggestions.includes(suggestion)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => addSuggestion(suggestion)}
                        className="text-xs h-auto py-1"
                      >
                        + {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 生成按鈕 */}
              <Button
                onClick={handleGenerateReview}
                disabled={isGenerating}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "生成評語"
                )}
              </Button>
            </div>
          </div>

          {/* 右側：評語預覽 */}
          <div className="lg:col-span-2">
            {generatedReview ? (
              <Card className="border-2 border-gray-300 shadow-lg h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{formData.studentName}</CardTitle>
                      <CardDescription>
                        評語預覽
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyReview}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          已複製
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          複製
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 評語內容 */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <Streamdown>{generatedReview}</Streamdown>
                  </div>

                  {/* 字數統計 */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">
                      字數統計：<span className="font-semibold text-blue-600">{wordCount}</span> 字
                    </p>
                  </div>

                  {/* 使用的名言 */}
                  {usedQuotes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700">使用的名言佳句</h4>
                      {usedQuotes.map((quote, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400"
                        >
                          <p className="text-gray-700 italic">"{quote.text}"</p>
                          <p className="text-sm text-gray-600 mt-2">— {quote.author}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-gray-300 shadow-lg h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">
                    填寫左側表單並點擊「生成評語」按鈕
                  </p>
                  <p className="text-gray-400">
                    系統將根據您的輸入生成正向輔導性評語
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
