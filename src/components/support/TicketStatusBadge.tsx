import { ArrowUpRight, Circle, CircleCheck, LoaderCircle } from "lucide-react";
import type { Status } from "@/lib/types";

const styles: Record<Status, string> = {
  Investigating: "status-investigating",
  "In Progress": "status-progress",
  Resolved: "status-resolved",
  Escalated: "status-escalated",
};

const icons = { Investigating: LoaderCircle, "In Progress": Circle, Resolved: CircleCheck, Escalated: ArrowUpRight };

export default function TicketStatusBadge({ status }: { status: Status }) {
  const Icon = icons[status];
  return (
    <span className={`pill whitespace-nowrap ${styles[status]}`}>
      <Icon className="size-3" />
      {status}
    </span>
  );
}
