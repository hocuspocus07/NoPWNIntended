import Image from "next/image";
import { Button } from "../ui/button";

export default function Cta() {
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
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-8 font-nacelle text-3xl font-semibold text-transparent md:text-4xl"
              data-aos="fade-up"
            >
              Ready to level up your security assessments?
            </h2>
            <p className="mb-8 text-indigo-200/70">
              Start using the all-in-one pentesting toolkit trusted by professionals.
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <div data-aos="fade-up" data-aos-delay={400}>
                <Button className="btn group mb-4 w-full">
                  <span className="...">Get Started</span>
                </Button>
              </div>
              <div data-aos="fade-up" data-aos-delay={600}>
                <Button variant="outline" className="w-full">
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}