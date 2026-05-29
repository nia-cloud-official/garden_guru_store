import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/paynow";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pollUrl = searchParams.get("poll_url");
  const orderId = searchParams.get("order_id");

  if (!pollUrl || !orderId) {
    return NextResponse.json(
      { error: "Missing poll_url or order_id" },
      { status: 400 },
    );
  }

  try {
    console.log(`[payment-status] Checking payment for order ${orderId}`);
    const status = await checkPaymentStatus(pollUrl);
    console.log(`[payment-status] Paynow status:`, status);

    if (status && status.status === "paid") {
      console.log(
        `[payment-status] Payment confirmed for order ${orderId}, updating database`,
      );
      const { error: updateError } = await supabase
        .from("store_orders")
        .update({
          payment_status: "paid",
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", orderId);

      if (updateError) {
        console.error(`[payment-status] Error updating order:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      status: status?.status || "unknown",
      paid: status?.status === "paid",
    });
  } catch (error: any) {
    console.error(`[payment-status] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 },
    );
  }
}
