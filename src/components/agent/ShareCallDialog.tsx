import { useState } from "react";
import { Check, FileText, Link2, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { CallSession } from "@/lib/types";

const SECTIONS = ["Call details", "Transcript", "AI summary", "Follow-up actions"];

export default function ShareCallDialog({ call }: { call: CallSession }) {
  const [sections, setSections] = useState(["Call details", "Transcript", "AI summary"]);
  const [team, setTeam] = useState("Payments Support");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><Users className="size-4" />Share with team</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="icon-box mb-3"><LockKeyhole className="size-4" /></div>
          <DialogTitle className="display">Share the full picture.</DialogTitle>
          <DialogDescription>Prepare a private call report for authorized teammates. Sharing is a UI preview, not a live service.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] p-3">
          <FileText className="size-4 text-primary" />
          <div>
            <p className="text-xs font-medium">Call report · {call.id}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Ticket {call.ticketId} · {call.duration}</p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-xs font-medium">Include in this report</legend>
          <div className="space-y-3">
            {SECTIONS.map((s) => (
              <label className="flex cursor-pointer items-center gap-2 text-xs" key={s}>
                <Checkbox checked={sections.includes(s)} onCheckedChange={(v) => setSections(v ? [...sections, s] : sections.filter((x) => x !== s))} />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="text-xs font-medium">
          Authorized team
          <select className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-card px-3 text-xs font-normal" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option>Payments Support</option>
            <option>Customer Operations</option>
            <option>Support Leads</option>
          </select>
        </label>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-primary"><ShieldCheck className="size-4" />Only authorized teammates</p>
          <p className="mt-2 text-[11px] leading-6 text-muted-foreground">
            {sections.length} sections selected for {team}. The backend must verify every recipient’s access before a private link can be created or opened.
          </p>
        </div>

        <Button disabled className="w-full"><Link2 className="size-4" />Create private link — not connected</Button>
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"><Check className="size-3" />No link created. No report has been shared.</p>
      </DialogContent>
    </Dialog>
  );
}
