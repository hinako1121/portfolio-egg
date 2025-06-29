"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  githubUrl?: string
  twitterUrl?: string
  websiteUrl?: string
  location?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// モックユーザーデータ
const mockUsers = [
  {
    id: "1",
    username: "田中太郎",
    email: "tanaka@example.com",
    password: "password123",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "フロントエンド開発者です。React/Next.jsを中心に開発しています。",
    githubUrl: "https://github.com/tanaka",
    twitterUrl: "https://twitter.com/tanaka",
    websiteUrl: "https://tanaka-portfolio.com",
    location: "東京, 日本",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "佐藤花子",
    email: "sato@example.com",
    password: "password123",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "UI/UXデザイナー兼フロントエンド開発者です。",
    githubUrl: "https://github.com/sato",
    location: "大阪, 日本",
    createdAt: "2024-01-02T00:00:00Z",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user_data")

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!mockUser) {
        throw new Error("メールアドレスまたはパスワードが正しくありません")
      }

      const { password: _, ...userWithoutPassword } = mockUser
      const token = `mock_token_${mockUser.id}_${Date.now()}`

      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))

      setUser(userWithoutPassword)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if email already exists
      const existingUser = mockUsers.find((u) => u.email === email)
      if (existingUser) {
        throw new Error("このメールアドレスは既に登録されています")
      }

      // Create new user
      const newUser: User = {
        id: `${Date.now()}`,
        username,
        email,
        avatar: "/placeholder.svg?height=80&width=80",
        bio: "",
        createdAt: new Date().toISOString(),
      }

      const token = `mock_token_${newUser.id}_${Date.now()}`

      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(newUser))

      setUser(newUser)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error("ユーザーがログインしていません")
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data
      const updatedUser = { ...user, ...profileData }

      localStorage.setItem("user_data", JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    signup,
    updateProfile,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
