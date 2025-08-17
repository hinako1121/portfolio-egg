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
  ImageIcon,
  Twitter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type AppDetail as AppDetailType, type CreateFeedbackData, type Feedback } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [allExpanded, setAllExpanded] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [versionListOpen, setVersionListOpen] = useState(false);

  useEffect(() => {
    const fetchAppDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await api.apps.get(parseInt(id));
        setApp(data);
        
        // ログインユーザーの既存フィードバックを取得
        if (isAuthenticated && data.app_versions.length > 0) {
          const latestVersion = data.app_versions[0];
          try {
            const existingFeedback = await api.feedbacks.myFeedback(latestVersion.id);
            console.log('myFeedback API result:', existingFeedback);
            setExistingFeedback(existingFeedback);
            setHasExistingFeedback(!!existingFeedback);
            
            // 既存フィードバックがあればフォームに設定
            if (existingFeedback) {
              setFeedbackForm({
                comment: existingFeedback.comment,
                design_score: existingFeedback.design_score,
                usability_score: existingFeedback.usability_score,
                creativity_score: existingFeedback.creativity_score,
                usefulness_score: existingFeedback.usefulness_score,
                overall_score: existingFeedback.overall_score,
              });
            }
          } catch (error: any) {
            // 認証エラー（401）やその他のエラーは無視して続行
            if (error.response?.status === 401) {
              console.log('ユーザーが認証されていません');
            } else {
              console.error('既存フィードバックの取得に失敗しました:', error);
            }
            // エラーが発生してもアプリ詳細の表示は続行
          }
        }

        if (data.app_versions.length > 0) {
          setSelectedVersionId(data.app_versions[0].id);
        }
      } catch (error) {
        console.error('アプリ詳細の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppDetail();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (app && app.app_versions.length > 0) {
      setExpandedVersions(new Set([app.app_versions[0].id])); // 最新バージョンのみ展開
    }
  }, [app]);

  useEffect(() => {
    console.log('existingFeedback:', existingFeedback);
    if (existingFeedback) {
      setFeedbackForm({
        comment: existingFeedback.comment,
        design_score: existingFeedback.design_score,
        usability_score: existingFeedback.usability_score,
        creativity_score: existingFeedback.creativity_score,
        usefulness_score: existingFeedback.usefulness_score,
        overall_score: existingFeedback.overall_score,
      });
    }
    // 既存フィードバックがnullなら初期値に戻す
    else {
      setFeedbackForm({
        comment: "",
        design_score: 0,
        usability_score: 0,
        creativity_score: 0,
        usefulness_score: 0,
        overall_score: 0,
      });
    }
  }, [existingFeedback]);

  useEffect(() => {
    console.log('feedbackForm:', feedbackForm);
  }, [feedbackForm]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!app || !isAuthenticated || !selectedVersionId) return;

    setIsSubmitting(true);

    try {
      await api.feedbacks.create(selectedVersionId, feedbackForm);
      alert(hasExistingFeedback ? "フィードバックを更新しました！" : "フィードバックを投稿しました！");
      
      // 既存フィードバックフラグを更新
      setHasExistingFeedback(true);
      
      // アプリデータを再取得
      const updatedData = await api.apps.get(parseInt(id!));
      setApp(updatedData);
      
      // 選択されたバージョンの既存フィードバックを再取得
      const newExistingFeedback = await api.feedbacks.myFeedback(selectedVersionId);
      setExistingFeedback(newExistingFeedback);
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
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    if (allExpanded) {
      setExpandedVersions(new Set());
      setAllExpanded(false);
    } else if (app) {
      setExpandedVersions(new Set(app.app_versions.map(v => v.id)));
      setAllExpanded(true);
    }
  };

  // バージョン変更時の処理
  const handleVersionChange = async (versionId: string) => {
    const newVersionId = Number(versionId);
    setSelectedVersionId(newVersionId);

    // 選択されたバージョンの既存フィードバックを取得
    if (isAuthenticated) {
      try {
        const existingFeedback = await api.feedbacks.myFeedback(newVersionId);
        setExistingFeedback(existingFeedback);
        setHasExistingFeedback(!!existingFeedback);
      } catch (error: any) {
        console.error('既存フィードバックの取得に失敗しました:', error);
        setExistingFeedback(null);
        setHasExistingFeedback(false);
      }
    } else {
      setExistingFeedback(null);
      setHasExistingFeedback(false);
    }
  };

  // 選択されたバージョンの統計を計算する関数
  const getSelectedVersionStats = () => {
    if (!selectedVersionId || !app) {
      return {
        averageScore: 0,
        feedbackCount: 0
      };
    }
    
    const selectedVersion = app.app_versions.find(v => v.id === selectedVersionId);
    if (!selectedVersion || !selectedVersion.feedbacks.length) {
      return {
        averageScore: 0,
        feedbackCount: 0
      };
    }
    
    const feedbacks = selectedVersion.feedbacks;
    const totalScore = feedbacks.reduce((sum, feedback) => sum + feedback.overall_score, 0);
    const averageScore = totalScore / feedbacks.length;
    
    return {
      averageScore: Math.round(averageScore * 10) / 10, // 小数点第1位まで
      feedbackCount: feedbacks.length
    };
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
          className={readonly ? "cursor-default" : "cursor-pointer"}
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

  const sortedVersions = app.app_versions
    .slice()
    .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());

  return (
    <div className="min-h-screen bg-orange-50">
      {/* ナビゲーションバー */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-orange-200">
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
                                  <Button variant="outline" className="bg-white" size="sm" asChild>
                    <Link to={`/apps/${id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      編集
                    </Link>
                  </Button>
                  <Button variant="outline" className="bg-white" asChild>
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
            <Card className="bg-white">
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
                <div className="w-full h-64 bg-white/90 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                  {app.thumbnail_url ? (
                    <img
                      src={app.thumbnail_url}
                      alt={app.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-24 h-24 text-gray-400" />
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex space-x-4 mb-6">
                  {app.deploy_url && (
                    <Button asChild className="flex-1 bg-stone-600 hover:bg-stone-700 text-white">
                      <a href={app.deploy_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        アプリを開く
                      </a>
                    </Button>
                  )}
                  {app.github_url && (
                    <Button variant="outline" asChild className="flex-1 bg-white">
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
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-left">バージョン履歴</CardTitle>
                  </div>
                  <Button variant="ghost" className="bg-white" size="sm" onClick={() => setVersionListOpen((prev) => !prev)}>
                    {versionListOpen ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />すべて閉じる
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />すべて展開
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={versionListOpen}>
                  <div className="space-y-2">
                    {sortedVersions.map((version, idx) => (
                      <Collapsible key={version.id} open={idx === 0 || versionListOpen}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold">v{version.version_number}</span>
                              <span className="text-sm text-gray-500">{formatDate(version.release_date)}</span>
                              <span className="text-xs text-gray-500">{version.feedbacks.length} フィードバック</span>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-8 pb-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 p-3 text-left">{version.changelog}</pre>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </Collapsible>
              </CardContent>
            </Card>

            {/* フィードバック絞り込み */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-left">フィードバック</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedVersionId?.toString() || ""} onValueChange={handleVersionChange}>
                    <SelectTrigger className="w-64 bg-white">
                      <SelectValue placeholder="バージョンを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {app.app_versions.map((version) => (
                        <SelectItem key={version.id} value={version.id.toString()}>
                          v{version.version_number}（{formatDate(version.release_date)}）
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {app.app_versions.find(v => v.id === selectedVersionId)?.feedbacks.length ? (
                    app.app_versions.find(v => v.id === selectedVersionId)!.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={feedback.user.profile_image_url} alt={feedback.user.username} />
                              <AvatarFallback>{feedback.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-left">{feedback.user.username}</p>
                              <p className="text-sm text-gray-500 text-left">{formatRelativeTime(feedback.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{feedback.overall_score}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3 text-left">{feedback.comment}</p>
                        <p className="text-xs text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span>デザイン {feedback.design_score}/5</span>
                          <span>使いやすさ {feedback.usability_score}/5</span>
                          <span>創造性 {feedback.creativity_score}/5</span>
                          <span>有用性 {feedback.usefulness_score}/5</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">まだフィードバックがありません</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* フィードバック投稿フォーム */}
            {isAuthenticated && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-left">
                    {hasExistingFeedback ? "フィードバックを更新" : "フィードバックを投稿"}
                  </CardTitle>
                  <CardDescription className="text-left">
                    {hasExistingFeedback 
                      ? "既存のフィードバックを編集できます"
                      : "このアプリについての感想や改善点を教えてください"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-left mb-2">コメント</label>
                      <Textarea
                        value={feedbackForm.comment}
                        onChange={e => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="アプリについての感想や改善点を書いてください..."
                        rows={4}
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">デザイン</label>
                        <StarRating
                          rating={feedbackForm.design_score}
                          onRatingChange={rating => {
                            setFeedbackForm(prev => ({ ...prev, design_score: rating }));
                            console.log(feedbackForm.design_score);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">使いやすさ</label>
                        <StarRating
                          rating={feedbackForm.usability_score}
                          onRatingChange={rating => setFeedbackForm(prev => ({ ...prev, usability_score: rating }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">創造性</label>
                        <StarRating
                          rating={feedbackForm.creativity_score}
                          onRatingChange={rating => setFeedbackForm(prev => ({ ...prev, creativity_score: rating }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-left mb-2">有用性</label>
                        <StarRating
                          rating={feedbackForm.usefulness_score}
                          onRatingChange={rating => setFeedbackForm(prev => ({ ...prev, usefulness_score: rating }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-left mb-2">総合評価</label>
                      <StarRating
                        rating={feedbackForm.overall_score}
                        onRatingChange={rating => setFeedbackForm(prev => ({ ...prev, overall_score: rating }))}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-stone-600 hover:bg-stone-700 text-white">
                      {isSubmitting ? (
                        <>
                          <Send className="w-4 h-4 mr-2 animate-spin" />
                          {hasExistingFeedback ? "更新中..." : "投稿中..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {hasExistingFeedback ? "フィードバックを更新" : "フィードバックを投稿"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Card className="bg-white">
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
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-left">開発者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={app.user.profile_image_url || "/placeholder.svg"} alt={app.user.username} />
                    <AvatarFallback>{app.user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-left">{app.user.username}</h4>
                  </div>
                </div>
                {/* 自己紹介 */}
                {app.user.bio && (
                  <div className="mb-2 text-left text-sm text-gray-700">
                    <span className="font-medium"></span>{app.user.bio}
                  </div>
                )}
                  <div className="flex justify-start items-center gap-6 mb-4">
                    {app.user.github_url && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Github className="w-4 h-4 text-gray-400" />
                        <a href={app.user.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          GitHub
                        </a>
                      </div>
                    )}
                    {app.user.twitter_url && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Twitter className="w-4 h-4 text-gray-400" />
                        <a href={app.user.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          X
                        </a>
                      </div>
                    )}
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
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-left">統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedVersionId ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">総合評価</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {getSelectedVersionStats().averageScore || "未評価"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">フィードバック数</span>
                        <span className="font-medium">{getSelectedVersionStats().feedbackCount}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">全体の総合評価</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{app.overall_score || "未評価"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">全体のフィードバック数</span>
                        <span className="font-medium">{app.feedback_count}</span>
                      </div>
                    </>
                  )}
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