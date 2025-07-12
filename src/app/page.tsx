
import PageIllustration from "@/components/landing-components/page-illustration";
import HeroHome from "@/components/landing-components/hero-home";
import Workflows from "@/components/landing-components/workflows";
import Features from "@/components/landing-components/features";
import Testimonials from "@/components/landing-components/testimonials";
import Cta from "@/components/landing-components/cta";
export default function Home() {
  return (
    <div className="w-screen custom-scroll">
      <PageIllustration />
      <HeroHome />
      <Workflows />
      <Features />
      <Testimonials />
      <Cta />
    </div>
  );
}
