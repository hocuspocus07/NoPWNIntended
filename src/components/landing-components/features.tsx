"use client"
import { Bug, ChartBar, Code2, History, ScanSearch, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <Image src="/images/blurred-shape-gray.svg" width={760} height={668} alt="Blurred shape" />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-50"
        aria-hidden="true"
      >
        <Image src="/images/blurred-shape.svg" width={760} height={668} alt="Blurred shape" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-400/.25),transparent)1] md:py-20">
          {/* Section header */}
          <motion.div
            className="mx-auto max-w-3xl pb-4 text-center md:pb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent font-nacelle">
                Security Features
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-extrabold text-transparent md:text-4xl">
              Unleash the Power of Modern Pentesting
            </h2>
            <p className="text-lg text-indigo-200/80 font-inter">
              Everything you need for reconnaissance, vulnerability discovery, exploitation, and reporting—<span className="font-semibold text-indigo-300">all in one seamless platform</span>.
            </p>
          </motion.div>
          <motion.div
            className="flex justify-center pb-4 md:pb-12"
            data-aos="fade-up"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Image src="/images/hero-image-01.jpg" width={1104} height={384} alt="Features" />
          </motion.div>
          {/* Items */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {[
              {
                icon: ScanSearch,
                title: "Reconnaissance Suite",
                desc: "Instantly discover subdomains, scan ports, and enumerate DNS records with blazing speed.",
              },
              {
                icon: ShieldAlert,
                title: "Vulnerability Scanning",
                desc: "Automated web scans, SSL/TLS analysis, and vulnerability checks for robust security.",
              },
              {
                icon: Bug,
                title: "Web Exploitation Tools",
                desc: "Fuzz directories, test for SQLi/XSS, and launch advanced payloads with ease.",
              },
              {
                icon: Code2,
                title: "Payload Crafting",
                desc: "Encode, decode, and crack hashes—build and test payloads in seconds.",
              },
              {
                icon: History,
                title: "Saved History",
                desc: "Generate professional reports, automate tasks, and access cheat sheets for efficient workflows.",
              },
              {
                icon: ChartBar,
                title: "Track Usage",
                desc: "Track your usage across months!",
              },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                className="flex flex-col items-center justify-start text-center h-full w-full space-y-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                viewport={{ once: true }}
              >
                <item.icon className="w-12 h-12 text-indigo-500 mb-2 drop-shadow-lg" />
                <h3 className="font-nacelle text-lg font-semibold text-gray-200">{item.title}</h3>
                <p className="text-indigo-200/80 font-inter">{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}