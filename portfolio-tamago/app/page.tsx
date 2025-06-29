"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Github, ExternalLink, MessageCircle, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// モックデータ
const mockApps = [
  {
    id: 1,
    title: "タスク管理アプリ",
    description: "シンプルで使いやすいタスク管理アプリです。ドラッグ&ドロップでタスクを整理できます。",
    thumbnail: "/placeholder.svg?height=200&width=300",
    category: "Webアプリ",
    author: "田中太郎",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    githubUrl: "https://github.com/example/task-app",
    deployUrl: "https://task-app.vercel.app",
    overallScore: 4.5,
    feedbackCount: 12,
    version: "2.1",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "天気予報アプリ",
    description: "現在地の天気情報を美しいUIで表示するアプリです。",
    thumbnail: "/placeholder.svg?height=200&width=300",
    category: "モバイルアプリ",
    author: "佐藤花子",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    githubUrl: "https://github.com/example/weather-app",
    deployUrl: "https://weather-app.netlify.app",
    overallScore: 4.2,
    feedbackCount: 8,
    version: "1.3",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    title: "ポートフォリオサイト",
    description: "レスポンシブデザインのポートフォリオサイトテンプレートです。",
    thumbnail: "/placeholder.svg?height=200&width=300",
    category: "Webアプリ",
    author: "山田次郎",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    githubUrl: "https://github.com/example/portfolio",
    deployUrl: "https://portfolio.example.com",
    overallScore: 4.8,
    feedbackCount: 15,
    version: "1.0",
    createdAt: "2024-01-25",
  },
]

const mockUser = {
  username: "田中太郎",
  email: "tanaka@example.com",
  avatar: "/placeholder.svg?height=80&width=80",
  bio: "フロントエンド開発者です。React/Next.jsを中心に開発しています。",
  githubUrl: "https://github.com/tanaka",
  twitterUrl: "https://twitter.com/tanaka",
}

export default function PortfolioTamago() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const categories = ["all", "Webアプリ", "モバイルアプリ", "ゲーム", "その他"]

  const filteredApps = mockApps.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.overallScore - a.overallScore
      case "feedback":
        return b.feedbackCount - a.feedbackCount
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🥚 ポートフォリオのたまご</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/post">
                      <Plus className="w-4 h-4 mr-2" />
                      投稿する
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                        <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">プロフィール</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">設定</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>ログアウト</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">ログイン</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">新規登録</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="explore">アプリを探す</TabsTrigger>
            <TabsTrigger value="dashboard">マイページ</TabsTrigger>
          </TabsList>

          {/* アプリ一覧タブ */}
          <TabsContent value="explore" className="space-y-6">
            {/* 検索・フィルター */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="アプリを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "すべて" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">新着順</SelectItem>
                  <SelectItem value="popular">人気順</SelectItem>
                  <SelectItem value="feedback">フィードバック数順</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* アプリ一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedApps.map((app) => (
                <Link key={app.id} href={`/apps/${app.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <img
                        src={app.thumbnail || "/placeholder.svg"}
                        alt={app.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">{app.title}</CardTitle>
                        <Badge variant="secondary">{app.category}</Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {app.description}
                      </CardDescription>
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={app.authorAvatar || "/placeholder.svg"} alt={app.author} />
                          <AvatarFallback>{app.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{app.author}</span>
                        <span className="text-xs text-gray-400">v{app.version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{app.overallScore}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{app.feedbackCount}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(app.githubUrl, "_blank")
                        }}
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(app.deployUrl, "_blank")
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        開く
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* マイページタブ */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* プロフィールセクション */}
            <Card>
              <CardHeader>
                <CardTitle>プロフィール</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.username} />
                    <AvatarFallback>{mockUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{mockUser.username}</h3>
                    <p className="text-gray-600 mb-3">{mockUser.bio}</p>
                    <div className="flex space-x-4">
                      <Button variant="outline" size="sm">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                      <Button variant="outline" size="sm">
                        プロフィール編集
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 投稿したアプリ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>投稿したアプリ</CardTitle>
                  <Button size="sm" asChild>
                    <Link href="/post">
                      <Plus className="w-4 h-4 mr-2" />
                      新しいアプリを投稿
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApps.slice(0, 2).map((app) => (
                    <div key={app.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={app.thumbnail || "/placeholder.svg"}
                        alt={app.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{app.title}</h4>
                        <p className="text-sm text-gray-600 mb-1">{app.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{app.overallScore}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{app.feedbackCount} フィードバック</span>
                          </div>
                          <span>v{app.version}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最近のフィードバック */}
            <Card>
              <CardHeader>
                <CardTitle>最近のフィードバック</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>佐</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">佐藤花子</span>
                        <span className="text-xs text-gray-500">2時間前</span>
                      </div>
                      <p className="text-sm text-gray-700">「タスク管理アプリ」にフィードバックしました</p>
                      <p className="text-sm text-gray-600 mt-1">UIがとても使いやすくて素晴らしいです！</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>山</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">山田次郎</span>
                        <span className="text-xs text-gray-500">1日前</span>
                      </div>
                      <p className="text-sm text-gray-700">「タスク管理アプリ」に評価をつけました</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
