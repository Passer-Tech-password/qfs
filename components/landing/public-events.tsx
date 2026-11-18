"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Tag, ExternalLink, ArrowRight } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirebaseClients } from "@/lib/firebase/client";

type SiteEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  imageUrl: string;
  linkUrl: string;
  published: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  Announcement: "bg-cyan-500/15 text-cyan-300",
  Event: "bg-violet-500/15 text-violet-300",
  Update: "bg-emerald-500/15 text-emerald-300",
  Security: "bg-rose-500/15 text-rose-300",
  Product: "bg-amber-500/15 text-amber-300",
};

export function PublicEvents() {
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { db } = getFirebaseClients();
        const q = query(
          collection(db, "site_events"),
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(6),
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as SiteEvent),
        );
        setEvents(list);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || error || events.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-[#1a2030] bg-[#090d19] px-5 py-14 sm:py-16">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] text-violet-300">
              LATEST FROM QFS
            </span>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Events &amp; Announcements
            </h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <article
              key={ev.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#242b3a] bg-[#101522] transition hover:border-violet-500/40"
            >
              {ev.imageUrl && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${
                      CATEGORY_COLORS[ev.category] ??
                      "bg-slate-500/15 text-slate-300"
                    }`}
                  >
                    {ev.category}
                  </span>
                  {ev.eventDate && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar size={11} />
                      {new Date(ev.eventDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-[16px] font-bold leading-snug text-white">
                  {ev.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-[1.7] text-slate-400">
                  {ev.description}
                </p>
                {ev.linkUrl && (
                  <a
                    href={ev.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-cyan-300 transition hover:text-cyan-200"
                  >
                    Learn more <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
