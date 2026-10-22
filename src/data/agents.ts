import art0 from "@/assets/wheel/prismatic-rift-anime.jpg"
import art1 from "@/assets/wheel/red-ribbon-typography.jpg"
import art2 from "@/assets/wheel/neon-cave-portal-silhouette.jpg"
import art3 from "@/assets/wheel/indigo-liquid-marble.jpg"
import art4 from "@/assets/wheel/rocket-launch-gradient.jpg"
import art5 from "@/assets/wheel/black-hole-ember-clouds.jpg"
import art6 from "@/assets/wheel/neon-portrait-uplight.jpg"
import art7 from "@/assets/wheel/astronaut-cosmic-wave.jpg"
import art8 from "@/assets/wheel/celestial-light-figure.jpg"

const ART = [art0, art1, art2, art3, art4, art5, art6, art7, art8]

export type Flag = { tone: "risk" | "wrong" | "cost" | "leak"; label: string }

export type Agent = {
  slug: string
  title: string
  image: string
  caption: string
  intro: string
  watches: string[]
  /** Sample conversations shown on the agent's page. Illustrative, not real customer data. */
  chats: { customer: string; bot: string; flag: Flag; note: string }[]
  /** Sample weekly numbers for the agent's page. */
  stats: { label: string; value: number; suffix?: string; prefix?: string }[]
}

const raw: Omit<Agent, "image">[] = [
  {
    slug: "support-desk",
    title: "Support desk",
    caption: "Catches refunds and promises your policy doesn't allow.",
    intro: "Support bots are kind by design, which is exactly why they give away refunds, credits and delivery dates nobody approved.",
    watches: ["Refunds and credits outside policy", "Delivery dates it can't guarantee", "Angry customers it failed to hand off", "Loops that burn tokens without resolving"],
    chats: [
      { customer: "It arrived broken, I want my money back.", bot: "No problem, I've refunded the full ₹4,800 to your card.", flag: { tone: "risk", label: "Risky action" }, note: "Order is 41 days old. Policy allows 30." },
      { customer: "Will it reach Panjim by Friday?", bot: "Yes, guaranteed delivery by Friday.", flag: { tone: "wrong", label: "Wrong promise" }, note: "Courier SLA for Goa is 5–7 days." },
      { customer: "Still not working.", bot: "Let me check that again for you…", flag: { tone: "cost", label: "Cost spike" }, note: "Same reply 41 times in one chat." },
    ],
    stats: [{ label: "Chats reviewed", value: 1240 }, { label: "Resolved by the bot", value: 71, suffix: "%" }, { label: "Need a human look", value: 6 }],
  },
  {
    slug: "sales-agent",
    title: "Sales agent",
    caption: "Flags discounts and prices it quotes without approval.",
    intro: "A sales bot that closes deals is great, until it closes them at a price you never set.",
    watches: ["Discounts above your limit", "Prices that don't match your price list", "Features it says you have but don't", "Leads it lets go cold"],
    chats: [
      { customer: "Can you do better on the annual plan?", bot: "Sure, I'll apply 50% off your renewal.", flag: { tone: "risk", label: "Unapproved discount" }, note: "Your max discount is 15%." },
      { customer: "Does it integrate with Zoho?", bot: "Yes, we have a native Zoho integration.", flag: { tone: "wrong", label: "Made-up feature" }, note: "No Zoho integration exists." },
      { customer: "What's the price for 20 seats?", bot: "That's ₹1,200 per seat per month.", flag: { tone: "wrong", label: "Old price" }, note: "Price changed to ₹1,450 on 1 Oct." },
    ],
    stats: [{ label: "Chats reviewed", value: 860 }, { label: "Qualified leads", value: 94 }, { label: "Pricing errors", value: 3 }],
  },
  {
    slug: "booking-bot",
    title: "Booking bot",
    caption: "Spots wrong opening hours and double-booked slots.",
    intro: "Clinics, salons and restaurants lose real customers when the booking bot gets hours or slots wrong.",
    watches: ["Opening hours it gets wrong", "Slots booked twice", "Cancellations it didn't confirm", "Customers it couldn't book at all"],
    chats: [
      { customer: "Are you open on Sunday evening?", bot: "Yes, we're open on Sundays until 9 pm.", flag: { tone: "wrong", label: "Wrong hours" }, note: "Closed on Sundays." },
      { customer: "Thursday 4:30 with Dr. Mehta please.", bot: "Booked: Thursday, 4:30 pm with Dr. Mehta.", flag: { tone: "risk", label: "Double booking" }, note: "Slot already taken by another patient." },
      { customer: "Cancel my Friday booking.", bot: "I can help you book a new appointment!", flag: { tone: "wrong", label: "Missed intent" }, note: "Cancellation never processed." },
    ],
    stats: [{ label: "Bookings made", value: 312 }, { label: "Booking accuracy", value: 96, suffix: "%" }, { label: "Need a human look", value: 4 }],
  },
  {
    slug: "helpdesk",
    title: "Helpdesk",
    caption: "Shows which questions it can't answer and should hand off.",
    intro: "Internal IT and HR bots answer confidently even when the answer isn't in your docs.",
    watches: ["Answers not backed by your knowledge base", "Questions it should escalate", "Repeated questions that need a new doc", "Access it grants without checks"],
    chats: [
      { customer: "How many casual leaves do I have?", bot: "You have 18 casual leaves this year.", flag: { tone: "wrong", label: "Not in your docs" }, note: "Policy says 12." },
      { customer: "Reset my VPN password.", bot: "Done! Your new password is Welcome@123.", flag: { tone: "leak", label: "Security risk" }, note: "Password shared in chat." },
      { customer: "My laptop won't boot.", bot: "Try restarting it.", flag: { tone: "cost", label: "Should hand off" }, note: "Asked 5 times, never escalated." },
    ],
    stats: [{ label: "Questions answered", value: 540 }, { label: "Backed by docs", value: 88, suffix: "%" }, { label: "Missing docs found", value: 7 }],
  },
  {
    slug: "onboarding-guide",
    title: "Onboarding guide",
    caption: "Finds where new users get stuck and drop off.",
    intro: "Your onboarding bot sees every confused new user. AgentMinder turns those chats into a list of fixes.",
    watches: ["Steps where users give up", "Questions asked again and again", "Wrong setup instructions", "Users who never finish setup"],
    chats: [
      { customer: "Where do I find my API key?", bot: "Go to Settings → Developers → Keys.", flag: { tone: "wrong", label: "Outdated steps" }, note: "Menu moved to Workspace → API." },
      { customer: "This is too confusing.", bot: "Happy to help! What would you like to do?", flag: { tone: "cost", label: "Drop-off risk" }, note: "User left 2 minutes later." },
      { customer: "Can I import from Excel?", bot: "Yes, upload any .xlsx file.", flag: { tone: "wrong", label: "Wrong answer" }, note: "Only .csv is supported." },
    ],
    stats: [{ label: "New users helped", value: 430 }, { label: "Finished setup", value: 64, suffix: "%" }, { label: "Stuck points found", value: 5 }],
  },
  {
    slug: "billing-assistant",
    title: "Billing assistant",
    caption: "Watches for leaked account details and wrong amounts.",
    intro: "Billing chats carry the most sensitive data you have. One slip is a privacy incident.",
    watches: ["Account details shared with unverified users", "Wrong invoice amounts", "Refunds issued without checks", "GST and tax errors"],
    chats: [
      { customer: "What email is on my account?", bot: "The email on file is r•••@gmail.com and the phone is 98…", flag: { tone: "leak", label: "Data leak" }, note: "User was not verified." },
      { customer: "Why is my bill ₹2,360?", bot: "That's ₹2,000 plus 12% GST.", flag: { tone: "wrong", label: "Wrong tax" }, note: "GST is 18%, the maths is wrong." },
      { customer: "Waive the late fee?", bot: "Done, late fee removed.", flag: { tone: "risk", label: "Risky action" }, note: "Bot isn't allowed to waive fees." },
    ],
    stats: [{ label: "Billing chats", value: 690 }, { label: "Verified before sharing", value: 97, suffix: "%" }, { label: "Privacy flags", value: 2 }],
  },
  {
    slug: "shop-concierge",
    title: "Shop concierge",
    caption: "Checks product facts against your live catalogue.",
    intro: "Shoppers trust the concierge. If it invents sizes, stock or materials, returns go up.",
    watches: ["Products it says are in stock but aren't", "Wrong sizes or materials", "Coupon codes it makes up", "Upsells that annoy customers"],
    chats: [
      { customer: "Is the blue kurta available in XL?", bot: "Yes, XL is in stock!", flag: { tone: "wrong", label: "Stock error" }, note: "XL sold out yesterday." },
      { customer: "Any discount code?", bot: "Use FESTIVE50 for 50% off.", flag: { tone: "risk", label: "Made-up coupon" }, note: "Code doesn't exist." },
      { customer: "Is this pure cotton?", bot: "Yes, 100% cotton.", flag: { tone: "wrong", label: "Wrong material" }, note: "Catalogue says 60% cotton." },
    ],
    stats: [{ label: "Shopping chats", value: 2100 }, { label: "Led to a sale", value: 23, suffix: "%" }, { label: "Product errors", value: 9 }],
  },
  {
    slug: "lead-qualifier",
    title: "Lead qualifier",
    caption: "Tracks cost per qualified lead, chat by chat.",
    intro: "Qualifying leads with AI is cheap per chat and expensive in total. See exactly what each good lead costs.",
    watches: ["Cost per qualified lead", "Good leads marked as bad", "Questions that scare leads off", "Chats that run far too long"],
    chats: [
      { customer: "We're a team of 200.", bot: "Thanks! Someone will reach out.", flag: { tone: "wrong", label: "Missed hot lead" }, note: "Enterprise lead not routed to sales." },
      { customer: "Just browsing.", bot: "Can I ask 12 quick questions?", flag: { tone: "cost", label: "Too long" }, note: "38 turns, lead not qualified." },
      { customer: "What's your budget question for?", bot: "We only work with budgets over ₹10 lakh.", flag: { tone: "risk", label: "Off-script" }, note: "No such rule exists." },
    ],
    stats: [{ label: "Leads screened", value: 1580 }, { label: "Qualified", value: 18, suffix: "%" }, { label: "Cost per lead", value: 42, prefix: "₹" }],
  },
  {
    slug: "voice-receptionist",
    title: "Voice receptionist",
    caption: "Reviews call transcripts the same way as chats.",
    intro: "Voice agents answer your phone. AgentMinder reads every transcript, so nothing said on a call goes unchecked.",
    watches: ["Calls it couldn't understand", "Promises made on the phone", "Callers it put on hold too long", "Calls that should reach a person"],
    chats: [
      { customer: "(caller) I need to speak to the doctor now.", bot: "Please call back during office hours.", flag: { tone: "risk", label: "Urgent, not escalated" }, note: "Caller mentioned chest pain." },
      { customer: "(caller) What's your address?", bot: "We're at 14 MG Road, Panaji.", flag: { tone: "wrong", label: "Old address" }, note: "Clinic moved in August." },
      { customer: "(caller) Hello? Hello?", bot: "I'm sorry, I didn't catch that.", flag: { tone: "cost", label: "Loop" }, note: "Repeated 9 times before hang-up." },
    ],
    stats: [{ label: "Calls reviewed", value: 375 }, { label: "Handled fully", value: 79, suffix: "%" }, { label: "Escalations missed", value: 2 }],
  },
]

export const AGENTS: Agent[] = raw.map((a, i) => ({ ...a, image: ART[i % ART.length] }))

export const agentBySlug = (slug?: string) => AGENTS.find((a) => a.slug === slug)

export const FLAG_STYLE: Record<Flag["tone"], string> = {
  risk: "bg-orange-400/15 text-orange-200 ring-orange-300/30",
  wrong: "bg-amber-300/15 text-amber-100 ring-amber-200/30",
  cost: "bg-sky-400/15 text-sky-200 ring-sky-300/30",
  leak: "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-300/30",
}
