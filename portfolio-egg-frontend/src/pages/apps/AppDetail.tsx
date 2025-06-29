import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Star,
  Github,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  Edit,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type AppDetail as AppDetailType, type CreateFeedbackData } from "@/lib/api";

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [app, setApp] = useState<AppDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState<CreateFeedbackData>({
    comment: "",
    design_score: 0,
    usability_score: 0,
    creativity_score: 0,
    usefulness_score: 0,
    overall_score: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAppDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await api.apps.get(parseInt(id));
        setApp(data);
      } catch (error) {
        console.error('アプリ詳細の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppDetail();
  }, [id]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!app || !isAuthenticated) return;

    // 最新のバージョンにフィードバックを投稿
    const latestVersion = app.app_versions[0];
    if (!latestVersion) return;

    setIsSubmitting(true);

    try {
      await api.feedbacks.create(latestVersion.id, feedbackForm);
      alert("フィードバックを投稿しました！");
      
      // フォームをリセット
      setFeedbackForm({
        comment: "",
        design_score: 0,
        usability_score: 0,
        creativity_score: 0,
        usefulness_score: 0,
        overall_score: 0,
      });

      // アプリデータを再取得
      const updatedData = await api.apps.get(parseInt(id!));
      setApp(updatedData);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        alert("エラー: " + Object.values(error.response.data.errors).flat().join(', '));
      } else {
        alert("投稿に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVersionExpansion = (versionId: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          disabled={readonly}
        >
          <Star className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "1時間未満前";
    if (diffInHours < 24) return `${diffInHours}時間前`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">アプリが見つかりません</p>
          <Link to="/" className="text-blue-600 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">アプリ詳細</h1>
            </div>
            {app.is_owner && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/apps/${id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    編集
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/apps/${id}/versions/new`}>バージョン追加</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* アプリ基本情報 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-2xl text-left">{app.title}</CardTitle>
                      <Badge variant="secondary">{app.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{app.feedback_count} フィードバック</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <img
                  src={app.thumbnail_url || "/placeholder.svg"}
                  alt={app.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />

                {/* アクションボタン */}
                <div className="flex space-x-4 mb-6">
                  {app.deploy_url && (
                    <Button asChild className="flex-1">
                      <a href={app.deploy_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        アプリを開く
                      </a>
                    </Button>
                  )}
                  {app.github_url && (
                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                      <a href={app.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>

                {/* 説明文 */}
                <div className="text-left">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{app.description}</pre>
                </div>
              </CardContent>
            </Card>

            {/* バージョン履歴 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-left">バージョン履歴</CardTitle>
                <CardDescription className="text-left">アプリの更新履歴とフィードバック</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {app.app_versions.map((version) => (
                    <Collapsible
                      key={version.id}
                      open={expandedVersions.has(version.id)}
                      onOpenChange={() => toggleVersionExpansion(version.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-left">v{version.version_number}</h4>
                              <p className="text-sm text-gray-500 text-left">
                                {formatDate(version.release_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                              {version.feedbacks.length} フィードバック
                            </div>
                            {expandedVersions.has(version.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 border-t">
                          {/* 変更履歴 */}
                          <div className="mb-6">
                            <h5 className="font-semibold mb-2 text-left">変更履歴</h5>
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-3 rounded text-left">
                              {version.changelog}
                            </pre>
                          </div>

                          {/* フィードバック一覧 */}
                          <div>
                            <h5 className="font-semibold mb-4 text-left">フィードバック</h5>
                            {version.feedbacks.length > 0 ? (
                              <div className="space-y-4">
                                {version.feedbacks.map((feedback) => (
                                  <div key={feedback.id} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src="/placeholder.svg" alt={feedback.user.username} />
                                          <AvatarFallback>{feedback.user.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium text-left">{feedback.user.username}</p>
                                          <p className="text-sm text-gray-500 text-left">
                                            {formatRelativeTime(feedback.created_at)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{feedback.overall_score}</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-3 text-left">{feedback.comment}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">デザイン</span>
                                        <span>{feedback.design_score}/5</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">使いやすさ</span>
                                        <span>{feedback.usability_score}/5</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">創造性</span>
                                        <span>{feedback.creativity_score}/5</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">有用性</span>
                                        <span>{feedback.usefulness_score}/5</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">まだフィードバックがありません</p>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* フィードバック投稿フォーム */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">フィードバックを投稿</CardTitle>
                  <CardDescription className="text-left">
                    このアプリについての感想や改善点を教えてください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-left mb-2">コメント</label>
                      <Textarea
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="アプリについての感想や改善点を書いてください..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">デザイン</label>
                        <StarRating
                          rating={feedbackForm.design_score}
                          onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, design_score: rating }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">使いやすさ</label>
                        <StarRating
                          rating={feedbackForm.usability_score}
                          onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, usability_score: rating }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">創造性</label>
                        <StarRating
                          rating={feedbackForm.creativity_score}
                          onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, creativity_score: rating }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">有用性</label>
                        <StarRating
                          rating={feedbackForm.usefulness_score}
                          onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, usefulness_score: rating }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-left mb-2">総合評価</label>
                      <StarRating
                        rating={feedbackForm.overall_score}
                        onRatingChange={(rating) => setFeedbackForm(prev => ({ ...prev, overall_score: rating }))}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-spin" />
                          投稿中...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          フィードバックを投稿
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">フィードバックを投稿</CardTitle>
                  <CardDescription className="text-left">フィードバックを投稿するにはログインが必要です</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">このアプリにフィードバックを投稿するには、アカウントが必要です。</p>
                  <div className="flex space-x-4">
                    <Button asChild>
                      <Link to="/login">ログイン</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/signup">新規登録</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 開発者情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-left">開発者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/placeholder.svg" alt={app.user.username} />
                    <AvatarFallback>{app.user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-left">{app.user.username}</h4>
                    <p className="text-sm text-gray-500 text-left">開発者</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">投稿日: {formatDate(app.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">最終更新: {formatDate(app.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 統計情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-left">統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総合評価</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{app.overall_score}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">フィードバック数</span>
                    <span className="font-medium">{app.feedback_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">バージョン数</span>
                    <span className="font-medium">{app.app_versions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 