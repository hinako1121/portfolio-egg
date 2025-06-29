import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Github,
  Twitter,
  Globe,
  MapPin,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  X,
  Camera,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type UpdateProfileData, type User } from "@/lib/api";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Partial<UpdateProfileData>>({});
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateProfileData>({
    username: "",
    bio: "",
    github_url: "",
    profile_image: undefined
  });

  // プロフィールデータを読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await api.users.profile();
        setProfile(data);
        
        // フォームデータを初期化
        setFormData({
          username: data.username || "",
          bio: data.bio || "",
          github_url: data.github_url || "",
          profile_image: undefined
        });
        
        // プロフィール画像プレビューを設定
        if (data.profile_image_url) {
          setProfileImagePreview(data.profile_image_url);
        }
      } catch (error) {
        console.error("プロフィールデータの取得に失敗しました:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, profile_image: file }));
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
    const newErrors: Partial<UpdateProfileData> = {};

    if (!formData.username?.trim()) {
      newErrors.username = "ユーザー名は必須です";
    } else if (formData.username.length < 2) {
      newErrors.username = "ユーザー名は2文字以上で入力してください";
    } else if (formData.username.length > 20) {
      newErrors.username = "ユーザー名は20文字以下で入力してください";
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "自己紹介は500文字以下で入力してください";
    }

    // URL validation
    if (formData.github_url && !isValidUrl(formData.github_url)) {
      newErrors.github_url = "有効なGitHub URLを入力してください";
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
      await api.users.updateProfile(formData);
      alert("プロフィールが正常に更新されました！");
      navigate("/");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: Partial<UpdateProfileData> = {};
        
        // APIエラーをフォームエラーに変換
        Object.keys(apiErrors).forEach((key) => {
          if (key in formData) {
            newErrors[key as keyof UpdateProfileData] = apiErrors[key].join(', ');
          }
        });
        
        setErrors(newErrors);
      } else {
        alert("更新に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">プロフィールが見つかりません</p>
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
              <h1 className="text-xl font-semibold text-gray-900">プロフィール編集</h1>
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
                  <CardDescription className="text-left">プロフィールの基本情報を編集してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-left">
                      ユーザー名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="ユーザー名を入力"
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                    <p className="text-sm text-gray-500 mt-1">2-20文字で入力してください</p>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-left">
                      自己紹介
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="自己紹介を入力してください..."
                      rows={4}
                      className={errors.bio ? "border-red-500" : ""}
                    />
                    {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                    <p className="text-sm text-gray-500 mt-1">500文字以内で入力してください</p>
                  </div>

                  <div>
                    <Label htmlFor="githubUrl" className="text-left">
                      <Github className="w-4 h-4 inline mr-2" />
                      GitHub URL
                    </Label>
                    <Input
                      id="githubUrl"
                      value={formData.github_url}
                      onChange={(e) => handleInputChange("github_url", e.target.value)}
                      placeholder="https://github.com/username"
                      className={errors.github_url ? "border-red-500" : ""}
                    />
                    {errors.github_url && <p className="text-sm text-red-500 mt-1">{errors.github_url}</p>}
                    <p className="text-sm text-gray-500 mt-1">GitHubプロフィールのURLを入力してください（任意）</p>
                  </div>
                </CardContent>
              </Card>

              {/* プロフィール画像 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">プロフィール画像</CardTitle>
                  <CardDescription className="text-left">プロフィール画像を設定してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 現在の画像 */}
                  {profileImagePreview && (
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={profileImagePreview} alt="プロフィール画像" />
                          <AvatarFallback>{formData.username?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                          onClick={() => {
                            setProfileImagePreview(null);
                            setFormData((prev) => ({ ...prev, profile_image: undefined }));
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
                      id="profile-image-upload"
                    />
                    <Label htmlFor="profile-image-upload">
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
                    推奨サイズ: 400x400px
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 現在のプロフィール */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">現在のプロフィール</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} alt={profile.username} />
                      <AvatarFallback>{profile.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-left">{profile.username}</h3>
                      <p className="text-sm text-gray-500 text-left">{profile.email}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-gray-700 text-left mb-3">{profile.bio}</p>
                  )}
                  {profile.github_url && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Github className="w-4 h-4 text-gray-400" />
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        GitHub
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* アカウント情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-left">アカウント情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">メールアドレス</span>
                      <span className="font-medium">{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ユーザーID</span>
                      <span className="font-medium">{profile.id}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    メールアドレスとユーザーIDは変更できません
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" asChild>
              <Link to="/">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  変更を保存
                </>
              )}
            </Button>
          </div>

          {/* 注意事項 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              プロフィール情報は他のユーザーに公開されます。
              個人情報や機密情報は含めないでください。
            </AlertDescription>
          </Alert>
        </form>
      </div>
    </div>
  );
} 