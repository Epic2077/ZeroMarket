import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";

    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "کاربر احراز هویت نشده است." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin" || profile?.role === "owner";

    // 1. Fetch live data
    const { data: specsData } = await supabaseAdmin
      .from("car_specs")
      .select("brand, model");
    const uniqueBrandModels = new Set<string>();
    if (specsData) {
      specsData.forEach((car) => {
        if (car.brand && car.model)
          uniqueBrandModels.add(`${car.brand} / ${car.model}`);
      });
    }
    const brandModels =
      uniqueBrandModels.size > 0
        ? Array.from(uniqueBrandModels)
        : ["تویوتا / کمری"];

    const { data: colorsData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "COLOR");
    const colors = colorsData?.length
      ? colorsData.map((c) => c.value)
      : ["سفید", "مشکی"];

    const { data: citiesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "CITY");
    const cities = citiesData?.length
      ? citiesData.map((c) => c.value)
      : ["تهران", "مشهد"];

    const { data: yearsData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "YEAR");
    const years = yearsData?.length
      ? yearsData.map((y) => y.value)
      : ["۱۴۰۵", "۱۴۰۴", "۱۴۰۳"];

    // Fetch taxonomy options for guide sheet
    const { data: bodyTypesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "BODY_TYPE");
    const bodyTypes = bodyTypesData?.map((c) => c.value) || ["سدان", "هاچبک", "SUV"];

    const { data: fuelTypesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "FUEL_TYPE");
    const fuelTypes = fuelTypesData?.map((c) => c.value) || ["بنزینی", "دوگانه", "الکتریک"];

    const { data: gearboxData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "TRANSMISSION");
    const gearboxes = gearboxData?.map((c) => c.value) || ["اتوماتیک", "دستی", "CVT"];

    const statuses = ["موجود", "در انتظار", "مذاکره", "فروخته شده", "رزرو شده"];
    const features = ["فول آپشن", "نیمه فول", "پایه", "سفارشی"];

    // 2. Setup workbook
    const workbook = new ExcelJS.Workbook();
    const mainSheet = workbook.addWorksheet("آگهی‌ها", {
      views: [{ rightToLeft: true }],
    });
    const guideSheet = workbook.addWorksheet("راهنما_و_مقادیر_مجاز", {
      views: [{ rightToLeft: true }],
    });

    // 3. Guide sheet
    guideSheet.columns = [
      { header: "برند و مدل‌های مجاز", key: "col1", width: 30 },
      { header: "سال‌های مجاز", key: "col2", width: 20 },
      { header: "رنگ‌های مجاز", key: "col3", width: 20 },
      { header: "شهرهای مجاز", key: "col4", width: 20 },
      { header: "وضعیت‌های مجاز", key: "col5", width: 20 },
      { header: "نوع بدنه", key: "col6", width: 20 },
      { header: "سوخت", key: "col7", width: 20 },
      { header: "گیربکس", key: "col8", width: 20 },
      { header: "امکانات پیشنهادی", key: "col9", width: 20 },
    ];
    guideSheet.getRow(1).font = { bold: true, size: 12 };
    guideSheet.getRow(1).alignment = { horizontal: "center" };

    const maxLength = Math.max(
      brandModels.length,
      years.length,
      colors.length,
      cities.length,
      statuses.length,
      bodyTypes.length,
      fuelTypes.length,
      gearboxes.length,
      features.length,
    );

    for (let i = 0; i < maxLength; i++) {
      guideSheet.addRow({
        col1: brandModels[i] || "",
        col2: years[i] || "",
        col3: colors[i] || "",
        col4: cities[i] || "",
        col5: statuses[i] || "",
        col6: bodyTypes[i] || "",
        col7: fuelTypes[i] || "",
        col8: gearboxes[i] || "",
        col9: features[i] || "",
      });
    }

    // 4. Main sheet - separate brand and model for easier import
    const columns = [
      { header: "برند", key: "brand", width: 20 },
      { header: "مدل", key: "model", width: 20 },
      { header: "تریم / نسخه", key: "trim", width: 20 },
      { header: "سال ساخت", key: "year", width: 15 },
      { header: "رنگ", key: "color", width: 15 },
      { header: "شهر", key: "city", width: 15 },
      { header: "نوع بدنه", key: "bodyType", width: 15 },
      { header: "سوخت", key: "fuel", width: 15 },
      { header: "گیربکس", key: "gearbox", width: 15 },
      { header: "زمان تحویل (روز)", key: "deliveryDays", width: 20 },
      { header: "وضعیت", key: "status", width: 15 },
      { header: "قیمت(تومان)", key: "price", width: 25 },
      { header: "امکانات کارخانه", key: "features", width: 25 },
      { header: "یادداشت شخصی فروشنده", key: "privateNote", width: 40 },
    ];

    if (isAdmin) {
      columns.push({
        header: "شماره تماس فروشنده",
        key: "phoneNumber",
        width: 25,
      });
    }

    mainSheet.columns = columns;
    mainSheet.getRow(1).font = { bold: true, size: 12 };
    mainSheet.getRow(1).alignment = { horizontal: "center" };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Listings_Template.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
