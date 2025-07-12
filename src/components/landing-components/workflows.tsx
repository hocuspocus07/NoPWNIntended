"use client"
import Spotlight from "./spotlight";
import { motion } from "framer-motion";

export default function Workflows() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <motion.div
            className="mx-auto max-w-3xl pb-12 text-center md:pb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent font-nacelle">
                Tailored Workflows
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-extrabold text-transparent md:text-4xl">
              Penetration Testing, Reimagined
            </h2>
            <p className="text-lg text-indigo-200/80 font-inter">
              Specialized modules for every phase—<span className="font-semibold text-indigo-300">from discovery to reporting</span>. Streamline your workflow and maximize your impact.
            </p>
          </motion.div>
          {/* Spotlight items */}
          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3 text-center">
            {/* Card 1 */}
            <motion.a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px transition-shadow hover:shadow-2xl"
              href="#0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="mb-3 flex w-full h-10 items-center justify-center">
                  <p className="text-2xl bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent font-nacelle">Tools</p>
                </div>
                <p className="text-indigo-200/80 font-inter">
                  Access a suite of powerful tools for every pentest scenario.
                </p>
              </div>
            </motion.a>
            {/* Card 2 */}
            <motion.a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px transition-shadow hover:shadow-2xl"
              href="#0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="mb-3 flex w-full h-10 items-center justify-center">
                  <p className="text-2xl bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent font-nacelle">Backed up history</p>
                </div>
                <p className="text-indigo-200/80 font-inter">
                  Never lose your progress—your findings and scans are always saved.
                </p>
              </div>
            </motion.a>
            {/* Card 3 */}
            <motion.a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px transition-shadow hover:shadow-2xl"
              href="#0"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="p-6">
                <div className="mb-3 flex w-full h-10 items-center justify-center">
                  <p className="text-2xl bg-linear-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent font-nacelle">Friendly Layout</p>
                </div>
                <p className="text-indigo-200/80 font-inter">
                  Enjoy a clean, intuitive interface designed for productivity.
                </p>
              </div>
            </motion.a>
          </Spotlight>
        </div>
      </div>
    </section>
  );
}