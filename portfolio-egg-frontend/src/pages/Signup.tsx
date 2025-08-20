import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Github } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api, type SignupData } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithGitHub, firebaseConfigValid } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupData & { general?: string }>>({});

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    password_confirmation: "",
    username: ""
  });

  const handleInputChange = (field: keyof SignupData, value: string) => {
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
    const newErrors: Partial<SignupData> = {};

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.username.trim()) {
      newErrors.username = "ユーザー名は必須です";
    } else if (formData.username.length < 2) {
      newErrors.username = "ユーザー名は2文字以上で入力してください";
    } else if (formData.username.length > 20) {
      newErrors.username = "ユーザー名は20文字以下で入力してください";
    }

    if (!formData.password.trim()) {
      newErrors.password = "パスワードは必須です";
    } else if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください";
    }

    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = "パスワード確認は必須です";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "パスワードが一致しません";
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
      await signup(formData.email, formData.password, formData.password_confirmation, formData.username);
      //サインアップ後、自動ログイン
      alert("アカウントを作成しました！");
      navigate("/");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        
        // APIエラーをフォームエラーに変換
        if (apiErrors.email) {
          setErrors(prev => ({ ...prev, email: apiErrors.email.join(', ') }));
        }
        if (apiErrors.username) {
          setErrors(prev => ({ ...prev, username: apiErrors.username.join(', ') }));
        }
        if (apiErrors.password) {
          setErrors(prev => ({ ...prev, password: apiErrors.password.join(', ') }));
        }
        if (apiErrors.password_confirmation) {
          setErrors(prev => ({ ...prev, password_confirmation: apiErrors.password_confirmation.join(', ') }));
        }
        if (apiErrors.base) {
          setErrors(prev => ({ ...prev, general: apiErrors.base.join(', ') }));
        }
      } else {
        setErrors({ general: "アカウント作成に失敗しました。もう一度お試しください。" });
      }
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
            <div className="flex items-center justify-center space-x-3 mb-2">
                              <Logo width={24} height={24} className="sm:w-10 sm:h-10" />
                              <h1 className="text-base sm:text-2xl font-bold text-gray-900">Portfolio Egg</h1>
            </div>
          </Link>
                          <p className="text-sm text-gray-600">アプリを投稿してフィードバックを受け取ろう</p>
        </div>

        <Card className="w-full max-w-md bg-white/80">
          <CardHeader>
            <CardTitle className="text-center text-sm sm:text-base">アカウントを作成</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              必要な情報を入力してアカウントを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive" className="bg-white/80">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="username" className="text-left text-sm sm:text-base">
                  <User className="w-4 h-4 inline mr-2" />
                  ユーザー名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="ユーザー名を入力"
                  className={`bg-white/80 focus:ring-0 focus:border-gray-300 ${errors.username ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                <p className="text-sm text-gray-500 mt-1">2-20文字で入力してください</p>
              </div>

              <div>
                <Label htmlFor="email" className="text-left text-sm sm:text-base">
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
                <Label htmlFor="password" className="text-left text-sm sm:text-base">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                <p className="text-sm text-gray-500 mt-1">6文字以上で入力してください</p>
              </div>

              <div>
                <Label htmlFor="passwordConfirmation" className="text-left text-sm sm:text-base">
                  <Lock className="w-4 h-4 inline mr-2" />
                  パスワード確認 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                    placeholder="パスワードを再入力"
                    className={`bg-white/80 focus:ring-0 focus:border-gray-300 ${errors.password_confirmation ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-stone-600 hover:bg-stone-700 text-white text-xs sm:text-sm">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    作成中...
                  </>
                ) : (
                  "アカウントを作成"
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

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full ${firebaseConfigValid ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'}`}
                  onClick={firebaseConfigValid ? loginWithGoogle : undefined}
                  disabled={!firebaseConfigValid}
                  title={!firebaseConfigValid ? "Firebase認証が設定されていません" : ""}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Googleでログイン {!firebaseConfigValid && "(設定待ち)"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full ${firebaseConfigValid ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900' : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'}`}
                  onClick={firebaseConfigValid ? loginWithGitHub : undefined}
                  disabled={!firebaseConfigValid}
                  title={!firebaseConfigValid ? "Firebase認証が設定されていません" : ""}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHubでログイン {!firebaseConfigValid && "(設定待ち)"}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  すでにアカウントをお持ちの方は{" "}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    ログイン
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