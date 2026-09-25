import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
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
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "کاربر احراز هویت نشده است." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin" || profile?.role === "owner";

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { error: "هیچ فایلی آپلود نشده است." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const sheet = workbook.getWorksheet("آگهی‌ها");
    if (!sheet) {
      return NextResponse.json(
        { error: "فرمت فایل نامعتبر است. تب آگهی‌ها یافت نشد." },
        { status: 400 },
      );
    }

    const { data: specsData } = await supabaseAdmin
      .from("car_specs")
      .select("id, brand, model");
    const brandModelStrings = new Set<string>();
    const validBrands = new Set<string>();
    const validModels = new Set<string>();
    if (specsData) {
      specsData.forEach((car) => {
        if (car.brand && car.model)
          brandModelStrings.add(`${car.brand} / ${car.model}`);
        if (car.brand) validBrands.add(car.brand);
        if (car.model) validModels.add(car.model);
      });
    }

    const { data: colorsData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "COLOR");
    const validColors = new Set(
      colorsData ? colorsData.map((c) => c.value) : ["سفید", "مشکی"],
    );

    const { data: citiesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "CITY");
    const validCities = new Set(
      citiesData ? citiesData.map((c) => c.value) : ["تهران", "مشهد"],
    );

    const { data: yearsData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "YEAR");
    const validYears = new Set(
      yearsData ? yearsData.map((y) => y.value) : ["۱۴۰۵", "۱۴۰۴", "۱۴۰۳"],
    );

    // Map Persian status to DB status
    const statusMap: Record<string, string> = {
      "موجود": "AVAILABLE",
      "در انتظار": "WAITING",
      "مذاکره": "NEGOTIABLE",
      "فروخته شده": "SOLD",
      "رزرو شده": "RESERVED",
    };
    const validStatuses = new Set(Object.keys(statusMap));

    // Fetch valid taxonomy options for body_type, fuel, gearbox
    const { data: bodyTypesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "BODY_TYPE");
    const validBodyTypes = new Set(bodyTypesData?.map((c) => c.value) || []);

    const { data: fuelTypesData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "FUEL_TYPE");
    const validFuelTypes = new Set(fuelTypesData?.map((c) => c.value) || []);

    const { data: gearboxData } = await supabaseAdmin
      .from("taxonomy_options")
      .select("value")
      .eq("category", "TRANSMISSION");
    const validGearboxes = new Set(gearboxData?.map((c) => c.value) || []);

    const errors: string[] = [];
    const rowsToInsert: any[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      // Support both old format (combined "برند / مدل" in column 1) and new format (separate "برند" and "مدل" in columns 1 and 2)
      const cell1 = String(row.getCell(1).value || "").trim();
      const cell2 = String(row.getCell(2).value || "").trim();
      
      // Check if this is new format (brand in col 1, model in col 2) or old format (combined in col 1)
      const isNewFormat = validBrands.has(cell1) || (cell1 && cell2 && !brandModelStrings.has(`${cell1} / ${cell2}`));
      
      let brand: string;
      let model: string;
      let brandModel: string;
      let colOffset = 0;
      
      if (isNewFormat) {
        // New format: brand in col 1, model in col 2
        brand = cell1;
        model = cell2;
        brandModel = `${brand} / ${model}`;
        colOffset = 1; // shift all other columns by 1
      } else {
        // Old format: combined "برند / مدل" in col 1
        brandModel = cell1;
        const parts = brandModel.split(" / ");
        brand = parts[0] || "";
        model = parts[1] || "";
      }

      const trim = String(row.getCell(2 + colOffset).value || "").trim();
      const yearStr = String(row.getCell(3 + colOffset).value || "").trim();
      const year = parseInt(yearStr, 10);
      const color = String(row.getCell(4 + colOffset).value || "").trim();
      const city = String(row.getCell(5 + colOffset).value || "").trim();
      const bodyType = String(row.getCell(6 + colOffset).value || "").trim();
      const fuel = String(row.getCell(7 + colOffset).value || "").trim();
      const gearbox = String(row.getCell(8 + colOffset).value || "").trim();
      const deliveryDays = Number(row.getCell(9 + colOffset).value || 0);
      const statusPersian = String(row.getCell(10 + colOffset).value || "").trim();
      const price = Number(row.getCell(11 + colOffset).value || 0);
      const features = String(row.getCell(12 + colOffset).value || "").trim();
      // privateNote and phoneNumber are not stored in listings table
      const privateNote = String(row.getCell(13 + colOffset).value || "").trim();
      const phoneNumber = isAdmin
        ? String(row.getCell(14 + colOffset).value || "").trim()
        : null;

      if (!brand && !model && !year && !price) return;

      let rowHasError = false;

      if (!brandModelStrings.has(brandModel)) {
        errors.push(
          `سطر ${rowNumber}: برند/مدل "${brandModel}" نامعتبر است. به تب راهنما مراجعه کنید.`,
        );
        rowHasError = true;
      }
      if (isNaN(year) || !validYears.has(yearStr)) {
        errors.push(`سطر ${rowNumber}: سال ساخت "${yearStr}" نامعتبر است.`);
        rowHasError = true;
      }
      if (!validColors.has(color)) {
        errors.push(`سطر ${rowNumber}: رنگ "${color}" نامعتبر است.`);
        rowHasError = true;
      }
      if (!validCities.has(city)) {
        errors.push(`سطر ${rowNumber}: شهر "${city}" نامعتبر است.`);
        rowHasError = true;
      }
      if (bodyType && !validBodyTypes.has(bodyType)) {
        errors.push(`سطر ${rowNumber}: نوع بدنه "${bodyType}" نامعتبر است.`);
        rowHasError = true;
      }
      if (fuel && !validFuelTypes.has(fuel)) {
        errors.push(`سطر ${rowNumber}: سوخت "${fuel}" نامعتبر است.`);
        rowHasError = true;
      }
      if (gearbox && !validGearboxes.has(gearbox)) {
        errors.push(`سطر ${rowNumber}: گیربکس "${gearbox}" نامعتبر است.`);
        rowHasError = true;
      }
      if (!validStatuses.has(statusPersian)) {
        errors.push(
          `سطر ${rowNumber}: وضعیت "${statusPersian}" باید یکی از مقادیر مجاز باشد (موجود، در انتظار، مذاکره، فروخته شده، رزرو شده).`,
        );
        rowHasError = true;
      }
      if (isNaN(price) || price <= 0) {
        errors.push(`سطر ${rowNumber}: قیمت وارد شده معتبر نیست.`);
        rowHasError = true;
      }

      if (!rowHasError) {
        // Use default values for required fields not in template
        const finalBodyType = bodyType || (validBodyTypes.size > 0 ? Array.from(validBodyTypes)[0] : "سدان");
        const finalFuel = fuel || (validFuelTypes.size > 0 ? Array.from(validFuelTypes)[0] : "بنزینی");
        const finalGearbox = gearbox || (validGearboxes.size > 0 ? Array.from(validGearboxes)[0] : "اتوماتیک");
        const enginePower = "۲.۰ لیتر";
        const colorHex = "#1b4fd8";
        // Simple UUID generation for Edge runtime compatibility
        const uuidPart = Math.random().toString(36).substring(2, 10);
        
        rowsToInsert.push({
          seller_id: user.id,
          brand,
          model,
          trim: trim || "استاندارد",
          year,
          price,
          price_unit: "تومان",
          color,
          color_hex: colorHex,
          city,
          shipment_days: deliveryDays,
          body_type: finalBodyType,
          engine_power: enginePower,
          gearbox: finalGearbox,
          fuel: finalFuel,
          other_options: features ? [features] : [],
          status: statusMap[statusPersian] || "WAITING",
          listing_type: "SELL",
          slug: `${brand}-${model}-${year}-${uuidPart}`.replace(/\s+/g, "-"),
        });
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    if (rowsToInsert.length === 0) {
      return NextResponse.json(
        { error: "هیچ داده‌ای برای ثبت در فایل یافت نشد." },
        { status: 400 },
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("listings")
      .insert(rowsToInsert);
    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      success: true,
      message: `${rowsToInsert.length} آگهی با موفقیت ثبت شد.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
