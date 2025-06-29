"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await login(formData.email, formData.password)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoLogin = async (userType: "user1" | "user2") => {
    const demoCredentials = {
      user1: { email: "tanaka@example.com", password: "password123" },
      user2: { email: "sato@example.com", password: "password123" },
    }

    const credentials = demoCredentials[userType]
    setFormData(credentials)

    setIsSubmitting(true)
    try {
      await login(credentials.email, credentials.password)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
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
                    className="pr-10"
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
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
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
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
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
  )
}
