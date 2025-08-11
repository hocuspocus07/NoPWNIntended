"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/utils/supabase/client"

type ForgotPasswordModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ForgotPasswordModal({ open = false, onOpenChange = () => {} }: ForgotPasswordModalProps) {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Password reset email sent. Check your inbox.")
        onOpenChange(false)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="forgot-desc">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription id="forgot-desc">
            Enter the email associated with your account and we&apos;ll send a reset link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
