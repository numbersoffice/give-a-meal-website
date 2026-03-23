import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

import { Users } from "./collections/Users";
import { Businesses } from "./collections/Businesses";
import { BusinessUsers } from "./collections/BusinessUsers";
import { Donors } from "./collections/Donors";
import { Items } from "./collections/Items";
import { Donations } from "./collections/Donations";
import { Reservations } from "./collections/Reservations";
import { Verifications } from "./collections/Verifications";
import { VerificationKeys } from "./collections/VerificationKeys";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  // Should we add this?
  cors: ["http://192.168.8.182:3000", "http://localhost:3000", "https://www.give-a-meal.org"],
  csrf: ["http://192.168.8.182:3000", "http://localhost:3000", "https://www.give-a-meal.org"],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    dashboard: {
      widgets: [
        {
          slug: "business-count",
          Component: "./components/payload/BusinessCountWidget.tsx#default",
          minWidth: "small",
          maxWidth: "medium",
        },
        {
          slug: "verification-count",
          Component: "./components/payload/VerificationCountWidget.tsx#default",
          minWidth: "small",
          maxWidth: "medium",
        },
        {
          slug: "donor-count",
          Component: "./components/payload/DonorCountWidget.tsx#default",
          minWidth: "small",
          maxWidth: "medium",
        },
        {
          slug: "donation-count",
          Component: "./components/payload/DonationCountWidget.tsx#default",
          minWidth: "small",
          maxWidth: "medium",
        },
        {
          slug: "item-count",
          Component: "./components/payload/ItemCountWidget.tsx#default",
          minWidth: "small",
          maxWidth: "medium",
        },
      ],
      defaultLayout: () => [
        { widgetSlug: "business-count", width: "small" },
        { widgetSlug: "verification-count", width: "small" },
        { widgetSlug: "donor-count", width: "small" },
        { widgetSlug: "donation-count", width: "small" },
        { widgetSlug: "item-count", width: "small" },
        { widgetSlug: "collections", width: "full" },
      ],
    },
  },
  collections: [
    Users,
    Businesses,
    BusinessUsers,
    Donors,
    Items,
    Donations,
    Reservations,
    Verifications,
    VerificationKeys,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
  }),
  sharp,
  plugins: [],
  email: nodemailerAdapter({
    defaultFromAddress: "noreply@give-a-meal.org",
    defaultFromName: "Give a Meal",
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
});
