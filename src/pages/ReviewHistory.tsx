import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Review {
  id: string;
  studentName: string;
  positiveTraits: string[];
  weaknesses: string[];
  impressivePoints: string;
  suggestions: string[];
  review: string;
  createdAt: number;
}

export default function ReviewHistory() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // 從本地儲存載入評語
  useEffect(() => {
    const saved = localStorage.getItem("reviews");
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (error) {
        console.error("載入評語失敗:", error);
      }
    }
  }, []);

  // 選擇評語
  const handleSelectReview = (review: Review) => {
    setSelectedReview(review);
    setEditingId(null);
  };

  // 開始編輯
  const handleStartEdit = (review: Review) => {
    setEditingId(review.id);
    setEditingText(review.review);
  };

  // 保存編輯
  const handleSaveEdit = () => {
    if (editingId && selectedReview) {
      const updated = reviews.map((r) =>
        r.id === editingId ? { ...r, review: editingText } : r
      );
      setReviews(updated);
      localStorage.setItem("reviews", JSON.stringify(updated));
      setSelectedReview({ ...selectedReview, review: editingText });
      setEditingId(null);
      toast.success("評語已更新");
    }
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // 刪除評語
  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    localStorage.setItem("reviews", JSON.stringify(updated));
    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
    toast.success("評語已刪除");
  };

  // 計算字數
  const wordCount = selectedReview ? selectedReview.review.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            評語歷史記錄
          </h1>
          <p className="text-gray-600 text-lg">
            查看、編輯和管理已生成的評語
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card className="border-2 border-gray-300 shadow-lg">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                還沒有生成任何評語
              </p>
              <p className="text-gray-400">
                前往評語生成頁面生成第一份評語吧！
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：評語列表 */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardHeader>
                  <CardTitle>評語列表</CardTitle>
                  <CardDescription>
                    共 {reviews.length} 份評語
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {reviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => handleSelectReview(review)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedReview?.id === review.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <p className="font-semibold text-gray-800">
                          {review.studentName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("zh-TW")}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右側：評語詳情 */}
            <div className="lg:col-span-2">
              {selectedReview ? (
                <Card className="border-2 border-gray-300 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedReview.studentName}</CardTitle>
                        <CardDescription>
                          {new Date(selectedReview.createdAt).toLocaleString("zh-TW")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(selectedReview.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        刪除
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 學生信息 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">正向特質</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedReview.positiveTraits.map((trait, index) => (
                            <Badge key={index} variant="secondary">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">可以改進的地方</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedReview.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="outline">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedReview.impressivePoints && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          令人印象深刻的地方
                        </h4>
                        <p className="text-gray-700 text-sm bg-amber-50 p-3 rounded-lg">
                          {selectedReview.impressivePoints}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm mb-2">建議</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReview.suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="secondary">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 評語內容 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">評語內容</h4>
                        {!editingId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartEdit(selectedReview)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            編輯
                          </Button>
                        )}
                      </div>

                      {editingId === selectedReview.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="min-h-32"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              保存
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-3">
                            <Streamdown>{selectedReview.review}</Streamdown>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600">
                              字數統計：
                              <span className="font-semibold text-blue-600">
                                {wordCount}
                              </span>{" "}
                              字
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-gray-300 shadow-lg">
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      選擇一份評語查看詳情
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
