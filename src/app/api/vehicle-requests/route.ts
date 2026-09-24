import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      brand: string;
      model: string;
      purchaseMethod: string;
      firstName: string;
      lastName: string;
      city: string;
      phone: string;
    };
    const { brand, model, purchaseMethod, firstName, lastName, city, phone } = body;

    // Validate required fields
    if (!brand || !model || !purchaseMethod || !firstName || !lastName || !city || !phone) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره تماس نامعتبر است" },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "برای ثبت درخواست باید وارد حساب کاربری شوید" },
        { status: 401 }
      );
    }

    // Check user's request limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, monthly_request_count, request_limit, subscription_tier")
      .eq("id", user.id)
      .single();

    const limit = profile?.request_limit ?? 3; // Default limit for free users
    const used = profile?.monthly_request_count ?? 0;
    const remaining = Math.max(0, limit - used);

    if (used >= limit) {
      return NextResponse.json(
        {
          error: "شما به محدودیت درخواست‌های ماهانه رسیده‌اید",
          limitReached: true,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    // Create the vehicle request
    const { data: createdRequest, error: insertError } = await supabase
      .from("vehicle_requests")
      .insert({
        user_id: user.id,
        brand,
        model,
        purchase_method: purchaseMethod,
        first_name: firstName,
        last_name: lastName,
        city,
        phone,
        status: "PENDING",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating vehicle request:", insertError);
      return NextResponse.json(
        { error: "خطا در ثبت درخواست" },
        { status: 500 }
      );
    }

    // Increment user's monthly request count
    await supabase
      .from("profiles")
      .update({ monthly_request_count: used + 1 })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      requestId: createdRequest.id,
      remaining: remaining - 1,
    });
  } catch (err) {
    console.error("Vehicle request API error:", err);
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 }
    );
  }
}