"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, PhoneOff, Play, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { retrySessionAction } from "@/actions/session";
import { cn } from "@/lib/utils";

interface VoiceSessionProps {
  sessionId: string;
  sessionType: string;
  sessionStartedAt: Date | string;
  isExpired: boolean;
}

interface TranscriptMessage {
  role: "interviewer" | "candidate";
  content: string;
}

export default function VoiceSession({
  sessionId,
  sessionType,
  sessionStartedAt,
  isExpired,
}: VoiceSessionProps) {
  const router = useRouter();
  const vapiRef = useRef<Vapi | null>(null);

  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ending" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? null : "Vapi public key is not configured in environment variables."
  );
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [prevCallStatus, setPrevCallStatus] = useState(callStatus);
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [hasExpired, setHasExpired] = useState(isExpired);
  const [isRetrying, setIsRetrying] = useState(false);

  if (callStatus !== prevCallStatus) {
    setPrevCallStatus(callStatus);
    if (callStatus === "active") {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  }

  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);

  const transcriptRef = useRef<TranscriptMessage[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const handleCallEnd = useCallback(async (finalTranscript: TranscriptMessage[]) => {
    try {
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: finalTranscript }),
      });

      // Fire and forget feedback generation in background to pre-warm the LLM report
      fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
      }).catch(console.error);

      toast.success("Interview finished! Preparing evaluation report...");
      setTimeout(() => {
        router.push(`/interview/${sessionId}/report`);
      }, 2000);
    } catch (err) {
      console.error("Error saving transcript:", err);
      toast.error("Failed to save transcript records.");
    }
  }, [sessionId, router]);

  const startCall = useCallback(async () => {
    setError(null);
    setActiveSeconds(0);
    setCallStatus("connecting");
    try {
      const response = await fetch(`/api/sessions/${sessionId}/start`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to start session. Please try again.");
      }
      const data = await response.json();
      const assistantOverrides = data.assistantOverrides;

      if (vapiRef.current) {
        vapiRef.current.start(assistantOverrides);
      } else {
        throw new Error("Voice client not initialized.");
      }
    } catch (err) {
      console.error("Start call error caught:", err);
      const errorMsg = err instanceof Error 
        ? err.message 
        : typeof err === "string" 
        ? err 
        : JSON.stringify(err);
      setError(errorMsg);
      setCallStatus("idle");
    }
  }, [sessionId]);

  const endCall = useCallback(() => {
    setCallStatus("ending");
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      const nextMute = !isMuted;
      vapiRef.current.setMuted(nextMute);
      setIsMuted(nextMute);
    }
  }, [isMuted]);

  // Fade hint out 5 seconds after call becomes active or key is pressed
  useEffect(() => {
    if (callStatus !== "active") return;
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [callStatus, lastKeyTime]);

  // Keydown listener to show hint again on any keyboard event
  useEffect(() => {
    if (callStatus !== "active") return;
    const handleKeyDown = () => {
      setLastKeyTime(Date.now());
      setShowHint(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callStatus]);

  // Scoped Voice Session Keyboard Shortcuts Bindings
  useKeyboardShortcuts(
    {
      Escape: () => {
        setIsConfirmOpen(true);
      },
      " ": () => {
        toggleMute();
      },
      m: () => {
        toggleMute();
      },
      M: () => {
        toggleMute();
      },
    },
    callStatus === "active"
  );
  // Check if session has expired (30-minute threshold)
  useEffect(() => {
    if (isExpired) return;
    const checkExpired = () => {
      const createdTime = new Date(sessionStartedAt).getTime();
      const now = Date.now();
      if (callStatus === "idle" && now - createdTime > 30 * 60 * 1000) {
        setHasExpired(true);
      }
    };
    checkExpired();
    const interval = setInterval(checkExpired, 10000);
    return () => clearInterval(interval);
  }, [isExpired, sessionStartedAt, callStatus]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const result = await retrySessionAction(sessionId);
      if (result.success && result.newSessionId) {
        toast.success("New session created. Redirecting...");
        router.push(`/interview/${result.newSessionId}`);
      } else {
        toast.error(result.error || "Failed to retry session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to retry session.");
    } finally {
      setIsRetrying(false);
    }
  }, [sessionId, router]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Keep ref up to date to avoid stale closures in listeners
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Active call timer
  useEffect(() => {
    if (callStatus !== "active") return;
    const interval = setInterval(() => {
      setActiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  // Initialize Vapi client on mount
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) return;

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setCallStatus("active");
      setError(null);
    });

    vapi.on("call-end", () => {
      setCallStatus("ended");
      handleCallEnd(transcriptRef.current);
    });

    vapi.on("speech-start", () => {
      setIsAiSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setIsAiSpeaking(false);
    });

    vapi.on("volume-level", (level: number) => {
      // Animate candidate orb scale based on voice audio volume level when AI is quiet
      if (level > 0.06) {
        setIsCandidateSpeaking(true);
      } else {
        setIsCandidateSpeaking(false);
      }
    });

    vapi.on("message", (message: { type: string; role?: string; transcriptType?: string; transcript?: string }) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "assistant" ? "interviewer" : "candidate";
        const content = (message.transcript || "").trim();
        if (!content) return;

        setTranscript((prev) => {
          if (prev.length === 0) {
            return [{ role, content }];
          }
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.role === role) {
            const updatedLastMsg = {
              ...lastMsg,
              content: lastMsg.content.endsWith(" ")
                ? `${lastMsg.content}${content}`
                : `${lastMsg.content} ${content}`,
            };
            return [...prev.slice(0, -1), updatedLastMsg];
          } else {
            return [...prev, { role, content }];
          }
        });

        // Persist immediately
        fetch(`/api/sessions/${sessionId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, content }),
        }).catch(console.error);
      }
    });

    vapi.on("error", (e: unknown) => {
      console.error("Vapi error occurred:", e);
      const err = e as { message?: string; error?: string | { message?: string } } | null | undefined;
      let errorMsg = "An error occurred with the voice connection.";
      if (typeof e === "string") {
        errorMsg = e;
      } else if (err) {
        if (typeof err.error === "string") {
          errorMsg = err.message || err.error;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        } else {
          errorMsg = JSON.stringify(e);
        }
      }
      setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
      setCallStatus("idle");
    });

    return () => {
      vapi.stop();
      vapiRef.current = null;
    };
  }, [handleCallEnd, sessionId]);

  const isIdle = callStatus === "idle";
  const isConnecting = callStatus === "connecting";
  const isActive = callStatus === "active";
  const isEndingOrEnded = callStatus === "ending" || callStatus === "ended";

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">
      {/* Dynamic Keyframes injection for speaking animations */}
      <style jsx global>{`
        @keyframes pulse-ai-glow {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 135, 0.4), 0 0 20px rgba(0, 255, 135, 0.2);
          }
          70% {
            transform: scale(1.08);
            box-shadow: 0 0 0 24px rgba(0, 255, 135, 0), 0 0 40px rgba(0, 255, 135, 0.4);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 135, 0), 0 0 20px rgba(0, 255, 135, 0.2);
          }
        }
        @keyframes pulse-user-glow {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 135, 0.3), 0 0 15px rgba(0, 255, 135, 0.15);
          }
          70% {
            transform: scale(1.04);
            box-shadow: 0 0 0 16px rgba(0, 255, 135, 0), 0 0 30px rgba(0, 255, 135, 0.3);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 135, 0), 0 0 15px rgba(0, 255, 135, 0.15);
          }
        }
        @keyframes breathe-glow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
            Live Session
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
            {sessionType.replace(/([A-Z])/g, " $1").trim()} Interview
          </h1>
        </div>
        {isActive && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-sm rounded-lg shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{formatTime(activeSeconds)}</span>
          </div>
        )}
      </div>

      {/* Error Alert Box */}
      {error && !hasExpired && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-1 flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button size="sm" variant="outline" className="h-8 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400" onClick={startCall}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasExpired ? (
        /* Expired state UI */
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-6">
          <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-[#F59E0B] mb-2 animate-bounce duration-1000">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">This session has expired</h2>
            <p className="text-zinc-400 text-sm">
              The previous session was interrupted or timed out. Start a new session to continue practicing.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Center Interactive Orb Animation */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="relative flex items-center justify-center h-48 w-48 md:h-60 md:w-60">
              {/* Concentric Glowing Rings */}
              {/* Ring 3 (Outer) */}
              <div
                className={cn(
                  "absolute inset-[-30px] rounded-full border border-[#00FF87]/10 transition-all duration-500",
                  isAiSpeaking && "animate-[pulse_1.5s_infinite] border-[#00FF87]/20 scale-105",
                  isCandidateSpeaking && "animate-[pulse_1s_infinite] border-[#00FF87]/20 scale-105"
                )}
              />
              {/* Ring 2 (Middle) */}
              <div
                className={cn(
                  "absolute inset-[-15px] rounded-full border border-[#00FF87]/35 transition-all duration-500 shadow-[0_0_20px_rgba(0,255,135,0.05)]",
                  isAiSpeaking && "animate-[pulse_1.2s_infinite] border-[#00FF87]/50 scale-105",
                  isCandidateSpeaking && "animate-[pulse_0.8s_infinite] border-[#00FF87]/50 scale-105"
                )}
              />
              {/* Ring 1 (Inner) */}
              <div
                className={cn(
                  "absolute inset-[-2px] rounded-full border border-[#00FF87]/65 transition-all duration-500 shadow-[0_0_30px_rgba(0,255,135,0.15)]",
                  isAiSpeaking && "scale-108 border-[#00FF87]",
                  isCandidateSpeaking && "scale-104 border-[#00FF87]"
                )}
              />

              {/* Solid green core disk */}
              <div
                className={cn(
                  "absolute h-24 w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(0,255,135,0.35),inset_0_4px_16px_rgba(255,255,255,0.45)] border border-[#00FF87]/50",
                  isAiSpeaking && "scale-108 bg-[#00FF87] text-black",
                  isCandidateSpeaking && "scale-104 bg-[#00FF87] text-black",
                  isActive && !isAiSpeaking && !isCandidateSpeaking && "bg-[#00FF87] text-black",
                  !isActive && "bg-zinc-900 text-zinc-500 shadow-none border-[#1A1A1A]"
                )}
              >
                {/* Flat text overlay */}
                <div className="flex flex-col items-center justify-center">
                  {isConnecting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                  ) : isAiSpeaking ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-6 bg-black rounded-full animate-[pulse_1s_infinite_100ms]" />
                      <span className="w-1.5 h-8 bg-black rounded-full animate-[pulse_1s_infinite_300ms]" />
                      <span className="w-1.5 h-6 bg-black rounded-full animate-[pulse_1s_infinite_500ms]" />
                    </div>
                  ) : isCandidateSpeaking ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-5 bg-black rounded-full animate-[pulse_0.8s_infinite_100ms]" />
                      <span className="w-1.5 h-7 bg-black rounded-full animate-[pulse_0.8s_infinite_200ms]" />
                      <span className="w-1.5 h-5 bg-black rounded-full animate-[pulse_0.8s_infinite_300ms]" />
                    </div>
                  ) : (
                    <span className={cn("text-[10px] font-bold tracking-widest uppercase font-mono", isActive ? "text-black" : "text-zinc-500")}>
                      {callStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isActive && !isConnecting && !isEndingOrEnded && (
              <p className="text-sm text-zinc-400 mt-4">
                Click Start below to begin your voice practice session
              </p>
            )}
          </div>

          {/* Transcript Log Container */}
          {(isActive || transcript.length > 0) && (
            <div className="h-64 border border-[#1A1A1A] bg-[#0A0A0A] rounded-xl flex flex-col shadow-inner">
              <div className="px-4 py-2.5 border-b border-[#1A1A1A] text-xs font-semibold uppercase tracking-wider text-[#888888]">
                Real-time Transcript
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {transcript.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-zinc-400/60 italic">
                    Awaiting first question from interviewer...
                  </div>
                ) : (
                  transcript.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[80%] ${
                        msg.role === "interviewer" ? "mr-auto items-start" : "ml-auto items-end"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">
                        {msg.role === "interviewer" ? "AI Interviewer" : "You"}
                      </span>
                      <div
                        className={`px-3 py-2 text-sm rounded-lg shadow-sm ${
                          msg.role === "interviewer"
                            ? "bg-[#111111] text-white rounded-tl-none border border-[#1A1A1A]"
                            : "bg-[rgba(0,255,135,0.06)] border border-[#00FF87]/15 text-white rounded-tr-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Keyboard Shortcuts Hint Bar */}
      {!hasExpired && callStatus === "active" && (
        <div
          className={cn(
            "text-center text-xs text-zinc-500 transition-opacity duration-500 my-2",
            showHint ? "opacity-100" : "opacity-0"
          )}
        >
          <kbd className="bg-[#111111] border border-[#1A1A1A] rounded-sm px-1.5 py-0.5 font-mono text-zinc-400 text-[10px]">
            Space
          </kbd>{" "}
          to mute &middot;{" "}
          <kbd className="bg-[#111111] border border-[#1A1A1A] rounded-sm px-1.5 py-0.5 font-mono text-zinc-400 text-[10px]">
            M
          </kbd>{" "}
          to mute &middot;{" "}
          <kbd className="bg-[#111111] border border-[#1A1A1A] rounded-sm px-1.5 py-0.5 font-mono text-zinc-400 text-[10px]">
            Esc
          </kbd>{" "}
          to end
        </div>
      )}

      {/* Bottom Control Actions */}
      <div className="flex items-center justify-center pt-2">
        {hasExpired ? (
          <div className="flex items-center justify-center gap-4 w-full max-w-sm">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 py-4 rounded-lg font-bold shadow-lg shadow-[#00FF87]/15 bg-[#00FF87] hover:bg-[#00FF87]/90 text-black cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  Creating new session...
                </>
              ) : (
                "Retry Interview"
              )}
            </Button>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1 py-4 rounded-lg font-semibold border-[#1A1A1A] hover:bg-zinc-900 text-zinc-300 flex items-center justify-center text-xs"
              )}
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {isIdle && (
              <Button
                onClick={startCall}
                size="lg"
                className="w-full max-w-xs bg-[#00FF87] hover:bg-[#00FF87]/90 text-black py-4 rounded-lg font-bold shadow-lg shadow-[#00FF87]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Play className="h-4.5 w-4.5 fill-current" />
                Start Interview
              </Button>
            )}

            {isConnecting && (
              <Button
                disabled
                size="lg"
                className="w-full max-w-xs bg-zinc-900 border border-[#1A1A1A] text-zinc-500 py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"
              >
                <Loader2 className="h-4.5 w-4.5 animate-spin text-zinc-600" />
                Connecting...
              </Button>
            )}

            {isActive && (
              <div className="flex items-center justify-center gap-4 w-full max-w-sm">
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="lg"
                  className={`flex-grow flex items-center justify-center gap-1.5 py-4 rounded-lg font-semibold border-[#1A1A1A] active:scale-[0.98] transition-all text-xs cursor-pointer ${
                    isMuted
                      ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                      : "bg-[#111111] hover:bg-zinc-900 text-white"
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isMuted ? "Muted" : "Mute"}
                </Button>
                <Button
                  onClick={() => setIsConfirmOpen(true)}
                  variant="destructive"
                  size="lg"
                  className="flex-grow flex items-center justify-center gap-1.5 py-4 rounded-lg font-bold active:scale-[0.98] transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs cursor-pointer"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </Button>
              </div>
            )}

            {isEndingOrEnded && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  <span>Generating your feedback report...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* End Interview Confirmation AlertDialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-50 max-w-sm md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg">
              End this interview?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
              The session will be saved and your feedback report will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsConfirmOpen(false);
                endCall();
              }}
              className="bg-red-600 hover:bg-red-500 text-white border-transparent"
            >
              End Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
