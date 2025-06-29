"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Star,
  Github,
  ExternalLink,
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  Heart,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// モックデータ
const mockApp = {
  id: 1,
  title: "タスク管理アプリ",
  description: `# タスク管理アプリ

シンプルで使いやすいタスク管理アプリです。

## 主な機能
- ✅ タスクの作成・編集・削除
- 🏷️ カテゴリ別の整理
- 📅 期限設定とリマインダー
- 🎨 ドラッグ&ドロップでの並び替え
- 📱 レスポンシブデザイン

## 技術スタック
- React.js
- TypeScript
- Tailwind CSS
- Local Storage

直感的なUIで、誰でも簡単にタスクを管理できます。`,
  thumbnail: "/placeholder.svg?height=400&width=600",
  category: "Webアプリ",
  author: {
    id: 1,
    username: "田中太郎",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "フロントエンド開発者です。React/Next.jsを中心に開発しています。",
    githubUrl: "https://github.com/tanaka",
  },
  githubUrl: "https://github.com/example/task-app",
  deployUrl: "https://task-app.vercel.app",
  overallScore: 4.5,
  feedbackCount: 12,
  viewCount: 245,
  likeCount: 18,
  createdAt: "2024-01-15",
  updatedAt: "2024-01-25",
  versions: [
    {
      id: 1,
      versionNumber: "2.1",
      releaseDate: "2024-01-25",
      changelog:
        "- バグ修正: タスクの削除時のエラーを修正\n- 新機能: カテゴリ別フィルタリング\n- UI改善: モバイル表示の最適化",
      feedbackCount: 5,
    },
    {
      id: 2,
      versionNumber: "2.0",
      releaseDate: "2024-01-20",
      changelog: "- 大幅なUI刷新\n- ドラッグ&ドロップ機能の追加\n- パフォーマンス改善",
      feedbackCount: 4,
    },
    {
      id: 3,
      versionNumber: "1.0",
      releaseDate: "2024-01-15",
      changelog: "- 初回リリース\n- 基本的なタスク管理機能\n- レスポンシブデザイン対応",
      feedbackCount: 3,
    },
  ],
}

const mockFeedbacks = [
  {
    id: 1,
    user: {
      username: "佐藤花子",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    versionId: 1,
    versionNumber: "2.1",
    comment:
      "UIがとても使いやすくて素晴らしいです！特にドラッグ&ドロップ機能が直感的で気に入りました。今後も使い続けたいと思います。",
    designScore: 5,
    usabilityScore: 5,
    creativityScore: 4,
    usefulnessScore: 5,
    overallScore: 5,
    createdAt: "2024-01-26T10:30:00Z",
    likes: 3,
  },
  {
    id: 2,
    user: {
      username: "山田次郎",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    versionId: 1,
    versionNumber: "2.1",
    comment:
      "機能は充実していて良いのですが、もう少しカスタマイズ性があると嬉しいです。色テーマの変更機能などがあると良いかもしれません。",
    designScore: 4,
    usabilityScore: 4,
    creativityScore: 4,
    usefulnessScore: 4,
    overallScore: 4,
    createdAt: "2024-01-25T15:45:00Z",
    likes: 1,
  },
  {
    id: 3,
    user: {
      username: "鈴木一郎",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    versionId: 2,
    versionNumber: "2.0",
    comment: "v2.0での大幅なアップデートが素晴らしいです。以前のバージョンと比べて格段に使いやすくなりました。",
    designScore: 5,
    usabilityScore: 5,
    creativityScore: 5,
    usefulnessScore: 4,
    overallScore: 5,
    createdAt: "2024-01-22T09:15:00Z",
    likes: 2,
  },
]

interface FeedbackFormData {
  comment: string
  designScore: number
  usabilityScore: number
  creativityScore: number
  usefulnessScore: number
  overallScore: number
}

export default function AppDetail({ params }: { params: { id: string } }) {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    comment: "",
    designScore: 0,
    usabilityScore: 0,
    creativityScore: 0,
    usefulnessScore: 0,
    overallScore: 0,
  })
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<number[]>([1])
  const [likedFeedbacks, setLikedFeedbacks] = useState<number[]>([])
  const [isLiked, setIsLiked] = useState(false)

  const { isAuthenticated } = useAuth()

  const handleStarClick = (category: keyof FeedbackFormData, rating: number) => {
    setFeedbackForm((prev) => ({ ...prev, [category]: rating }))
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.comment.trim() || feedbackForm.overallScore === 0) {
      alert("コメントと総合評価は必須です")
      return
    }

    setIsSubmittingFeedback(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert("フィードバックを投稿しました！")
      setFeedbackForm({
        comment: "",
        designScore: 0,
        usabilityScore: 0,
        creativityScore: 0,
        usefulnessScore: 0,
        overallScore: 0,
      })
    } catch (error) {
      alert("投稿に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const toggleVersionExpanded = (versionId: number) => {
    setExpandedVersions((prev) =>
      prev.includes(versionId) ? prev.filter((id) => id !== versionId) : [...prev, versionId],
    )
  }

  const toggleFeedbackLike = (feedbackId: number) => {
    setLikedFeedbacks((prev) =>
      prev.includes(feedbackId) ? prev.filter((id) => id !== feedbackId) : [...prev, feedbackId],
    )
  }

  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
  }: {
    rating: number
    onRatingChange?: (rating: number) => void
    readonly?: boolean
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
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "1時間未満前"
    if (diffInHours < 24) return `${diffInHours}時間前`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}日前`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">アプリ詳細</h1>
            </div>
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
                      <CardTitle className="text-2xl">{mockApp.title}</CardTitle>
                      <Badge variant="secondary">{mockApp.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{mockApp.viewCount} 閲覧</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{mockApp.likeCount} いいね</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{mockApp.feedbackCount} フィードバック</span>
                      </div>
                    </div>
                  </div>
                  <Button variant={isLiked ? "default" : "outline"} size="sm" onClick={() => setIsLiked(!isLiked)}>
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "いいね済み" : "いいね"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <img
                  src={mockApp.thumbnail || "/placeholder.svg"}
                  alt={mockApp.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />

                {/* アクションボタン */}
                <div className="flex space-x-4 mb-6">
                  <Button asChild className="flex-1">
                    <a href={mockApp.deployUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      アプリを開く
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1 bg-transparent">
                    <a href={mockApp.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                </div>

                {/* 説明文 */}
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{mockApp.description}</pre>
                </div>
              </CardContent>
            </Card>

            {/* バージョン履歴 */}
            <Card>
              <CardHeader>
                <CardTitle>バージョン履歴</CardTitle>
                <CardDescription>アプリのアップデート履歴とフィードバック</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockApp.versions.map((version) => (
                  <Collapsible
                    key={version.id}
                    open={expandedVersions.includes(version.id)}
                    onOpenChange={() => toggleVersionExpanded(version.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">v{version.versionNumber}</Badge>
                          <div className="text-left">
                            <div className="font-medium">バージョン {version.versionNumber}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(version.releaseDate)}</span>
                              <MessageCircle className="w-3 h-3 ml-2" />
                              <span>{version.feedbackCount} フィードバック</span>
                            </div>
                          </div>
                        </div>
                        {expandedVersions.includes(version.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">変更内容</h4>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">{version.changelog}</pre>
                      </div>

                      {/* このバージョンのフィードバック */}
                      <div className="space-y-3">
                        <h4 className="font-medium">このバージョンのフィードバック</h4>
                        {mockFeedbacks
                          .filter((feedback) => feedback.versionId === version.id)
                          .map((feedback) => (
                            <div key={feedback.id} className="bg-white border rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={feedback.user.avatar || "/placeholder.svg"}
                                    alt={feedback.user.username}
                                  />
                                  <AvatarFallback>{feedback.user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm">{feedback.user.username}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatRelativeTime(feedback.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <StarRating rating={feedback.overallScore} readonly />
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{feedback.comment}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                                      <div>デザイン: {feedback.designScore}/5</div>
                                      <div>使いやすさ: {feedback.usabilityScore}/5</div>
                                      <div>独自性: {feedback.creativityScore}/5</div>
                                      <div>実用性: {feedback.usefulnessScore}/5</div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleFeedbackLike(feedback.id)}
                                      className={likedFeedbacks.includes(feedback.id) ? "text-blue-600" : ""}
                                    >
                                      <ThumbsUp className="w-3 h-3 mr-1" />
                                      {feedback.likes + (likedFeedbacks.includes(feedback.id) ? 1 : 0)}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* フィードバック投稿フォーム */}
            {isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>フィードバックを投稿</CardTitle>
                  <CardDescription>このアプリについてのご意見をお聞かせください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 評価項目 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">デザイン</label>
                      <StarRating
                        rating={feedbackForm.designScore}
                        onRatingChange={(rating) => handleStarClick("designScore", rating)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">使いやすさ</label>
                      <StarRating
                        rating={feedbackForm.usabilityScore}
                        onRatingChange={(rating) => handleStarClick("usabilityScore", rating)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">アイデア・独自性</label>
                      <StarRating
                        rating={feedbackForm.creativityScore}
                        onRatingChange={(rating) => handleStarClick("creativityScore", rating)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">実用性</label>
                      <StarRating
                        rating={feedbackForm.usefulnessScore}
                        onRatingChange={(rating) => handleStarClick("usefulnessScore", rating)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      総合評価 <span className="text-red-500">*</span>
                    </label>
                    <StarRating
                      rating={feedbackForm.overallScore}
                      onRatingChange={(rating) => handleStarClick("overallScore", rating)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      コメント <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                      placeholder="このアプリについての感想や改善提案をお聞かせください..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={isSubmittingFeedback || !feedbackForm.comment.trim() || feedbackForm.overallScore === 0}
                    className="w-full"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Send className="w-4 h-4 mr-2 animate-pulse" />
                        投稿中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        フィードバックを投稿
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>フィードバックを投稿</CardTitle>
                  <CardDescription>フィードバックを投稿するにはログインが必要です</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 mb-4">このアプリにフィードバックを投稿するには、アカウントが必要です。</p>
                  <div className="flex justify-center space-x-4">
                    <Button asChild>
                      <Link href="/login">ログイン</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/signup">新規登録</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* 開発者情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">開発者</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={mockApp.author.avatar || "/placeholder.svg"} alt={mockApp.author.username} />
                      <AvatarFallback>{mockApp.author.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mockApp.author.username}</h3>
                      <p className="text-sm text-gray-600 mb-3">{mockApp.author.bio}</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={mockApp.author.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 統計情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">統計情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">総合評価</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{mockApp.overallScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">フィードバック数</span>
                    <span className="font-semibold">{mockApp.feedbackCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">閲覧数</span>
                    <span className="font-semibold">{mockApp.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">いいね数</span>
                    <span className="font-semibold">{mockApp.likeCount}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">公開日</span>
                    <span className="text-sm">{formatDate(mockApp.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">最終更新</span>
                    <span className="text-sm">{formatDate(mockApp.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
