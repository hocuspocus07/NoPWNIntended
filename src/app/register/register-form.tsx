"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { MailIcon, Eye, EyeOff } from "lucide-react"
import { signup } from "../login/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RegisterModal } from "@/components/auth/registerModal"
// import { FaGithub } from "react-icons/fa"
// import { authWithGithub } from "@/utils/auth/auth"

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setPasswordMatch(password === confirmPassword)
  }, [password, confirmPassword])

  useEffect(() => {
    let strength = 0
    const suggestions: string[] = []

    if (password.length >= 8) strength += 25
    else suggestions.push("At least 8 characters")

    if (/[A-Z]/.test(password)) strength += 25
    else suggestions.push("Add uppercase letters")

    if (/\d/.test(password)) strength += 25
    else suggestions.push("Add numbers")

    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    else suggestions.push("Add special characters")

    setPasswordStrength(strength)
    setPasswordSuggestions(suggestions)
  }, [password])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const pwd = formData.get("password") as string
    const confirmPwd = formData.get("confirm-password") as string

    if (pwd !== confirmPwd || passwordStrength < 50) {
      setFormError("Please fix password issues before submitting")
      setIsSubmitting(false)
      return
    }

    const result = await signup(formData)

    if (result?.success) {
      router.push("/login")
      toast.success("User registered successfully. Check your email for verification.")
    } else if (result?.error === "duplicate") {
      toast.error("An account with this email already exists. Please log in or use a different email.")
    } else {
      toast.error("Something went wrong")
      console.log(result?.error)
    }

    setIsSubmitting(false)
  }

  // const handleGithubSignup = async () => {
  //   setIsSubmitting(true)
  //   try {
  //     await authWithGithub()
  //   } catch {
  //     setFormError("GitHub signup failed")
  //     toast.error("GitHub signup failed")
  //   }
  //   setIsSubmitting(false)
  // }

  return (
    <>
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Register with your Apple or Google account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  disabled={isSubmitting}
                >
                  <MailIcon className="mr-2 h-4 w-4" />
                  Sign up with Email
                </Button>
                {/* <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  type="button"
                  onClick={handleGithubSignup}
                  disabled={isSubmitting}
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  Sign up with Github
                </Button> */}
              </div>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or register with email</span>
              </div>

              <form onSubmit={onSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" name="name" placeholder="John Doe" required />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                    <Progress value={passwordStrength} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {passwordStrength < 25 && "Too weak"}
                      {passwordStrength >= 25 && passwordStrength < 50 && "Weak"}
                      {passwordStrength >= 50 && passwordStrength < 75 && "Moderate"}
                      {passwordStrength >= 75 && passwordStrength < 100 && "Strong"}
                      {passwordStrength === 100 && "Very strong"}
                    </div>
                    {passwordSuggestions.length > 0 && password.length > 0 && (
                      <div className="text-xs text-muted-foreground">Suggestions: {passwordSuggestions.join(", ")}</div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {!passwordMatch && confirmPassword.length > 0 && (
                      <div className="text-xs text-destructive">Passwords do not match</div>
                    )}
                  </div>

                  {formError && <div className="text-sm text-destructive">{formError}</div>}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !passwordMatch || passwordStrength < 50}
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </>
  )
}
