import {
  verifyAuth,
  verifyBusinessMembership,
  errorResponse,
  ApiError,
} from "@/lib/api/middleware";
import { getPayload } from "payload";
import config from "@payload-config";
import { sendNotifications } from "@/lib/api/notifications";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import donationReceivedTemplate from "@/components/emailTemplates/donationReceived";

// getDonationsFromBusiness
export async function GET(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get("businessId")!;
    const isActiveParam = request.nextUrl.searchParams.get("isActive");

    const payload = await getPayload({ config });

    const where: any = { business: { equals: businessId } };

    if (isActiveParam === "true") {
      where.redeemedAt = { exists: false };
    } else if (isActiveParam === "false") {
      where.redeemedAt = { exists: true };
    }

    const { docs } = await payload.find({
      collection: "donations",
      where,
      limit: isActiveParam === "false" ? 5 : 100,
      depth: 2,
    });

    // Look up reservations for returned donations
    const donationIds = docs.map((d) => d.id);

    const { docs: reservations } =
      donationIds.length > 0
        ? await payload.find({
            collection: "reservations",
            where: { donation: { in: donationIds.join(",") } },
            // limit: donationIds.length,
          })
        : { docs: [] };

    const reservedDonationIds = new Set(
      reservations.map((r) =>
        typeof r.donation === "object" ? r.donation.id : r.donation,
      ),
    );

    const docsWithReserved = docs.map((d) => ({
      ...d,
      reserved: reservedDonationIds.has(d.id),
    }));

    // Filter out reserved donations when filtering by active status
    if (isActiveParam) {
      return NextResponse.json(docsWithReserved.filter((d) => !d.reserved));
    }

    return NextResponse.json(docsWithReserved);
  } catch (error) {
    return errorResponse(error);
  }
}

// addDonation
export async function POST(request: NextRequest) {
  try {
    const authData = await verifyAuth(request);
    const { itemId, businessId, donorEmail } = await request.json();
    const { user } = await verifyBusinessMembership(authData, businessId);

    if (!itemId) throw new ApiError(400, "Missing parameter: itemId.");

    const payload = await getPayload({ config });

    // Check if item exists on this business
    const { docs: items } = await payload.find({
      collection: "items",
      where: {
        id: { equals: itemId },
        business: { equals: businessId },
      },
      depth: 1,
      limit: 1,
    });

    if (items.length === 0)
      throw new ApiError(
        400,
        `Item with id ${itemId} does not exist for this business.`,
      );

    const item = items[0];

    // If no donor info, add donation without donor
    if (!donorEmail) {
      const donation = await payload.create({
        collection: "donations",
        data: {
          item: itemId,
          business: businessId,
          createdBy: user.id,
        },
      });

      sendNotifications(businessId, "donation_added", user.id);
      return NextResponse.json(donation);
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);

    if (!isEmail) {
      // Not an email — treat as donor name
      // Shouldn't usually happen since client checks for valid email as well
      const donation = await payload.create({
        collection: "donations",
        data: {
          item: itemId,
          business: businessId,
          donorName: donorEmail,
          createdBy: user.id,
        },
      });

      sendNotifications(businessId, "donation_added", user.id);
      return NextResponse.json(donation);
    }

    // Valid email — find or create donor
    let donor;
    const { docs: existingDonors } = await payload.find({
      collection: "donors",
      where: { email: { equals: donorEmail } },
      limit: 1,
    });

    if (existingDonors.length > 0) {
      donor = existingDonors[0];
    } else {
      donor = await payload.create({
        collection: "donors",
        data: {
          email: donorEmail,
          password: crypto.randomBytes(32).toString("hex"),
        },
      });
    }

    const donation = await payload.create({
      collection: "donations",
      data: {
        item: itemId,
        business: businessId,
        donorName: donor.firstName ?? null,
        donatedBy: donor.id,
        createdBy: user.id,
      },
    });

    sendNotifications(businessId, "donation_added", user.id);

    // Send email to donor
    const businessObj =
      typeof item.business === "object" ? item.business : null;

    const template = donationReceivedTemplate({
      businessName: businessObj?.businessName || "",
      donationName: item.title || "",
      donorProfileUrl: `https://give-a-meal.org/donors/profile?pe=${donorEmail}`,
    });

    await payload.sendEmail({
      to: donorEmail,
      subject: "Thank you for your donation!",
      text: template.text,
      html: template.html,
    });

    return NextResponse.json(donation);
  } catch (error) {
    return errorResponse(error);
  }
}
