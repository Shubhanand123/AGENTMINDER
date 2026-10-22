"use client";

import { useAnimationFrame, useMotionValue, useReducedMotion, motion, useTransform, MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type OrbitItem = { src: string; title: string; caption?: string };

interface OrbitGalleryProps {
  items: OrbitItem[];
  /** Big text in the middle of the ring. */
  centerLabel?: string;
  className?: string;
  /** Degrees per second the ring drifts while idle. */
  speed?: number;
  /** Called when the viewer opens the active card (click it again, or the Open button). */
  onOpen?: (item: OrbitItem, index: number) => void;
  openLabel?: string;
}

/** Shortest signed distance between two angles, in degrees (-180..180]. */
const angleDiff = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;

function OrbitCard({
  item,
  index,
  total,
  rotation,
  radius,
  cardW,
  active,
  onSelect,
}: {
  item: OrbitItem;
  index: number;
  total: number;
  rotation: MotionValue<number>;
  radius: number;
  cardW: number;
  active: boolean;
  onSelect: () => void;
}) {
  const base = (index * 360) / total;
  const transform = useTransform(rotation, (r) => {
    const a = base + r;
    const rad = (a * Math.PI) / 180;
    const x = Math.sin(rad) * radius;
    const y = -Math.cos(rad) * radius;
    return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${a}deg)`;
  });

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={item.title}
      aria-pressed={active}
      style={{ transform, width: cardW }}
      className={cn(
        "absolute left-1/2 top-1/2 aspect-[4/5] overflow-hidden rounded-xl shadow-2xl shadow-black/60 ring-1 transition-[box-shadow,filter] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
        active ? "ring-white/60" : "ring-white/10 brightness-[0.82] hover:brightness-100",
      )}
    >
      <img src={item.src} alt="" draggable={false} className="h-full w-full object-cover" />
    </motion.button>
  );
}

export default function OrbitGallery({ items, centerLabel = "Works '26", className, speed = 6, onOpen, openLabel = "Open" }: OrbitGalleryProps) {
  const reduce = useReducedMotion();
  const rotation = useMotionValue(0);
  const target = useRef<number | null>(null);
  const paused = useRef(false);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState({ radius: 300, cardW: 150 });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const s = Math.min(entry.contentRect.width, entry.contentRect.height);
      setSize({ radius: s * 0.37, cardW: Math.max(84, s * 0.17) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = items.length;

  useAnimationFrame((_, delta) => {
    let r = rotation.get();
    if (target.current !== null) {
      const d = target.current - r;
      if (Math.abs(d) < 0.05) {
        r = target.current;
        target.current = null;
      } else {
        r += d * Math.min(1, delta / 140);
      }
    } else if (!paused.current && !reduce) {
      r -= (speed * delta) / 1000;
    }
    rotation.set(r);
    // the card nearest the top of the ring is the active one
    let best = 0;
    let bestD = 999;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(angleDiff((i * 360) / n + r, 0));
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setActive((prev) => (prev === best ? prev : best));
  });

  const select = (i: number) => {
    const r = rotation.get();
    const need = -((i * 360) / n);
    target.current = r + angleDiff(need, r);
  };

  const current = items[active];

  return (
    <div
      className={cn("relative grid w-full items-center gap-8 lg:grid-cols-[1fr_auto]", className)}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[760px]">
        {items.map((item, i) => (
          <OrbitCard
            key={item.title}
            item={item}
            index={i}
            total={n}
            rotation={rotation}
            radius={size.radius}
            cardW={size.cardW}
            active={i === active}
            onSelect={() => (i === active && onOpen ? onOpen(item, i) : select(i))}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-[24%] text-center">
          <span className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">{centerLabel}</span>
          {current?.caption && (
            <motion.p
              key={current.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[28ch] text-sm leading-relaxed text-neutral-400 sm:text-base"
            >
              <span className="font-medium text-neutral-100">{current.title}.</span> {current.caption}
            </motion.p>
          )}
          {onOpen && current && (
            <button
              type="button"
              onClick={() => onOpen(current, active)}
              className="pointer-events-auto mt-1 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-105"
            >
              {openLabel} {current.title}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 lg:flex-col lg:items-end lg:gap-1.5">
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onClick={() => select(i)}
              className={cn(
                "text-sm tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:underline",
                i === active ? "font-semibold text-white" : "text-neutral-500 hover:text-neutral-200",
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
