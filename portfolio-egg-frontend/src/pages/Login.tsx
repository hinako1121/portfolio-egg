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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🥚 Portfolio Egg</h1>
          </Link>
          <p className="text-gray-600">アプリを投稿してフィードバックを受け取ろう</p>
        </div>

        <Card className="w-full max-w-md bg-white/80">
          <CardHeader>
            <CardTitle className="text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              アカウントにログインしてアプリを投稿・管理しましょう
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert variant="destructive" className="bg-white/80">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-left">
                  <Mail className="w-4 h-4 inline mr-2" />
                  メールアドレス <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="メールアドレスを入力"
                  className={`bg-white/80 focus:ring-0 focus:border-gray-300 ${errors.email ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-left">
                  <Lock className="w-4 h-4 inline mr-2" />
                  パスワード <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="パスワードを入力"
                    className={`bg-white/80 focus:ring-0 focus:border-gray-300 ${errors.password ? "border-red-500" : ""}`}
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

              <Button type="submit" className="w-full bg-stone-600 hover:bg-stone-700 text-white" disabled={isSubmitting}>
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

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 text-gray-500">または</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  アカウントをお持ちでない方は{" "}
                  <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    新規登録
                  </Link>
                  してください
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 