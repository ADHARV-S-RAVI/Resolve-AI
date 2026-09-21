import { Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PhoneSupport({ ticketId }: { ticketId?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Phone className="size-4" />Call support</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phone support</DialogTitle>
          <DialogDescription>Phone support is not connected in this UI demo. Your support number and voice provider will be added during backend integration.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-secondary/60 p-4 text-sm text-secondary-foreground">
          <ShieldCheck className="size-5 shrink-0" />
          <span>{ticketId ? `Case ${ticketId} stays with your conversation.` : "Your call will connect to the same complaint as your chat."}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
