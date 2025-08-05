"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {toast} from 'sonner'
import { FaGithub } from "react-icons/fa"
import { MailIcon } from "lucide-react"
import { authWithGithub } from "@/utils/auth/auth";
import MagicLinkModal from "@/components/auth/magicModal"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [magicOpen, setMagicOpen] = useState(false)
  const supabase=createClient()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Use Supabase client SDK for login
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.code === "email_not_confirmed") {
        toast.error("Please check your email and follow the link to verify your account before logging in.");
        return { error: "unverified" };
      }
      if(error.code==="invalid_credentials"){
        toast.error("Invalid credentials")
        return { error: "invalid" };
      }
      toast.error(error.message)
      setFormError(error.message)
      setIsSubmitting(false)
      return
    }

    toast.success("Logged in successfully!")
    // Redirect to dashboard
    window.location.href = '/dashboard'
    setIsSubmitting(false)
  }
  const handleGithubLogin = async () => {
    setIsSubmitting(true);
    try {
      await authWithGithub();
    } catch (err) {
      setFormError("GitHub login failed");
    }
    setIsSubmitting(false);
  };
  return (
    <>
      <MagicLinkModal open={magicOpen} onOpenChange={setMagicOpen} />
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" onClick={() => setMagicOpen(true)} disabled={isSubmitting} type="button">
                    <MailIcon/>
                    Login with Email
                  </Button>
                  {/* <Button variant="outline" className="w-full" onClick={handleGithubLogin} disabled={isSubmitting} type="button">
                    <FaGithub/>
                    Login with Github
                  </Button> */}
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" name="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
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
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </>
  );
}