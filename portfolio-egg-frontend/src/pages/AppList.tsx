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
  Twitter,
  ImageIcon,
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
import { Logo } from "@/components/Logo";

const APPS_PER_PAGE = 20;

// テキスト省略関数
const truncateText = (text: string, maxLength: number = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function AppList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [apps, setApps] = useState<AppType[]>([]);
  const [myApps, setMyApps] = useState<AppType[]>([]);
  const [loading, setLoading] = useState(true);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
        setMyApps(data);
      } catch (error) {
        console.error('マイアプリの取得に失敗しました:', error);
      } finally {
        setMyAppsLoading(false);
      }
    };

    fetchMyApps();
  }, [isAuthenticated]);

  // ページネーション用のアプリ配列
  const paginatedApps = apps.slice((currentPage - 1) * APPS_PER_PAGE, currentPage * APPS_PER_PAGE);
  const totalPages = Math.ceil(apps.length / APPS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* ナビゲーションバー */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo width={32} height={32} />
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Egg</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="bg-white" size="sm" asChild>
                    <Link to="/apps/new">
                      <Plus className="w-4 h-4 mr-2" />
                      投稿する
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage 
                          src={user?.profile_image_url || "/placeholder.svg"} 
                          alt={user?.username || "プロフィール"} 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
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
                  <Button variant="outline" className="bg-white" size="sm" asChild>
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-stone-600 hover:bg-stone-700 text-white">
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
          <TabsList className="grid w-full grid-cols-2 bg-orange-100">
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
                  className="pl-10 bg-white"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent className="bg-white/90">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "すべて" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 bg-white">
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent className="bg-white/90">
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedApps.map((app) => (
                    <Link key={app.id} to={`/apps/${app.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-[28rem] flex flex-col bg-white overflow-hidden">
                        <CardHeader className="p-0 flex-shrink-0">
                          <div className="w-full h-36 sm:h-40 md:h-44 bg-white/90 rounded-t-lg flex items-center justify-center overflow-hidden">
                            {app.thumbnail_url ? (
                              <img
                                src={app.thumbnail_url}
                                alt={app.title}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-gray-400" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-1 flex-shrink-0">
                            <CardTitle className="text-sm sm:text-base md:text-lg text-left line-clamp-1 sm:line-clamp-2 flex-1 mr-2">{app.title}</CardTitle>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{app.category}</Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mb-2 overflow-hidden h-10 sm:h-12 md:h-12">
                            <div className="line-clamp-3">
                              {app.description}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mb-1 flex-shrink-0">
                            <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                              <AvatarImage src={app.user.profile_image_url || "/placeholder.svg"} alt={app.user.username} />
                              <AvatarFallback className="text-xs">{app.user.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs sm:text-sm text-gray-600 truncate">{app.user.username}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">v{app.version}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs sm:text-sm font-medium">{app.overall_score}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">{app.feedback_count}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0 mt-auto">
                            {app.github_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white text-xs h-7 sm:h-8"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(app.github_url, "_blank");
                                }}
                              >
                                <Github className="w-3 h-3 mr-1" />
                                <span className="truncate text-xs">GitHub</span>
                              </Button>
                            )}
                            {app.deploy_url && (
                              <Button
                                size="sm"
                                className="w-full bg-stone-600 hover:bg-stone-700 text-white text-xs h-7 sm:h-8"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(app.deploy_url, "_blank");
                                }}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="truncate text-xs">開く</span>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {/* ページネーションUI */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button size="sm" variant="outline" className="bg-white" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      前へ
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        size="sm"
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className={currentPage === i + 1 ? "bg-stone-600 hover:bg-stone-700 text-white" : "bg-white"}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button size="sm" variant="outline" className="bg-white" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      次へ
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* マイページタブ */}
          <TabsContent value="dashboard" className="space-y-6">
            {isAuthenticated ? (
              <>
                {/* プロフィールセクション */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-left">プロフィール</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage 
                          src={user?.profile_image_url || "/placeholder.svg"} 
                          alt={user?.username || "プロフィール"} 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                          {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-left">{user?.username}</h3>
                        <p className="text-gray-600 mb-3 text-left">{user?.bio || 'プロフィールが設定されていません'}</p>
                        <div className="flex justify-start items-center gap-6 mb-4">
                          {user?.github_url && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Github className="w-4 h-4 text-gray-400" />
                              <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                GitHub
                              </a>
                            </div>
                          )}
                          {user?.twitter_url && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Twitter className="w-4 h-4 text-gray-400" />
                              <a href={user.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                X
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" asChild className="bg-stone-600 hover:bg-stone-700 text-white">
                            <Link to="/profile/edit">プロフィール編集</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 投稿したアプリ */}
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left">投稿したアプリ</CardTitle>
                      <Button size="sm" asChild className="bg-stone-600 hover:bg-stone-700 text-white">
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
                          <div key={app.id} className="p-4 border rounded-lg">
                            <Link to={`/apps/${app.id}`} className="block">
                              <div className="flex items-start space-x-4 mb-3">
                                <div className="w-16 h-16 bg-white/90 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {app.thumbnail_url ? (
                                    <img
                                      src={app.thumbnail_url}
                                      alt={app.title}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-left">{app.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2 text-left">{truncateText(app.description, 120)}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span>{app.overall_score}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="w-4 h-4" />
                                      <span className="hidden sm:inline">フィードバック </span>
                                      <span>{app.feedback_count}</span>
                                    </div>
                                    <span>v{app.version}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button size="sm" variant="outline" className="bg-white w-full sm:w-auto" asChild>
                                <Link to={`/apps/${app.id}/edit`}>編集</Link>
                              </Button>
                              <Button size="sm" variant="outline" className="bg-white w-full sm:w-auto" asChild>
                                <Link to={`/apps/${app.id}/versions/new`}>バージョン追加</Link>
                              </Button>
                              <Button size="sm" variant="destructive" className="w-full sm:w-auto" onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm('本当にこのアプリを削除しますか？')) {
                                  try {
                                    await api.apps.delete(app.id);
                                    alert('アプリを削除しました');
                                    setMyApps((prev) => prev.filter((a) => a.id !== app.id));
                                  } catch (err) {
                                    alert('削除に失敗しました');
                                  }
                                }
                              }}>
                                削除
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">まだアプリを投稿していません</p>
                        <Button asChild className="bg-stone-600 hover:bg-stone-700 text-white">
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
                  <Button asChild className="bg-stone-600 hover:bg-stone-700 text-white">
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button variant="outline" asChild className="bg-white">
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