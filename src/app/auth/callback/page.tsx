"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Mode = "loading" | "reset" | "signin" | "invalid"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [mode, setMode] = useState<Mode>("loading")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)

    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
    const hashParams = new URLSearchParams(hash)
    const hashType = (hashParams.get("type") || "").toLowerCase()

    if (hashType === "recovery") {
      setMode("reset")
    } else if (["magiclink", "signup", "invite"].includes(hashType)) {
      setMode("signin")
    }

    const searchParams = new URLSearchParams(url.search)
    const code = searchParams.get("code")
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("exchangeCodeForSession error:", error)
          setMode("invalid")
        } else {
          setMode("signin")
        }
      })
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset")
      if (event === "SIGNED_IN") setMode((m) => (m === "reset" ? "reset" : "signin"))
    })

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setMode((m) => (m === "reset" ? "reset" : "signin"))
      } else if (!hashType && !code) {
        setMode("invalid")
      }
    })()

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (mode === "signin") {
      const t = setTimeout(() => {
        router.replace("/dashboard")
      }, 300)
      return () => clearTimeout(t)
    }
  }, [mode, router])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const password = String(fd.get("password") || "")
    const confirm = String(fd.get("confirm") || "")

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      setIsSubmitting(false)
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setIsSubmitting(false)
      return
    }

    toast.success("Password reset successfully!")
    const { data } = await supabase.auth.getSession()
    router.replace(data.session ? "/dashboard" : "/login")
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w/full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-bold text-2xl">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image src="/images/icon-no-bg.png" width={20} height={20} alt="Icon" />
          </div>
          NoPWNIntended
        </Link>

        {mode === "loading" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">One moment…</CardTitle>
              <CardDescription>We’re preparing your secure session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Loading…</div>
            </CardContent>
          </Card>
        )}

        {mode === "invalid" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Link not valid</CardTitle>
              <CardDescription>This link is invalid or expired.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {mode === "signin" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Signing you in…</CardTitle>
              <CardDescription>You’ll be redirected shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Please wait…</div>
            </CardContent>
          </Card>
        )}

        {mode === "reset" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Reset your password</CardTitle>
              <CardDescription>Enter a new password to secure your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
