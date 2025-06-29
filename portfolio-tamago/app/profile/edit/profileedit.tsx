"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"

interface ProfileFormData {
  username: string
  bio: string
  avatar: string
  githubUrl: string
  twitterUrl: string
  websiteUrl: string
  location: string
}

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    bio: "",
    avatar: "",
    githubUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    location: "",
  })

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        githubUrl: user.githubUrl || "",
        twitterUrl: user.twitterUrl || "",
        websiteUrl: user.websiteUrl || "",
        location: user.location || "",
      })
    }
  }, [user])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, avatar: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {}

    if (!formData.username.trim()) {
      newErrors.username = "ユーザー名は必須です"
    } else if (formData.username.length < 2) {
      newErrors.username = "ユーザー名は2文字以上で入力してください"
    } else if (formData.username.length > 50) {
      newErrors.username = "ユーザー名は50文字以内で入力してください"
    }

    if (formData.bio.length > 500) {
      newErrors.bio = "自己紹介は500文字以内で入力してください"
    }

    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "有効なURLを入力してください"
    }

    if (formData.twitterUrl && !isValidUrl(formData.twitterUrl)) {
      newErrors.twitterUrl = "有効なURLを入力してください"
    }

    if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "有効なURLを入力してください"
    }

    if (formData.location.length > 100) {
      newErrors.location = "所在地は100文字以内で入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      await updateProfile(formData)
      setSuccessMessage("プロフィールを更新しました！")

      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (error) {
      setErrors({ username: error instanceof Error ? error.message : "更新に失敗しました" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ナビゲーションバー */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">プロフィール編集</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* メインフォーム */}
              <div className="lg:col-span-2 space-y-6">
                {/* 基本情報 */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>あなたの基本的なプロフィール情報を編集してください</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="username">
                        ユーザー名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="田中太郎"
                        className={errors.username ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                    </div>

                    <div>
                      <Label htmlFor="bio">自己紹介</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="あなたについて教えてください..."
                        rows={4}
                        className={errors.bio ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
                      <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500文字</p>
                    </div>

                    <div>
                      <Label htmlFor="location">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        所在地
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="東京, 日本"
                        className={errors.location ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* SNSリンク */}
                <Card>
                  <CardHeader>
                    <CardTitle>SNS・Webサイト</CardTitle>
                    <CardDescription>あなたのSNSアカウントやWebサイトのリンクを追加してください</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="githubUrl">
                        <Github className="w-4 h-4 inline mr-2" />
                        GitHub URL
                      </Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                        placeholder="https://github.com/username"
                        className={errors.githubUrl ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.githubUrl && <p className="text-sm text-red-500 mt-1">{errors.githubUrl}</p>}
                    </div>

                    <div>
                      <Label htmlFor="twitterUrl">
                        <Twitter className="w-4 h-4 inline mr-2" />
                        Twitter URL
                      </Label>
                      <Input
                        id="twitterUrl"
                        value={formData.twitterUrl}
                        onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                        placeholder="https://twitter.com/username"
                        className={errors.twitterUrl ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.twitterUrl && <p className="text-sm text-red-500 mt-1">{errors.twitterUrl}</p>}
                    </div>

                    <div>
                      <Label htmlFor="websiteUrl">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website URL
                      </Label>
                      <Input
                        id="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                        placeholder="https://your-website.com"
                        className={errors.websiteUrl ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.websiteUrl && <p className="text-sm text-red-500 mt-1">{errors.websiteUrl}</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* サイドバー（プロフィール画像） */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">プロフィール画像</CardTitle>
                      <CardDescription>あなたのプロフィール画像を設定してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 現在の画像 */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <Avatar className="w-32 h-32">
                            <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="プロフィール画像" />
                            <AvatarFallback className="text-2xl">{formData.username[0] || "?"}</AvatarFallback>
                          </Avatar>
                          {formData.avatar && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                              onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                              disabled={isSubmitting}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

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
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">画像をドラッグ&ドロップ</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(e.target.files[0])
                            }
                          }}
                          className="hidden"
                          id="avatar-upload"
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="avatar-upload">
                          <Button type="button" variant="outline" size="sm" asChild disabled={isSubmitting}>
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
                        最大サイズ: 5MB
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                <Link href="/profile">キャンセル</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
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
                プロフィール情報は他のユーザーに公開されます。 個人情報の取り扱いにはご注意ください。
              </AlertDescription>
            </Alert>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
