"use client"
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
export default function HeroHome() {
   const [loggedIn, setIsLoggedIn] = useState(false);
    const supabase = createClient();
    useEffect(() => {
      const getSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          setIsLoggedIn(false);
        }
      }
      getSession();
    }
  )
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <motion.div
            className="pb-12 text-center md:pb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-extrabold text-transparent md:text-5xl">
              Offensive Security Platform for the Next Generation
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-xl text-indigo-200/80 font-inter">
                Supercharge your penetration testing and red teaming with a unified, intuitive toolkit. <span className="font-semibold text-indigo-300">Work smarter, not harder.</span>
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Button variant="outline" className="btn relative w-full" onClick={
                    ()=>{
                      if(loggedIn){
                        window.location.href="/dashboard";
                      }else{
                        window.location.href="/login";
                      }
                    }
                  }>
                    <span className="font-inter">Get Started</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}