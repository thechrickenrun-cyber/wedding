import { google } from "googleapis";
import { NextResponse } from "next/server";
import { validateRSVP } from "@/lib/rsvp-validation";

export const runtime = "nodejs";

function sheetRange(sheetName: string) {
  const escapedSheetName = sheetName.replace(/'/g, "''");
  return `'${escapedSheetName}'!A:G`;
}

function googleErrorStatus(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = Number((error as { code?: unknown }).code);

    if (Number.isInteger(code) && code >= 400 && code < 600) {
      return code;
    }
  }

  return 502;
}

function storedDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Bangkok"
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";

  return `${day}-${month}-${year}`;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = validateRSVP(payload ?? {});

  if (!parsed.data) {
    return NextResponse.json({ ok: false, message: parsed.error }, { status: 400 });
  }

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || "";
  const privateKey = rawPrivateKey
    .replace(/^["']|["']$/g, "") // Remove surrounding quotes if Vercel added them
    .replace(/\\n/g, "\n") // Replace literal \n with actual newlines
    .trim();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "RSVP";

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return NextResponse.json(
      { ok: false, message: "RSVP service is not configured." },
      { status: 500 }
    );
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });
    const rsvp = parsed.data;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetRange(sheetName),
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            storedDate(),
            rsvp.name,
            rsvp.attendance === "yes" ? "ยินดีไปร่วมงาน" : rsvp.attendance === "no" ? "ส่งความรักจากระยะไกล" : rsvp.attendance,
            rsvp.guestCount,
            rsvp.phone ? `'${rsvp.phone}` : "",
            rsvp.message,
            rsvp.locale
          ]
        ]
      }
    });

    return NextResponse.json({ ok: true, message: "Successfully." });
  } catch (error) {
    console.error("Google Sheets RSVP append failed", error);
    const status = googleErrorStatus(error);

    return NextResponse.json(
      {
        ok: false,
        message:
          status === 403
            ? "Google Sheet permission denied. Share the sheet with the service account email."
            : status === 404
              ? "Google Sheet or tab was not found. Check the spreadsheet ID and sheet name."
              : "Unable to save RSVP right now."
      },
      { status }
    );
  }
}
