import { Bug, Code2, History, ScanSearch, ShieldAlert } from "lucide-react";
import Image from "next/image";

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
          <div className="mx-auto max-w-3xl pb-4 text-center md:pb-12">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                Security Features
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              Essential Tools for Modern Pentesters
            </h2>
            <p className="text-lg text-indigo-200/65">
              All-in-one toolkit for reconnaissance, vulnerability assessment, exploitation, and reporting.
            </p>
          </div>
          <div className="flex justify-center pb-4 md:pb-12" data-aos="fade-up">
            <Image src="/images/features.png" width={1104} height={384} alt="Features" />
          </div>
          {/* Items */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            <article className="flex flex-col items-center justify-start text-center h-full w-full space-y-3">
              <ScanSearch className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="font-nacelle text-[1rem] font-semibold text-gray-200">
                Reconnaissance Suite
              </h3>
              <p className="text-indigo-200/65">
                Discover subdomains, scan ports and enumerate DNS.
              </p>
            </article>
            <article className="flex flex-col items-center justify-start text-center h-full w-full space-y-3">
              <ShieldAlert className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="font-nacelle text-[1rem] font-semibold text-gray-200">
                Vulnerability Scanning
              </h3>
              <p className="text-indigo-200/65">
                Web scans, SSL/TLS analysis, and check for vulnerabilities.
              </p>
            </article>
            <article className="flex flex-col items-center justify-start text-center h-full w-full space-y-3">
              <Bug className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="font-nacelle text-[1rem] font-semibold text-gray-200">
                Web Exploitation Tools
              </h3>
              <p className="text-indigo-200/65">
                Fuzz directories, test for SQLi/XSS, and test XSS payloads.
              </p>
            </article>
            <article className="flex flex-col items-center justify-start text-center h-full w-full space-y-3">
              <Code2 className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="font-nacelle text-[1rem] font-semibold text-gray-200">
                Payload Crafting
              </h3>
              <p className="text-indigo-200/65">
                Encode/Decode payloads with ease, crack hashes.
              </p>
            </article>
            <article className="flex flex-col items-center justify-start text-center h-full w-full space-y-3">
              <History className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="font-nacelle text-[1rem] font-semibold text-gray-200">
                Saved History
              </h3>
              <p className="text-indigo-200/65">
                Generate professional reports, automate tasks, and access cheat sheets for efficient workflows.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}