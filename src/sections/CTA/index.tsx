import Button from "@/components/button";
import styles from "./styles.module.css";
import RecentItem from "./RecentItem";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import Tomato from "@/public/assets/tomato.svg";
import Cucumber from "@/public/assets/cucumber.svg";
import Onion from "@/public/assets/onion.svg";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary-server";
import localeLink from "@/utils/localeLink";
import getRecentDonationsAndBusinesses from "@/functions/getRecentDonationsAndBusinesses";

/**
 * CTA section displaying three buttons and a marquee of recent donations
 * @param lang Sets the language of the component
 */
export default async function CTA({ lang }: { lang: Locale }) {
  const dictionary = await getDictionary(lang);
  const data = await getRecentDonationsAndBusinesses(dictionary);

  if (!dictionary) return null;
  return (
    <div className="grid">
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <h2>{dictionary.pages.home.cta.title}</h2>
          <div className={styles.buttonContainer}>
            <Button
              className={styles.button}
              href={localeLink("/get-a-meal", lang)}
            >
              {dictionary.pages.home.cta.button_1}
            </Button>
            <Button
              className={styles.button}
              href={localeLink("/give-a-meal", lang)}
            >
              {dictionary.pages.home.cta.button_2}
            </Button>
            <Button
              className={styles.button}
              href={localeLink("/restaurants", lang)}
            >
              {dictionary.pages.home.cta.button_3}
            </Button>
          </div>
        </div>
        {data && (
          <div className={styles.recentItemsContainer}>
            <Marquee>
              {data.map((data: any) => (
                <RecentItem
                  lang={lang}
                  key={data.id}
                  action={data.action}
                  businessName={data.businessName}
                  time={data.time}
                  donorName={data.donorName}
                  item={data.item}
                />
              ))}
            </Marquee>
          </div>
        )}
      </div>
      <div className={styles.vegContainer}>
        <Image src={Tomato} alt="tomato" width={287} height={420} />
        <Image src={Cucumber} alt="cucumber" width={377} height={430} />
        <Image src={Onion} alt="onion" width={285} height={420} />
      </div>
    </div>
  );
}
