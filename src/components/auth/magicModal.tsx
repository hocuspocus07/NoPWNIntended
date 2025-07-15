"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"

export default function MagicLinkModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMagicLink = async () => {
    setIsSubmitting(true)
    setError(null)

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.")
      setIsSubmitting(false)
      return
    }

    // Check if user exists manually
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (profileError) {
      toast.error("User with this email does not exist.")
      setError("No user found with that email.")
      setIsSubmitting(false)
      return
    }

    // Send magic link
    const { error: loginError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${location.origin}/dashboard`,
      },
    })

    if (loginError) {
        if (loginError.code === "email_not_confirmed") {
          toast.error("Please check your email to verify your account first.");
        } else {
          toast.error(loginError.message);
        }
      }else {
      toast.success("Check your email for the magic link.")
      onOpenChange(false); // Close modal
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login with Magic Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleMagicLink} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Magic Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
