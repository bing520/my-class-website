import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface FormData {
  studentName: string;
  positiveTraits: string[];
  weaknesses: string[];
  impressivePoints: string;
  suggestions: string[];
}

export default function ReviewGenerator() {
  const { user } = useAuth();
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

  // 取得預設選項
  const { data: options, isLoading: optionsLoading } = trpc.review.getOptions.useQuery();

  // 生成評語
  const generateMutation = trpc.review.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedReview(data.review);
      setUsedQuotes(data.usedQuotes);
      toast.success("評語生成成功！");
    },
    onError: (error) => {
      toast.error(`生成失敗: ${error.message}`);
    },
  });

  const handleAddTrait = () => {
    if (customTrait.trim()) {
      setFormData({
        ...formData,
        positiveTraits: [...formData.positiveTraits, customTrait],
      });
      setCustomTrait("");
    }
  };

  const handleRemoveTrait = (index: number) => {
    setFormData({
      ...formData,
      positiveTraits: formData.positiveTraits.filter((_, i) => i !== index),
    });
  };

  const handleAddWeakness = () => {
    if (customWeakness.trim()) {
      setFormData({
        ...formData,
        weaknesses: [...formData.weaknesses, customWeakness],
      });
      setCustomWeakness("");
    }
  };

  const handleRemoveWeakness = (index: number) => {
    setFormData({
      ...formData,
      weaknesses: formData.weaknesses.filter((_, i) => i !== index),
    });
  };

  const handleAddSuggestion = () => {
    if (customSuggestion.trim()) {
      setFormData({
        ...formData,
        suggestions: [...formData.suggestions, customSuggestion],
      });
      setCustomSuggestion("");
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setFormData({
      ...formData,
      suggestions: formData.suggestions.filter((_, i) => i !== index),
    });
  };

  const handleGenerateReview = async () => {
    if (!formData.studentName.trim()) {
      toast.error("請輸入學生名稱");
      return;
    }

    if (formData.positiveTraits.length === 0) {
      toast.error("請至少選擇一個正向特質");
      return;
    }

    if (!formData.impressivePoints.trim()) {
      toast.error("請輸入令人印象深刻的地方");
      return;
    }

    generateMutation.mutate(formData);
  };

  const handleCopyReview = () => {
    if (generatedReview) {
      navigator.clipboard.writeText(generatedReview);
      setCopied(true);
      toast.success("已複製到剪貼板");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReview = () => {
    if (generatedReview) {
      const element = document.createElement("a");
      const file = new Blob([generatedReview], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${formData.studentName}_評語.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("已下載評語");
    }
  };

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">國小學生正向評語生成器</h1>
          <p className="text-muted-foreground">
            根據學生特質和表現，快速生成正向輔導性的評語
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側表單 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 學生名稱 */}
            <Card>
              <CardHeader>
                <CardTitle>學生基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studentName">學生名稱</Label>
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
                </div>
              </CardContent>
            </Card>

            {/* 正向特質 */}
            <Card>
              <CardHeader>
                <CardTitle>正向特質</CardTitle>
                <CardDescription>選擇或輸入學生的正向特質（可多選）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.positiveTraits.map((trait, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleRemoveTrait(index)}
                    >
                      {trait} ×
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>預設特質</Label>
                  <div className="flex flex-wrap gap-2">
                    {options?.positiveTraits.map((trait) => (
                      <Badge
                        key={trait}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          if (!formData.positiveTraits.includes(trait)) {
                            setFormData({
                              ...formData,
                              positiveTraits: [...formData.positiveTraits, trait],
                            });
                          }
                        }}
                      >
                        + {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="輸入自訂特質"
                    value={customTrait}
                    onChange={(e) => setCustomTrait(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTrait()}
                  />
                  <Button onClick={handleAddTrait} variant="outline">
                    新增
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 缺點 */}
            <Card>
              <CardHeader>
                <CardTitle>需要改進的地方</CardTitle>
                <CardDescription>選擇或輸入學生需要改進的地方（可多選）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.weaknesses.map((weakness, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleRemoveWeakness(index)}
                    >
                      {weakness} ×
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>預設缺點</Label>
                  <div className="flex flex-wrap gap-2">
                    {options?.weaknesses.map((weakness) => (
                      <Badge
                        key={weakness}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          if (!formData.weaknesses.includes(weakness)) {
                            setFormData({
                              ...formData,
                              weaknesses: [...formData.weaknesses, weakness],
                            });
                          }
                        }}
                      >
                        + {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="輸入自訂缺點"
                    value={customWeakness}
                    onChange={(e) => setCustomWeakness(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddWeakness()}
                  />
                  <Button onClick={handleAddWeakness} variant="outline">
                    新增
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 令人印象深刻之處 */}
            <Card>
              <CardHeader>
                <CardTitle>令人印象深刻的地方</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="描述學生令人印象深刻的表現或成就"
                  value={formData.impressivePoints}
                  onChange={(e) =>
                    setFormData({ ...formData, impressivePoints: e.target.value })
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* 建議 */}
            <Card>
              <CardHeader>
                <CardTitle>建議</CardTitle>
                <CardDescription>選擇或輸入對學生的建議（可多選）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => handleRemoveSuggestion(index)}
                    >
                      {suggestion} ×
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>預設建議</Label>
                  <div className="flex flex-wrap gap-2">
                    {options?.suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          if (!formData.suggestions.includes(suggestion)) {
                            setFormData({
                              ...formData,
                              suggestions: [...formData.suggestions, suggestion],
                            });
                          }
                        }}
                      >
                        + {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="輸入自訂建議"
                    value={customSuggestion}
                    onChange={(e) => setCustomSuggestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSuggestion()}
                  />
                  <Button onClick={handleAddSuggestion} variant="outline">
                    新增
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 生成按鈕 */}
            <Button
              onClick={handleGenerateReview}
              disabled={generateMutation.isPending}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                "生成評語"
              )}
            </Button>
          </div>

          {/* 右側預覽 */}
          <div className="lg:col-span-1">
            {generatedReview ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>評語預覽</CardTitle>
                  <CardDescription>{formData.studentName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{generatedReview}</Streamdown>
                  </div>

                  {usedQuotes.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-2">引用的名言</h4>
                      <div className="space-y-2">
                        {usedQuotes.map((quote, index) => (
                          <div key={index} className="text-xs italic text-muted-foreground">
                            <p>"{quote.text}"</p>
                            <p className="text-right">— {quote.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCopyReview}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          已複製
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          複製
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadReview}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下載
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    填寫左側表單並點擊「生成評語」按鈕，評語將在此顯示
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
