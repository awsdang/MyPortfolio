import { Hero } from "@/components/desktop/Hero";
import { Dock } from "@/components/os/Dock";
import { AboutShort } from "@/components/sections/AboutShort";
import { Achievements } from "@/components/sections/Achievements";
import { ChapterStack } from "@/components/sections/ChapterStack";
import { Footer } from "@/components/sections/Footer";

/** The desktop and the sections under it; shared by / and /cv (which opens the CV window on top). */
export function HomeScreen() {
  return (
    <main>
      <Hero />
      <Dock mode="hero" />
      {/* phones never scroll: the home screen pages carry these as widgets */}
      <div className="max-md:hidden">
        <Achievements />
        <ChapterStack />
        <AboutShort />
        <Footer />
      </div>
    </main>
  );
}
