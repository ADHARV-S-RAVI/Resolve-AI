import { useEffect, useRef, useState } from "react";
import { AudioLines, FileText, Paperclip, Send, Sparkles, UserRound, X } from "lucide-react";
import type { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function Conversation({ messages, onSend, agent = false }: { messages: Message[]; onSend: (text: string) => void; agent?: boolean }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [messages.length]);

  function submit() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="flex min-h-[440px] flex-col">
      <div className="max-h-[560px] min-h-[260px] flex-1 space-y-6 overflow-y-auto p-5 sm:p-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm py-10 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-primary"><Sparkles className="size-5" /></span>
            <h2 className="display mt-5 text-lg font-semibold">Let’s understand what happened.</h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">This is a sample conversation, not live AI. Choose a demo scenario below, or describe your issue.</p>
            <div className="mt-5 space-y-2">
              {["My payment was deducted twice, but my order is cancelled.", "My refund is missing after cancellation."].map((t) => (
                <button key={t} onClick={() => setText(t)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-left text-xs transition-colors hover:border-primary/40 hover:bg-white/[0.05]">{t}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.speaker === "Customer" ? "flex-row-reverse" : ""}`}>
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${m.speaker === "Customer" ? "bg-white/[0.06] text-muted-foreground" : "bg-gradient-to-br from-sky-400 to-indigo-500 text-white"}`}>
              {m.speaker === "ResolveAI" ? <Sparkles className="size-3" /> : <UserRound className="size-3" />}
            </span>
            <div className="min-w-0 max-w-[85%]">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px]">
                <span className="font-medium">{m.speaker === "Customer" ? (agent ? "Customer" : "You") : m.speaker}</span>
                <span className="text-muted-foreground">{m.time}</span>
                {m.channel !== "chat" && <span className="inline-flex items-center gap-1 text-primary"><AudioLines className="size-2.5" />{m.channel}</span>}
              </div>
              <p className={`break-words rounded-2xl p-3.5 text-xs leading-6 ${m.speaker === "Customer" ? "rounded-tr-sm border border-sky-400/20 bg-sky-500/[0.12] text-sky-50" : "rounded-tl-sm border border-white/[0.06] bg-white/[0.05] text-white/80"}`}>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form className="border-t border-white/[0.07] p-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span key={`${f.name}-${i}`} className="flex max-w-full items-center gap-2 rounded-lg bg-white/[0.06] px-2 py-1 text-[10px]">
                <FileText className="size-3" />
                <span className="max-w-[150px] truncate">{f.name}</span>
                <span className="text-muted-foreground">Not uploaded</span>
                <button type="button" className="p-2" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => i !== j))}><X className="size-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
          <textarea
            aria-label={agent ? "Agent reply" : "Message"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={agent ? "Reply with the full context in mind…" : "Tell us what happened…"}
            rows={2}
            maxLength={3000}
            className="w-full resize-none bg-transparent text-xs leading-6 outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input ref={picker} type="file" multiple accept="image/*,.pdf,.txt" className="hidden" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files || [])]); e.target.value = ""; }} />
              <button type="button" aria-label="Attach local details" title="Preview local files; uploads not connected" onClick={() => picker.current?.click()} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/[0.06]"><Paperclip className="size-4" /></button>
              <span className="hidden text-[9px] text-muted-foreground sm:inline">Enter to send · Shift + Enter for a new line</span>
            </div>
            <Button size="sm" type="submit" disabled={!text.trim()} aria-label="Send message"><Send className="size-3" /><span className="hidden sm:inline">Send</span></Button>
          </div>
        </div>
        <p className="mt-2 text-center text-[9px] text-muted-foreground">Please don’t include personal or sensitive information.</p>
      </form>
    </div>
  );
}
