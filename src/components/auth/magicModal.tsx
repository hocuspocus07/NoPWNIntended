"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { signInWithMagicLink } from "@/utils/auth/auth"

type MagicLinkModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function MagicLinkModal({ open = false, onOpenChange = () => {} }: MagicLinkModalProps) {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set("email", email)
      const res = await signInWithMagicLink(fd)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(res?.message || "Check your email for the magic link")
        onOpenChange(false)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send magic link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="magic-desc" className="text-foreground">
        <DialogHeader>
          <DialogTitle>Login with Email</DialogTitle>
          <DialogDescription id="magic-desc">Enter your email and we&apos;ll send you a magic link.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send magic link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
