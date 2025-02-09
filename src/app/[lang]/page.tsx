import styles from "./page.module.css";
import Hero from "@/sections/Hero";
import Why from "@/sections/Why";
import FAQ from "@/components/faq";
import CTA from "@/sections/CTA";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary-server";
import Badge from "@/components/badge";
import InfoCards from "@/components/infoCards";
import Footer from "@/components/footer";
import { Metadata } from "next";
import PartnerMarquee from "@/components/partnerMarquee";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const {
    pages: {
      home: { meta },
    },
  } = await getDictionary(params.lang);
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const {
    pages: {
      home: { faq, howTo, partners },
    },
  } = await getDictionary(lang);

  return (
    <div className={styles.container}>
      <Hero lang={lang} />
      <div className={styles.overlay}>
        <div className={styles.maxWidth}>
          <div className="grid" style={{ padding: 0 }}>
            {/* <Badge className={styles.badgePartnerMarquee} style={{ margin: "0 24px" }}>{partners.title}</Badge> */}
            {/* <PartnerMarquee className={styles.partnerMarqueeContainer} /> */}
          </div>
          <Why lang={lang} />
          <div className="grid">
            <Badge className={styles.badgeHowItWorks}>{howTo.title}</Badge>
            <InfoCards
              items={howTo.cards}
              className={styles.infoCardContainer}
            />
          </div>
          <div className="grid">
            <Badge className={styles.badgeFAQ}>{faq.title}</Badge>
            <FAQ items={faq.questions} className={styles.faqContainer} />
          </div>
          <CTA lang={lang} />
        </div>
      </div>
      <Footer lang={lang} />
    </div>
  );
}
