import { useEffect, useRef, useState } from "react";
import { AudioLines, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo/store";
import { useSearchParams } from "react-router-dom";

interface VoiceWidgetProps {
  ticketId?: string;
  inline?: boolean;
}

export default function VoiceWidget({
  ticketId,
  inline = false,
}: VoiceWidgetProps) {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const processingRef = useRef(false);

  const { state, send, createTicket } = useDemo();
  const [, setParams] = useSearchParams();

  const ticket = state.tickets.find(
    (t) => t.id === ticketId,
  );

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: typeof window.SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const text =
          event.results[i][0]?.transcript ?? "";

        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (interimText) {
        setTranscript(interimText);
      }

      if (finalText.trim() && !processingRef.current) {
        const cleanText = finalText.trim();

        setTranscript(cleanText);
        processingRef.current = true;

        recognition.stop();
        setIsListening(false);

        handleSend(cleanText);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (
      event: SpeechRecognitionErrorEvent,
    ) => {
      console.error(
        "Speech recognition error:",
        event?.error,
      );

      setIsListening(false);
      processingRef.current = false;

      if (event?.error === "not-allowed") {
        setTranscript(
          "Microphone permission was denied.",
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };

    // This effect intentionally recreates recognition when the ticket changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setTranscript(
        "Speech recognition is not supported in this browser.",
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    window.speechSynthesis.cancel();

    setTranscript("");
    processingRef.current = false;

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error,
      );
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) {
      processingRef.current = false;
      return;
    }

    setIsProcessing(true);

    const id = ticketId || createTicket();

    if (!ticketId) {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("ticket", id);
        return next;
      });
    }

    send(id, text, false, (reply) => {
      setIsProcessing(false);
      processingRef.current = false;

      if (!reply) {
        return;
      }

      speak(reply);
    });
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsProcessing(false);
    };

    utterance.onerror = () => {
      setIsProcessing(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();

      setIsListening(false);
      setIsProcessing(false);
      setTranscript("");

      processingRef.current = false;

      window.speechSynthesis.cancel();
    }
  }, [open]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={inline ? "outline" : "default"}
        className={
          inline
            ? ""
            : "fixed bottom-5 right-5 z-20 gap-2 rounded-full border border-white/20 bg-white/[0.08] px-5 text-white shadow-[0_0_30px_-8px_rgba(120,170,255,0.7)] backdrop-blur hover:bg-white/[0.14]"
        }
      >
        <AudioLines className="size-4" />
        {inline
          ? "Talk to AI"
          : "Talk to ResolveAI"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-[390px] sm:fixed sm:bottom-5 sm:left-auto sm:right-5 sm:top-auto sm:translate-x-0 sm:translate-y-0">
          <DialogHeader>
            <DialogTitle className="display flex items-center gap-2 text-base">
              <AudioLines className="size-5 text-primary" />
              Voice Assistance
            </DialogTitle>

            <DialogDescription>
              Talk to ResolveAI using your browser
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-6 py-6">
            <div className="relative">
              {isListening && (
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 opacity-75" />
              )}

              <Button
                size="lg"
                variant={
                  isListening
                    ? "default"
                    : "secondary"
                }
                className="relative h-20 w-20 rounded-full"
                onClick={toggleListening}
                disabled={isProcessing}
              >
                {isListening ? (
                  <MicOff className="size-8" />
                ) : (
                  <Mic className="size-8" />
                )}
              </Button>
            </div>

            <div className="min-h-[40px] text-center">
              {isListening ? (
                <p className="text-sm text-primary">
                  {transcript || "Listening..."}
                </p>
              ) : isProcessing ? (
                <p className="text-sm text-primary">
                  ResolveAI is processing...
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tap the microphone to speak
                </p>
              )}
            </div>

            <div className="min-h-[80px] w-full rounded-xl bg-white/[0.05] p-4">
              <p className="mb-1 text-xs text-muted-foreground">
                Latest AI Response:
              </p>

              <p className="text-sm">
                {ticket?.messages
                  .slice()
                  .reverse()
                  .find(
                    (m) =>
                      m.speaker === "ResolveAI",
                  )?.text ??
                  "No response yet."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}