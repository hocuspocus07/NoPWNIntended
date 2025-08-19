"use client"
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
export default function Cta() {
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
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <Image src="/images/blurred-shape.svg" width={760} height={668} alt="Blurred shape" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-transparent via-gray-800/50 py-12 md:py-20">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-3xl font-extrabold text-transparent md:text-4xl"
              data-aos="fade-up"
            >
              Ready to Elevate Your Security Game?
            </h2>
            <p className="mb-8 text-indigo-200/80 font-inter">
              Join thousands of professionals using the most advanced pentesting toolkit. <span className="font-semibold text-indigo-300">Start your journey today!</span>
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button variant="outline" className="w-full font-inter" onClick={
                  () => {
                    if (loggedIn) {
                      window.location.href = "/dashboard";
                    } else {
                      window.location.href = "/login";
                    }
                  }
                }>
                  Get Started
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}