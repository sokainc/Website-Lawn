"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3,
  Leaf, MapPin, Menu, MessageCircle, Phone, Scissors, ShieldCheck,
  Sparkles, Sprout, Star, Trees, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import {
  ADD_ONS, type Frequency, type GrassHeight, type PriceBreakdown, type QuoteInput,
} from "@/lib/pricing";

const services = [
  ["Lawn Mowing", "A clean, even cut with hard surfaces blown clear.", "$19", Scissors],
  ["Edging", "Crisp borders along drives, walks, and beds.", "$12", Sparkles],
  ["Leaf Removal", "Seasonal cleanup that lets your lawn breathe.", "$55", Leaf],
  ["Fertilization", "Targeted nutrition for thicker, greener turf.", "$45", Sprout],
  ["Aeration", "Open compacted soil to air, water, and nutrients.", "$65", Trees],
  ["Bush Trimming", "Healthy hedges with a tidy natural shape.", "$35", Scissors],
  ["Mulching", "Fresh beds with better moisture retention.", "$75", Leaf],
  ["Yard Cleanup", "A full reset for sticks, leaves, and debris.", "$85", Sparkles],
] as const;

const reviews = [
  ["Sarah M.", "Wabash Shores", "Our pro arrived in the window, shut the gate, and left the driveway spotless."],
  ["Daniel R.", "University Farm", "The price was clear before I sent the request, and the whole process took a few minutes."],
  ["Monica T.", "Hills & Dales", "Friendly, professional, and careful around every flower bed."],
] as const;

const faqs = [
  ["How is my price calculated?", "Your preliminary quote uses the lawn size you provide, visit frequency, grass condition, access, and selected add-ons. The server recalculates the price before saving every request."],
  ["Is the displayed price final?", "It is a preliminary service quote based on your answers. A pro may confirm or revise it if the property differs materially from the submitted details."],
  ["What happens after I send a request?", "The request is stored with a reference number and marked new. A GreenBlade team member can review the job details and contact you to confirm availability."],
  ["Is there a contract?", "No long-term contract. You can request weekly, biweekly, or one-time service."],
  ["Do I pay on this website?", "No. This version collects service requests and calculates pricing, but it does not collect card details or process payments."],
  ["Which areas are supported?", "The current market is West Lafayette and nearby Tippecanoe County communities. Availability is confirmed before scheduling."],
] as const;

const serviceBenefits = [
  [ShieldCheck, "Vetted local pros", "Background and insurance checks"],
  [Clock3, "Fast request intake", "A clear reference number instantly"],
  [Sparkles, "Transparent pricing", "Every adjustment shown"],
  [MessageCircle, "Human follow-up", "Availability confirmed with you"],
] as const;

const howItWorks = [
  [MapPin, "1", "Build your price", "Share the property details that affect the work. The pricing engine calculates every adjustment on the server."],
  [CalendarDays, "2", "Send the request", "Add your contact details and preferred start date. We save everything under a unique reference number."],
  [Scissors, "3", "Confirm your pro", "A team member reviews the property, confirms availability and final scope, then matches your local pro."],
] as const;

const requestFeatures = [
  [ShieldCheck, "Validated details", "Required contact, property, and service fields are checked before saving."],
  [Sparkles, "Server-priced", "The backend calculates the quote and stores price in cents alongside the request."],
  [CheckCircle2, "Trackable reference", "Every successful submission returns a unique GreenBlade reference number."],
] as const;

type LocationFields = {
  address: string; city: string; state: string; postalCode: string;
};
type ContactFields = {
  name: string; email: string; phone: string; preferredDate: string; notes: string;
  consent: boolean; companyWebsite: string;
};

const initialLocation: LocationFields = {
  address: "", city: "West Lafayette", state: "IN", postalCode: "",
};
const initialQuote: QuoteInput = {
  lotSize: 5000, frequency: "biweekly", grassHeight: "maintained", gated: false, addOns: ["edging"],
};
const initialContact: ContactFields = {
  name: "", email: "", phone: "", preferredDate: "", notes: "", consent: false, companyWebsite: "",
};

function Brand() {
  return (
    <a href="#top" className="flex items-center gap-2.5 text-[#173f2d]" aria-label="GreenBlade home">
      <span className="grid size-10 place-items-center rounded-xl bg-[#173f2d] text-lg font-black text-[#c4e99b]">G</span>
      <span className="text-xl font-black tracking-[-0.05em]">GreenBlade<span className="block text-[9px] font-bold tracking-[.19em]">LAWN CARE, SIMPLIFIED</span></span>
    </a>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-[#173f2d]">{children}</label>;
}

function QuoteFlow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [location, setLocation] = useState(initialLocation);
  const [quote, setQuote] = useState(initialQuote);
  const [contact, setContact] = useState(initialContact);
  const [price, setPrice] = useState<PriceBreakdown | null>(null);
  const [result, setResult] = useState<{ reference: string; price: number; address: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nextLocation = (event: FormEvent) => {
    event.preventDefault();
    if (location.address.trim().length < 6 || !/^\d{5}(?:-\d{4})?$/.test(location.postalCode)) {
      setError("Enter a complete street address and ZIP code.");
      return;
    }
    setError("");
    setStep(2);
  };

  const calculate = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/quote", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(quote),
      });
      const data = (await response.json()) as { price?: PriceBreakdown; error?: string };
      if (!response.ok || !data.price) throw new Error(data.error || "Could not calculate the quote.");
      setPrice(data.price); setStep(3);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not calculate the quote.");
    } finally { setBusy(false); }
  };

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...location, ...quote, ...contact }),
      });
      const data = (await response.json()) as {
        request?: { reference: string; price: number; address: string }; error?: string;
      };
      if (!response.ok || !data.request) throw new Error(data.error || "Could not save the request.");
      setResult(data.request); setStep(4);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the request.");
    } finally { setBusy(false); }
  };

  const restart = () => {
    setStep(1); setLocation(initialLocation); setQuote(initialQuote); setContact(initialContact);
    setPrice(null); setResult(null); setError("");
  };

  return (
    <Card id="quote" className="scroll-mt-28 overflow-hidden border-0 bg-white py-0 shadow-[0_22px_70px_rgba(23,63,45,.18)]">
      <div className="bg-[#173f2d] px-6 py-5 text-white sm:px-8">
        <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[.12em] text-[#c4e99b]">
          <span>{step === 4 ? "Request received" : `Instant quote · Step ${step} of 3`}</span>
          <span>{step === 4 ? "Complete" : `${Math.round((step / 3) * 100)}%`}</span>
        </div>
        <Progress value={step === 4 ? 100 : (step / 3) * 100} className="bg-white/20 [&_[data-slot=progress-indicator]]:bg-[#f7aa5d]" />
      </div>
      <CardContent className="p-6 sm:p-8">
        {step === 1 && (
          <form onSubmit={nextLocation} className="space-y-5">
            <div><p className="text-xs font-black uppercase tracking-[.15em] text-[#327840]">Start with your property</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#173f2d]">Where should we work?</h2><p className="mt-2 text-sm text-[#607064]">We use your answers to create a preliminary price. No on-site visit is needed to start.</p></div>
            <div><FieldLabel htmlFor="address">Street address</FieldLabel><Input id="address" autoComplete="street-address" value={location.address} onChange={(e) => setLocation({ ...location, address: e.target.value })} placeholder="123 Maple Street" className="h-12" required /></div>
            <div className="grid gap-4 sm:grid-cols-[1fr_70px_110px]">
              <div><FieldLabel htmlFor="city">City</FieldLabel><Input id="city" autoComplete="address-level2" value={location.city} onChange={(e) => setLocation({ ...location, city: e.target.value })} className="h-12" required /></div>
              <div><FieldLabel htmlFor="state">State</FieldLabel><Input id="state" autoComplete="address-level1" maxLength={2} value={location.state} onChange={(e) => setLocation({ ...location, state: e.target.value.toUpperCase() })} className="h-12" required /></div>
              <div><FieldLabel htmlFor="postal">ZIP code</FieldLabel><Input id="postal" inputMode="numeric" autoComplete="postal-code" value={location.postalCode} onChange={(e) => setLocation({ ...location, postalCode: e.target.value })} className="h-12" required /></div>
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <Button size="lg" className="h-13 w-full bg-[#f7aa5d] text-[#213829] hover:bg-[#ffc17f]">Price my lawn <ArrowRight /></Button>
            <p className="text-center text-xs text-[#607064]">Your address stays private and is used only for this service request.</p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={calculate} className="space-y-5">
            <div><p className="text-xs font-black uppercase tracking-[.15em] text-[#327840]">Lawn details</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#173f2d]">Tell us about the job.</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><FieldLabel htmlFor="lot-size">Approximate lawn size</FieldLabel><div className="relative"><Input id="lot-size" type="number" inputMode="numeric" min={500} max={100000} step={100} value={quote.lotSize} onChange={(e) => setQuote({ ...quote, lotSize: Number(e.target.value) })} className="h-12 pr-14" required /><span className="pointer-events-none absolute right-3 top-3 text-sm text-[#607064]">sq ft</span></div></div>
              <div><FieldLabel htmlFor="frequency">Visit frequency</FieldLabel><NativeSelect id="frequency" value={quote.frequency} onChange={(e) => setQuote({ ...quote, frequency: e.target.value as Frequency })} className="h-12 w-full"><NativeSelectOption value="weekly">Weekly · save 10%</NativeSelectOption><NativeSelectOption value="biweekly">Every two weeks</NativeSelectOption><NativeSelectOption value="one-time">One-time visit</NativeSelectOption></NativeSelect></div>
              <div><FieldLabel htmlFor="height">Current grass height</FieldLabel><NativeSelect id="height" value={quote.grassHeight} onChange={(e) => setQuote({ ...quote, grassHeight: e.target.value as GrassHeight })} className="h-12 w-full"><NativeSelectOption value="maintained">Maintained · under 6 in</NativeSelectOption><NativeSelectOption value="tall">Tall · 6–12 in</NativeSelectOption><NativeSelectOption value="overgrown">Overgrown · above 12 in</NativeSelectOption></NativeSelect></div>
              <label className="mt-7 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#cddbc8] px-4 text-sm font-bold text-[#173f2d]"><input type="checkbox" checked={quote.gated} onChange={(e) => setQuote({ ...quote, gated: e.target.checked })} className="size-4 accent-[#327840]" />Gated or hard-to-access backyard</label>
            </div>
            <fieldset><legend className="mb-3 text-sm font-bold text-[#173f2d]">Add services</legend><div className="grid gap-2 sm:grid-cols-2">{ADD_ONS.map((service) => <label key={service.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#dce6d9] p-3 text-sm hover:bg-[#f4f7f1]"><span className="flex items-center gap-2"><input type="checkbox" checked={quote.addOns.includes(service.id)} onChange={(e) => setQuote({ ...quote, addOns: e.target.checked ? [...quote.addOns, service.id] : quote.addOns.filter((id) => id !== service.id) })} className="size-4 accent-[#327840]" />{service.name}</span><strong>+${service.price}</strong></label>)}</div></fieldset>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="flex gap-3"><Button type="button" variant="outline" size="lg" onClick={() => setStep(1)} className="h-12">Back</Button><Button size="lg" disabled={busy} className="h-12 flex-1 bg-[#f7aa5d] text-[#213829] hover:bg-[#ffc17f]">{busy ? "Calculating…" : "See my price"}<ArrowRight /></Button></div>
          </form>
        )}

        {step === 3 && price && (
          <form onSubmit={submitRequest} className="space-y-5">
            <div className="rounded-2xl bg-[#f1f7ec] p-5"><p className="text-xs font-black uppercase tracking-[.15em] text-[#327840]">Your preliminary price</p><div className="mt-1 flex items-end justify-between"><strong className="text-5xl tracking-[-.06em] text-[#173f2d]">${price.total}</strong><span className="pb-2 text-sm text-[#607064]">per visit</span></div><div className="mt-4 space-y-2 border-t border-[#cddbc8] pt-4 text-sm"><div className="flex justify-between"><span>Base mowing</span><strong>${price.mowing}</strong></div>{price.frequencyAdjustment !== 0 && <div className="flex justify-between"><span>Frequency adjustment</span><strong>{price.frequencyAdjustment > 0 ? "+" : "−"}${Math.abs(price.frequencyAdjustment)}</strong></div>}{price.conditionAdjustment > 0 && <div className="flex justify-between"><span>Grass condition</span><strong>+${price.conditionAdjustment}</strong></div>}{price.accessAdjustment > 0 && <div className="flex justify-between"><span>Property access</span><strong>+${price.accessAdjustment}</strong></div>}{price.addOns.map((item) => <div key={item.id} className="flex justify-between"><span>{item.name}</span><strong>+${item.price}</strong></div>)}</div></div>
            <div><h2 className="text-2xl font-black tracking-[-.04em] text-[#173f2d]">Where should we send confirmation?</h2><p className="mt-1 text-sm text-[#607064]">Submitting saves this quote as a new service request. No payment is taken.</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="name">Full name</FieldLabel><Input id="name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="h-12" required /></div><div><FieldLabel htmlFor="phone">Phone</FieldLabel><Input id="phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-12" required /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="h-12" required /></div><div><FieldLabel htmlFor="date">Preferred start date</FieldLabel><Input id="date" type="date" value={contact.preferredDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setContact({ ...contact, preferredDate: e.target.value })} className="h-12" /></div></div>
            <div><FieldLabel htmlFor="notes">Anything your pro should know? <span className="font-normal text-[#607064]">Optional</span></FieldLabel><textarea id="notes" value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} maxLength={1000} rows={3} className="w-full rounded-xl border border-[#cddbc8] bg-white px-3 py-2 text-base outline-none focus:border-[#327840] focus:ring-3 focus:ring-[#327840]/20" placeholder="Pets, gate code, steep areas, or timing notes" /></div>
            <div className="sr-only" aria-hidden="true"><label htmlFor="company-website">Company website</label><input id="company-website" tabIndex={-1} autoComplete="off" value={contact.companyWebsite} onChange={(e) => setContact({ ...contact, companyWebsite: e.target.value })} /></div>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#4f6256]"><input type="checkbox" checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} className="mt-1 size-4 accent-[#327840]" required /><span>I agree that GreenBlade may contact me about this lawn-care request. Standard message and data rates may apply.</span></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="flex gap-3"><Button type="button" variant="outline" size="lg" onClick={() => setStep(2)} className="h-12">Edit</Button><Button size="lg" disabled={busy} className="h-12 flex-1 bg-[#f7aa5d] text-[#213829] hover:bg-[#ffc17f]">{busy ? "Saving request…" : "Request this service"}<ArrowRight /></Button></div>
            <p className="text-center text-xs text-[#607064]">Final pricing and scheduling are confirmed after property review.</p>
          </form>
        )}

        {step === 4 && result && (
          <div className="py-4 text-center" aria-live="polite"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e3f3d9] text-[#327840]"><CheckCircle2 className="size-8" /></span><p className="mt-5 text-xs font-black uppercase tracking-[.15em] text-[#327840]">Request {result.reference}</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em] text-[#173f2d]">Your lawn is in the queue.</h2><p className="mx-auto mt-3 max-w-md text-[#607064]">We saved your ${result.price} preliminary quote for {result.address}. A team member can now review the details and contact you to confirm service.</p><div className="mt-6 grid gap-3 rounded-2xl bg-[#f4f7f1] p-4 text-left text-sm sm:grid-cols-3"><span><strong className="block text-[#173f2d]">Status</strong>New request</span><span><strong className="block text-[#173f2d]">Price</strong>${result.price} / visit</span><span><strong className="block text-[#173f2d]">Payment</strong>Not collected</span></div><Button type="button" onClick={restart} variant="outline" className="mt-6">Price another property</Button></div>
        )}
      </CardContent>
    </Card>
  );
}

export function GreenBladeApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div id="top" className="min-h-screen bg-white text-[#243b30]">
      <a href="#quote" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to instant quote</a>
      <div className="bg-[#173f2d] px-4 py-1.5 text-center text-xs font-bold text-[#e5f1de]">West Lafayette lawn care · Preliminary pricing in minutes</div>
      <header className="sticky top-0 z-40 border-b border-[#e3eadf] bg-white/95 backdrop-blur-xl"><div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-5 sm:px-8"><Brand /><nav className="ml-auto hidden items-center gap-7 text-sm font-bold lg:flex"><a href="#services">Services</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#reviews">Reviews</a><a href="#faq">FAQ</a></nav><a href="tel:+17655550190" className="ml-auto hidden text-sm font-bold xl:block">(765) 555-0190</a><Button asChild className="ml-auto hidden bg-[#173f2d] sm:inline-flex lg:ml-0"><a href="#quote">Get a quote</a></Button><Button variant="ghost" size="icon" className="ml-auto lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div>{menuOpen && <nav className="grid border-t border-[#e3eadf] bg-white px-5 py-3 text-sm font-bold lg:hidden">{[["Services","services"],["How it works","how"],["Pricing","pricing"],["Reviews","reviews"],["FAQ","faq"]].map(([label,id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="py-3">{label}</a>)}</nav>}</header>

      <main>
        <section className="overflow-hidden bg-[#f1f7ec]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-20"><div><p className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.17em] text-[#327840]"><MapPin className="size-4" />West Lafayette, Indiana</p><h1 className="text-5xl font-black leading-[.98] tracking-[-.065em] text-[#173f2d] sm:text-6xl">A greener lawn.<br /><span className="font-medium">A price you can see.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#55685b]">Build your quote, send the request, and let a local pro take the yard work from here. Mowing starts at $19.</p><div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-[#173f2d]"><span className="flex items-center gap-2"><Star className="size-4 fill-[#327840] text-[#327840]" />4.8 sample rating</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#327840]" />Background-checked pros</span></div><div className="relative mt-9 overflow-hidden rounded-[2rem] lg:rounded-[4rem_1.5rem_1.5rem_1.5rem]"><img src="/hero.jpg" alt="Green residential lawn outside a welcoming home" className="h-64 w-full object-cover sm:h-80" /><span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-[#173f2d] shadow-lg">Fresh cut. Zero weekend work.</span></div></div><QuoteFlow /></div></section>

        <section aria-label="Service benefits" className="border-y border-[#e3eadf]"><div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{serviceBenefits.map(([Icon,title,copy]) => <div key={title} className="flex gap-3"><Icon className="mt-1 size-6 text-[#327840]" /><div><strong className="text-[#173f2d]">{title}</strong><p className="text-[#607064]">{copy}</p></div></div>)}</div></section>

        <section id="how" className="scroll-mt-24 py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">From quote to freshly cut</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">Three steps. One less chore.</h2></div><div className="mt-12 grid gap-7 md:grid-cols-3">{howItWorks.map(([Icon,num,title,copy]) => <article key={num} className="rounded-3xl border border-[#dce6d9] p-7"><span className="grid size-14 place-items-center rounded-2xl bg-[#f1f7ec] text-[#327840]"><Icon className="size-7" /></span><p className="mt-6 text-xs font-black text-[#327840]">STEP {num}</p><h3 className="mt-2 text-xl font-black tracking-[-.03em] text-[#173f2d]">{title}</h3><p className="mt-3 leading-7 text-[#607064]">{copy}</p></article>)}</div></div></section>

        <section id="services" className="scroll-mt-24 bg-[#f6f9f3] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">One yard. All the help you need.</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">Choose the care that fits.</h2></div><Button asChild variant="outline"><a href="#quote">Build my quote <ArrowRight /></a></Button></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map(([name,copy,price,Icon]) => <article key={name} className="rounded-2xl border border-[#dce6d9] bg-white p-6"><Icon className="size-7 text-[#327840]" /><h3 className="mt-5 text-lg font-black text-[#173f2d]">{name}</h3><p className="mt-2 min-h-14 text-sm leading-6 text-[#607064]">{copy}</p><strong className="mt-5 block text-sm text-[#173f2d]">From {price}</strong></article>)}</div></div></section>

        <section id="pricing" className="scroll-mt-24 py-20"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">Pricing without guesswork</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">See what moves your price.</h2><p className="mt-5 max-w-xl leading-7 text-[#607064]">The app starts with lawn size, then applies clear adjustments for frequency, grass height, access, and add-ons. The same rules run again when you submit, so the saved price cannot be changed in the browser.</p><ul className="mt-7 space-y-3">{["Mowing from $19 for a small weekly lawn","Most standard visits fall near $42–$68","Weekly service receives a 10% mowing discount","No long-term contract and no payment at request time"].map((item) => <li key={item} className="flex gap-3"><Check className="mt-1 size-5 text-[#327840]" /><span>{item}</span></li>)}</ul></div><div className="rounded-3xl bg-[#173f2d] p-7 text-white sm:p-9"><p className="text-xs font-black uppercase tracking-[.17em] text-[#c4e99b]">Example 5,000 sq ft lawn</p><div className="mt-3 text-6xl font-black tracking-[-.06em]">$49<span className="text-base font-medium tracking-normal text-white/70"> / visit</span></div><div className="mt-7 space-y-4 border-t border-white/20 pt-6 text-sm"><div className="flex justify-between"><span>Biweekly mowing</span><strong>$42</strong></div><div className="flex justify-between"><span>Gated backyard</span><strong>+$7</strong></div><div className="flex justify-between text-[#c4e99b]"><span>Total before add-ons</span><strong>$49</strong></div></div><Button asChild className="mt-7 w-full bg-[#f7aa5d] text-[#213829] hover:bg-[#ffc17f]"><a href="#quote">Calculate my actual quote <ArrowRight /></a></Button></div></div></section>

        <section className="bg-[#173f2d] py-20 text-white"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.17em] text-[#c4e99b]">Built for confident requests</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em]">Every request arrives complete.</h2></div><div className="mt-10 grid gap-6 md:grid-cols-3">{requestFeatures.map(([Icon,title,copy]) => <article key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6"><Icon className="size-7 text-[#c4e99b]" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/70">{copy}</p></article>)}</div></div></section>

        <section id="reviews" className="scroll-mt-24 py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">Fresh cuts. Happy neighbors.</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">A little neighborhood love.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{reviews.map(([name,area,quote]) => <blockquote key={name} className="rounded-2xl border border-[#dce6d9] p-7"><div className="flex gap-1 text-[#327840]" aria-label="Five stars">{[1,2,3,4,5].map((n) => <Star key={n} className="size-4 fill-current" />)}</div><p className="mt-5 text-lg leading-8 text-[#324a3c]">“{quote}”</p><footer className="mt-6"><strong className="block text-[#173f2d]">{name}</strong><span className="text-sm text-[#607064]">{area} · Sample customer</span></footer></blockquote>)}</div><p className="mt-5 text-center text-xs text-[#607064]">Illustrative testimonials retained from the original demonstration website.</p></div></section>

        <section className="bg-[#f6f9f3] py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_.8fr]"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">Rooted in West Lafayette</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">Local care for Indiana lawns.</h2><p className="mt-5 leading-7 text-[#607064]">Kentucky bluegrass and tall fescue thrive during Indiana’s milder spring and fall weather. Mowing commonly runs from spring green-up into fall, with frequency changing during summer heat or dry periods.</p><p className="mt-4 leading-7 text-[#607064]">Keep cool-season grass a little taller in hot weather, avoid removing more than one-third of the blade at once, and use late summer or early fall to repair thin areas.</p></div><aside className="rounded-3xl bg-white p-7 shadow-sm"><MapPin className="size-7 text-[#327840]" /><h3 className="mt-5 text-xl font-black text-[#173f2d]">Areas currently quoted</h3><div className="mt-4 flex flex-wrap gap-2">{["West Lafayette","Lafayette","Battle Ground","Dayton","Shadeland","Brookston","Delphi","Tippecanoe County"].map((area) => <span key={area} className="rounded-full bg-[#f1f7ec] px-3 py-1.5 text-sm font-semibold text-[#315941]">{area}</span>)}</div></aside></div></section>

        <section id="faq" className="scroll-mt-24 py-20"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#327840]">Straight answers</p><h2 className="mt-3 text-4xl font-black tracking-[-.05em] text-[#173f2d]">Before you send the request.</h2><Button asChild className="mt-7 bg-[#173f2d]"><a href="#quote">Start my quote <ArrowRight /></a></Button></div><div>{faqs.map(([question,answer]) => <details key={question} className="group border-b border-[#dce6d9] first:border-t"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-black text-[#173f2d]">{question}<ChevronRight className="size-5 transition-transform group-open:rotate-90" /></summary><p className="pb-5 pr-8 leading-7 text-[#607064]">{answer}</p></details>)}</div></div></section>

        <section className="bg-[#f7aa5d] py-16"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#315941]">Less mowing. More living.</p><h2 className="mt-2 text-4xl font-black tracking-[-.05em] text-[#173f2d]">Ready to price your lawn?</h2></div><Button asChild size="lg" className="h-13 bg-[#173f2d] px-7"><a href="#quote">Build my request <ArrowRight /></a></Button></div></section>
      </main>

      <footer className="bg-[#f6f9f3] py-12"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-5"><div className="sm:col-span-2"><Brand /><p className="mt-4 max-w-sm text-sm leading-6 text-[#607064]">Transparent lawn-care pricing and complete service requests for West Lafayette homeowners.</p></div><div><h3 className="font-black text-[#173f2d]">Services</h3><a href="#services" className="mt-3 block text-sm text-[#607064]">Mowing & edging</a><a href="#services" className="mt-2 block text-sm text-[#607064]">Seasonal care</a><a href="#services" className="mt-2 block text-sm text-[#607064]">Yard cleanup</a></div><div><h3 className="font-black text-[#173f2d]">Support</h3><a href="#faq" className="mt-3 block text-sm text-[#607064]">Common questions</a><a href="tel:+17655550190" className="mt-2 flex items-center gap-2 text-sm text-[#607064]"><Phone className="size-4" />(765) 555-0190</a></div><div><h3 className="font-black text-[#173f2d]">Request status</h3><p className="mt-3 text-sm leading-6 text-[#607064]">Keep your confirmation reference. Customer lookup and online payment are not enabled in this version.</p></div></div><div className="mt-10 border-t border-[#dce6d9] pt-6 text-xs leading-6 text-[#607064]">© {new Date().getFullYear()} GreenBlade Lawn Care. Example business application. Preliminary prices require property and availability confirmation. Photo: Curtis Adams / Pexels.</div></div></footer>
    </div>
  );
}
