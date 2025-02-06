"use client";

import { Locale } from "@/i18n-config";
import styles from "./styles.module.css";
import localeLink from "@/utils/localeLink";
import React, { useEffect } from "react";
import NavLinkMobile from "../navLinkMobile";
import Button from "../button";

export default function NavigationMobile({
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
  const [active, setActive] = React.useState(false);

  // Prevent body from scrolling while drawer is open
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [active]);

  return (
    <div className={className}>
      <button
        onClick={() => setActive((prev) => !prev)}
        className={styles.navButton}
        style={{ boxShadow: active ? "none" : undefined }}
      >
        {active ? (
          <p className={styles.closeButton}>&#10005;</p>
        ) : (
          <p>&#9776;</p>
        )}
      </button>
      <div className={`${styles.drawer} ${active && styles.drawerActive}`}>
        <div className={styles.menuContainerMobile}>
          <NavLinkMobile
            label={nav.pickUp}
            onClick={() => setActive(false)}
            href={localeLink("/get-a-meal", lang)}
            className="body"
          ></NavLinkMobile>
          {/* <NavLinkMobile label={nav.donate} onClick={() => setActive(false)} href={localeLink("/give-a-meal", lang)} className="body"></NavLinkMobile> */}
          {/* <NavLinkMobile label={nav.donate} onClick={() => setActive(false)} href={localeLink("/give-a-meal", lang)} className="body"></NavLinkMobile>
                        <NavLinkMobile.Sub label={nav.donate} onClick={() => setActive(false)} href={localeLink("/give-a-meal", lang)} className="body"></NavLinkMobile.Sub>
                        <NavLinkMobile.Sub label={nav.donorProfile} onClick={() => setActive(false)} href={localeLink("/donors/profile", lang)} className="body"></NavLinkMobile.Sub>
                    </NavLinkMobile> */}
          <NavLinkMobile
            label={nav.partners}
            onClick={() => setActive(false)}
            href={localeLink("/restaurants", lang)}
            className="body"
          ></NavLinkMobile>
          <NavLinkMobile
            label={nav.donorProfile}
            onClick={() => setActive(false)}
            href={localeLink("/donors/profile", lang)}
            className="body"
          ></NavLinkMobile>
          <Button
            className={styles.mobileButton}
            onClick={() => setActive(false)}
            href={localeLink("/app", lang)}
          >
            {nav.apps}
          </Button>
        </div>
        <div
          onClick={() => setActive(false)}
          className={styles.bgClickCatcher}
        ></div>
      </div>
    </div>
  );
}
