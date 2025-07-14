"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleAuth = async () => {
      // Wait for session to be set
      let user = null;
      for (let i = 0; i < 10; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          user = session.user;
          break;
        }
        await new Promise(res => setTimeout(res, 200));
      }
      if (!user) {
        setStatus("error");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      // Insert user into users table if not exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!existing) {
        await supabase.from("users").insert({
          name: user.user_metadata?.name || user.user_metadata?.full_name || "",
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: new Date().toISOString(),
        });
      }

      setStatus("success");
      setTimeout(() => router.replace("/dashboard"), 1500);
    };
    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen font-nacelle text-2xl">
      {status === "loading" && "Authenticating..."}
      {status === "success" && "Registration complete! Redirecting..."}
      {status === "error" && "Authentication failed. Redirecting..."}
    </div>
  );
}