import { calculatePrice, isQuoteInput } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!isQuoteInput(payload)) {
      return Response.json(
        { error: "Check the lawn size, frequency, condition, and selected services." },
        { status: 400 },
      );
    }
    return Response.json({ price: calculatePrice(payload) });
  } catch {
    return Response.json({ error: "We could not calculate that quote." }, { status: 400 });
  }
}
