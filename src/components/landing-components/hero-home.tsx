import { Button } from "../ui/button";
export default function HeroHome() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center md:pb-20">
            <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-5 font-nacelle text-4xl font-semibold text-transparent md:text-5xl">
              Offensive Security Platform
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="mb-8 text-xl text-indigo-200/65">
                All-in-one toolkit for penetration testing and red teaming
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <Button className="btn group mb-4 w-full... [keep all original classes]">
                  <span className="...">Launch App</span>
                </Button>
                <Button variant="outline" className="btn relative w-full... [keep all original classes]">
                  Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}