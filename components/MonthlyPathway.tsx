import Image from "next/image";
import { monthlyMilestones } from "@/lib/config";
import Reveal from "@/components/Reveal";

export default function MonthlyPathway() {
  return (
    <section className="px-6 pl-14 sm:pl-16 py-16 sm:py-24 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <Reveal>
          <div className="text-center mb-16 sm:mb-24 max-w-2xl mx-auto">
            <span className="tag mb-3 inline-block">1 to 11 Months Journey</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-3 leading-tight">
              The Road to Turning <span className="text-[var(--honey)]">ONE</span> 🍼
            </h2>
            <p className="mt-4 text-[var(--ink-soft)] text-base sm:text-lg">
              Every single month brought new giggles, little milestones, and memories we&apos;ll cherish forever.
            </p>
          </div>
        </Reveal>

        {/* Central Winding Growth Pathway Line */}
        <div className="relative">
          {/* Vertical central dotted pathway line (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-[var(--blush-deep)] via-[var(--honey)] to-[var(--sage)] rounded-full opacity-30 pointer-events-none" />

          <div className="space-y-12 md:space-y-20">
            {monthlyMilestones.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={item.month} className="relative">
                  {/* Center Node Badge for desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-8 z-10 w-12 h-12 rounded-full bg-[var(--paper)] border-4 border-[var(--cream)] shadow-md items-center justify-center font-display font-bold text-[var(--ink)] text-sm">
                    {item.month}m
                  </div>

                  <Reveal delay={index * 40}>
                    <div
                      className={`grid md:grid-cols-2 gap-8 items-center ${
                        isEven ? "" : "md:[&>*:first-child]:order-2"
                      }`}
                    >
                      {/* Photo Card */}
                      <div className="group relative rounded-3xl overflow-hidden card p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--cream)]">
                          <Image
                            src={item.photo}
                            alt={`${item.label} photo`}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div
                        className={`space-y-3 p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-[var(--line)] shadow-sm ${
                          isEven ? "md:text-left" : "md:text-right"
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                          <span className="px-3 py-1 text-xs font-semibold tracking-wider rounded-full bg-[var(--honey-soft)] text-[var(--ink)]">
                            {item.label}
                          </span>
                          <span className="text-xs text-[var(--ink-soft)] font-mono">
                            Month {item.month} of 11
                          </span>
                        </div>

                        <h3 className="font-display text-2xl text-[var(--ink)]">
                          {item.caption}
                        </h3>

                        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                          Sihagi Ayenya at {item.month} {item.month === 1 ? "month" : "months"} old — captured in a moment of pure magic.
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>

          {/* Pathway End Milestone Banner */}
          <Reveal delay={200}>
            <div className="mt-20 text-center">
              <div className="inline-flex flex-col items-center p-8 rounded-3xl card max-w-md mx-auto">
                <span className="text-4xl mb-3">🎉 🎂 🎈</span>
                <h3 className="font-display text-2xl sm:text-3xl text-[var(--ink)]">
                  And Now... 12th Month!
                </h3>
                <p className="text-sm text-[var(--ink-soft)] mt-2">
                  Our baby girl is officially turning ONE! Join us to celebrate this grand milestone together.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
