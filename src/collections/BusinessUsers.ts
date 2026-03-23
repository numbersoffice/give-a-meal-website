import type { CollectionConfig } from "payload";

export const BusinessUsers: CollectionConfig = {
  slug: "businessUsers",
  admin: {
    useAsTitle: "email",
    group: "Auth",
  },
  auth: {
    verify: true,
    tokenExpiration: 7776000,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/en/reset-password/${args?.token}`;
        return `
          <h1>Reset your password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `;
      },
    },
  },
  access: {
    read: ({ req }) => {
      return req.user?.collection === "users";
    },
    update: ({ req }) => {
      return req.user?.collection === "users";
    },
    // Check for better ways to handle this
    // Maybe with a dedicated endpoint
    create: () => true,
    delete: ({ req }) => {
      return req.user?.collection === "users";
    },
    admin: () => false,
  },
  fields: [
    {
      name: "email",
      type: "text",
      required: true,
    },
    {
      name: "firstName",
      type: "text",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "lastName",
      type: "text",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "pushToken",
      type: "text",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "ownedBusinesses",
      type: "relationship",
      relationTo: "businesses",
      hasMany: true,
      label: "Businesses (Owner)",
    },
    {
      name: "staffBusinesses",
      type: "relationship",
      relationTo: "businesses",
      hasMany: true,
      label: "Businesses (Staff)",
    },
  ],
};
