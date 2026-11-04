import { HomeScreen } from "@/components/desktop/HomeScreen";
import { PERSON, SITE_NAME, SITE_URL, jsonLd, shareMeta } from "@/lib/seo";

export const metadata = shareMeta({
  title: "Aws Abdulfattah, Software Engineer",
  description:
    "I'm Aws, a Software Engineer at Qi and Founding Engineer and Technical Lead at Cardy. Read how I build products, lead a technical team and put my background in architecture to work.",
  path: "/",
});

const WEBSITE = {
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: "en", publisher: { "@id": PERSON["@id"] } },
    PERSON,
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(WEBSITE)} />
      <HomeScreen />
    </>
  );
}
