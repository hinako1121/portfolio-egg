import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Github, ExternalLink, ArrowLeft, Save, AlertCircle, ImageIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type CreateAppData } from "@/lib/api";

const categories = ["Webアプリ", "モバイルアプリ", "デスクトップアプリ", "ゲーム", "ツール・ユーティリティ", "その他"];

export default function NewApp() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateAppData>({
    title: "",
    description: "",
    category: "",
    githubUrl: "",
    deployUrl: "",
    thumbnailImage: undefined
  });

  const [errors, setErrors] = useState<Partial<CreateAppData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateAppData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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
      setFormData((prev) => ({ ...prev, thumbnailImage: file }));
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
    const newErrors: Partial<CreateAppData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "アプリタイトルは必須です";
    }

    if (!formData.description.trim()) {
      newErrors.description = "説明文は必須です";
    }

    if (!formData.category) {
      newErrors.category = "カテゴリは必須です";
    }

    // URL validation
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "有効なGitHub URLを入力してください";
    }

    if (formData.deployUrl && !isValidUrl(formData.deployUrl)) {
      newErrors.deployUrl = "有効なURLを入力してください";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.apps.create(formData);
      alert("アプリが正常に投稿されました！");
      navigate("/");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: Partial<CreateAppData> = {};
        
        // APIエラーをフォームエラーに変換
        Object.keys(apiErrors).forEach((key) => {
          if (key in formData) {
            newErrors[key as keyof CreateAppData] = apiErrors[key].join(', ');
          }
        });
        
        setErrors(newErrors);
      } else {
        alert("投稿に失敗しました。もう一度お試しください。");
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
              <h1 className="text-xl font-semibold text-gray-900">新しいアプリを投稿</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* メインフォーム */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">基本情報</CardTitle>
                  <CardDescription className="text-left">アプリの基本的な情報を入力してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-left">
                      アプリタイトル <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="例: タスク管理アプリ"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-left">
                      説明文 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="アプリの機能や特徴を詳しく説明してください..."
                      rows={4}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    <p className="text-sm text-gray-500 mt-1">Markdown記法が使用できます</p>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-left">
                      カテゴリ <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
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
                </CardContent>
              </Card>

              {/* サムネイル画像 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">サムネイル画像</CardTitle>
                  <CardDescription className="text-left">アプリのサムネイル画像を設定してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 現在の画像 */}
                  {thumbnailPreview && (
                    <div className="flex justify-center">
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
                            setFormData((prev) => ({ ...prev, thumbnailImage: undefined }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 画像アップロード */}
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

                  <p className="text-xs text-gray-500 text-center">
                    JPG、PNG、GIF形式をサポート
                    <br />
                    推奨サイズ: 600x400px
                  </p>
                </CardContent>
              </Card>

              {/* リンク情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">リンク情報</CardTitle>
                  <CardDescription className="text-left">GitHubリポジトリや公開先URLを入力してください（任意）</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="githubUrl" className="text-left">
                      <Github className="w-4 h-4 inline mr-2" />
                      GitHubリポジトリURL
                    </Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className={errors.githubUrl ? "border-red-500" : ""}
                    />
                    {errors.githubUrl && <p className="text-sm text-red-500 mt-1">{errors.githubUrl}</p>}
                  </div>

                  <div>
                    <Label htmlFor="deployUrl" className="text-left">
                      <ExternalLink className="w-4 h-4 inline mr-2" />
                      公開先URL
                    </Label>
                    <Input
                      id="deployUrl"
                      value={formData.deployUrl}
                      onChange={(e) => handleInputChange("deployUrl", e.target.value)}
                      placeholder="https://your-app.vercel.app"
                      className={errors.deployUrl ? "border-red-500" : ""}
                    />
                    {errors.deployUrl && <p className="text-sm text-red-500 mt-1">{errors.deployUrl}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* バージョン情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">バージョン情報</CardTitle>
                  <CardDescription className="text-left">初回リリースのバージョン番号</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="versionNumber" className="text-left">バージョン番号</Label>
                    <Input
                      id="versionNumber"
                      value="1.0.0"
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">初回リリースは1.0.0で固定されます</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* プレビュー */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">投稿後の表示イメージ</CardTitle>
                  <CardDescription className="text-left">投稿後はこのように表示されます</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-left">
                        {formData.title || "アプリタイトル"}
                      </h3>
                      <Badge variant="secondary">{formData.category || "カテゴリ"}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 text-left line-clamp-2">
                      {formData.description || "アプリの説明文がここに表示されます"}
                    </p>
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{user?.username}</span>
                      <span className="text-xs text-gray-400">v1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">-</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 投稿ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" asChild>
              <Link to="/">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  投稿中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  アプリを投稿
                </>
              )}
            </Button>
          </div>

          {/* 注意事項 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              投稿されたアプリは他のユーザーに公開され、フィードバックを受け取ることができます。
              不適切な内容や著作権を侵害する内容は投稿しないでください。
            </AlertDescription>
          </Alert>
        </form>
      </div>
    </div>
  );
}