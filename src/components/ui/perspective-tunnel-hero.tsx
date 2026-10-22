"use client";

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* Each card is one conversation the agent had. Swap in your own, or pass `items`. */
export type TunnelItem = {
    tag: string;
    tone: "risk" | "wrong" | "cost" | "good";
    quote: string;
    meta: string;
};

const DEFAULT_ITEMS: TunnelItem[] = [
    { tag: "Risky action", tone: "risk", quote: "No problem, I've refunded the full amount to your card.", meta: "Support bot · outside 30-day policy" },
    { tag: "Resolved", tone: "good", quote: "Your order ships tomorrow. Here's the tracking link.", meta: "Support bot · 2 turns" },
    { tag: "Wrong answer", tone: "wrong", quote: "Shipping to Pune is ₹49 flat.", meta: "Sales bot · price changed last month" },
    { tag: "Cost spike", tone: "cost", quote: "Let me check that again for you…", meta: "Support bot · looped 41 times" },
    { tag: "Resolved", tone: "good", quote: "I've reset your password. Check your inbox.", meta: "Helpdesk bot · 3 turns" },
    { tag: "Risky action", tone: "risk", quote: "Sure, I'll apply a 50% discount to your renewal.", meta: "Sales bot · no approval" },
    { tag: "Wrong answer", tone: "wrong", quote: "Yes, we're open on Sundays until 9 pm.", meta: "Booking bot · closed Sundays" },
    { tag: "Resolved", tone: "good", quote: "Booked: Thursday, 4:30 pm with Dr. Mehta.", meta: "Booking bot · 4 turns" },
    { tag: "Data leak", tone: "risk", quote: "The account email on file is r•••@gmail.com and the phone is…", meta: "Support bot · shared personal data" },
];

const TONE: Record<TunnelItem["tone"], string> = {
    risk: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
    wrong: "bg-amber-400/15 text-amber-200 ring-amber-300/30",
    cost: "bg-sky-400/15 text-sky-200 ring-sky-300/30",
    good: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
};

interface TunnelCardData {
    item: TunnelItem;
    angleCos: number;
    angleSin: number;
    radiusFactorX: number;
    radiusFactorY: number;
    rotationZ: number;
    index: number;
}

const buildCards = (items: TunnelItem[]): TunnelCardData[] =>
    items.map((item, i) => {
        const goldenAngle = i * 137.5 * (Math.PI / 180);
        const radiusFactorX = 0.28 + (i % 3) * 0.08;
        const radiusFactorY = 0.26 + (i % 2) * 0.09;

        return {
            item,
            angleCos: Math.cos(goldenAngle),
            angleSin: Math.sin(goldenAngle),
            radiusFactorX,
            radiusFactorY,
            rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
            index: i,
        };
    });

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

function useCameraParallax(enabled: boolean) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG);
    const y = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: PointerEvent) => {
            rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
            rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, [enabled, rawX, rawY]);

    return { x, y };
}

interface TunnelCardProps {
    card: TunnelCardData;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    total: number;
    stage: StageDimensions;
}

function TunnelCard({ card, progress, pointer, total, stage }: TunnelCardProps) {
    const staggerSpan = 0.55;
    const start = (card.index / total) * (1 - staggerSpan);
    const end = start + staggerSpan;

    const localProgress = useTransform(progress, [start, end], [0, 1]);

    const farZ = stage.isMobile ? -1200 : -1700;
    const nearZ = stage.isMobile ? 350 : 500;
    const z = useTransform(localProgress, [0, 1], [farZ, nearZ]);

    const opacity = useTransform(localProgress, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

    const cardWidth = stage.isMobile
        ? Math.max(170, Math.min(220, stage.width * 0.5))
        : Math.max(220, Math.min(300, stage.width * 0.2));

    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    const panStrength = stage.isMobile ? 20 : 45;

    const transform = useTransform(
        [z, pointer.x, pointer.y],
        ([currZ, px, py]: number[]) => {
            const offsetX = baseX - px * panStrength;
            const offsetY = baseY - py * panStrength;
            return `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${currZ}px) rotateZ(${card.rotationZ}deg)`;
        }
    );

    const { item } = card;

    return (
        <motion.div
            style={{
                width: cardWidth,
                transform,
                opacity,
                zIndex: card.index + 1,
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 will-change-transform select-none"
        >
            <div className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-neutral-900/90 p-4 sm:p-5 shadow-2xl shadow-black/80 ring-1 ring-white/10 backdrop-blur transition-all duration-500 hover:ring-emerald-400/60 hover:shadow-emerald-500/20">
                <span className={`self-start rounded-md px-2 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest ring-1 ${TONE[item.tone]}`}>
                    {item.tag}
                </span>
                <p className="text-sm sm:text-[15px] leading-snug text-white/90">“{item.quote}”</p>
                <span className="font-mono text-[10px] sm:text-[11px] tracking-wide text-white/45">{item.meta}</span>
            </div>
        </motion.div>
    );
}

interface PerspectiveTunnelHeroProps {
    items?: TunnelItem[];
    eyebrow?: string;
    title?: ReactNode;
    subtitle?: string;
}

export default function PerspectiveTunnelHero({
    items = DEFAULT_ITEMS,
    eyebrow = "AI agent monitoring",
    title = (
        <>
            EVERY CHAT.
            <br />
            WATCHED.
        </>
    ),
    subtitle = "Scroll to fly through a week of your bot's conversations. AgentMinder reads every one and flags the few that matter.",
}: PerspectiveTunnelHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const cards = useMemo(() => buildCards(items), [items]);

    const [stage, setStage] = useState<StageDimensions>({
        width: 1440,
        height: 900,
        isMobile: false,
    });

    useEffect(() => {
        const updateDimensions = () => {
            setStage({
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: window.innerWidth < 768,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Raw motion value controlled directly by mouse wheel / trackpad / touch
    const rawProgress = useMotionValue(0);
    const smoothProgress = useSpring(rawProgress, {
        stiffness: 80,
        damping: 30,
        restDelta: 0.0001,
    });

    // The tunnel captures the wheel until you reach either end, then hands
    // scrolling back to the page so the sections below stay reachable.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const advance = (delta: number) => {
            const current = rawProgress.get();
            if ((delta > 0 && current >= 1) || (delta < 0 && current <= 0)) return false;
            const rect = el.getBoundingClientRect();
            if (Math.abs(rect.top) > 4) return false; // only fly when the hero fills the screen
            rawProgress.set(Math.min(1, Math.max(0, current + delta)));
            return true;
        };

        const handleWheel = (e: WheelEvent) => {
            if (advance(e.deltaY * 0.0008)) e.preventDefault();
        };

        let lastY = 0;
        const onTouchStart = (e: TouchEvent) => {
            lastY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            const y = e.touches[0].clientY;
            const dy = lastY - y;
            lastY = y;
            if (advance(dy * 0.0025)) e.preventDefault();
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        return () => {
            el.removeEventListener("wheel", handleWheel);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
        };
    }, [rawProgress]);

    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1, 1.35]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.6, 1, 1, 0]);
    const promptOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
    const doneOpacity = useTransform(smoothProgress, [0.9, 1], [0, 1]);

    return (
        <div
            ref={containerRef}
            className="relative h-[100svh] w-full overflow-hidden bg-neutral-950 text-white select-none flex items-center justify-center"
            style={{
                perspective: stage.isMobile ? "900px" : "1200px",
                transformStyle: "preserve-3d",
            }}
        >
            {/* Immersive Background Grid & Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#134e4a_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.16)_0%,transparent_72%)]" />

            {/* Depth Ring Guides */}
            <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-emerald-400/15" />
            <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

            {/* Central Anchor Typography */}
            <motion.div
                style={{ scale: titleScale, opacity: titleOpacity }}
                className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-2xl"
            >
                <p className="text-xs font-mono uppercase tracking-[0.4em] text-emerald-400 mb-4">
                    {eyebrow}
                </p>
                <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[0.9] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                    {title}
                </h1>
                <p className="mt-5 max-w-[40ch] text-sm sm:text-base font-light text-neutral-400">
                    {subtitle}
                </p>
            </motion.div>

            {/* Scroll Prompt */}
            <motion.div
                style={{ opacity: promptOpacity }}
                className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-neutral-400"
            >
                <span>Scroll to explore</span>
                <div className="h-6 w-px bg-gradient-to-b from-emerald-400 to-transparent" />
            </motion.div>

            {/* End-of-tunnel hint */}
            <motion.div
                style={{ opacity: doneOpacity }}
                className="pointer-events-none absolute bottom-8 z-20 font-mono text-xs uppercase tracking-[0.3em] text-emerald-300"
            >
                9 chats · 6 need you · keep scrolling
            </motion.div>

            {/* 3D Z-Space Plane */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ transformStyle: "preserve-3d" }}
            >
                {cards.map((card, i) => (
                    <TunnelCard
                        key={i}
                        card={card}
                        progress={smoothProgress}
                        pointer={pointer}
                        total={cards.length}
                        stage={stage}
                    />
                ))}
            </div>
        </div>
    );
}
