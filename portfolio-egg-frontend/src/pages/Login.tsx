import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Github } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.password.trim()) {
      newErrors.password = "パスワードは必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      alert("ログインしました！");
      navigate("/");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        
        // APIエラーをフォームエラーに変換
        if (apiErrors.email) {
          setErrors(prev => ({ ...prev, email: apiErrors.email.join(', ') }));
        }
        if (apiErrors.password) {
          setErrors(prev => ({ ...prev, password: apiErrors.password.join(', ') }));
        }
        if (apiErrors.base) {
          setErrors(prev => ({ ...prev, general: apiErrors.base.join(', ') }));
        }
      } else if (error.response?.status === 401) {
        setErrors({ general: "メールアドレスまたはパスワードが正しくありません" });
      } else {
        setErrors({ general: "ログインに失敗しました。もう一度お試しください。" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (userType: "user1" | "user2") => {
    const demoCredentials = {
      user1: { email: "tanaka@example.com", password: "password123" },
      user2: { email: "sato@example.com", password: "password123" },
    };

    const credentials = demoCredentials[userType];
    setFormData(credentials);

    setIsSubmitting(true);
    try {
      await login(credentials.email, credentials.password);
      navigate("/");
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "ログインに失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🥚 ポートフォリオのたまご</h1>
          </Link>
          <p className="text-gray-600">アプリを投稿してフィードバックを受け取ろう</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              アカウントにログインしてアプリを投稿・管理しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@example.com"
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="パスワードを入力"
                    className={errors.password ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                パスワードを忘れた場合
              </Link>
            </div>

            <Separator />

            {/* デモログイン */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">デモアカウントでログイン</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("user1")} disabled={isSubmitting}>
                  田中太郎
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin("user2")} disabled={isSubmitting}>
                  佐藤花子
                </Button>
              </div>
            </div>

            <Separator />

            {/* SNSログイン（将来の実装用） */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent" disabled>
                <Github className="w-4 h-4 mr-2" />
                GitHubでログイン（準備中）
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              アカウントをお持ちでない場合は{" "}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                新規登録
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 ポートフォリオのたまご. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 