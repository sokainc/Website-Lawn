import { getDb } from "@/db";
import { serviceRequests } from "@/db/schema";
import { calculatePrice, isQuoteInput, type QuoteInput } from "@/lib/pricing";
import { isValidPhone, isValidPreferredDate } from "@/lib/request-validation";

type RequestPayload = QuoteInput & {
  name?: string; email?: string; phone?: string; address?: string; city?: string;
  state?: string; postalCode?: string; preferredDate?: string; notes?: string;
  consent?: boolean; companyWebsite?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postalPattern = /^\d{5}(?:-\d{4})?$/;
const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RequestPayload | null;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return Response.json({ error: "Enter valid request details." }, { status: 400 });
    }
    if (payload.companyWebsite) return Response.json({ ok: true }, { status: 201 });

    const name = clean(payload.name, 100);
    const email = clean(payload.email, 160).toLowerCase();
    const phone = clean(payload.phone, 24);
    const address = clean(payload.address, 180);
    const city = clean(payload.city, 80);
    const state = clean(payload.state, 2).toUpperCase();
    const postalCode = clean(payload.postalCode, 10);
    const preferredDate = clean(payload.preferredDate, 10) || null;
    const notes = clean(payload.notes, 1000);

    if (!isQuoteInput(payload)) {
      return Response.json({ error: "The lawn details are incomplete." }, { status: 400 });
    }
    if (!name || !emailPattern.test(email) || !isValidPhone(phone)) {
      return Response.json({ error: "Enter a valid name, email, and phone number." }, { status: 400 });
    }
    if (address.length < 6 || !city || state.length !== 2 || !postalPattern.test(postalCode)) {
      return Response.json({ error: "Enter a complete service address." }, { status: 400 });
    }
    if (payload.consent !== true) {
      return Response.json({ error: "Please allow us to contact you about this request." }, { status: 400 });
    }
    if (!isValidPreferredDate(preferredDate ?? "")) {
      return Response.json({ error: "Choose today or a future start date." }, { status: 400 });
    }

    const price = calculatePrice(payload);
    const id = crypto.randomUUID();
    const reference = `GB-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    const db = getDb();
    await db.insert(serviceRequests).values({
      id, reference, name, email, phone, address, city, state, postalCode,
      lotSize: Math.round(payload.lotSize), frequency: payload.frequency,
      grassHeight: payload.grassHeight, gated: payload.gated,
      addOns: JSON.stringify(payload.addOns), priceCents: price.totalCents,
      preferredDate, notes,
    });

    return Response.json({
      request: {
        reference, status: "new", price: price.total,
        address: `${address}, ${city}, ${state} ${postalCode}`,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("service_request_create_failed", error);
    return Response.json(
      { error: "We could not save your request. Your details are still in the form—please try again." },
      { status: 500 },
    );
  }
}
