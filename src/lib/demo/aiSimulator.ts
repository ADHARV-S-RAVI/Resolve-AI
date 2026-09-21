import type { Ticket } from "../types";
import { paymentInvestigation } from "./seed";

export function simulateReply(ticket: Ticket, text: string): Partial<Ticket> & { reply: string } {
  const history = [...ticket.messages.filter((m)=>m.speaker==="Customer").map((m)=>m.text), text].join(" ");

  if (/refund.*(missing|not received)|conflict|pending.*refund|refund.*pending/i.test(history)) {
    return {
      status:"Escalated",
      escalation:{ reason:"Payment and refund records conflict.", team:"Payments Support" },
      investigation:{ ...paymentInvestigation, stage:"Escalated", confidence:42, rootCause:"Sample payment and refund records conflict. A human must verify the actual refund status.", decision:"Human review required" },
      reply:"In this demo, the payment and refund records conflict. I’m preparing a handoff to Payments Support with your full conversation and investigation. You won’t need to repeat anything.",
    };
  }
  if (/twice|duplicate/i.test(history)) {
    if (/TX-92841/i.test(history)) return {
      status:"In Progress", investigation:paymentInvestigation,
      reply:"The demo investigation found two captured payments for cancelled order ORD-4821. A gateway timeout may explain the duplicate charge. Confidence: 91%. A refund is recommended under the sample policy, but has not been executed.",
    };
    return {
      investigation:{ ...ticket.investigation, stage:"Waiting for customer", decision:"Transaction ID needed" },
      reply:"I can investigate the duplicate payment demo. Could you share the transaction ID? Use TX-92841 to explore the sample case.",
    };
  }
  return { reply:"This is a UI demonstration, not a live AI assistant. Try “My payment was deducted twice, but my order is cancelled” or “My refund is missing” to explore the two sample journeys." };
}
