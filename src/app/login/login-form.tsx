"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { MailIcon, Eye, EyeOff } from "lucide-react"
import { authWithGithub } from "@/utils/auth/auth"
import MagicLinkModal from "@/components/auth/magicModal"
import { ForgotPasswordModal } from "./forgot-password"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [magicOpen, setMagicOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.code === "email_not_confirmed") {
        toast.error("Please verify your email before logging in.")
        setIsSubmitting(false)
        return
      }
      if (error.code === "invalid_credentials") {
        toast.error("Invalid credentials")
        setIsSubmitting(false)
        return
      }
      toast.error(error.message)
      setFormError(error.message)
      setIsSubmitting(false)
      return
    }

    toast.success("Logged in successfully!")
    window.location.href = "/dashboard"
    setIsSubmitting(false)
  }

  const handleGithubLogin = async () => {
    setIsSubmitting(true)
    try {
      await authWithGithub()
    } catch {
      setFormError("GitHub login failed")
      toast.error("GitHub login failed")
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <MagicLinkModal open={magicOpen} onOpenChange={setMagicOpen} />
      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Login with your Apple or Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setMagicOpen(true)}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <MailIcon className="mr-2 h-4 w-4" />
                    Login with Email
                  </Button>
                  {/* <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleGithubLogin}
                    disabled={isSubmitting}
                    type="button"
                  >
                    <FaGithub className="mr-2 h-4 w-4" />
                    Login with Github
                  </Button> */}
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      {/* <button
                        type="button"
                        onClick={() => setForgotOpen(true)}
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </button> */}
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} name="password" required />
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
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                  {formError && <div className="text-center text-sm text-destructive">{formError}</div>}
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="underline underline-offset-4">
                    Register
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </>
  )
}
