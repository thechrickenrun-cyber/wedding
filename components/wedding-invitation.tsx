"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary, Locale, RSVPForm } from "@/lib/types";
import iconMonk from "@/app/assets/images/22-removebg-preview.png";
import iconKhanMak from "@/app/assets/images/33-removebg-preview.png";
import iconWater from "@/app/assets/images/55-removebg-preview.png";
import iconFood from "@/app/assets/images/11.png";

const heroImages = [
   "/images/fi01.jpg",
   "/images/fi02.jpg"
];

const galleryImages = [
 
  "/images/fi03.jpg",
  "/images/fi04.jpg",
  "/images/fi05.jpg",
  "/images/fi051.jpg",
  "/images/fi06.jpg",
  "/images/fi07.jpg",
  "/images/fi08.jpg",
  "/images/fi09.jpg",
  "/images/fi10.jpg",
  "/images/fi11.jpg",
  "/images/fi12.jpg",
  "/images/fi13.jpg"
  

];

const colorSwatches = [
  "linear-gradient(135deg, #9ccdf3)",
  "#DAB9D6",
  "#f4c2c2",
  "#FFEAD9"
];

const initialForm: RSVPForm = {
  name: "",
  attendance: "",
  guestCount: "1",
  phone: "",
  message: ""
};

type Countdown = {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  complete: boolean;
};

const initialCountdown: Countdown = {
  days: "00",
  hours: "00",
  mins: "00",
  secs: "00",
  complete: false
};

function hasThaiText(value: string) {
  return /[\u0E00-\u0E7F]/.test(value);
}

function textClass(value: string, className = "") {
  return [className, hasThaiText(value) ? "thai-text" : ""].filter(Boolean).join(" ");
}

function getTimelineIcon(index: number) {
  const icons = [iconMonk, iconKhanMak, iconWater, iconFood];
  const src = icons[index];
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="48px"
      style={{ objectFit: "cover", objectPosition: "center 20%" }}
    />
  );
}

function getCountdown(): Countdown {
  const target = new Date("2026-07-19T07:09:00+07:00").getTime();
  const diff = Math.max(target - Date.now(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
    complete: diff === 0
  };
}

function GoldParticles() {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number; size: number; drift: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 5,
      size: 4 + Math.random() * 6,
      drift: -30 + Math.random() * 60,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="gold-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export function WeddingInvitation({
  dictionaries,
  defaultLocale
}: {
  dictionaries: Record<Locale, Dictionary>;
  defaultLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeGallery, setActiveGallery] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(initialCountdown);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [form, setForm] = useState<RSVPForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = dictionaries[locale];
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = mounted ? resolvedTheme === "dark" : false;

  useEffect(() => {
    setMounted(true);
    setCountdown(getCountdown());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateScrollTopVisibility = () => {
      const hero = document.querySelector<HTMLElement>(".hero-section");
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;

      setShowScrollTop(window.scrollY > heroBottom - 48);
    };

    updateScrollTopVisibility();
    window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
    window.addEventListener("resize", updateScrollTopVisibility);

    return () => {
      window.removeEventListener("scroll", updateScrollTopVisibility);
      window.removeEventListener("resize", updateScrollTopVisibility);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [locale]);

  const labels = useMemo(
    () => [
      { value: countdown.days, label: t.countdown.labels.days },
      { value: countdown.hours, label: t.countdown.labels.hours },
      { value: countdown.mins, label: t.countdown.labels.mins },
      { value: countdown.secs, label: t.countdown.labels.secs }
    ],
    [countdown, t]
  );

  async function toggleMusic() {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveGallery(direction: 1 | -1) {
    setActiveGallery((current) => (current + direction + galleryImages.length) % galleryImages.length);
  }

  function galleryPosition(index: number) {
    const offset = (index - activeGallery + galleryImages.length) % galleryImages.length;

    if (offset === 0) {
      return "is-active";
    }

    if (offset === 1) {
      return "is-next";
    }

    if (offset === galleryImages.length - 1) {
      return "is-prev";
    }

    return "is-hidden";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name || !form.attendance || !form.guestCount || !form.phone) {
      setStatus("error");
      setMessage(t.rsvp.required);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale })
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(result?.message || t.rsvp.error);
      }

      setStatus("success");
      setMessage(result?.message || t.rsvp.success);
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t.rsvp.error);
    }
  }

  return (
    <main
      className={`locale-${locale} relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]`}
    >
      <div className="page-ambient" aria-hidden="true" />
      <audio ref={audioRef} loop preload="none" src="/audio/GrooveRider.mp3" />

      {controlsCollapsed ? (
        <button
          className="control-panel-toggle"
          onClick={() => setControlsCollapsed(false)}
          type="button"
          aria-expanded="false"
          aria-label={locale === "th" ? "เปิดแผงควบคุม" : "Open control panel"}
          title={locale === "th" ? "เปิดแผงควบคุม" : "Open control panel"}
        >
          ⚙
        </button>
      ) : (
      <div className="control-panel" aria-label="Invitation controls">
        <div className="control-panel-group language-group">
          {(["th", "en"] as Locale[]).map((item) => (
            <button
              className={`control-pill ${locale === item ? "is-active" : ""}`}
              key={item}
              onClick={() => setLocale(item)}
              type="button"
              aria-label={`${t.controls.language}: ${dictionaries[item].meta.localeName}`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="control-panel-group">
          <button
            className="icon-button"
            onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
            type="button"
            aria-label={t.controls.theme}
            title={t.controls.theme}
            suppressHydrationWarning
          >
            {isDarkTheme ? "☾" : "☼"}
          </button>
          <button
            className={`icon-button music-button ${isPlaying ? "is-playing" : ""}`}
            onClick={toggleMusic}
            type="button"
            aria-label={isPlaying ? t.controls.musicPause : t.controls.musicPlay}
            title={isPlaying ? t.controls.musicPause : t.controls.musicPlay}
          >
            ♪
          </button>
          {showScrollTop ? (
            <button
              className="icon-button scroll-top-button"
              onClick={scrollToTop}
              type="button"
              aria-label={locale === "th" ? "กลับขึ้นด้านบน" : "Scroll to top"}
              title={locale === "th" ? "กลับขึ้นด้านบน" : "Scroll to top"}
            >
              ↑
            </button>
          ) : null}
          <button
            className="icon-button panel-collapse-button"
            onClick={() => setControlsCollapsed(true)}
            type="button"
            aria-expanded="true"
            aria-label={locale === "th" ? "หุบแผงควบคุม" : "Collapse control panel"}
            title={locale === "th" ? "หุบแผงควบคุม" : "Collapse control panel"}
          >
            ×
          </button>
        </div>
      </div>
      )}

      <section className="hero-section snap-section" data-snap-section>
        {heroImages.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            className={`hero-image ${activeSlide === index ? "is-active" : ""}`}
            style={{
              objectPosition:
                image === "/images/01.jpg" ? "center 62%" :
                image === "/images/02.jpg" ? "center 38%" :
                undefined
            }}
          />
        ))}
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-content" data-reveal>
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.names}</h1>
          <p className={textClass(t.hero.date, "hero-date")}>{t.hero.date}</p>
          <a className="button-link" href="#rsvp">
            {t.hero.scroll}
          </a>
        </div>
      </section>

      <Section title={t.story.title}>
        <div className="mx-auto max-w-3xl text-center" data-reveal>
          <p className={textClass(t.story.quote, "story-quote")}>{t.story.quote}</p>
          <p className={textClass(t.story.body, "mt-6 text-base leading-8 text-[color:var(--muted)] md:text-lg")}>{t.story.body}</p>
        </div>
      </Section>

      <Section title={t.itinerary.title} tinted>
        <div className="timeline" data-reveal>
          {t.itinerary.items.map((item, index) => (
            <article className="timeline-item" key={`${item.time}-${item.label}`}>
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-card">
                <span className="timeline-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="timeline-body">
                  <div className="timeline-meta">
                    <time>{item.time}</time>
                    <span className="timeline-icon" aria-hidden="true">
                      {getTimelineIcon(index)}
                    </span>
                  </div>
                  <p className={textClass(item.label)}>{item.label}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={t.dress.title}>
        <div className="dress-panel" data-reveal>
          <p className={textClass(t.dress.subtitle, "dress-subtitle")}>{t.dress.subtitle}</p>
          <p className={textClass(t.dress.note, "text-sm leading-7 text-[color:var(--muted)] md:text-base")}>{t.dress.note}</p>
          <div className="mt-9 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {t.dress.colors.map((color, index) => (
              <div className="swatch-item" key={color}>
                <span className="swatch" style={{ background: colorSwatches[index] }} />
                <span className={textClass(color)}>{color}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t.gallery.title} tinted>
        <div className="gallery-carousel" data-reveal>
          <div className="gallery-stage" aria-live="polite">
            {galleryImages.map((image, index) => (
              <button
                className={`gallery-card ${galleryPosition(index)}`}
                key={image}
                onClick={() => (index === activeGallery ? setLightbox(image) : setActiveGallery(index))}
                type="button"
                aria-label={t.gallery.images[index].alt}
                aria-hidden={galleryPosition(index) === "is-hidden"}
                tabIndex={galleryPosition(index) === "is-hidden" ? -1 : 0}
              >
                <Image
                  src={image}
                  alt={t.gallery.images[index].alt}
                  fill
                  sizes="(min-width: 1024px) 52vw, (min-width: 640px) 70vw, 86vw"
                  className={`object-cover${image === "/images/89.jpg" ? " gallery-89" : ""}`}
                />
              </button>
            ))}
          </div>
          <div className="gallery-controls" aria-label="Gallery controls">
            <button className="gallery-nav" type="button" onClick={() => moveGallery(-1)} aria-label="Previous image">
              ←
            </button>
            <div className="gallery-dots">
              {galleryImages.map((image, index) => (
                <button
                  className={activeGallery === index ? "is-active" : ""}
                  key={image}
                  type="button"
                  onClick={() => setActiveGallery(index)}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
            <button className="gallery-nav" type="button" onClick={() => moveGallery(1)} aria-label="Next image">
              →
            </button>
          </div>
        </div>
      </Section>

      <Section title={t.countdown.title} id="countdown">
        <GoldParticles />
        <div className="countdown-grid relative z-10" data-reveal>
          {countdown.complete ? (
            <p className={textClass(t.countdown.complete, "col-span-full text-xl text-[color:var(--gold)]")}>{t.countdown.complete}</p>
          ) : (
            labels.map((item) => (
              <div className="countdown-cell" key={item.label}>
                <strong>{item.value}</strong>
                <span className={textClass(item.label)}>{item.label}</span>
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title={t.rsvp.title} id="rsvp" tinted>
        <form className="rsvp-form" data-reveal onSubmit={handleSubmit}>
          <div className="rsvp-heading">
            <span aria-hidden="true" />
            <p className={textClass(t.rsvp.intro, "rsvp-intro")}>{t.rsvp.intro}</p>
          </div>
          <label className="field-control">
            <span className={textClass(t.rsvp.name, "field-label")}>{t.rsvp.name}</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder={t.rsvp.namePlaceholder}
              autoComplete="name"
            />
          </label>
          <fieldset className="field-control">
            <legend className={textClass(t.rsvp.attendance, "field-label")}>{t.rsvp.attendance}</legend>
            <div className="choice-row">
              <label className={`choice ${form.attendance === "yes" ? "is-selected" : ""}`}>
                <input
                  checked={form.attendance === "yes"}
                  onChange={() => setForm({ ...form, attendance: "yes", guestCount: form.guestCount || "1" })}
                  name="attendance"
                  type="radio"
                />
                <span className="choice-mark" aria-hidden="true" />
                <span className={textClass(t.rsvp.yes)}>{t.rsvp.yes}</span>
              </label>
              <label className={`choice ${form.attendance === "no" ? "is-selected" : ""}`}>
                <input
                  checked={form.attendance === "no"}
                  onChange={() => setForm({ ...form, attendance: "no", guestCount: "0" })}
                  name="attendance"
                  type="radio"
                />
                <span className="choice-mark" aria-hidden="true" />
                <span className={textClass(t.rsvp.no)}>{t.rsvp.no}</span>
              </label>
            </div>
          </fieldset>
          <div className="field-grid">
            <label className="field-control">
              <span className={textClass(t.rsvp.guestCount, "field-label")}>{t.rsvp.guestCount}</span>
              <input
                value={form.guestCount}
                onChange={(event) => setForm({ ...form, guestCount: event.target.value })}
                min="0"
                max="10"
                type="number"
              />
            </label>
            <label className="field-control">
              <span className={textClass(t.rsvp.phone, "field-label")}>{t.rsvp.phone}</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder={t.rsvp.phonePlaceholder}
                autoComplete="tel"
              />
            </label>
          </div>
          <label className="field-control">
            <span className={textClass(t.rsvp.message, "field-label")}>{t.rsvp.message}</span>
            <textarea
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder={t.rsvp.messagePlaceholder}
              rows={4}
            />
          </label>
          <div className="rsvp-actions">
            <button className={textClass(status === "loading" ? t.rsvp.submitting : t.rsvp.submit, "button-link rsvp-submit")} disabled={status === "loading"} type="submit">
              {status === "loading" ? t.rsvp.submitting : t.rsvp.submit}
            </button>
            {message ? (
              <p className={textClass(message, `form-status ${status}`)} aria-live="polite">
                {message}
              </p>
            ) : null}
          </div>
        </form>
      </Section>

      <Section title={t.venue.title}>
        <div className="venue-panel" data-reveal>
          <p className={textClass(t.venue.name, "venue-name")}>{t.venue.name}</p>
          <p className={textClass(t.venue.address, "mb-7 text-[color:var(--muted)]")}>{t.venue.address}</p>
          <iframe
            title={t.venue.name}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3854.4606368420653!2d102.1365111!3d14.872782!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31194da9833cb931%3A0x6b4fd9965a363a0a!2zQ2FmZSdzIEltb3VuIOC4h-C4suC4v-C4p-C4seC4meC5geC4muC4o-C5iA!5e0!3m2!1sth!2sth!4v1700000000000"
          />
          <a className="button-link mt-8" href="https://maps.app.goo.gl/2ELjiD883RpyFTvm6" target="_blank" rel="noreferrer">
            {t.venue.directions}
          </a>
        </div>
      </Section>

      {/* <footer className="snap-section px-6 pb-12 text-center text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]" data-snap-section>
        <span className={textClass(t.footer.text)}>{t.footer.text}</span>
      </footer> */}

      {lightbox ? (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="lightbox-close" type="button" aria-label={t.controls.close}>
            ×
          </button>
          <Image src={lightbox} alt="" width={1400} height={933} className="max-h-[82vh] w-auto max-w-[92vw] rounded-sm object-contain" />
        </div>
      ) : null}
    </main>
  );
}

function Section({
  children,
  title,
  id,
  tinted = false
}: {
  children: React.ReactNode;
  title: string;
  id?: string;
  tinted?: boolean;
}) {
  return (
    <section id={id} className={`section-shell snap-section ${tinted ? "is-tinted" : ""}`} data-snap-section>
      <div className="mx-auto w-full max-w-6xl">
        <h2 className={textClass(title, "section-title")} data-reveal>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
