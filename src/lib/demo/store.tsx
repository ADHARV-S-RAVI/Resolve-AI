import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DemoState,
  Message,
  Resolution,
  Ticket,
} from "../types";
import {
  baseInvestigation,
  callSegments,
  initialState,
  sampleCall,
} from "./seed";
import { findCustomerOrder, formatINR } from "./businessData";
import { toast } from "sonner";
import {
  api,
  type MessageRow,
  type OrderRow,
  type TicketRow,
} from "../api";
import { supabase } from "@/integrations/supabase/client";

const KEY = "resolveai-demo-v1";

const clock = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const uid = () => crypto.randomUUID();

function load(): DemoState {
  try {
    const v = JSON.parse(
      sessionStorage.getItem(KEY) || "null",
    );

    if (
      v?.version === 1 &&
      Array.isArray(v.tickets) &&
      Array.isArray(v.calls)
    ) {
      return v;
    }
  } catch {
    /* corrupt session starts clean */
  }

  return initialState();
}

// ------------------------------------------------------------
// DATABASE → FRONTEND MAPPING HELPERS
// ------------------------------------------------------------
//
// Map persisted Supabase rows into the existing frontend shapes
// (Ticket / Message) so the rest of the UI is untouched. Fields
// not stored in the database fall back to seed/demo values.

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapDbMessage(row: MessageRow): Message {
  const speaker =
    row.sender_type === "ai"
      ? ("ResolveAI" as const)
      : row.sender_type === "agent"
        ? ("Human Agent" as const)
        : ("Customer" as const);

  return {
    id: row.id,
    speaker,
    text: row.message,
    time: formatTime(row.created_at),
    channel: "chat" as const,
  };
}

function mapDbInvestigation(
  raw: unknown,
  status: Ticket["status"],
  escalationRequired: boolean,
  fallback: Ticket["investigation"],
): Ticket["investigation"] {
  const inv = (raw ?? null) as {
    found?: boolean;
    steps?: string[];
    evidence?: {
      source: string;
      reference: string;
      result: string;
    }[];
    confidence?: number;
    decision?: string;
    rootCause?: string;
    status?: string;
  } | null;

  if (!inv) return fallback;

  const stage: Ticket["investigation"]["stage"] =
    escalationRequired
      ? "Escalated"
      : status === "Resolved"
        ? "Resolved"
        : (inv.confidence ?? 0) >= 90
          ? "Decision ready"
          : "Investigating";

  return {
    stage,
    steps: inv.steps ?? fallback.steps,
    evidence: inv.evidence ?? fallback.evidence,
    rootCause: inv.rootCause ?? fallback.rootCause,
    confidence: inv.confidence ?? fallback.confidence,
    decision: inv.decision ?? fallback.decision,
  };
}

function mapDbTicket(
  row: TicketRow,
  dbMessages: MessageRow[],
  fallback?: Ticket,
): Ticket {
  const status =
    (row.status as Ticket["status"]) ??
    fallback?.status ??
    "Investigating";

  const escalationRaw = (row.escalation ?? null) as {
    required?: boolean;
    reason?: string;
    team?: string;
  } | null;

  const escalationRequired =
    escalationRaw?.required === true;

  return {
    id: row.id,

    customerId: row.customer_id,

    issue:
      row.title || fallback?.issue || "Support request",

    category: fallback?.category ?? "Support",

    priority:
      (row.priority as Ticket["priority"]) ??
      fallback?.priority ??
      "Medium",

    status,

    updated:
      fallback?.updated ?? formatTime(row.updated_at),

    channel: fallback?.channel ?? "chat",

    assignee: fallback?.assignee ?? "Unassigned",

    messages: dbMessages.map(mapDbMessage),

    events: fallback?.events ?? [],

    investigation: mapDbInvestigation(
      row.investigation,
      status,
      escalationRequired,
      fallback?.investigation ?? {
        stage: "Investigating" as const,
        steps: [],
        evidence: [],
        rootCause: "",
        confidence: 0,
        decision: "",
      },
    ),

    ...(escalationRequired
      ? {
          escalation: {
            reason:
              escalationRaw.reason ||
              "Human review required.",
            team:
              escalationRaw.team ||
              "Payments Support",
          },
        }
      : {}),

    ...(row.resolution
      ? { resolution: row.resolution as unknown as Resolution }
      : {}),
  };
}

// ------------------------------------------------------------
// REFUND RESOLUTION BUILDER
// ------------------------------------------------------------
// The refund amount and refund id come from the ticket's own
// order/payment data (never hardcoded). Sandbox simulation only —
// no real payment is ever moved.

function buildRefundResolution(ticket: Ticket): Resolution {
  const messageText = ticket.messages
    .map((m) => m.text)
    .join(" ");

  const evidenceText = ticket.investigation.evidence
    .map((e) => `${e.source} ${e.reference} ${e.result}`)
    .join(" ");

  const orderId =
    messageText.match(/ORD-\d{4,}/i)?.[0].toUpperCase() ??
    evidenceText.match(/ORD-\d{4,}/i)?.[0].toUpperCase();

  const order = orderId
    ? findCustomerOrder(orderId)
    : undefined;

  return {
    type: "refund",
    status: "completed",
    ...(order?.amount !== undefined
      ? { amount: order.amount }
      : {}),
    currency: "INR",
    ...(orderId
      ? { refundId: `RF-${orderId.replace("ORD-", "")}` }
      : {}),
    approvedBy: "Sarah Mitchell",
    approvedAt: new Date().toISOString(),
  };
}

// ------------------------------------------------------------
// REALTIME MERGE
// ------------------------------------------------------------
// Reuses the DB→frontend mapper for the DB-owned ticket fields and
// merges only those into the local ticket, so local messages, events,
// channel, category and assignee are always preserved.

function mergeTicketFromDb(
  local: Ticket,
  row: TicketRow,
): Ticket {
  const dbTicket = mapDbTicket(row, [], local);

  return {
    ...local,
    status: dbTicket.status,
    priority: dbTicket.priority,
    investigation: dbTicket.investigation,
    escalation: dbTicket.escalation,
    resolution: dbTicket.resolution,
    updated: dbTicket.updated,
  };
}

interface Store {
  state: DemoState;

  /** Persisted order state (Supabase public.orders). */
  orders: OrderRow[];

  /** Perform a real, persisted order action (sandbox). */
  orderAction: (
    orderId: string,
    kind: "cancel" | "return" | "exchange" | "refund",
  ) => Promise<{ ok: boolean; error?: string }>;

  createTicket: () => string;

  send: (
  ticketId: string,
  text: string,
  human?: boolean,
  onAIReply?: (reply: string) => void,
  ) => void;

  action: (
    ticketId: string,
    action: "approve" | "escalate" | "review",
  ) => void;

  finishCall: (
    ticketId: string,
    human: boolean,
  ) => string;

  report: (
    callId: string,
    type: "transcript" | "summary",
  ) => void;

  reset: () => void;
}

const Context = createContext<Store | null>(null);

export function DemoStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] =
    useState<DemoState>(load);

  const [orders, setOrders] = useState<OrderRow[]>([]);

  // Mirrors the latest state synchronously so
  // chained calls always see the freshest tickets.
  const stateRef = useRef(state);

  // Hydration-race guard: while mount-time hydration is in flight,
  // ticket ids the user mutates locally are tracked so the stale
  // DB snapshot never overwrites those fresh local changes.
  const hydratingRef = useRef(false);
  const mutatedTicketIdsRef = useRef<Set<string>>(new Set());

  const commit = (
    next: DemoState,
    skipMutationMark = false,
  ) => {
    // While hydration is in flight, remember which tickets the
    // user changed locally (via send/action/createTicket/...) so
    // the DB snapshot cannot overwrite them. The hydration commit
    // itself passes skipMutationMark = true.
    if (!skipMutationMark && hydratingRef.current) {
      const prevById = new Map(
        stateRef.current.tickets.map((t) => [t.id, t]),
      );

      for (const t of next.tickets) {
        const prev = prevById.get(t.id);

        if (
          !prev ||
          JSON.stringify(prev) !== JSON.stringify(t)
        ) {
          mutatedTicketIdsRef.current.add(t.id);
        }
      }
    }

    stateRef.current = next;
    setState(next);

    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          ...next,
          version: 1,
        }),
      );
    } catch {
      /* demo works in memory */
    }
  };

  const update = (
    apply: (s: DemoState) => DemoState,
  ) => commit(apply(stateRef.current));

  // ------------------------------------------------------------
  // DATABASE HYDRATION ON MOUNT
  // ------------------------------------------------------------
  //
  // Load persisted tickets + messages from Supabase and merge them
  // into state. For tickets that exist in Supabase, the database
  // wins over sessionStorage/seed (ticket id is the unique key).
  // Messages are replaced by their persisted rows (persisted ids),
  // so no duplicates are created. Any failure falls back to the
  // existing sessionStorage/seed behavior.
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    hydratingRef.current = true;

    async function hydrate() {
      try {
        const rows = await api.listTickets();

        if (cancelled || rows.length === 0) {
          return;
        }

        const seedById = new Map(
          initialState().tickets.map((t) => [
            t.id,
            t,
          ]),
        );

        const localById = new Map(
          stateRef.current.tickets.map((t) => [
            t.id,
            t,
          ]),
        );

        const hydrated: Ticket[] = [];

        for (const row of rows) {
          const messages =
            await api.listMessages(row.id);

          if (cancelled) return;

          const fallback =
            localById.get(row.id) ??
            seedById.get(row.id);

          hydrated.push(
            mapDbTicket(row, messages, fallback),
          );
        }

        if (cancelled) return;

        // Merge: local tickets first, then DB overrides by id —
        // but never overwrite a ticket the user already mutated
        // locally while hydration was in flight.
        const merged = new Map(localById);

        for (const t of hydrated) {
          if (mutatedTicketIdsRef.current.has(t.id)) {
            continue;
          }

          merged.set(t.id, t);
        }

        commit(
          {
            ...stateRef.current,
            tickets: Array.from(merged.values()),
          },
          // This is the hydration commit — it must not mark
          // tickets as locally mutated.
          true,
        );
      } catch (err) {
        console.error(
          "hydrate tickets failed:",
          err,
        );
        // Keep the sessionStorage/seed state as-is.
      } finally {
        hydratingRef.current = false;
        // Realtime merges apply normally once hydration completes.
        mutatedTicketIdsRef.current.clear();
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  // ------------------------------------------------------------
  // REALTIME TICKET SYNCHRONIZATION
  // ------------------------------------------------------------
  // Subscribes to INSERT + UPDATE on public.tickets so an already-open
  // customer or agent page reflects changes made elsewhere without a
  // refresh. Subscribed once on mount, removed on unmount — never
  // recreated per render.

  const handleRealtimeTicket = async (raw: unknown) => {
    const row = raw as TicketRow | null;
    if (!row?.id) return;

    // Skip tickets the user mutated locally during the hydration window.
    if (mutatedTicketIdsRef.current.has(row.id)) {
      return;
    }

    const existing = stateRef.current.tickets.find(
      (t) => t.id === row.id,
    );

    if (existing) {
      const hadResolution = Boolean(existing.resolution);

      const merged = mergeTicketFromDb(existing, row);

      // Customer success popup — only when a refund resolution arrives
      // through Realtime (i.e., the agent's persisted approval).
      if (row.resolution && !hadResolution) {
        const r = row.resolution as unknown as {
          amount?: number;
          refundId?: string;
        } | null;

        toast.success("Refund Successful", {
          description: (
            <span>
              {formatINR(r?.amount ?? 0)} has been refunded
              <br />
              Refund ID: {r?.refundId ?? "—"}
            </span>
          ),
        });
      }

      commit({
        ...stateRef.current,
        tickets: stateRef.current.tickets.map((t) =>
          t.id === row.id ? merged : t,
        ),
      });
      return;
    }

    // A ticket created from another client: load its messages and add it.
    try {
      const messages = await api.listMessages(row.id);
      const ticket = mapDbTicket(row, messages, undefined);

      commit({
        ...stateRef.current,
        tickets: [ticket, ...stateRef.current.tickets],
      });
    } catch (err) {
      console.error(
        "realtime insert hydrate failed:",
        err,
      );
    }
  };

  useEffect(() => {
    // Load persisted orders, then keep them in sync via Realtime.
    api.listOrders().then((rows) => {
      if (rows.length) setOrders(rows);
    });

    const channel = supabase
      .channel("realtime-tickets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tickets",
        },
        (payload) => {
          handleRealtimeTicket(payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
        },
        (payload) => {
          handleRealtimeTicket(payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const row = payload.new as OrderRow;
          if (!row?.id) return;
          setOrders((prev) =>
            prev.some((o) => o.id === row.id)
              ? prev
              : [row, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const row = payload.new as OrderRow;
          if (!row?.id) return;
          setOrders((prev) =>
            prev.map((o) => (o.id === row.id ? row : o)),
          );
        },
      )
      .subscribe((status) => {
        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          console.error(
            "realtime subscription failed:",
            status,
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTicket = () => {
    const ticketId = `RSV-${Date.now()
      .toString()
      .slice(-7)}`;

    const ticket: Ticket = {
      id: ticketId,
      customerId: "C-10482",
      issue: "New support request",
      category: "Support",
      priority: "Medium",
      status: "Investigating",
      channel: "chat",
      updated: clock(),
      assignee: "Unassigned",
      messages: [],
      events: [],
      investigation: {
        ...baseInvestigation,
      },
    };

    update((s) => ({
      ...s,
      tickets: [ticket, ...s.tickets],
    }));

    // Persist the new ticket to Enter Cloud.
    api
      .createTicket({
        id: ticketId,
        customer_id: "C-10482",
        title: ticket.issue,
      })
      .catch((err) =>
        console.error(
          "createTicket persist failed:",
          err,
        ),
      );

    return ticketId;
  };

  const send: Store["send"] = (
  ticketId,
  text,
  human = false,
  onAIReply,
 ) => {
    if (!text.trim()) return;

    const trimmed = text.trim();

    const ticket =
      stateRef.current.tickets.find(
        (t) => t.id === ticketId,
      );

    if (!ticket) return;

    const message = {
      id: uid(),
      text: trimmed,
      speaker: human
        ? ("Human Agent" as const)
        : ("Customer" as const),
      time: clock(),
      channel: "chat" as const,
    };

    // ------------------------------------------------------------
    // HUMAN AGENT RESPONSE
    // ------------------------------------------------------------

    if (human) {
      api
        .addMessage({
          ticket_id: ticketId,
          sender_type: "agent",
          message: trimmed,
        })
        .catch((err) =>
          console.error(
            "addMessage persist failed:",
            err,
          ),
        );

      update((s) => ({
        ...s,
        tickets: s.tickets.map((t) =>
          t.id !== ticketId
            ? t
            : {
                ...t,
                updated: clock(),
                messages: [
                  ...t.messages,
                  message,
                ],
                events: [
                  ...t.events,
                  {
                    id: uid(),
                    title: "Human response",
                    detail:
                      "Support agent replied",
                    time: clock(),
                  },
                ],
              },
        ),
      }));

      return;
    }

    // ------------------------------------------------------------
    // CUSTOMER MESSAGE → REAL GEMINI AI
    // ------------------------------------------------------------

    // First show customer's message immediately.
    update((s) => ({
      ...s,
      tickets: s.tickets.map((t) =>
        t.id !== ticketId
          ? t
          : {
              ...t,

              issue: t.messages.length
                ? t.issue
                : trimmed.slice(0, 85),

              updated: clock(),

              messages: [
                ...t.messages,
                message,
              ],

              events: [
                ...t.events,
                {
                  id: uid(),
                  title:
                    "Customer message received",
                  detail: trimmed.slice(0, 140),
                  time: clock(),
                },
              ],
            },
      ),
    }));

    // Persist customer message.
    api
      .addMessage({
        ticket_id: ticketId,
        sender_type: "customer",
        message: trimmed,
      })
      .catch((err) =>
        console.error(
          "customer message persist failed:",
          err,
        ),
      );

    // ------------------------------------------------------------
    // BUILD GEMINI CONVERSATION HISTORY
    // ------------------------------------------------------------
    //
    // Important:
    // The current message is sent separately to chatAgent(),
    // so we intentionally do NOT add `trimmed` here.
    //
    // This prevents the current customer message from being
    // sent to Gemini twice.
    // ------------------------------------------------------------

    const conversationHistory =
      ticket.messages.map((m) => ({
        role:
          m.speaker === "ResolveAI"
            ? ("model" as const)
            : ("user" as const),

        content: m.text,
      }));

    // ------------------------------------------------------------
    // CALL GEMINI EDGE FUNCTION
    // ------------------------------------------------------------

    api
      .chatAgent(
        trimmed,
        conversationHistory,
      )
      .then((result) => {
        // --------------------------------------------------------
        // GEMINI FAILURE
        // --------------------------------------------------------

        if (!result) {
          console.error(
            "Gemini returned no response.",
          );

          const fallback =
            "I'm sorry, I couldn't process your request right now. Please try again.";

          api
            .addMessage({
              ticket_id: ticketId,
              sender_type: "ai",
              message: fallback,
            })
            .catch((err) =>
              console.error(
                "AI fallback persist failed:",
                err,
              ),
            );

          update((s) => ({
            ...s,
            tickets: s.tickets.map((t) =>
              t.id !== ticketId
                ? t
                : {
                    ...t,
                    updated: clock(),

                    messages: [
                      ...t.messages,
                      {
                        id: uid(),
                        text: fallback,
                        speaker:
                          "ResolveAI" as const,
                        time: clock(),
                        channel:
                          "chat" as const,
                      },
                    ],
                  },
            ),
          }));

          return;
        }

        // --------------------------------------------------------
        // STRUCTURED GEMINI RESULT
        // --------------------------------------------------------

        const {
          reply,
          investigation,
          escalation,
        } = result;
        if (onAIReply) {
         onAIReply(reply);
        }

        // A submitted customer action (cancel/return/exchange/refund)
        // becomes a real timeline event on the ticket.
        const ACTION_TITLES: Record<string, string> = {
          cancel: "Cancellation requested",
          return: "Return requested",
          exchange: "Exchange requested",
          refund: "Refund requested",
          escalate: "Escalation requested",
        };

        const actionEvent =
          result.action?.status === "submitted" &&
          result.action.type
            ? {
                id: uid(),
                title:
                  ACTION_TITLES[result.action.type] ??
                  "Request submitted",
                detail:
                  [result.action.orderId, result.action.requestId]
                    .filter(Boolean)
                    .join(" · ") ||
                  (result.action.message ?? ""),
                time: clock(),
              }
            : null;

        // --------------------------------------------------------
        // PERSIST AI MESSAGE
        // --------------------------------------------------------

        api
          .addMessage({
            ticket_id: ticketId,
            sender_type: "ai",
            message: reply,
          })
          .catch((err) =>
            console.error(
              "AI message persist failed:",
              err,
            ),
          );

        // --------------------------------------------------------
        // UPDATE TICKET WITH AI RESULT
        // --------------------------------------------------------

        const investigationFound =
          investigation?.found === true;

        const escalationRequired =
          escalation?.required === true;

        // Computed status/priority applied to the ticket state —
        // the same values are persisted to the database below.
        const nextStatus =
          escalationRequired
            ? ("Escalated" as const)
            : investigationFound
              ? ("In Progress" as const)
              : ticket.status;

        const nextPriority =
          investigationFound &&
          investigation.confidence >= 90 &&
          investigation.decision ===
            "Refund recommended"
            ? ("High" as const)
            : ticket.priority;

        // Persist the Gemini investigation, escalation, and the
        // computed status/priority to the tickets table.
        // Best-effort: failures log here without breaking the UI.
        api
          .updateTicketAI(
            ticketId,
            investigation,
            escalation,
            nextStatus,
            nextPriority,
          )
          .catch((err) =>
            console.error(
              "updateTicketAI persist failed:",
              err,
            ),
          );

        update((s) => ({
          ...s,

          tickets: s.tickets.map((t) => {
            if (t.id !== ticketId) {
              return t;
            }

            // ----------------------------------------------------
            // INVESTIGATION
            // ----------------------------------------------------

            const nextInvestigation =
              investigationFound
                ? {
                    ...t.investigation,

                    steps:
                      investigation.steps,

                    evidence:
                      investigation.evidence,

                    confidence:
                      investigation.confidence,

                    decision:
                      investigation.decision,

                    rootCause:
                      investigation.rootCause,

                    stage:
                      escalationRequired
                        ? ("Escalated" as const)
                        : investigation.confidence >=
                            90
                          ? ("Decision ready" as const)
                          : ("Investigating" as const),
                  }
                : t.investigation;

            return {
              ...t,

              status: nextStatus,

              priority: nextPriority,

              updated: clock(),

              investigation:
                nextInvestigation,

              // ------------------------------------------------
              // ESCALATION
              // ------------------------------------------------

              ...(escalationRequired
                ? {
                    escalation: {
                      reason:
                        escalation.reason ||
                        "Human review required.",

                      team:
                        escalation.team ||
                        "Payments Support",
                    },

                    assignee:
                      "Sarah Mitchell",
                  }
                : {}),

              // ------------------------------------------------
              // AI MESSAGE
              // ------------------------------------------------

              messages: [
                ...t.messages,
                {
                  id: uid(),
                  text: reply,
                  speaker:
                    "ResolveAI" as const,
                  time: clock(),
                  channel:
                    "chat" as const,
                },
              ],

              // ------------------------------------------------
              // EVENTS
              // ------------------------------------------------

              events: [
                ...t.events,

                {
                  id: uid(),

                  title:
                    investigationFound
                      ? "AI investigation completed"
                      : "ResolveAI responded",

                  detail:
                    investigationFound
                      ? `${investigation.confidence}% confidence · ${investigation.decision}`
                      : reply.slice(0, 140),

                  time: clock(),
                },

                ...(escalationRequired
                  ? [
                      {
                        id: uid(),

                        title:
                          "Escalated to human support",

                        detail:
                          escalation.reason ||
                          "Human review required",

                        time: clock(),
                      },
                    ]
                  : []),

                ...(actionEvent
                  ? [actionEvent]
                  : []),
              ],
            };
          }),
        }));
      })
      .catch((err) => {
        console.error(
          "Gemini chat failed:",
          err,
        );
      });
  };

  // ------------------------------------------------------------
  // TICKET ACTIONS
  // ------------------------------------------------------------

  const action: Store["action"] = (
    ticketId,
    kind,
  ) => {
    const current =
      stateRef.current.tickets.find(
        (t) => t.id === ticketId,
      );

    if (!current) {
      return;
    }

    const blocked =
  kind === "approve" &&
  current.status === "Resolved";

if (blocked) {
  return;
}

    // Final values applied to the frontend ticket — the same
    // values are persisted to Supabase below.
    const status =
      kind === "approve"
        ? ("Resolved" as const)
        : kind === "escalate"
          ? ("Escalated" as const)
          : ("In Progress" as const);

    const priority = current.priority;

    const title =
      kind === "approve"
        ? "Refund approved"
        : kind === "escalate"
          ? "Human escalation"
          : "Human review started";

    // ------------------------------------------------------------
    // PERSISTENCE PAYLOAD (mapped to api.updateTicketAI shapes)
    // ------------------------------------------------------------
    //
    // updateTicketAI always writes both jsonb columns, so the
    // existing investigation is preserved (mapped to the API shape)
    // instead of being erased with null.

    const hasInvestigation =
      current.investigation.steps.length > 0 ||
      current.investigation.confidence > 0 ||
      Boolean(current.investigation.decision) ||
      Boolean(current.investigation.rootCause);

    const persistedInvestigation =
      hasInvestigation
        ? {
            found: true,
            steps:
              current.investigation.steps,
            evidence:
              current.investigation.evidence,
            confidence:
              current.investigation.confidence,
            decision:
              current.investigation.decision,
            rootCause:
              current.investigation.rootCause,
            status:
              current.investigation.stage,
          }
        : null;

    const persistedEscalation =
      kind === "escalate"
        ? {
            required: true,
            reason:
              current.escalation?.reason ||
              "Additional human review requested.",
            team: "Payments Support",
          }
        : current.escalation
          ? {
              required: true,
              reason: current.escalation.reason,
              team: current.escalation.team,
            }
          : {
              required: false,
              reason: "",
              team: "",
            };

    // ------------------------------------------------------------
    // REFUND RESOLUTION (approve only)
    // ------------------------------------------------------------

    const resolution =
      kind === "approve"
        ? buildRefundResolution(current)
        : null;

    // Update local state first (same behavior as before).
    update((s) => ({
      ...s,

      tickets: s.tickets.map((t) => {
        if (t.id !== ticketId) {
          return t;
        }

        return {
          ...t,

          status,

          assignee:
            "Sarah Mitchell",

          updated: clock(),

          investigation: {
            ...t.investigation,

            stage:
              kind === "approve"
                ? ("Resolved" as const)
                : kind === "escalate"
                  ? ("Escalated" as const)
                  : t.investigation.stage,
          },

          ...(kind === "escalate"
            ? {
                escalation: {
                  reason:
                    t.escalation?.reason ||
                    "Additional human review requested.",

                  team:
                    "Payments Support",
                },
              }
            : {}),

          ...(resolution
            ? { resolution }
            : {}),

          events: [
            ...t.events,

            {
              id: uid(),

              title,

              detail:
                kind === "approve"
                  ? "Refund request created in sandbox. No real payment was processed."
                  : "Complete case context retained.",

              time: clock(),
            },
          ],
        };
      }),
    }));

    // Persist the action to Supabase. Best-effort: failures log
    // here without breaking the UI.
    api
      .updateTicketAI(
        ticketId,
        persistedInvestigation,
        persistedEscalation,
        status,
        priority,
        resolution,
      )
      .then((row) => {
        // Agent success popup — only after the refund write succeeds.
        if (kind === "approve" && resolution && row) {
          toast.success("Refund Successful", {
            description: (
              <span>
                {formatINR(resolution.amount ?? 0)} refunded to customer
                <br />
                Refund ID: {resolution.refundId ?? "—"}
              </span>
            ),
          });
        }
      })
      .catch((err) =>
        console.error(
          "action persist failed:",
          err,
        ),
      );

    // Keep the real order refund state in sync with the agent approval.
    if (kind === "approve" && resolution) {
      const orderId =
        current.messages
          .map((m) => m.text)
          .join(" ")
          .match(/ORD-\d{4,}/i)?.[0] ??
        current.investigation.evidence.find((e) =>
          /ORD-\d{4,}/i.test(e.reference),
        )?.reference;

      if (orderId) {
        api
          .updateOrder(orderId.toUpperCase(), {
            refund_status: "Completed",
            ...(resolution.amount !== undefined
              ? { refund_amount: resolution.amount }
              : {}),
            ...(resolution.refundId
              ? { refund_id: resolution.refundId }
              : {}),
          })
          .catch((err) =>
            console.error(
              "order refund persist failed:",
              err,
            ),
          );
      }
    }
  };

  // ------------------------------------------------------------
  // CALL FLOW
  // ------------------------------------------------------------

  const finishCall: Store["finishCall"] = (
    ticketId,
    human,
  ) => {
    const callId = `CALL-${uid().slice(
      0,
      8,
    )}`;

    update((s) => {
      const ticket = s.tickets.find(
        (t) => t.id === ticketId,
      );

      if (!ticket) {
        return s;
      }

      const segments = callSegments
        .slice(0, human ? 6 : 3)
        .map((seg, i) => ({
          ...seg,

          id: `${callId}-${i}`,

          text:
            i === 0
              ? `Hi. I have your case ${ticketId}: ${ticket.issue}. We can continue without starting again.`
              : seg.text,
        }));

      const call = {
        ...sampleCall,

        id: callId,

        ticketId,

        channel: "call" as const,

        customerId:
          ticket.customerId,

        startedAt: clock(),

        endedAt: clock(),

        duration: human
          ? "03:24"
          : "01:12",

        agent: human
          ? "Sarah Mitchell"
          : "ResolveAI",

        segments,

        transcriptReady: false,

        summaryReady: false,

        summary: {
          ...sampleCall.summary,

          issue:
            `Demo call about ${ticket.issue}.`,

          outcome: human
            ? "Human review required. No refund was executed."
            : "Call ended before human handoff. No action executed.",

          actions: human
            ? sampleCall.summary.actions
            : [
                "AI reviewed the complaint context.",
                "Human review recommended; call ended before transfer.",
              ],
        },
      };

      return {
        ...s,

        calls: [
          call,
          ...s.calls,
        ],

        tickets: s.tickets.map((t) =>
          t.id !== ticketId
            ? t
            : {
                ...t,

                status:
                  "Escalated" as const,

                updated: clock(),

                escalation: {
                  reason:
                    "Demo call introduced conflicting refund information.",

                  team:
                    "Payments Support",
                },

                investigation: {
                  ...t.investigation,

                  confidence: 42,

                  stage:
                    "Escalated" as const,

                  decision:
                    "Human review required",
                },

                messages: [
                  ...t.messages,

                  ...segments.map(
                    (seg) => ({
                      id: seg.id,

                      text: seg.text,

                      speaker:
                        seg.speaker,

                      channel:
                        "call" as const,

                      time:
                        seg.timestamp,
                    }),
                  ),
                ],

                events: [
                  ...t.events,

                  {
                    id: uid(),

                    title: human
                      ? "AI → human demo call completed"
                      : "AI demo call ended",

                    detail:
                      "Transcript available in the call workspace",

                    time: clock(),

                    callId,
                  },
                ],
              },
        ),
      };
    });

    return callId;
  };

  // ------------------------------------------------------------
  // CALL REPORT
  // ------------------------------------------------------------

  const report: Store["report"] = (
    callId,
    type,
  ) =>
    update((s) => ({
      ...s,

      calls: s.calls.map((c) =>
        c.id !== callId
          ? c
          : {
              ...c,

              [type === "transcript"
                ? "transcriptReady"
                : "summaryReady"]: true,
            },
      ),
    }));

  // ------------------------------------------------------------
  // RESET
  // ------------------------------------------------------------

  const reset = () =>
    update(() => initialState());

  // ------------------------------------------------------------
  // REAL ORDER ACTIONS (persisted to Supabase public.orders)
  // ------------------------------------------------------------
  // Each action awaits the database write and only reports success
  // once the row was actually updated — never a fake success.

  const orderAction: Store["orderAction"] = async (
    orderId,
    kind,
  ) => {
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return { ok: false, error: "Order not found." };
    }

    const patch: Parameters<typeof api.updateOrder>[1] = {};

    if (kind === "cancel") {
      if (!order.cancellation_eligible) {
        return {
          ok: false,
          error: "Cancellation is not available for this order.",
        };
      }
      patch.status = "Cancelled";
      patch.cancellation_eligible = false;
    } else if (kind === "return") {
      if (!String(order.return_status).startsWith("Eligible")) {
        return {
          ok: false,
          error: `Return is not available (${order.return_status}).`,
        };
      }
      patch.return_status = "Requested";
      if (order.refund_status === "None") {
        patch.refund_status = "Pending";
        patch.refund_amount = Number(order.amount);
        patch.refund_id = `RF-${orderId.replace("ORD-", "")}`;
      }
    } else if (kind === "exchange") {
      if (!order.exchange_eligible) {
        return {
          ok: false,
          error: "Exchange is not available for this order.",
        };
      }
      patch.exchange_status = "Requested";
    } else if (kind === "refund") {
      patch.refund_status = "Pending";
      patch.refund_amount = Number(order.amount);
      patch.refund_id =
        order.refund_id ?? `RF-${orderId.replace("ORD-", "")}`;
    }

    const updated = await api.updateOrder(orderId, patch);

    if (!updated) {
      return {
        ok: false,
        error: "The action could not be saved. Please try again.",
      };
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updated : o)),
    );

    const titleMap: Record<string, string> = {
      cancel: "Cancellation completed",
      return: "Return request submitted",
      exchange: "Exchange request submitted",
      refund: "Refund requested",
    };

    const requestId =
      kind === "cancel"
        ? `CNL-${orderId}`
        : kind === "return"
          ? `RET-${orderId}`
          : kind === "exchange"
            ? `EXC-${orderId}`
            : updated.refund_id ?? `RF-${orderId}`;

    // Real timeline event on any ticket that references this order.
    update((s) => ({
      ...s,
      tickets: s.tickets.map((t) =>
        t.messages.some((m) => m.text.includes(orderId)) ||
        t.investigation.evidence.some(
          (e) => e.reference === orderId,
        )
          ? {
              ...t,
              updated: clock(),
              events: [
                ...t.events,
                {
                  id: uid(),
                  title: titleMap[kind],
                  detail: `${orderId} · ${requestId}`,
                  time: clock(),
                },
              ],
            }
          : t,
      ),
    }));

    return { ok: true };
  };

  return (
    <Context.Provider
      value={{
        state,
        orders,
        orderAction,
        createTicket,
        send,
        action,
        finishCall,
        report,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const store = useContext(Context);

  if (!store) {
    throw new Error(
      "DemoStoreProvider is missing",
    );
  }

  return store;
}