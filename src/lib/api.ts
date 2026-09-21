import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * ResolveAI backend API
 *
 * Handles:
 * - Tickets
 * - Messages
 * - Gemini AI agent
 * - AI investigation
 * - AI escalation
 * - Persistent investigation data
 */

export type TicketRow =
  Database["public"]["Tables"]["tickets"]["Row"];

export type OrderRow =
  Database["public"]["Tables"]["orders"]["Row"];

export type TicketInsert =
  Database["public"]["Tables"]["tickets"]["Insert"];

export type MessageRow =
  Database["public"]["Tables"]["messages"]["Row"];

export type MessageInsert =
  Database["public"]["Tables"]["messages"]["Insert"];

export type SenderType =
  MessageInsert["sender_type"];

/* ---------------------------------------------------------
   AI INVESTIGATION TYPES
--------------------------------------------------------- */

export type AIInvestigation = {
  found: boolean;
  steps: string[];
  evidence: {
    source: string;
    reference: string;
    result: string;
  }[];
  confidence: number;
  decision: string;
  rootCause: string;
  status: string;
};

export type AIEscalation = {
  required: boolean;
  reason: string;
  team: string;
};

export type AIResolution = {
  type: "refund";
  status: string;
  amount?: number;
  currency?: string;
  refundId?: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type ChatAgentResponse = {
  reply: string;
  investigation: AIInvestigation | null;
  escalation: AIEscalation | null;
  action?: {
    type?: string;
    orderId?: string | null;
    status?: string;
    requestId?: string | null;
    message?: string;
  } | null;
};

/* ---------------------------------------------------------
   API
--------------------------------------------------------- */

export const api = {
  /** Create a ticket and return the stored row. */
  async createTicket(
    input: Pick<
      TicketInsert,
      "id" | "customer_id" | "title"
    > &
      Partial<
        Pick<
          TicketInsert,
          | "description"
          | "status"
          | "priority"
          | "investigation"
          | "escalation"
        >
      >,
  ): Promise<TicketRow | null> {
    const { data, error } = await supabase
      .from("tickets")
      .insert(input)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "api.createTicket failed:",
        error.message,
      );
      return null;
    }

    return data;
  },

  /** Retrieve a single ticket by id. */
  async getTicket(
    id: string,
  ): Promise<TicketRow | null> {
    const { data, error } = await supabase
      .from("tickets")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "api.getTicket failed:",
        error.message,
      );
      return null;
    }

    return data;
  },

  /** List tickets, newest first. */
  async listTickets(): Promise<TicketRow[]> {
    const { data, error } = await supabase
      .from("tickets")
      .select()
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "api.listTickets failed:",
        error.message,
      );
      return [];
    }

    return data ?? [];
  },

  /** Update investigation and escalation for a ticket. */
  async updateTicketAI(
    ticketId: string,
    investigation: AIInvestigation | null,
    escalation: AIEscalation | null,
    status?: string,
    priority?: string,
    resolution?: AIResolution | null,
  ): Promise<TicketRow | null> {
    const { data, error } = await supabase
      .from("tickets")
      .update({
        investigation,
        escalation,
        ...(status !== undefined
          ? { status }
          : {}),
        ...(priority !== undefined
          ? { priority }
          : {}),
        ...(resolution !== undefined
          ? { resolution }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "api.updateTicketAI failed:",
        error.message,
      );
      return null;
    }

    return data;
  },

  /** Add a message to a ticket. */
  async addMessage(
    input: Pick<
      MessageInsert,
      "ticket_id" | "sender_type" | "message"
    >,
  ): Promise<MessageRow | null> {
    const { data, error } = await supabase
      .from("messages")
      .insert(input)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "api.addMessage failed:",
        error.message,
      );
      return null;
    }

    return data;
  },

  /** Retrieve all messages for a ticket. */
  async listMessages(    ticketId: string,
  ): Promise<MessageRow[]> {
    const { data, error } = await supabase
      .from("messages")
      .select()
      .eq("ticket_id", ticketId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "api.listMessages failed:",
        error.message,
      );
      return [];
    }

    return data ?? [];
  },

  /**
   * List orders (optionally for one customer).
   */
  async listOrders(customerId?: string): Promise<OrderRow[]> {
    let query = supabase
      .from("orders")
      .select()
      .order("id", { ascending: true });

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("api.listOrders failed:", error.message);
      return [];
    }

    return data ?? [];
  },

  /** Retrieve a single order by id. */
  async getOrder(id: string): Promise<OrderRow | null> {
    const { data, error } = await supabase
      .from("orders")
      .select()
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("api.getOrder failed:", error.message);
      return null;
    }

    return data;
  },

  /**
   * Persist an order state change (sandbox customer/agent action).
   */
  async updateOrder(
    id: string,
    patch: Partial<{
      status: string;
      return_status: string;
      refund_status: string;
      refund_amount: number;
      refund_id: string;
      cancellation_eligible: boolean;
      exchange_eligible: boolean;
      exchange_status: string;
    }>,
  ): Promise<OrderRow | null> {
    const { data, error } = await supabase
      .from("orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("api.updateOrder failed:", error.message);
      return null;
    }

    return data;
  },

  /**
   * Send a customer message to the Gemini-powered
   * ResolveAI agent.
   */
  async chatAgent(
    message: string,
    conversationHistory: {
      role: "user" | "model";
      content: string;
    }[] = [],
  ): Promise<ChatAgentResponse | null> {
    const { data, error } =
      await supabase.functions.invoke(
        "chat-agent",
        {
          body: {
            message,
            conversation_history:
              conversationHistory,
          },
        },
      );

    if (error) {
      console.error(
        "api.chatAgent failed:",
        error.message,
      );
      return null;
    }

    if (
      !data?.ok ||
      typeof data.reply !== "string"
    ) {
      console.error(
        "api.chatAgent returned an invalid response:",
        data,
      );
      return null;
    }

    return {
      reply: data.reply,

      investigation:
        data.investigation ?? null,

      escalation:
        data.escalation ?? null,

      action:
        data.action ?? null,
    };
  },
};