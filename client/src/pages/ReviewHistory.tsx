import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Download, Trash2, Edit2, Save, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewHistory() {
  const { user } = useAuth();
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState("");

  // 取得評語列表
  const { data: reviews, isLoading, refetch } = trpc.review.list.useQuery();

  // 刪除評語
  const deleteMutation = trpc.review.delete.useMutation({
    onSuccess: () => {
      toast.success("評語已刪除");
      refetch();
      setSelectedReviewId(null);
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  // 更新評語
  const updateMutation = trpc.review.update.useMutation({
    onSuccess: () => {
      toast.success("評語已更新");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗: ${error.message}`);
    },
  });

  const selectedReview = reviews?.find((r) => r.id === selectedReviewId);

  const handleCopyReview = (review: string) => {
    navigator.clipboard.writeText(review);
    toast.success("已複製到剪貼板");
  };

  const handleDownloadReview = (studentName: string, review: string) => {
    const element = document.createElement("a");
    const file = new Blob([review], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${studentName}_評語.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("已下載評語");
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm("確定要刪除這份評語嗎？")) {
      deleteMutation.mutate({ id: reviewId });
    }
  };

  const handleEditReview = () => {
    if (selectedReview) {
      setEditedReview(selectedReview.generatedReview);
      setIsEditing(true);
    }
  };

  const handleSaveReview = () => {
    if (selectedReview && editedReview.trim()) {
      updateMutation.mutate({ id: selectedReview.id, generatedReview: editedReview });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReview("");
  };

  if (isLoading) {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">評語歷史記錄</h1>
          <p className="text-muted-foreground">
            查看和管理之前生成的評語
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <p className="text-center text-muted-foreground">
                還沒有生成過評語。前往
                <a href="/" className="text-accent hover:underline mx-1">
                  評語生成器
                </a>
                開始創建。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 評語列表 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>評語列表</CardTitle>
                  <CardDescription>{reviews.length} 份評語</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {reviews.map((review) => (
                    <button
                      key={review.id}
                      onClick={() => {
                        setSelectedReviewId(review.id);
                        setIsEditing(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedReviewId === review.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{review.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("zh-TW")}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 評語詳情 */}
            <div className="lg:col-span-2">
              {selectedReview ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedReview.studentName}</CardTitle>
                        <CardDescription>
                          {new Date(selectedReview.createdAt).toLocaleString("zh-TW")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 學生信息 */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">正向特質</h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(selectedReview.positiveTraits).map(
                            (trait: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {trait}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">可以改進的地方</h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(selectedReview.weaknesses).map(
                            (weakness: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {weakness}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">令人印象深刻的地方</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedReview.impressivePoints || "（未提供）"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">建議</h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(selectedReview.suggestions).map(
                            (suggestion: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {suggestion}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 生成的評語 */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-2">生成的評語</h4>
                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editedReview}
                            onChange={(e) => setEditedReview(e.target.value)}
                            className="min-h-32"
                            placeholder="編輯評語..."
                          />
                          <div className="bg-accent/10 p-3 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">字數統計：</span>
                              <span className="text-foreground font-bold">{editedReview.length}</span> 字
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none bg-card p-4 rounded-lg mb-3">
                            <Streamdown>{selectedReview.generatedReview}</Streamdown>
                          </div>
                          <div className="bg-accent/10 p-3 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">字數統計：</span>
                              <span className="text-foreground font-bold">{selectedReview.generatedReview.length}</span> 字
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 引用的名言 */}
                    {!isEditing && JSON.parse(selectedReview.usedQuotes).length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">引用的名言</h4>
                        <div className="space-y-2">
                          {JSON.parse(selectedReview.usedQuotes).map(
                            (quote: any, index: number) => (
                              <div key={index} className="text-xs italic text-muted-foreground">
                                <p>"{quote.text}"</p>
                                <p className="text-right">— {quote.author}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div className="flex gap-2 pt-4 border-t">
                      {isEditing ? (
                        <>
                          <Button
                            onClick={handleSaveReview}
                            variant="default"
                            size="sm"
                            className="flex-1"
                            disabled={updateMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            disabled={updateMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-1" />
                            取消
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={handleEditReview}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            編輯
                          </Button>
                          <Button
                            onClick={() => handleCopyReview(selectedReview.generatedReview)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            複製
                          </Button>
                          <Button
                            onClick={() =>
                              handleDownloadReview(
                                selectedReview.studentName,
                                selectedReview.generatedReview
                              )
                            }
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            下載
                          </Button>
                          <Button
                            onClick={() => handleDeleteReview(selectedReview.id)}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            刪除
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-12 pb-12">
                    <p className="text-center text-muted-foreground">
                      選擇左側的評語查看詳情
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
