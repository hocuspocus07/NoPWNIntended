"use client"
import Image from "next/image"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-bold text-2xl">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image src="/images/icon-no-bg.png" width={20} height={20} alt="Icon" />
          </div>
          NoPWNIntended
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
