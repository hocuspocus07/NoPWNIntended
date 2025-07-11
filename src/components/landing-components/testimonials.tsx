"use client";

import { useState } from "react";
import useMasonry from "@/utils/useMasonry";
import Image from "next/image";

const testimonials = [
  {
    img: "/images/testimonial-01.jpg",
    clientImg: "/images/client-logo-01.svg",
    name: "Alex R.",
    company: "CyberGuard",
    content:
      "This toolkit streamlined our entire recon and scanning workflow. The port scanner and subdomain finder are incredibly fast and accurate.",
    categories: [1, 2],
  },
  {
    img: "/images/testimonial-02.jpg",
    clientImg: "/images/client-logo-02.svg",
    name: "Priya S.",
    company: "RedTeamX",
    content:
      "I love the vulnerability modules! The Nikto-like scanner and SSL analyzer helped us uncover issues we missed before.",
    categories: [2, 3],
  },
  {
    img: "/images/testimonial-03.jpg",
    clientImg: "/images/client-logo-03.svg",
    name: "Marcus L.",
    company: "SecureOps",
    content:
      "Payload crafting and encoding tools are a lifesaver for quick exploit tests. The hash cracker is a nice bonus.",
    categories: [3, 4],
  },
  {
    img: "/images/testimonial-04.jpg",
    clientImg: "/images/client-logo-04.svg",
    name: "Elena G.",
    company: "BugBounty.io",
    content:
      "The web exploitation suite is top-notch. Directory brute-forcing and XSS testing are super intuitive and effective.",
    categories: [1, 3],
  },
  {
    img: "/images/testimonial-05.jpg",
    clientImg: "/images/client-logo-05.svg",
    name: "Samir T.",
    company: "NetSecure",
    content:
      "Network utilities like ping, traceroute, and packet analyzer make this my go-to toolkit for internal assessments.",
    categories: [4, 5],
  },
  {
    img: "/images/testimonial-06.jpg",
    clientImg: "/images/client-logo-06.svg",
    name: "Julia P.",
    company: "PentestPro",
    content:
      "Reporting and automation features save me hours every week. I can focus on findings, not formatting.",
    categories: [5, 2],
  },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();
  const [category, setCategory] = useState<number>(1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-400/.25),transparent)1] md:py-20">
        {/* Section header */}
        <div className="mx-auto max-w-3xl pb-12 text-center">
          <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
            What security pros say
          </h2>
          <p className="text-lg text-indigo-200/65">
            Trusted by penetration testers and security teams for real-world results.
          </p>
        </div>
        {/* Category filter */}
        <div className="flex justify-center pb-12 max-md:hidden md:pb-16">
          <div className="relative inline-flex flex-wrap justify-center rounded-[1.25rem] bg-gray-800/40 p-1">
            <button
              className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-200 ${category === 1 ? "relative bg-linear-to-b from-gray-900 via-gray-800/60 to-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-indigo-500/0),--theme(--color-indigo-500/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]" : "opacity-65 transition-opacity hover:opacity-90"}`}
              aria-pressed={category === 1}
              onClick={() => setCategory(1)}
            >
              <span>Recon</span>
            </button>
            <button
              className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-200 ${category === 2 ? "relative bg-linear-to-b from-gray-900 via-gray-800/60 to-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-indigo-500/0),--theme(--color-indigo-500/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]" : "opacity-65 transition-opacity hover:opacity-90"}`}
              aria-pressed={category === 2}
              onClick={() => setCategory(2)}
            >
              <span>Vuln Scan</span>
            </button>
            <button
              className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-200 ${category === 3 ? "relative bg-linear-to-b from-gray-900 via-gray-800/60 to-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-indigo-500/0),--theme(--color-indigo-500/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]" : "opacity-65 transition-opacity hover:opacity-90"}`}
              aria-pressed={category === 3}
              onClick={() => setCategory(3)}
            >
              <span>Exploitation</span>
            </button>
            <button
              className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-200 ${category === 4 ? "relative bg-linear-to-b from-gray-900 via-gray-800/60 to-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-indigo-500/0),--theme(--color-indigo-500/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]" : "opacity-65 transition-opacity hover:opacity-90"}`}
              aria-pressed={category === 4}
              onClick={() => setCategory(4)}
            >
              <span>Network</span>
            </button>
            <button
              className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-200 ${category === 5 ? "relative bg-linear-to-b from-gray-900 via-gray-800/60 to-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_bottom,--theme(--color-indigo-500/0),--theme(--color-indigo-500/.5))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]" : "opacity-65 transition-opacity hover:opacity-90"}`}
              aria-pressed={category === 5}
              onClick={() => setCategory(5)}
            >
              <span>Reporting</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
          ref={masonryContainer}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <Testimonial testimonial={testimonial} category={category}>
                {testimonial.content}
              </Testimonial>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Testimonial({
  testimonial,
  category,
  children,
}: {
  testimonial: {
    img: string;
    clientImg: string;
    name: string;
    company: string;
    content: string;
    categories: number[];
  };
  category: number;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`relative rounded-2xl bg-linear-to-br from-gray-900/50 via-gray-800/25 to-gray-900/50 p-5 backdrop-blur-xs transition-opacity before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] ${!testimonial.categories.includes(category) ? "opacity-30" : ""}`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Image src={testimonial.clientImg} width={36} height={36} alt="Client logo" />
        </div>
        <p className="text-indigo-200/65 before:content-['“'] after:content-['”']">
          {children}
        </p>
        <div className="flex items-center gap-3">
          <Image
            className="inline-flex shrink-0 rounded-full"
            src={testimonial.img}
            width={36}
            height={36}
            alt={testimonial.name}
          />
          <div className="text-sm font-medium text-gray-200">
            <span>{testimonial.name}</span>
            <span className="text-gray-700"> - </span>
            <a
              className="text-indigo-200/65 transition-colors hover:text-indigo-500"
              href="#0"
            >
              {testimonial.company}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}