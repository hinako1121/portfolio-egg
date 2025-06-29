import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type CreateVersionData, type AppDetail } from "@/lib/api";

export default function NewVersion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateVersionData>>({});
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<CreateVersionData>({
    version_number: "",
    changelog: ""
  });

  // アプリデータを読み込み
  useEffect(() => {
    const fetchAppData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await api.apps.get(parseInt(id));
        setApp(data);
        
        // 最新バージョン番号を取得して次のバージョン番号を提案
        if (data.app_versions.length > 0) {
          const latestVersion = data.app_versions[0];
          const versionParts = latestVersion.version_number.split('.');
          const major = parseInt(versionParts[0]) || 1;
          const minor = parseInt(versionParts[1]) || 0;
          const patch = parseInt(versionParts[2]) || 0;
          
          // パッチバージョンをインクリメント
          const nextVersion = `${major}.${minor}.${patch + 1}`;
          setFormData(prev => ({ ...prev, version_number: nextVersion }));
        } else {
          setFormData(prev => ({ ...prev, version_number: "1.0.0" }));
        }
      } catch (error) {
        console.error("アプリデータの取得に失敗しました:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAppData();
  }, [id, navigate]);

  const handleInputChange = (field: keyof CreateVersionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateVersionData> = {};

    if (!formData.version_number.trim()) {
      newErrors.version_number = "バージョン番号は必須です";
    } else {
      // バージョン番号の形式チェック（例: 1.0.0, 2.1.3など）
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(formData.version_number)) {
        newErrors.version_number = "バージョン番号は x.y.z の形式で入力してください（例: 1.0.0）";
      }
    }

    if (!formData.changelog.trim()) {
      newErrors.changelog = "変更履歴は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.versions.create(parseInt(id), formData);
      alert("バージョンが正常に追加されました！");
      navigate(`/apps/${id}`);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: Partial<CreateVersionData> = {};
        
        // APIエラーをフォームエラーに変換
        Object.keys(apiErrors).forEach((key) => {
          if (key in formData) {
            newErrors[key as keyof CreateVersionData] = apiErrors[key].join(', ');
          }
        });
        
        setErrors(newErrors);
      } else {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* メインフォーム */}
            <div className="space-y-6">
              {/* アプリ情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">アプリ情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={app.thumbnail_url || "/placeholder.svg"}
                      alt={app.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-left">{app.title}</h3>
                      <Badge variant="secondary">{app.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-left">{app.description}</p>
                </CardContent>
              </Card>

              {/* バージョン情報 */}
              <Card>
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
                      value={formData.version_number}
                      onChange={(e) => handleInputChange("version_number", e.target.value)}
                      placeholder="例: 1.0.0"
                      className={errors.version_number ? "border-red-500" : ""}
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
                      value={formData.changelog}
                      onChange={(e) => handleInputChange("changelog", e.target.value)}
                      placeholder="このバージョンでの変更内容を詳しく記述してください..."
                      rows={6}
                      className={errors.changelog ? "border-red-500" : ""}
                    />
                    {errors.changelog && <p className="text-sm text-red-500 mt-1">{errors.changelog}</p>}
                    <p className="text-sm text-gray-500 mt-1">Markdown記法が使用できます</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 現在のバージョン履歴 */}
              <Card>
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
              <Card>
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              新しいバージョンを追加すると、ユーザーはそのバージョンに対してフィードバックを投稿できるようになります。
              バージョン番号は一度設定すると変更できませんので、慎重に決定してください。
            </AlertDescription>
          </Alert>
        </form>
      </div>
    </div>
  );
} 