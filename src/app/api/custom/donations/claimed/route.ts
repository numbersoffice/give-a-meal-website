import { errorResponse, ApiError } from "@/lib/api/middleware";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";

// listClaimedDonations
export async function GET(request: NextRequest) {
  try {
    const claimId = request.nextUrl.searchParams.get("claimId");

    if (!claimId || typeof claimId !== "string")
      throw new ApiError(400, "Missing parameter or wrong type: claimId.");

    const payload = await getPayload({ config });

    const { docs: reservations } = await payload.find({
      collection: "reservations",
      where: {
        deviceId: { equals: claimId },
      },
      depth: 0,
    });

    if (reservations.length === 0) {
      return NextResponse.json([]);
    }

    // Get the donation IDs from reservations
    const donationIds = reservations.map((r) =>
      typeof r.donation === "object" ? r.donation.id : r.donation
    );

    const { docs: donations } = await payload.find({
      collection: "donations",
      where: {
        id: { in: donationIds.join(",") },
        redeemedAt: { exists: false },
      },
      depth: 2,
    });

    // Attach pin and reservation id to each donation for the consumer
    const donationsWithReservation = donations.map((d) => {
      const reservation = reservations.find((r) => {
        const rDonationId = typeof r.donation === "object" ? r.donation.id : r.donation;
        return rDonationId === d.id;
      });
      return {
        ...d,
        pin: reservation?.pin,
        reservationId: reservation?.id,
        expiresAt: reservation?.expiresAt,
      };
    });

    return NextResponse.json(donationsWithReservation);
  } catch (error) {
    return errorResponse(error);
  }
}
