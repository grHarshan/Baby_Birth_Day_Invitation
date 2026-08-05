"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { monthlyMilestones } from "@/lib/config";
import Reveal from "@/components/Reveal";

const COLORS = [
  { bg: "#f2c9c4", accent: "#e08f86", text: "#392c34" }, // blush
  { bg: "#f4dcae", accent: "#e2a13f", text: "#392c34" }, // honey
  { bg: "#dbe6d5", accent: "#4f6b4d", text: "#392c34" }, // sage
  { bg: "#c9dee3", accent: "#3d7a8a", text: "#392c34" }, // sky
  { bg: "#f2c9c4", accent: "#e08f86", text: "#392c34" },
  { bg: "#f4dcae", accent: "#e2a13f", text: "#392c34" },
  { bg: "#dbe6d5", accent: "#4f6b4d", text: "#392c34" },
  { bg: "#c9dee3", accent: "#3d7a8a", text: "#392c34" },
  { bg: "#f2c9c4", accent: "#e08f86", text: "#392c34" },
  { bg: "#f4dcae", accent: "#e2a13f", text: "#392c34" },
  { bg: "#dbe6d5", accent: "#4f6b4d", text: "#392c34" },
];

export default function MonthlyPathway() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const scrollStart = useRef(0);

  // Update active index on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const cardW = el.scrollWidth / monthlyMilestones.length;
      setActive(Math.round(el.scrollLeft / cardW));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  function scrollTo(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / monthlyMilestones.length;
    el.scrollTo({ left: cardW * i, behavior: "smooth" });
    setActive(i);
  }

  // Mouse drag support
  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    dragStart.current = e.clientX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !scrollRef.current) return;
    scrollRef.current.scrollLeft = scrollStart.current - (e.clientX - dragStart.current);
  }
  function onMouseUp() { setIsDragging(false); }

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: "50vw", height: "50vw", maxWidth: 400,
            background: "radial-gradient(circle, #f4dcae55 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "0%", right: "-5%",
            width: "45vw", height: "45vw", maxWidth: 380,
            background: "radial-gradient(circle, #dbe6d577 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <Reveal>
          <div className="text-center mb-10 sm:mb-16 px-6 pl-14 sm:pl-16 max-w-2xl mx-auto">
            <span className="tag mb-3 inline-block">1 to 11 Months Journey</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-3 leading-tight">
              The Road to Turning <span className="text-[var(--honey)]">ONE</span> 🍼
            </h2>
            <p className="mt-4 text-[var(--ink-soft)] text-base sm:text-lg">
              Every single month brought new giggles, little milestones, and memories we&apos;ll cherish forever.
            </p>
          </div>
        </Reveal>

        {/* ── MOBILE: horizontal snap carousel ── */}
        <div className="block md:hidden">
          {/* Progress bar */}
          <div className="px-6 pl-14 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--ink-soft)] w-16">Month {active + 1}/11</span>
              <div
                className="flex-1 h-1.5 rounded-full"
                style={{ background: "var(--line)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((active + 1) / monthlyMilestones.length) * 100}%`,
                    background: "linear-gradient(to right, var(--blush-deep), var(--honey), var(--sage))",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--ink-soft)] w-8 text-right">🎂</span>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              paddingLeft: "3.5rem",
              paddingRight: "1.5rem",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {monthlyMilestones.map((item, i) => {
              const col = COLORS[i % COLORS.length];
              const isActive = i === active;
              return (
                <div
                  key={item.month}
                  className="snap-center shrink-0 flex flex-col"
                  style={{ width: "78vw", maxWidth: 300 }}
                >
                  {/* Photo */}
                  <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                      aspectRatio: "3/4",
                      border: `3px solid ${isActive ? col.accent : "transparent"}`,
                      boxShadow: isActive
                        ? `0 12px 40px ${col.accent}44`
                        : "0 4px 16px rgba(57,44,52,0.10)",
                      transition: "border-color 0.3s, box-shadow 0.3s",
                    }}
                  >
                    <Image
                      src={item.photo}
                      alt={item.label}
                      fill
                      className="object-cover"
                      sizes="80vw"
                    />
                    {/* Month badge overlay */}
                    <div
                      className="absolute top-3 left-3 w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg font-display font-bold text-sm"
                      style={{ background: col.accent, color: "#fff" }}
                    >
                      <span style={{ lineHeight: 1 }}>{item.month}</span>
                      <span style={{ fontSize: "0.55rem", lineHeight: 1, opacity: 0.9 }}>mo</span>
                    </div>
                    {/* Gradient overlay at bottom */}
                    <div
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: "50%",
                        background: `linear-gradient(to top, ${col.accent}cc, transparent)`,
                      }}
                    />
                    {/* Caption on photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p
                        className="font-display text-lg leading-tight"
                        style={{ color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
                      >
                        {item.caption}
                      </p>
                    </div>
                  </div>

                  {/* Info pill below */}
                  <div
                    className="mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: col.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold"
                      style={{ background: col.accent, color: "#fff" }}
                    >
                      {item.month}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: col.text }}>
                        {item.label}
                      </p>
                      <p className="text-xs" style={{ color: col.accent }}>
                        Sihagi at {item.month} {item.month === 1 ? "month" : "months"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final card */}
            <div
              className="snap-center shrink-0 flex flex-col justify-center items-center rounded-3xl"
              style={{
                width: "78vw",
                maxWidth: 300,
                aspectRatio: "3/4",
                background: "linear-gradient(135deg, var(--honey-soft), var(--blush))",
                border: "2px dashed var(--honey)",
              }}
            >
              <span className="text-5xl mb-3">🎂</span>
              <h3 className="font-display text-2xl text-[var(--ink)] text-center px-4">
                She&apos;s turning ONE!
              </h3>
              <p className="text-sm text-[var(--ink-soft)] text-center mt-2 px-6">
                12 months of pure magic. Come celebrate! 🎉
              </p>
            </div>
          </div>

          {/* Dot navigation */}
          <div className="flex justify-center gap-1.5 px-6 mt-2">
            {monthlyMilestones.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to month ${i + 1}`}
                style={{
                  width: i === active ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === active
                    ? COLORS[i % COLORS.length].accent
                    : "var(--line)",
                  border: "none",
                  padding: 0,
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-[var(--ink-soft)] font-mono mt-3 opacity-60">
            ← swipe to explore →
          </p>
        </div>

        {/* ── DESKTOP: original alternating grid ── */}
        <div className="hidden md:block px-6 pl-16 max-w-5xl mx-auto">
          <div className="relative">
            {/* Central vertical line */}
            <div className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-[var(--blush-deep)] via-[var(--honey)] to-[var(--sage)] rounded-full opacity-30 pointer-events-none" />

            <div className="space-y-20">
              {monthlyMilestones.map((item, index) => {
                const isEven = index % 2 === 0;
                const col = COLORS[index % COLORS.length];
                return (
                  <div key={item.month} className="relative">
                    {/* Center Node Badge */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-8 z-10 w-12 h-12 rounded-full border-4 border-[var(--cream)] shadow-md flex flex-col items-center justify-center font-display font-bold text-white text-sm"
                      style={{ background: col.accent }}
                    >
                      {item.month}m
                    </div>

                    <Reveal delay={index * 40}>
                      <div
                        className={`grid md:grid-cols-2 gap-8 items-center ${
                          isEven ? "" : "md:[&>*:first-child]:order-2"
                        }`}
                      >
                        {/* Photo */}
                        <div className="group relative rounded-3xl overflow-hidden card p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--cream)]">
                            <Image
                              src={item.photo}
                              alt={`${item.label} photo`}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              sizes="50vw"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div
                          className={`space-y-3 p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-[var(--line)] shadow-sm ${
                            isEven ? "md:text-left" : "md:text-right"
                          }`}
                        >
                          <div className={`flex items-center gap-3 ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                            <span
                              className="px-3 py-1 text-xs font-semibold tracking-wider rounded-full"
                              style={{ background: col.bg, color: col.accent }}
                            >
                              {item.label}
                            </span>
                            <span className="text-xs text-[var(--ink-soft)] font-mono">
                              Month {item.month} of 11
                            </span>
                          </div>
                          <h3 className="font-display text-2xl text-[var(--ink)]">{item.caption}</h3>
                          <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                            Sihagi Ayenya at {item.month}{" "}
                            {item.month === 1 ? "month" : "months"} old — captured in a moment of pure magic.
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                );
              })}
            </div>

            {/* End banner */}
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
      </div>
    </section>
  );
}
