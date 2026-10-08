import { Hero } from "@/components/desktop/Hero";
import { Dock } from "@/components/os/Dock";
import { AboutSection } from "@/components/sections/AboutSection";
import { Achievements } from "@/components/sections/Achievements";
import { ChapterStack } from "@/components/sections/ChapterStack";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Dock mode="hero" />
      <Achievements />
      <ChapterStack />
      <AboutSection />
      <Footer />
    </main>
  );
}
