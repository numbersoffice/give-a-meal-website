import { Locale } from "@/i18n-config";
import LinkWithHover from "../linkWithHover";
import styles from "./styles.module.css";
import localeLink from "@/utils/localeLink";
import Button from "../button";
import NavItem from "../navItem";

export default async function NavigationDesktop({
  lang,
  nav,
  className,
}: {
  lang: Locale;
  nav: {
    pickUp: string;
    donate: string;
    partners: string;
    apps: string;
    donorProfile: string;
  };
  className?: string;
}) {
  return (
    <div className={`${styles.menuContainerDesktop} ${className}`}>
      <div className={styles.contentBox}>
        <div className={styles.linkContainer}>
          <LinkWithHover
            href={localeLink("/get-a-meal", lang)}
            className="body"
          >
            {nav.pickUp}
          </LinkWithHover>

          <NavItem label={nav.donate}>
            <LinkWithHover
              href={localeLink("/give-a-meal", lang)}
              className="body"
            >
              {nav.donate}
            </LinkWithHover>
            <LinkWithHover
              href={localeLink("/donors/profile", lang)}
              className="body"
            >
              {nav.donorProfile}
            </LinkWithHover>
          </NavItem>
          <LinkWithHover
            href={localeLink("/restaurants", lang)}
            className="body"
          >
            {nav.partners}
          </LinkWithHover>
        </div>
        <Button href={localeLink("/app", lang)}>{nav.apps}</Button>
      </div>
    </div>
  );
}
