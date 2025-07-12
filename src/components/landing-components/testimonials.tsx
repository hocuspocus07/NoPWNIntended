"use client";

import { useState } from "react";
import useMasonry from "@/utils/useMasonry";
import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    img: "/images/avatars/avatar-1.jpg",
    clientImg: "/images/clients/client-1.svg",
    name: "Alex Johnson",
    company: "CyberGuard",
    content: "NoPWNIntended streamlined our entire pentesting workflow. The recon tools are lightning fast and the reporting features save us hours every week.",
    categories: [1, 2],
  },
  {
    img: "/images/avatars/avatar-2.jpg",
    clientImg: "/images/clients/client-2.svg",
    name: "Priya Singh",
    company: "RedOps",
    content: "The vulnerability scanner is top-notch. I love how everything is in one place and the UI is so intuitive.",
    categories: [2, 3],
  },
  {
    img: "/images/avatars/avatar-3.jpg",
    clientImg: "/images/clients/client-3.svg",
    name: "Marcus Lee",
    company: "SecureWave",
    content: "From payload crafting to exploitation, NoPWNIntended has become my go-to toolkit. Highly recommended for any security professional.",
    categories: [1, 3],
  },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();
  const [category, setCategory] = useState<number>(1);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-400/.25),transparent)1] md:py-20">
        {/* Section header */}
        <motion.div
          className="mx-auto max-w-3xl pb-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-extrabold text-transparent md:text-4xl">
            What Security Pros Are Saying
          </h2>
          <p className="text-lg text-indigo-200/80 font-inter">
            See how real teams use NoPWNIntended to <span className="font-semibold text-indigo-300">accelerate their security workflows</span> and deliver results.
          </p>
        </motion.div>
        {/* Cards */}
        <div
          className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
          ref={masonryContainer}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              viewport={{ once: true }}
            >
              <Testimonial testimonial={testimonial} category={category}>
                {testimonial.content}
              </Testimonial>
            </motion.div>
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
      className={`relative rounded-2xl bg-linear-to-br from-gray-900/50 via-gray-800/25 to-gray-900/50 p-5 backdrop-blur-xs transition-opacity before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Image src={testimonial.clientImg} width={36} height={36} alt="Client logo" />
        </div>
        <p className="text-indigo-200/80 font-inter before:content-['“'] after:content-['”']">
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