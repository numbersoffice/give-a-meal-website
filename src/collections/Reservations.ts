import type { CollectionConfig } from "payload";

export const Reservations: CollectionConfig = {
  slug: "reservations",
  access: {
    read: ({ req }) => {
      return req.user?.collection === "users";
    },
    update: ({ req }) => {
      return req.user?.collection === "users";
    },
    create: ({ req }) => {
      return req.user?.collection === "users";
    },
    delete: ({ req }) => {
      return req.user?.collection === "users";
    },
  },
  fields: [
    {
      name: "donation",
      type: "relationship",
      relationTo: "donations",
      required: true,
    },
    {
      name: "deviceId",
      type: "text",
      required: true,
      admin: {
        description:
          "The anonymous ID of the device that is reserving this donation.",
      },
    },
    {
      name: "pin",
      type: "text",
      required: true,
      admin: {
        description: "6-digit PIN the claimant must present to redeem.",
      },
    },
    {
      name: "expiresAt",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
