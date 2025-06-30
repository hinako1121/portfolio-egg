import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Star,
  MessageCircle,
  Plus,
  Github,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type App as AppType } from "@/lib/api";

export default function AppList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [apps, setApps] = useState<AppType[]>([]);
  const [myApps, setMyApps] = useState<AppType[]>([]);
  const [loading, setLoading] = useState(true);
  const [myAppsLoading, setMyAppsLoading] = useState(false);

  const categories = ["all", "Webアプリ", "モバイルアプリ", "デスクトップアプリ", "ゲーム", "ツール・ユーティリティ", "その他"];

  const { user, logout, isAuthenticated } = useAuth();

  // アプリ一覧を取得
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (searchQuery) params.q = searchQuery;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (sortBy) params.sort = sortBy;
        
        const data = await api.apps.list(params);
        console.log('Apps list data:', data);
        console.log('First app version info:', data[0]?.version, data[0]?.title);
        setApps(data);
      } catch (error) {
        console.error('アプリ一覧の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [searchQuery, selectedCategory, sortBy]);

  // マイアプリを取得
  useEffect(() => {
    const fetchMyApps = async () => {
      if (!isAuthenticated) return;
      
      try {
        setMyAppsLoading(true);
        const data = await api.apps.myApps();
        console.log('My apps data:', data);
        console.log('My first app version info:', data[0]?.version, data[0]?.title);
        setMyApps(data);
      } catch (error) {
        console.error('マイアプリの取得に失敗しました:', error);
      } finally {
        setMyAppsLoading(false);
      }
    };

    fetchMyApps();
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                    <Link to="/apps/new">
                      <Plus className="w-4 h-4 mr-2" />
                      投稿する
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.profile_image_url || "/placeholder.svg"} alt={user?.username} />
                        <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/profile/edit">プロフィール編集</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>ログアウト</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/signup">新規登録</Link>
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">読み込み中...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app) => (
                  <Link key={app.id} to={`/apps/${app.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="p-0">
                        <img
                          src={app.thumbnail_url || "/placeholder.svg"}
                          alt={app.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg text-left">{app.title}</CardTitle>
                          <Badge variant="secondary">{app.category}</Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2 text-left">
                          {app.description}
                        </CardDescription>
                        <div className="flex items-center space-x-2 mb-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user?.profile_image_url ? `${user.profile_image_url}?t=${Date.now()}` : "/placeholder.svg"} />
                            <AvatarFallback>{app.user.username[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{app.user.username}</span>
                          <span className="text-xs text-gray-400">v{app.version}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{app.overall_score}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{app.feedback_count}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (app.github_url) window.open(app.github_url, "_blank");
                          }}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (app.deploy_url) window.open(app.deploy_url, "_blank");
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
            )}
          </TabsContent>

          {/* マイページタブ */}
          <TabsContent value="dashboard" className="space-y-6">
            {isAuthenticated ? (
              <>
                {/* プロフィールセクション */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-left">プロフィール</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.profile_image_url || "/placeholder.svg"} alt={user?.username} />
                        <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-left">{user?.username}</h3>
                        <p className="text-gray-600 mb-3 text-left">{user?.bio || 'プロフィールが設定されていません'}</p>
                        <div className="flex space-x-4">
                          {user?.github_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/profile/edit">プロフィール編集</Link>
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
                      <CardTitle className="text-left">投稿したアプリ</CardTitle>
                      <Button size="sm" asChild>
                        <Link to="/apps/new">
                          <Plus className="w-4 h-4 mr-2" />
                          新しいアプリを投稿
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {myAppsLoading ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600">読み込み中...</p>
                      </div>
                    ) : myApps.length > 0 ? (
                      <div className="space-y-4">
                        {myApps.map((app) => (
                          <div key={app.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <Link to={`/apps/${app.id}`} className="flex-1">
                              <div className="flex items-center space-x-4">
                                <img
                                  src={app.thumbnail_url || "/placeholder.svg"}
                                  alt={app.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-left">{app.title}</h4>
                                  <p className="text-sm text-gray-600 mb-1 text-left">{app.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span>{app.overall_score}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="w-4 h-4" />
                                      <span>{app.feedback_count} フィードバック</span>
                                    </div>
                                    <span>v{app.version}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/apps/${app.id}/edit`}>編集</Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/apps/${app.id}/versions/new`}>バージョン追加</Link>
                              </Button>
                              <Button size="sm" variant="destructive">削除</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">まだアプリを投稿していません</p>
                        <Button asChild>
                          <Link to="/apps/new">
                            <Plus className="w-4 h-4 mr-2" />
                            最初のアプリを投稿
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">ログインしてマイページを利用してください</p>
                <div className="flex justify-center space-x-4">
                  <Button asChild>
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/signup">新規登録</Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 