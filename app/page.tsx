import Image from "next/image";
import { siteConfig } from "@/lib/config";
import GrowthRail from "@/components/GrowthRail";
import Reveal from "@/components/Reveal";
import RsvpForm from "@/components/RsvpForm";
import MonthlyPathway from "@/components/MonthlyPathway";

function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function calendarUrl() {
  const start = new Date(siteConfig.party.dateISO);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: siteConfig.eventTitle,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: siteConfig.party.venueAddress,
    details: `Join us to celebrate ${siteConfig.babyName}'s first birthday!`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function whatsappUrl(number: string, name: string) {
  const text = `Hi ${name}! Just replying about ${siteConfig.babyName}'s birthday party 🎈`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export default function Home() {
  const dateObj = new Date(siteConfig.party.dateISO);
  const day = dateObj.toLocaleDateString("en-US", { day: "2-digit" });
  const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <main className="relative overflow-x-clip">
      <GrowthRail />

      {/* ── Hero ── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center px-6 pl-14 sm:pl-16 pt-16 pb-20">
        <div className="max-w-3xl w-full text-center">
          <Reveal>
            <span className="tag">You&apos;re invited</span>
          </Reveal>
          <Reveal delay={80}>
            <div className="mx-auto mt-6 mb-6 w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[var(--paper)] shadow-[0_10px_40px_rgba(57,44,52,0.18)]">
              <Image
                src={siteConfig.heroPhoto}
                alt={`${siteConfig.babyName}, smiling`}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </Reveal>
          <Reveal delay={140}>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.05]">
              {siteConfig.babyName} turns <span className="text-[var(--honey)]">ONE</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-5 text-lg text-[var(--ink-soft)] max-w-md mx-auto">
              {siteConfig.heroTagline}
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-9 flex items-center justify-center gap-2 text-sm text-[var(--ink-soft)]">
              <span className="font-mono">↓</span> scroll for our story
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Story sections ── */}
      <section className="px-6 pl-14 sm:pl-16 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-20 sm:space-y-28">
          {siteConfig.story.map((item, i) => {
            const imageFirst = i % 2 === 0;
            return (
              <Reveal key={item.id}>
                <div
                  className={`grid sm:grid-cols-2 gap-8 sm:gap-12 items-center ${
                    imageFirst ? "" : "sm:[&>*:first-child]:order-2"
                  }`}
                >
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] card">
                    <Image
                      src={item.photo}
                      alt={item.title}
                      width={640}
                      height={480}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="tag mb-4">{item.eyebrow}</span>
                    <h2 className="font-display text-3xl sm:text-4xl mt-4 mb-4 leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-[var(--ink-soft)] leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── 1 to 11 Months Journey Pathway ── */}
      <MonthlyPathway />

      {/* ── Party details ── */}
      <section id="details" className="px-6 pl-14 sm:pl-16 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <span className="tag">The details</span>
              <h2 className="font-display text-4xl sm:text-5xl mt-4">Come celebrate with us</h2>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            <Reveal>
              <div className="card p-8 h-full flex flex-col">
                <div className="flex items-start gap-5 mb-6">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-[var(--honey-soft)] flex flex-col items-center justify-center font-mono leading-none">
                    <span className="text-xs tracking-widest">{month}</span>
                    <span className="text-2xl font-semibold">{day}</span>
                  </div>
                  <div>
                    <p className="font-display text-xl">{weekday}</p>
                    <p className="text-[var(--ink-soft)]">{siteConfig.party.dateDisplay}</p>
                    <p className="text-[var(--ink-soft)]">{siteConfig.party.timeDisplay}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--ink-soft)] mt-auto mb-4">
                  {siteConfig.party.dressCode}
                </p>
                <a
                  href={calendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Add to calendar
                </a>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="card p-8 h-full flex flex-col">
                <div className="flex items-start gap-5 mb-6">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-[var(--sage-soft)] flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sage-deep)" strokeWidth="2">
                      <path d="M12 21s-7-6.4-7-11a7 7 0 1 1 14 0c0 4.6-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-xl">{siteConfig.party.venueName}</p>
                    <p className="text-[var(--ink-soft)]">{siteConfig.party.venueAddress}</p>
                  </div>
                </div>
                <a
                  href={mapsUrl(siteConfig.party.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-honey mt-auto"
                >
                  Open in Google Maps
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section id="rsvp" className="px-6 pl-14 sm:pl-16 py-16 sm:py-24 bg-[var(--paper)]">
        <div className="max-w-xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <span className="tag">Kindly RSVP</span>
              <h2 className="font-display text-4xl sm:text-5xl mt-4">Will you be there?</h2>
              <p className="text-[var(--ink-soft)] mt-3">
                Let us know how many are coming from your house.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <RsvpForm />
          </Reveal>
        </div>
      </section>

      {/* ── Footer / contacts ── */}
      <footer className="px-6 pl-14 sm:pl-16 py-16 sm:py-20 text-center">
        <Reveal>
          <p className="font-display text-2xl sm:text-3xl mb-2">Questions? Just ask.</p>
          <p className="text-[var(--ink-soft)] mb-8">We&apos;re happy to help on WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={whatsappUrl(siteConfig.contacts.mom.whatsapp, siteConfig.contacts.mom.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              WhatsApp Mom ({siteConfig.contacts.mom.name})
            </a>
            <a
              href={whatsappUrl(siteConfig.contacts.dad.whatsapp, siteConfig.contacts.dad.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              WhatsApp Dad ({siteConfig.contacts.dad.name})
            </a>
          </div>
          <p className="mt-14 text-xs text-[var(--ink-soft)] font-mono">
            with love, for {siteConfig.babyName}&apos;s first birthday
          </p>
        </Reveal>
      </footer>
    </main>
  );
}
