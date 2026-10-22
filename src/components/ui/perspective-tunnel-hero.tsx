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

import card1 from "@/assets/tunnel/card-1.jpg";
import card2 from "@/assets/tunnel/card-2.jpg";
import card3 from "@/assets/tunnel/card-3.jpg";
import card4 from "@/assets/tunnel/card-4.jpg";
import card5 from "@/assets/tunnel/card-5.jpg";
import card6 from "@/assets/tunnel/card-6.jpg";
import card7 from "@/assets/tunnel/card-7.jpg";
import card8 from "@/assets/tunnel/card-8.jpg";
import card9 from "@/assets/tunnel/card-9.jpg";

/* Each card is one conversation the agent had, on the component's original artwork. */
export type TunnelItem = {
    src: string;
    tag: string;
    tone: "risk" | "wrong" | "cost" | "good";
    quote: string;
};

export const TUNNEL_IMAGES = [card1, card2, card3, card4, card5, card6, card7, card8, card9];

const DEFAULT_ITEMS: TunnelItem[] = [
    { src: card1, tag: "Risky action", tone: "risk", quote: "I've refunded the full amount to your card." },
    { src: card2, tag: "Resolved", tone: "good", quote: "Your order ships tomorrow." },
    { src: card3, tag: "Wrong answer", tone: "wrong", quote: "Shipping to Pune is ₹49 flat." },
    { src: card4, tag: "Cost spike", tone: "cost", quote: "Let me check that again for you…" },
    { src: card5, tag: "Resolved", tone: "good", quote: "Password reset. Check your inbox." },
    { src: card6, tag: "Risky action", tone: "risk", quote: "Sure, 50% off your renewal." },
    { src: card7, tag: "Wrong answer", tone: "wrong", quote: "Yes, we're open on Sundays." },
    { src: card8, tag: "Resolved", tone: "good", quote: "Booked: Thursday, 4:30 pm." },
    { src: card9, tag: "Data leak", tone: "risk", quote: "The email on file is r•••@gmail.com…" },
];

const TONE: Record<TunnelItem["tone"], string> = {
    risk: "bg-orange-500/90 text-white",
    wrong: "bg-amber-400/95 text-amber-950",
    cost: "bg-sky-400/95 text-sky-950",
    good: "bg-violet-400/95 text-violet-950",
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

/* Progress the tunnel opens at: a few cards are already in view, so the cursor parallax shows straight away. */
const START = 0.3;

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
        ? Math.max(130, Math.min(180, stage.width * 0.38))
        : Math.max(180, Math.min(270, stage.width * 0.18));

    const baseX = card.angleCos * (stage.width * card.radiusFactorX);
    const baseY = card.angleSin * (stage.height * card.radiusFactorY);
    const panStrength = stage.isMobile ? 24 : 70;

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
            className="keep-dark pointer-events-auto absolute left-1/2 top-1/2 aspect-[4/5] will-change-transform select-none cursor-pointer"
        >
            <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl shadow-black/90 ring-1 ring-white/15 transition-all duration-500 hover:ring-indigo-400/70 hover:shadow-indigo-500/25">
                <img
                    src={item.src}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <span className={`absolute left-3 top-3 rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-widest shadow-lg ${TONE[item.tone]}`}>
                    {item.tag}
                </span>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/15 to-transparent p-4 sm:p-5">
                    <span className="text-xs sm:text-sm font-mono leading-snug tracking-wide text-white/95 drop-shadow-md">
                        “{item.quote}”
                    </span>
                </div>
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
    const rawProgress = useMotionValue(START);
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
            if ((delta > 0 && current >= 1) || (delta < 0 && current <= START)) return false;
            const rect = el.getBoundingClientRect();
            if (Math.abs(rect.top) > 4) return false; // only fly when the hero fills the screen
            rawProgress.set(Math.min(1, Math.max(START, current + delta)));
            return true;
        };

        const handleWheel = (e: WheelEvent) => {
            if (advance(e.deltaY * 0.0008)) e.preventDefault();
        };

        el.addEventListener("wheel", handleWheel, { passive: false });

        // Touch screens: leave the swipe to the page (native, smooth scrolling) and
        // fly the tunnel on its own, slowly back and forth.
        let raf = 0;
        if (window.matchMedia("(pointer: coarse)").matches) {
            const t0 = performance.now();
            const loop = (now: number) => {
                const k = (Math.sin((now - t0) / 4200 - Math.PI / 2) + 1) / 2; // 0..1..0
                rawProgress.set(START + k * (0.86 - START));
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
        }
        return () => {
            el.removeEventListener("wheel", handleWheel);
            cancelAnimationFrame(raf);
        };
    }, [rawProgress]);

    const pointer = useCameraParallax(!reduce);

    const titleScale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1, 1.35]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [0.6, 1, 1, 0]);
    const promptOpacity = useTransform(smoothProgress, [START, START + 0.1], [1, 0]);
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22)_0%,transparent_75%)]" />

            {/* Depth Ring Guides */}
            <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-indigo-400/15" />
            <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/10" />

            {/* Central Anchor Typography */}
            <motion.div
                style={{ scale: titleScale, opacity: titleOpacity }}
                className="pointer-events-none z-0 flex flex-col items-center text-center px-6 max-w-2xl"
            >
                <p className="text-xs font-mono uppercase tracking-[0.4em] text-indigo-300 mb-4">
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
                <div className="h-6 w-px bg-gradient-to-b from-indigo-400 to-transparent" />
            </motion.div>

            {/* End-of-tunnel hint */}
            <motion.div
                style={{ opacity: doneOpacity }}
                className="pointer-events-none absolute bottom-8 z-20 font-mono text-xs uppercase tracking-[0.3em] text-indigo-200"
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
