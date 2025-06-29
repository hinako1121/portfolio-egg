"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Github, ExternalLink, ArrowLeft, Eye, Save, AlertCircle, ImageIcon, X } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"

interface AppFormData {
  title: string
  description: string
  thumbnail: string | null
  category: string
  githubUrl: string
  deployUrl: string
  versionNumber: string
}

const categories = ["Webアプリ", "モバイルアプリ", "ゲーム", "デスクトップアプリ", "API・ライブラリ", "その他"]

export default function PostApp() {
  const [formData, setFormData] = useState<AppFormData>({
    title: "",
    description: "",
    thumbnail: null,
    category: "",
    githubUrl: "",
    deployUrl: "",
    versionNumber: "1.0",
  })

  const [errors, setErrors] = useState<Partial<AppFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (field: keyof AppFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, thumbnail: e.target?.result as string }))
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
    const newErrors: Partial<AppFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = "タイトルは必須です"
    }
    if (!formData.description.trim()) {
      newErrors.description = "説明文は必須です"
    }
    if (!formData.category) {
      newErrors.category = "カテゴリを選択してください"
    }
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "有効なURLを入力してください"
    }
    if (formData.deployUrl && !isValidUrl(formData.deployUrl)) {
      newErrors.deployUrl = "有効なURLを入力してください"
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

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      alert("アプリが正常に投稿されました！")
      // Redirect to app detail or dashboard
    } catch (error) {
      alert("投稿に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  const AppPreview = () => (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0">
        {formData.thumbnail ? (
          <img
            src={formData.thumbnail || "/placeholder.svg"}
            alt={formData.title || "アプリのサムネイル"}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{formData.title || "アプリタイトル"}</CardTitle>
          {formData.category && <Badge variant="secondary">{formData.category}</Badge>}
        </div>
        <CardDescription className="text-sm text-gray-600 mb-3">
          {formData.description || "アプリの説明文がここに表示されます..."}
        </CardDescription>
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarFallback>あ</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">あなた</span>
          <span className="text-xs text-gray-400">v{formData.versionNumber}</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ナビゲーションバー */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">新しいアプリを投稿</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? "編集" : "プレビュー"}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {previewMode ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">プレビュー</h2>
                <p className="text-gray-600 mb-8">投稿後はこのように表示されます</p>
              </div>
              <div className="flex justify-center">
                <AppPreview />
              </div>
              <div className="flex justify-center">
                <Button onClick={() => setPreviewMode(false)}>編集に戻る</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* メインフォーム */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 基本情報 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>基本情報</CardTitle>
                      <CardDescription>アプリの基本的な情報を入力してください</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">
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
                        <Label htmlFor="description">
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
                        <Label htmlFor="category">
                          カテゴリ <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                            <SelectValue placeholder="カテゴリを選択してください" />
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
                      <CardTitle>サムネイル画像</CardTitle>
                      <CardDescription>アプリの代表画像をアップロードしてください</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {formData.thumbnail ? (
                          <div className="relative">
                            <img
                              src={formData.thumbnail || "/placeholder.svg"}
                              alt="サムネイル"
                              className="max-w-full h-48 object-cover rounded mx-auto"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData((prev) => ({ ...prev, thumbnail: null }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">画像をドラッグ&ドロップするか、クリックして選択</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(e.target.files[0])
                                }
                              }}
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <Label htmlFor="thumbnail-upload">
                              <Button type="button" variant="outline" asChild>
                                <span>ファイルを選択</span>
                              </Button>
                            </Label>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* リンク情報 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>リンク情報</CardTitle>
                      <CardDescription>GitHubリポジトリや公開先URLを入力してください（任意）</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="githubUrl">
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
                        <Label htmlFor="deployUrl">
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
                      <CardTitle>バージョン情報</CardTitle>
                      <CardDescription>初回投稿時のバージョン番号を設定してください</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="versionNumber">バージョン番号</Label>
                        <Input
                          id="versionNumber"
                          value={formData.versionNumber}
                          onChange={(e) => handleInputChange("versionNumber", e.target.value)}
                          placeholder="1.0"
                        />
                        <p className="text-sm text-gray-500 mt-1">例: 1.0, 1.0.0, v1.0など</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* サイドバー（プレビュー） */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">プレビュー</CardTitle>
                        <CardDescription>投稿後の表示イメージ</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AppPreview />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* 投稿ボタン */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/">キャンセル</Link>
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
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
