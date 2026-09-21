export type Status = "Investigating" | "In Progress" | "Resolved" | "Escalated";
export type Channel = "chat" | "call" | "phone";
export type Speaker = "Customer" | "ResolveAI" | "Human Agent";
export interface Message { id: string; speaker: Speaker; text: string; time: string; channel: Channel }
export interface AuditEvent { id: string; title: string; detail: string; time: string; callId?: string }
export interface Evidence { source: string; reference: string; result: string }
export type Stage = "Received" | "Waiting for customer" | "Investigating" | "Decision ready" | "Resolved" | "Escalated";
export interface Investigation { stage: Stage; steps: string[]; evidence: Evidence[]; rootCause: string; confidence: number; decision: string }
export interface Customer { id: string; name: string; initials: string; email: string; accountStatus: string }
export interface Escalation { reason: string; team: string }
export interface Resolution {
  type: "refund";
  status: "processing" | "approved" | "completed" | "rejected";
  amount?: number;
  currency?: string;
  refundId?: string;
  approvedBy?: string;
  approvedAt?: string;
}
export interface Ticket { id: string; customerId: string; issue: string; category: string; priority: "High" | "Medium" | "Low"; status: Status; updated: string; channel: Channel; assignee: string; messages: Message[]; events: AuditEvent[]; investigation: Investigation; escalation?: Escalation; resolution?: Resolution }
export interface TranscriptSegment { id: string; speaker: Speaker; name: string; timestamp: string; text: string; handoff?: boolean }
export interface CallSummaryData { issue: string; findings: string; actions: string[]; outcome: string; followups: string[] }
export interface CallSession { id: string; ticketId: string; customerId: string; channel: "call" | "phone"; startedAt: string; endedAt: string; duration: string; status: "Completed" | "Unavailable"; agent: string; team: string; reason: string; segments: TranscriptSegment[]; summary: CallSummaryData; transcriptReady: boolean; summaryReady: boolean }
export interface DemoState { tickets: Ticket[]; calls: CallSession[] }
