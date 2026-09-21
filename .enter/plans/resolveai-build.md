# ResolveAI — Customer Support Platform Build Plan

## Context

ResolveAI is an AI-native customer-support platform (hackathon build per `ResolveAI_PRD.md`). Core concept: **one customer → one complaint → one continuous context** across Text Chat, Web Voice Call, and Phone Call. The PRD defines two demo scenarios (autonomous resolution at 91% confidence; human escalation at 42% confidence due to conflicting records) and explicitly sanctions **controlled demo data** for the prototype ("Use mock data initially", "controlled mock APIs or sample data", "controlled demo data" for pattern detection). The user chose: floating "Talk to AI" voice widget, and an open agent route (no login).

This build delivers the complete UI/UX per PRD §15–§22 on the existing Vite + React + shadcn + Tailwind template. Data lives behind a demo store (React context) seeded with the PRD's data model, so a real Enter Cloud backend + Qwen AI can be swapped in later without reworking the screens.

**Design direction (PRD §28.2, overrides the dark reference screenshots):** white/light-gray surfaces, charcoal text, subtle borders, restrained teal/green accents, compact cards, dense readable tables, clear status badges, strong typography, professional/enterprise. Voice widget matches this ResolveAI light theme (screenshots are reference only).

## Routes

| Route | Page |
|---|---|
| `/` | Landing (hero "Support that understands what happened.", Get Support / Agent Login, workflow strip, features, voice/phone channels, status, footer) |
| `/support` | Customer Support Hub (greeting, Chat / Call / Phone CTAs, recent tickets with status) |
| `/chat` | AI Text Chat (conversation, ticket status panel, investigation progress, escalation banner) |
| `/tickets/:id` | Customer Ticket View (ticket summary + full timeline: message → AI questions → investigation → actions → resolution/escalation) |
| `/agent` | Agent Dashboard (Support Inbox table + Analytics tab) |
| `/agent/ticket/:id` | Agent Ticket Workspace (3-column: Customer 360 \| Conversation \| AI Investigation) |

Customer pages responsive (mobile + desktop); agent pages desktop-first with responsive collapse (mobile uses tabs for the 3 columns).

## Demo Data & Simulation

- `src/lib/types.ts` — shared contracts: `Customer`, `Ticket` (id, customerId, category, priority, status, aiConfidence), `Message` (channel: chat | call | phone, direction, content), `Conversation`, `Evidence`, `Investigation` (steps, rootCause, confidence, decision), `AuditEvent`, `Escalation`.
- `src/lib/demo/seed.ts` — PRD §24/§25/§26 data: customer Adharv (C-10482), tickets RSV-1042 (duplicate payment, high, investigating, 91%), RSV-1041 (order delivered, medium, AI Resolving, 88%), RSV-1039 (refund, high, Escalated, 42%, conflicting records); orders/payments/refunds evidence (ORD-4821, TX-92840, TX-92841).
- `src/lib/demo/aiSimulator.ts` — deterministic scripted pipeline: recognizes "payment deducted twice / cancelled order" → asks for transaction ID → on "TX-92841" creates/updates ticket → animates investigation steps (5 checks) → root cause "Possible payment gateway timeout caused duplicate transaction" → confidence 91% → decision REFUND_RECOMMENDED ("✓ Action allowed by refund policy"). Conflicting-record phrasing (e.g. "refund not received" / "refund missing") → confidence 42% → ESCALATE → Payments Support.
- `src/lib/demo/store.tsx` — `DemoStoreProvider` context + hooks: `sendMessage` (runs AI pipeline with staged delays), `escalate`, `approveAction` (marks Resolved + refund initiated), `startVoiceCall`/`endVoiceCall` (appends transcript messages tagged `call` to the SAME ticket conversation — demonstrates context continuity), `getTicket(id)`. Persisted to localStorage for demo continuity.

## Design System Changes

- `src/index.css` — replace default slate `--primary` with restrained teal; add semantic status tokens (`--status-investigating` amber, `--status-progress` blue, `--status-resolved` emerald, `--status-escalated` red, `--status-ai` violet) in both light `:root` and `.dark`; add muted surface + border tokens; keep light-first per PRD. No direct hex in components.
- `src/components/ui/badge.tsx` — add status variants mapped to the tokens.
- `src/components/ui/button.tsx` — add `subtle` (teal-tinted) and `ghost-outline` variants used on landing.

## Files to Create / Modify

Create:
- `src/lib/types.ts`, `src/lib/demo/seed.ts`, `src/lib/demo/aiSimulator.ts`, `src/lib/demo/store.tsx`
- `src/components/landing/` — `Nav.tsx`, `Hero.tsx`, `WorkflowStrip.tsx`, `Features.tsx`, `Channels.tsx`, `StatusSection.tsx`, `Footer.tsx`
- `src/components/support/` — `ChatMessage.tsx`, `TicketStatusBadge.tsx`, `ConversationTimeline.tsx` (timeline of a full case), `EscalationBanner.tsx` (human handoff + "Complete Context Ready" checklist), `InvestigationProgress.tsx` (live step list)
- `src/components/voice/` — `VoiceWidget.tsx` (floating launcher, bottom-right, accessible on mobile), `VoiceCallPanel.tsx` (connecting → in-call: waveform animation, timer, live caption transcript, mute/hang-up; simulated call appends to ticket conversation)
- `src/components/agent/` — `InboxTable.tsx`, `TicketWorkspace.tsx` (3 columns), `Customer360.tsx`, `InvestigationPanel.tsx` (timeline, evidence, root cause, confidence, Qwen decision), `WorkflowBar.tsx` (Received → Understood → Ticketed → Investigating → Decision → Resolved, "Enterprise workflow orchestration" label), `ResolutionActions.tsx` (Approve & Refund / Review / Escalate), `AnalyticsPanel.tsx` (recharts: AI resolution rate, escalation rate, emerging issues, root-cause donut, AI impact)
- `src/pages/support/SupportHub.tsx`, `src/pages/support/ChatPage.tsx`, `src/pages/support/TicketDetail.tsx`, `src/pages/agent/AgentDashboard.tsx`, `src/pages/agent/AgentTicket.tsx`

Modify:
- `src/router.tsx` — register the 6 routes above (before the `*` catch-all)
- `src/pages/Index.tsx` — full rewrite into the landing page
- `src/App.tsx` — wrap routes with `DemoStoreProvider`

Reuse: `cn` (`src/lib/utils.ts`), existing shadcn `button/badge/card/table/tabs/progress/avatar/scroll-area/textarea/input/select/skeleton/dialog/sonner`, `lucide-react` icons (no emoji), `recharts` for analytics.

## Implementation Checklist

- [ ] `src/index.css`: teal `--primary` + status tokens + subtle surface tokens; `badge.tsx` status variants; `button.tsx` `subtle` variant
- [ ] `src/lib/types.ts` with PRD §24 contracts (Customer, Ticket, Message, Conversation, Evidence, Investigation, AuditEvent, Escalation)
- [ ] `src/lib/demo/seed.ts` seeding Adharv + tickets RSV-1042/1041/1039 + order/payment/refund evidence per PRD §25/§26
- [ ] `src/lib/demo/aiSimulator.ts`: recognize duplicate-payment complaint → ask TX ID → investigate → root cause 91% → REFUND_RECOMMENDED; conflicting-record phrasing → 42% → ESCALATE
- [ ] `src/lib/demo/store.tsx`: `DemoStoreProvider` + `sendMessage` (staged AI pipeline), `escalate`, `approveAction` → Resolved, voice-call transcript appended to same ticket conversation, localStorage persistence
- [ ] `src/router.tsx`: routes `/`, `/support`, `/chat`, `/tickets/:id`, `/agent`, `/agent/ticket/:id`
- [ ] `src/App.tsx`: wrap RouterProvider content with DemoStoreProvider
- [ ] Landing (`Index.tsx` + `src/components/landing/*`): hero ("Support that understands what happened." + Get Support / Agent Login), workflow strip, features, channels (chat/voice/phone), system status, footer; responsive
- [ ] Support Hub (`/support`): greeting, Chat / Talk to AI / Call Support CTAs (phone number CTA — number displayed, "connects later"), recent tickets with status badges
- [ ] AI Text Chat (`/chat`): message list, AI scripted replies, ticket status panel (id, status, priority), investigation progress, escalation banner w/ "no need to repeat" copy
- [ ] Voice widget (`src/components/voice/*`): floating launcher + call panel (connecting → live waveform + timer + captions → hang up), transcript appended with `call` tag to active ticket; visible at mobile widths
- [ ] Customer Ticket View (`/tickets/:id`): ticket summary + `ConversationTimeline` (message → AI questions → investigation → actions → resolution/escalation)
- [ ] Agent Dashboard (`/agent`): Inbox table (Ticket | Customer | Issue | Priority | Status | AI Confidence | Updated) with search/filter; Analytics tab (metrics, emerging issues, root-cause donut, AI impact bars)
- [ ] Agent Ticket Workspace (`/agent/ticket/:id`): 3 columns — Customer360 (profile, orders, prev tickets, AI summary) | Conversation (channel tags for chat/call/phone) | AI Investigation (timeline, evidence, root cause, confidence, Qwen decision, WorkflowBar) + ResolutionActions (Approve & Refund / Review / Escalate) driving store actions
- [ ] `pnpm lint` and `pnpm exec tsc --noEmit` pass on final tree

## Verification Checklist

- [ ] Positive: `/chat` — send "My payment was deducted twice, but my order is cancelled." → AI asks for TX ID; send "TX-92841" → ticket RSV-1042 shown, investigation steps animate, root cause + 91% confidence, "Refund recommended" decision appears
- [ ] Escalation: `/chat` phrasing like "refund missing after cancelled order" → 42% confidence → escalation banner with "Complete Context Ready" checklist and "you won't have to repeat anything"
- [ ] Context continuity: start chat ticket, then open Voice widget and hang up → transcript appears in the same ticket conversation tagged `call`; verified in both `/chat` and `/agent/ticket/RSV-1042`
- [ ] Agent flow: `/agent` inbox shows RSV-1042/1041/1039 with priority/status/confidence; open workspace → Approve & Refund on RSV-1042 → status becomes Resolved; Escalate path on RSV-1039 shows Payments Support handoff
- [ ] Timeline: `/tickets/RSV-1042` renders full case timeline (message → questions → investigation → action → outcome)
- [ ] Phone CTA: `/support` shows "Call Support" with the AI support number and a clear "connects to voice agent" label
- [ ] Landing: `/` hero renders, all CTAs navigate (`Get Support` → `/support`, `Agent Login` → `/agent`), workflow strip + status section visible
- [ ] Responsive: `website_screenshot` at `mobile_390` and `desktop_1280` on `/` and `/chat`; voice widget launcher visible/usable on mobile; agent 3-column workspace collapses to tabs on mobile
- [ ] Negative/default: unknown ticket id `/tickets/xyz` shows a friendly not-found state; empty chat state shows greeting
- [ ] Build scope: `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm run build` pass
