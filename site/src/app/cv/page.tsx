import { HomeScreen } from "@/components/desktop/HomeScreen";
import { OpenOnLoad } from "@/components/os/OpenOnLoad";
import { CV_PDF, PERSON, SITE_URL, jsonLd, shareMeta } from "@/lib/seo";

const TITLE = "Aws Abdulfattah CV, Senior Software Engineer";
const DESCRIPTION =
  "Aws Abdulfattah's CV: Senior Software Engineer at Qi Card and Founding Engineer and Technical Lead at Cardy, focused on payments, full-stack TypeScript and applied AI.";

export const metadata = shareMeta({ title: TITLE, description: DESCRIPTION, path: "/cv/", image: "cv", type: "profile" });

const PROFILE_PAGE = {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/cv/#page`,
  url: `${SITE_URL}/cv/`,
  name: TITLE,
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: { ...PERSON, subjectOf: CV_PDF },
};

/** The desktop with the CV window open, so awsdang.com/cv can be shared as a link with its own title and card. */
export default function CVPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(PROFILE_PAGE)} />
      <HomeScreen />
      <OpenOnLoad kind="cv" />
    </>
  );
}
