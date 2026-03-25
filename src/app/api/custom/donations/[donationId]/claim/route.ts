import { errorResponse } from "@/lib/api/middleware";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// claimDonation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ donationId: string }> }
) {
  try {
    const { donationId } = await params;
    const { storageId } = await request.json();
    const maxClaims = 3;

    if (!storageId) {
      return NextResponse.json({
        error: {
          message: "Missing storage id",
          details: "A storage id was not provided.",
          hint: "A storageId specifies the donations to look up.",
          code: 400,
        },
      }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Get all active reservations for this device
    const { totalDocs } = await payload.count({
      collection: "reservations",
      where: { deviceId: { equals: storageId } },
    });

    if (totalDocs >= maxClaims) {
      return NextResponse.json({
        error: {
          message: "Insufficient permissions",
          details: "Maximum number of claimed donations reached",
          hint: "",
          code: 401,
        },
      }, { status: 401 });
    }

    // Check donation exists
    let donation;
    try {
      donation = await payload.findByID({
        collection: "donations",
        id: donationId,
      });
    } catch {
      return NextResponse.json({
        error: {
          message: "Claim failed",
          details: "Donation not found.",
          hint: "",
          code: 404,
        },
      }, { status: 404 });
    }

    // Check donation isn't already reserved
    const { totalDocs: existingReservations } = await payload.count({
      collection: "reservations",
      where: { donation: { equals: donationId } },
    });

    if (existingReservations > 0) {
      return NextResponse.json({
        error: {
          message: "Claim failed",
          details: "This donation has already been claimed.",
          hint: "Either you or someone else has already claimed this meal.",
          code: 500,
        },
      }, { status: 500 });
    }

    // Check donation hasn't been redeemed
    if (donation.redeemedAt) {
      return NextResponse.json({
        error: {
          message: "Claim failed",
          details: "This donation has already been redeemed.",
          hint: "",
          code: 400,
        },
      }, { status: 400 });
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await payload.create({
      collection: "reservations",
      data: {
        donation: donationId,
        deviceId: storageId,
        pin,
        expiresAt,
      },
    });

    return NextResponse.json({
      data: {
        message: "Success",
        details: "Successfully claimed donation.",
        pin,
        hint: "",
        code: 200,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
