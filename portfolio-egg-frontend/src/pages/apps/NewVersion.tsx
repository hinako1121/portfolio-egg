import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle, Plus, Upload, Github, ExternalLink, X, ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type CreateVersionData, type AppDetail, type UpdateAppData } from "@/lib/api";

const categories = ["Webアプリ", "モバイルアプリ", "デスクトップアプリ", "ゲーム", "ツール・ユーティリティ", "その他"];

export default function NewVersion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateVersionData & UpdateAppData>>({});
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [latestVersionNumber, setLatestVersionNumber] = useState("1.0.0");

  const [versionForm, setVersionForm] = useState<CreateVersionData>({
    version_number: "",
    changelog: ""
  });

  const [appForm, setAppForm] = useState<UpdateAppData>({
    title: "",
    description: "",
    category: "",
    github_url: "",
    deploy_url: "",
    thumbnail_image: undefined
  });

  // アプリデータを読み込み
  useEffect(() => {
    const fetchAppData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await api.apps.get(parseInt(id));
        setApp(data);
        
        // アプリ情報をフォームに設定
        setAppForm({
          title: data.title,
          description: data.description,
          category: data.category,
          github_url: data.github_url || "",
          deploy_url: data.deploy_url || "",
          thumbnail_image: undefined
        });

        // サムネイル画像プレビューを設定
        if (data.thumbnail_url) {
          setThumbnailPreview(data.thumbnail_url);
        }
        
        // 最新バージョン番号を取得して次のバージョン番号を提案
        const latest = data.app_versions[0]?.version_number || "1.0.0";
        setLatestVersionNumber(latest);

        // 最新バージョン番号をフォームに設定
        setVersionForm(prev => ({ ...prev, version_number: latest }));
      } catch (error) {
        console.error("アプリデータの取得に失敗しました:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAppData();
  }, [id, navigate]);

  const handleVersionInputChange = (field: keyof CreateVersionData, value: string) => {
    setVersionForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAppInputChange = (field: keyof UpdateAppData, value: string) => {
    setAppForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAppForm((prev) => ({ ...prev, thumbnail_image: file }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateVersionData & UpdateAppData> = {};

    // バージョン情報のバリデーション
    if (!versionForm.version_number.trim()) {
      newErrors.version_number = "バージョン番号は必須です";
    } else {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(versionForm.version_number)) {
        newErrors.version_number = "バージョン番号は x.y.z の形式で入力してください（例: 1.0.0）";
      }
    }

    if (!versionForm.changelog.trim()) {
      newErrors.changelog = "変更履歴は必須です";
    }

    // アプリ情報のバリデーション
    if (!appForm.title.trim()) {
      newErrors.title = "アプリタイトルは必須です";
    }

    if (!appForm.description.trim()) {
      newErrors.description = "説明文は必須です";
    }

    if (!appForm.category) {
      newErrors.category = "カテゴリは必須です";
    }

    // URL validation
    if (appForm.github_url && !isValidUrl(appForm.github_url)) {
      newErrors.github_url = "有効なGitHub URLを入力してください";
    }

    if (appForm.deploy_url && !isValidUrl(appForm.deploy_url)) {
      newErrors.deploy_url = "有効なURLを入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const compareVersions = (a: string, b: string): number => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // エラー初期化

    if (!validateForm() || !id) {
      return;
    }

    if (compareVersions(versionForm.version_number, latestVersionNumber) <= 0) {
      setErrors((prev) => ({
        ...prev,
        version_number: `新しいバージョン番号は最新バージョン（${latestVersionNumber}）より大きくしてください`
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // アプリ情報とバージョン情報を一緒に送信
      const formData = new FormData();
      
      // バージョン情報
      formData.append('app_version[version_number]', versionForm.version_number);
      formData.append('app_version[changelog]', versionForm.changelog);
      
      // アプリ情報
      formData.append('app[title]', appForm.title);
      formData.append('app[description]', appForm.description);
      formData.append('app[category]', appForm.category);
      if (appForm.github_url) formData.append('app[github_url]', appForm.github_url);
      if (appForm.deploy_url) formData.append('app[deploy_url]', appForm.deploy_url);
      if (appForm.thumbnail_image) formData.append('app[thumbnail_image]', appForm.thumbnail_image);

      await api.versions.create(parseInt(id), formData);
      alert("バージョンが正常に追加されました！");
      navigate("/?tab=dashboard");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: Partial<CreateVersionData & UpdateAppData> = {};
        
        // APIエラーをフォームエラーに変換
        if (Array.isArray(apiErrors)) {
          apiErrors.forEach((errorMsg: string) => {
            if (errorMsg.includes('title')) newErrors.title = errorMsg;
            else if (errorMsg.includes('description')) newErrors.description = errorMsg;
            else if (errorMsg.includes('category')) newErrors.category = errorMsg;
            else if (errorMsg.includes('github_url')) newErrors.github_url = errorMsg;
            else if (errorMsg.includes('deploy_url')) newErrors.deploy_url = errorMsg;
            else if (errorMsg.includes('version_number')) newErrors.version_number = errorMsg;
            else if (errorMsg.includes('changelog')) newErrors.changelog = errorMsg;
            else if (errorMsg.includes('release_date')) {
              // release_dateエラーは一般的なエラーとして表示
              console.warn('Release date error:', errorMsg);
            }
          });
        } else if (typeof apiErrors === 'object') {
          // オブジェクト形式のエラーの場合
          Object.keys(apiErrors).forEach((key) => {
            if (key in versionForm || key in appForm) {
              newErrors[key as keyof (CreateVersionData & UpdateAppData)] = apiErrors[key].join(', ');
            }
          });
        }
        
        setErrors(newErrors);
        console.error('バージョン追加エラー:', apiErrors);
      } else {
        console.error('バージョン追加エラー:', error);
        alert("バージョンの追加に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ログインが必要です</p>
          <Link to="/login" className="text-blue-600 hover:underline">
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

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

  if (!app.is_owner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">このアプリにバージョンを追加する権限がありません</p>
          <Link to={`/apps/${id}`} className="text-blue-600 hover:underline">
            アプリ詳細に戻る
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
              <Link to={`/apps/${id}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">バージョンを追加</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* メインフォーム */}
                <div className="lg:col-span-2 space-y-6">
                  {/* アプリ情報編集 */}
                  <Card className="w-full max-w-none">
                    <CardHeader>
                      <CardTitle className="text-left">アプリ情報の編集</CardTitle>
                      <CardDescription className="text-left">アプリの基本情報を編集できます</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-left">
                          アプリタイトル <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={appForm.title}
                          onChange={(e) => handleAppInputChange("title", e.target.value)}
                          placeholder="例: タスク管理アプリ"
                          className={`w-full ${errors.title ? "border-red-500" : ""}`}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-left">
                          説明文 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={appForm.description}
                          onChange={(e) => handleAppInputChange("description", e.target.value)}
                          placeholder="アプリの機能や特徴を詳しく説明してください..."
                          rows={4}
                          className={`w-full ${errors.description ? "border-red-500" : ""}`}
                        />
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-left">
                          カテゴリ <span className="text-red-500">*</span>
                        </Label>
                        <Select value={appForm.category} onValueChange={(value) => handleAppInputChange("category", value)}>
                          <SelectTrigger className={`w-full ${errors.category ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                      </div>

                      <div>
                        <Label htmlFor="githubUrl" className="text-left">
                          <Github className="w-4 h-4 inline mr-2" />
                          GitHubリポジトリURL
                        </Label>
                        <Input
                          id="githubUrl"
                          value={appForm.github_url}
                          onChange={(e) => handleAppInputChange("github_url", e.target.value)}
                          placeholder="https://github.com/username/repository"
                          className={`w-full ${errors.github_url ? "border-red-500" : ""}`}
                        />
                        {errors.github_url && <p className="text-sm text-red-500 mt-1">{errors.github_url}</p>}
                      </div>

                      <div>
                        <Label htmlFor="deployUrl" className="text-left">
                          <ExternalLink className="w-4 h-4 inline mr-2" />
                          公開先URL
                        </Label>
                        <Input
                          id="deployUrl"
                          value={appForm.deploy_url}
                          onChange={(e) => handleAppInputChange("deploy_url", e.target.value)}
                          placeholder="https://your-app.vercel.app"
                          className={`w-full ${errors.deploy_url ? "border-red-500" : ""}`}
                        />
                        {errors.deploy_url && <p className="text-sm text-red-500 mt-1">{errors.deploy_url}</p>}
                      </div>

                      {/* サムネイル画像 */}
                      <div>
                        <Label className="text-left">サムネイル画像</Label>
                        {thumbnailPreview && (
                          <div className="flex justify-center mb-4">
                            <div className="relative">
                              <img
                                src={thumbnailPreview}
                                alt="サムネイル"
                                className="w-32 h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                                onClick={() => {
                                  setThumbnailPreview(null);
                                  setAppForm((prev) => ({ ...prev, thumbnail_image: undefined }));
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">画像をドラッグ&ドロップ</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            id="thumbnail-upload"
                          />
                          <Label htmlFor="thumbnail-upload">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                ファイルを選択
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* バージョン情報 */}
                  <Card className="w-full max-w-none">
                    <CardHeader>
                      <CardTitle className="text-left">バージョン情報</CardTitle>
                      <CardDescription className="text-left">新しいバージョンの情報を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="versionNumber" className="text-left">
                          バージョン番号 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="versionNumber"
                          value={versionForm.version_number}
                          onChange={(e) => handleVersionInputChange("version_number", e.target.value)}
                          placeholder="例: 1.0.0"
                          className={`w-full ${errors.version_number ? "border-red-500" : ""}`}
                        />
                        {errors.version_number && <p className="text-sm text-red-500 mt-1">{errors.version_number}</p>}
                        <p className="text-sm text-gray-500 mt-1">セマンティックバージョニング（x.y.z）の形式で入力してください</p>
                      </div>

                      <div>
                        <Label htmlFor="changelog" className="text-left">
                          変更履歴 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="changelog"
                          value={versionForm.changelog}
                          onChange={(e) => handleVersionInputChange("changelog", e.target.value)}
                          placeholder="このバージョンでの変更内容を詳しく記述してください..."
                          rows={6}
                          className={`w-full ${errors.changelog ? "border-red-500" : ""}`}
                        />
                        {errors.changelog && <p className="text-sm text-red-500 mt-1">{errors.changelog}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/apps/${id}`}>キャンセル</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-32">
                  {isSubmitting ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      追加中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      バージョンを追加
                    </>
                  )}
                </Button>
              </div>

              {/* 注意事項 */}
              <Alert className="w-full max-w-none">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  新しいバージョンを追加すると、ユーザーはそのバージョンに対してフィードバックを投稿できるようになります。
                  バージョン番号は一度設定すると変更できませんので、慎重に決定してください。
                  また、アプリの基本情報（タイトル・説明・カテゴリなど）も同時に更新されます。
                </AlertDescription>
              </Alert>
            </form>
          </div>
          {/* サイドバー */}
          <div className="space-y-6">
                  {/* 現在のバージョン履歴 */}
                  <Card className="w-full max-w-none">
                    <CardHeader>
                      <CardTitle className="text-left">現在のバージョン履歴</CardTitle>
                      <CardDescription className="text-left">既存のバージョン一覧</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {app.app_versions.length > 0 ? (
                          app.app_versions.map((version) => (
                            <div key={version.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">v{version.version_number}</Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(version.release_date).toLocaleDateString("ja-JP")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 text-left line-clamp-2">
                                {version.changelog}
                              </p>
                              <div className="mt-2 text-xs text-gray-500">
                                {version.feedbacks.length} フィードバック
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">まだバージョンがありません</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* バージョニングガイド */}
                  <Card className="w-full max-w-none">
                    <CardHeader>
                      <CardTitle className="text-left">バージョニングガイド</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <h4 className="font-medium text-left">メジャーバージョン（x.0.0）</h4>
                          <p className="text-gray-600 text-left">互換性のない変更や大きな機能追加</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-left">マイナーバージョン（0.x.0）</h4>
                          <p className="text-gray-600 text-left">後方互換性のある機能追加</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-left">パッチバージョン（0.0.x）</h4>
                          <p className="text-gray-600 text-left">バグ修正や小さな改善</p>
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