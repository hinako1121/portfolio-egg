"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Github, Twitter, Globe, MapPin, Calendar, Edit, ArrowLeft, Star, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"

// モックデータ（実際のアプリでは API から取得）
const mockUserStats = {
  totalApps: 3,
  totalViews: 1250,
  totalLikes: 45,
  totalFeedbacks: 28,
  averageRating: 4.6,
}

const mockUserApps = [
  {
    id: 1,
    title: "タスク管理アプリ",
    description: "シンプルで使いやすいタスク管理アプリです。",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "Webアプリ",
    overallScore: 4.5,
    feedbackCount: 12,
    viewCount: 450,
    likeCount: 18,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "天気予報アプリ",
    description: "現在地の天気情報を美しいUIで表示するアプリです。",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "モバイルアプリ",
    overallScore: 4.2,
    feedbackCount: 8,
    viewCount: 320,
    likeCount: 12,
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    title: "ポートフォリオサイト",
    description: "レスポンシブデザインのポートフォリオサイトテンプレートです。",
    thumbnail: "/placeholder.svg?height=120&width=200",
    category: "Webアプリ",
    overallScore: 4.8,
    feedbackCount: 8,
    viewCount: 480,
    likeCount: 15,
    createdAt: "2024-01-25",
  },
]

export default function ProfilePage() {
  const { user } = useAuth()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    })
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard>
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
                <h1 className="text-xl font-semibold text-gray-900">プロフィール</h1>
              </div>
              <Button asChild>
                <Link href="/profile/edit">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインプロフィール */}
            <div className="lg:col-span-2 space-y-8">
              {/* プロフィール基本情報 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="text-2xl">{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
                      <p className="text-gray-600 mb-4">{user.bio || "自己紹介が設定されていません"}</p>

                      {/* 基本情報 */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {user.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{user.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatJoinDate(user.createdAt)} に参加</span>
                        </div>
                      </div>

                      {/* SNSリンク */}
                      <div className="flex flex-wrap gap-3">
                        {user.githubUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {user.twitterUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-4 h-4 mr-2" />
                              Twitter
                            </a>
                          </Button>
                        )}
                        {user.websiteUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 投稿したアプリ */}
              <Card>
                <CardHeader>
                  <CardTitle>投稿したアプリ</CardTitle>
                  <CardDescription>あなたが投稿したアプリの一覧です</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockUserApps.map((app) => (
                      <Link key={app.id} href={`/apps/${app.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="p-0">
                            <img
                              src={app.thumbnail || "/placeholder.svg"}
                              alt={app.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <CardTitle className="text-base">{app.title}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {app.category}
                              </Badge>
                            </div>
                            <CardDescription className="text-sm mb-3 line-clamp-2">{app.description}</CardDescription>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{app.overallScore}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{app.feedbackCount}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{app.viewCount}</span>
                                </div>
                              </div>
                              <span className="text-xs">{formatDate(app.createdAt)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー統計 */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* 統計情報 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">統計情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{mockUserStats.totalApps}</div>
                        <div className="text-sm text-gray-600">投稿アプリ</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{mockUserStats.averageRating}</div>
                        <div className="text-sm text-gray-600">平均評価</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{mockUserStats.totalViews}</div>
                        <div className="text-sm text-gray-600">総閲覧数</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{mockUserStats.totalLikes}</div>
                        <div className="text-sm text-gray-600">総いいね</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">フィードバック数</span>
                        <span className="font-semibold">{mockUserStats.totalFeedbacks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">参加日</span>
                        <span className="text-sm">{formatJoinDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* アクティビティ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">最近のアクティビティ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">「ポートフォリオサイト」を投稿しました</p>
                          <p className="text-xs text-gray-500">3日前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">「タスク管理アプリ」がv2.1にアップデートされました</p>
                          <p className="text-xs text-gray-500">1週間前</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">新しいフィードバックを5件受け取りました</p>
                          <p className="text-xs text-gray-500">2週間前</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
