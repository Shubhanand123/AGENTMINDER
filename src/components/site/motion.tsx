import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Every page enters with a colour wipe and its content rising in. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <>
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] origin-top bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-orange-400"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      <motion.div
        className={className}
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  )
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

/** Fades content up as it scrolls into view. Children rendered with <RevealItem> stagger. */
export function Reveal({ children, className, stagger = 0.08, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  )
}

export function RevealItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Comp = motion[as]
  return (
    <Comp className={className} variants={revealVariants}>
      {children}
    </Comp>
  )
}

/** Counts a number up from 0 when it scrolls into view. */
export function CountUp({ value, prefix = "", suffix = "", className }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [inView, value, reduce])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {shown.toLocaleString("en-IN")}
      {suffix}
    </span>
  )
}

/** Gradient text in the site's indigo → pink → orange. */
export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  )
}

/** Big page header used at the top of every inner page. */
export function PageHeader({ eyebrow, title, lead, children }: { eyebrow: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  const words = typeof title === "string" ? title.split(" ") : null
  return (
    <header className="relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_20%_0%,rgba(129,140,248,0.22),transparent),radial-gradient(40%_50%_at_90%_10%,rgba(232,121,249,0.14),transparent)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300"
        >
          {eyebrow}
        </motion.p>
        <h1 className="max-w-[18ch] font-display text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-7xl [text-wrap:balance]">
          {words
            ? words.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))
            : title}
        </h1>
        {lead && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-[56ch] text-lg leading-relaxed text-neutral-400"
          >
            {lead}
          </motion.p>
        )}
        {children}
      </div>
    </header>
  )
}
