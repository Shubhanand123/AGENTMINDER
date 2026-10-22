# AgentMinder landing page

Vite + React + TypeScript + Tailwind CSS v4, with the shadcn project structure.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
```

## Structure
- `src/components/ui/` – reusable UI components (shadcn convention: the CLI installs into this folder, and every import uses `@/components/ui/...`)
  - `perspective-tunnel-hero.tsx` – section 1, 3D tunnel of conversation cards
  - `ai-thiking-orb-and-input.tsx` – section 3, ask-the-orb demo
  - `confetti.tsx` + `button.tsx` – pricing buttons and waitlist success
  - `input.tsx` – animated-label inputs in the waitlist form
- `src/components/sections/` – one file per landing-page section
- `src/index.css` – Tailwind, theme tokens and the orb's styles
- `components.json` – shadcn config, so `npx shadcn@latest add <component>` works

## Before going live
- Waitlist form: send the data to a backend in `waitlist-section.tsx` (look for the TODO).
- Demo answers in `demo-section.tsx` are sample data.
