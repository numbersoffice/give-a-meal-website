import styles from "./styles.module.css";
import Image from "next/image";
import NewDonation from "@/public/assets/icons/newDonation.svg";
import NewBusiness from "@/public/assets/icons/newBusiness.svg";
import { Locale } from "@/i18n-config";

export default function RecentItem({
  lang,
  action,
  businessName,
  time,
  donorName,
  item,
}: {
  lang: Locale;
  action: "newDonation" | "newBusiness";
  businessName: string;
  time: string;
  donorName: string;
  item: string;
}) {
  let icon = action === "newDonation" ? NewDonation : NewBusiness;
  let message;

  // Truncate item and business name if they are too long
  if (item.length > 30) item = item.slice(0, 30) + "...";
  if (businessName.length > 20)
    businessName = businessName.slice(0, 20) + "...";

  if (lang === "es") {
    // Spanish
    if (action === "newDonation") {
      if (donorName) {
        ("Spindrift donado en Livite por Abby.");
        message = (
          <>
            {item} donado en <span className="body_l_bold">{businessName}</span>{" "}
            por <span className="body_l_bold">{donorName}</span>
          </>
        );
      } else {
        message = (
          <>
            A {item} has been donated at{" "}
            <span className="body_l_bold">{businessName}</span>
          </>
        );
      }
    } else {
      message = (
        <>
          <span className="body_l_bold">{businessName}</span> ahora es socio de
          restaurante
        </>
      );
    }
  } else {
    // English
    if (action === "newDonation") {
      if (donorName) {
        message = (
          <>
            <span className="body_l_bold">{donorName}</span> donated a {item} at{" "}
            <span className="body_l_bold">{businessName}</span>
          </>
        );
      } else {
        message = (
          <>
            A {item} has been donated at{" "}
            <span className="body_l_bold">{businessName}</span>
          </>
        );
      }
    } else {
      message = (
        <>
          <span className="body_l_bold">{businessName}</span> became a
          restaurant partner
        </>
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Image
          priority
          className={styles.image}
          src={icon}
          alt="Donation or restaurant icon"
          width={36}
          height={36}
        />
      </div>
      <div className={styles.textContainer}>
        <p className="body_l">{message}</p>
        <p className="body_s">{time}</p>
      </div>
    </div>
  );
}
