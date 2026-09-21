import type { CallSession, Customer, DemoState, Investigation, Ticket, TranscriptSegment } from "../types";

export const customers: Customer[] = [
  { id: "C-10482", name: "Adharv Sharma", initials: "AS", email: "adharv@example.com", accountStatus: "Active customer" },
  { id: "C-10483", name: "Priya Patel", initials: "PP", email: "priya@example.com", accountStatus: "Active customer" },
  { id: "C-10484", name: "Rahul Mehta", initials: "RM", email: "rahul@example.com", accountStatus: "Active customer" },
];

export const checkSteps = ["Customer history reviewed","Order records checked","Payment records matched","Previous tickets reviewed","Refund policy checked"];

export const baseInvestigation: Investigation = { stage:"Received", steps:[], evidence:[], rootCause:"", confidence:0, decision:"Waiting for complaint details" };

export const paymentInvestigation: Investigation = {
  stage:"Decision ready", steps:checkSteps,
  evidence:[
    { source:"Payment", reference:"TX-92840", result:"Captured · ₹2,499" },
    { source:"Payment", reference:"TX-92841", result:"Captured · ₹2,499" },
    { source:"Order", reference:"ORD-4821", result:"Cancelled" },
    { source:"Refund policy", reference:"POL-004", result:"Duplicate payment eligible" },
  ],
  rootCause:"A payment gateway timeout may have caused a duplicate transaction for a cancelled order.",
  confidence:91, decision:"Refund recommended",
};

export const callSegments: TranscriptSegment[] = [
  { id:"s1", speaker:"ResolveAI", name:"ResolveAI", timestamp:"00:00", text:"Hi Adharv. I have your case RSV-1042 and the previous chat about your duplicate payment. You don’t need to start again. How can I help?" },
  { id:"s2", speaker:"Customer", name:"Adharv Sharma", timestamp:"00:18", text:"Thanks. I can see both payments were taken, but my bank says one refund might already be pending. I’m worried about being charged twice." },
  { id:"s3", speaker:"ResolveAI", name:"ResolveAI", timestamp:"00:42", text:"I understand. Our sample payment and refund records don’t fully agree. Rather than initiate another refund, I’m transferring this case to a payments specialist with everything we’ve discussed." },
  { id:"s4", speaker:"Human Agent", name:"Sarah Mitchell", timestamp:"01:12", text:"Hi Adharv, Sarah here from Payments Support. I have your chat, transaction IDs, and the investigation. I’ll review the conflicting refund status for you.", handoff:true },
  { id:"s5", speaker:"Customer", name:"Adharv Sharma", timestamp:"01:35", text:"That’s helpful. Please make sure I’m not refunded twice either. Could you keep me updated on this ticket?" },
  { id:"s6", speaker:"Human Agent", name:"Sarah Mitchell", timestamp:"02:04", text:"Absolutely. I’ve noted that a payment reconciliation is needed. No further refund will be initiated until the records are confirmed. We’ll update this same ticket with the result." },
];

export const sampleCall: CallSession = {
  id:"CALL-2084", ticketId:"RSV-1042", customerId:"C-10482", channel:"phone",
  startedAt:"Sep 17, 2026 · 10:32 AM", endedAt:"Sep 17, 2026 · 10:35 AM", duration:"03:24",
  status:"Completed", agent:"Sarah Mitchell", team:"Payments Support",
  reason:"Customer reported a pending bank refund that conflicts with payment records.",
  segments:callSegments, transcriptReady:true, summaryReady:true,
  summary:{
    issue:"Customer called about a duplicate charge of ₹2,499 on cancelled order ORD-4821 and an uncertain bank refund.",
    findings:"Two sample captured payments were found. The customer reported a possible pending refund; this remains unverified and requires reconciliation.",
    actions:["AI reviewed the existing complaint and transaction context.","Case transferred to Sarah Mitchell with the full investigation.","Further refund action paused pending reconciliation."],
    outcome:"Human review required. No refund was executed during this call.",
    followups:["Payments Support: reconcile both transaction records.","Sarah Mitchell: update the customer on ticket RSV-1042."],
  },
};

export function initialState(): DemoState {
  const tickets: Ticket[] = [
    {
      id:"RSV-1042", customerId:"C-10482", issue:"Payment deducted twice for cancelled order", category:"Payments", priority:"High",
      status:"In Progress", updated:"10:35 AM", channel:"phone", assignee:"Sarah Mitchell", investigation:paymentInvestigation,
      messages:[
        { id:"m1", speaker:"Customer", text:"My payment was deducted twice, but my order is cancelled.", time:"10:24 AM", channel:"chat" },
        { id:"m2", speaker:"ResolveAI", text:"I can help investigate that. Could you share the transaction ID?", time:"10:24 AM", channel:"chat" },
        { id:"m3", speaker:"Customer", text:"TX-92841", time:"10:25 AM", channel:"chat" },
        { id:"m4", speaker:"ResolveAI", text:"The sample records show two captured payments for the cancelled order. A duplicate-payment refund is recommended, pending review.", time:"10:26 AM", channel:"chat" },
        ...callSegments.map((s)=>({ id:`call-${s.id}`, speaker:s.speaker, text:s.text, time:s.timestamp, channel:"phone" as const })),
      ],
      events:[
        { id:"e1", title:"Complaint received", detail:"Duplicate payment · Chat", time:"10:24 AM" },
        { id:"e2", title:"Investigation completed", detail:"5 sample sources reviewed · 91% confidence", time:"10:26 AM" },
        { id:"e3", title:"Phone call & human handoff", detail:"Sarah Mitchell · Payments Support · 03:24", time:"10:35 AM", callId:"CALL-2084" },
      ],
    },
    {
      id:"RSV-1041", customerId:"C-10483", issue:"Package marked delivered, not received", category:"Delivery", priority:"Medium",
      status:"Investigating", updated:"10:18 AM", channel:"chat", assignee:"Unassigned",
      investigation:{ ...baseInvestigation, stage:"Investigating", steps:["Customer history reviewed","Order records checked"], confidence:88, decision:"Review delivery confirmation" },
      messages:[{ id:"p1", speaker:"Customer", text:"My package says delivered, but I haven’t received it.", channel:"chat", time:"10:18 AM" }],
      events:[{ id:"p2", title:"Delivery complaint received", detail:"Carrier confirmation needed", time:"10:18 AM" }],
    },
    {
      id:"RSV-1039", customerId:"C-10484", issue:"Refund not received after cancellation", category:"Refunds", priority:"High",
      status:"Escalated", updated:"9:42 AM", channel:"call", assignee:"Sarah Mitchell",
      investigation:{ ...paymentInvestigation, stage:"Escalated", confidence:42, rootCause:"Payment and refund records conflict. The refund status cannot be confirmed.", decision:"Human review required" },
      escalation:{ reason:"Payment and refund records conflict.", team:"Payments Support" },
      messages:[
        { id:"r1", speaker:"Customer", text:"My refund is missing after the order was cancelled.", time:"9:38 AM", channel:"chat" },
        { id:"r2", speaker:"ResolveAI", text:"The sample payment and refund records conflict. I’ve prepared the complete context for Payments Support.", time:"9:42 AM", channel:"chat" },
      ],
      events:[{ id:"r3", title:"Escalated to Payments Support", detail:"42% confidence · conflicting records", time:"9:42 AM" }],
    },
    {
      id:"RSV-1036", customerId:"C-10482", issue:"Update delivery address", category:"Account", priority:"Low",
      status:"Resolved", updated:"Yesterday", channel:"chat", assignee:"ResolveAI",
      investigation:{ ...baseInvestigation, stage:"Resolved", confidence:97, decision:"Address updated in demo" },
      messages:[{ id:"a1", speaker:"ResolveAI", text:"Your sample delivery address has been updated.", time:"Yesterday", channel:"chat" }],
      events:[{ id:"a2", title:"Resolved in demo", detail:"Delivery address updated", time:"Yesterday" }],
    },
  ];
  return { tickets, calls:[sampleCall] };
}
