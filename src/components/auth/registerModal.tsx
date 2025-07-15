'use client'

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpWithMagicLink } from "@/utils/auth/auth"

interface RegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    if (!email) {
      setFormError("Please input an email")
      return
    }

    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("email", email)

      const result = await signUpWithMagicLink(formData)

      if (result?.error === "duplicate") {
        toast.error("An account with this email already exists. Please log in or use a different email.");
      } else if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("User Registered successfully, check your email for the magic link");
      }
    } catch (err) {
      toast.error("Something went wrong.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up with your email and start exploring.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {formError && <div className="text-sm text-destructive">{formError}</div>}

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
