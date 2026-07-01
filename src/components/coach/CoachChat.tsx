"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface CoachChatProps {
  sessionId: string;
  initialContext: {
    interviewType: string;
    overallScore: number;
    candidateName: string | null;
  };
  className?: string;
}

const SUGGESTIONS = [
  "Why did I score low on structure?",
  "How could I improve my weakest answer?",
  "What should I practice before my next interview?",
];

export default function CoachChat({ sessionId, initialContext, className }: CoachChatProps) {

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const formattedType = initialContext.interviewType.replace(/([A-Z])/g, " $1").trim();
    return [
      {
        id: "greeting",
        role: "assistant",
        content: `Hi ${
          initialContext.candidateName || "there"
        }! I've reviewed your ${formattedType} interview where you scored ${initialContext.overallScore}/10 overall. What would you like to work on or understand better about your performance?`,
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    const userMsg: ChatMessage = {
      id: `msg-user-${messages.length}`,
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Map ChatMessage structure to get clean payload of role/content for Groq history
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`/api/sessions/${sessionId}/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          chatHistory,
        }),
      });

      if (!res.ok) {
        throw new Error("Coach API responded with an error.");
      }

      const data = await res.json();
      const coachMsg: ChatMessage = {
        id: `msg-coach-${messages.length + 1}`,
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      setError("Coach is unavailable. Please try again.");
      toast.error("Coach unavailable, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasSentUserMessage = messages.some((m) => m.role === "user");

  return (
    <div className={cn("w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl flex flex-col h-[420px] shadow-lg overflow-hidden", className)}>
      
      {/* Card Header */}
      <div className="px-4 py-3 bg-[#0D0D0D] border-b border-[#1A1A1A] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold text-white">Interview Coach</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
          Powered by AI &bull; Based on your transcript
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col min-h-0 bg-[#070707]/30">
        {messages.map((msg) => {
          const isCoach = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] space-y-1.5",
                isCoach ? "mr-auto items-start" : "ml-auto items-end"
              )}
            >
              {/* Header Label */}
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wider uppercase",
                  isCoach ? "text-emerald-500/80" : "text-zinc-500"
                )}
              >
                {isCoach ? "Coach" : "You"}
              </span>

              {/* Message Content Bubble */}
              <div className="flex items-start space-x-2">
                {isCoach && (
                  <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-emerald-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg text-sm leading-relaxed break-words",
                    isCoach
                      ? "bg-[#111111] border border-[#1A1A1A] text-white rounded-tl-none"
                      : "bg-[rgba(0,255,135,0.06)] border border-[#00FF87]/15 text-white rounded-tr-none"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex flex-col max-w-[85%] space-y-1.5 mr-auto items-start">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-500/80">
              Coach
            </span>
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="bg-[#111111] border border-[#1A1A1A] p-3 rounded-lg rounded-tl-none flex items-center space-x-2 shadow-inner">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Pills */}
        {!hasSentUserMessage && messages.length > 0 && (
          <div className="pt-2 pl-9 space-y-1.5 max-w-sm">
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-1">
              Suggestions:
            </div>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-xs bg-[#111111] hover:bg-[#1A1A1A] text-zinc-400 hover:text-white px-3 py-2 rounded-lg border border-[#1A1A1A] cursor-pointer transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Area */}
      <div className="px-4 py-3 border-t border-[#1A1A1A] bg-[#0A0A0A] shrink-0 space-y-2">
        {/* Error Alert inside coach container */}
        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/5 text-red-400 py-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </div>
            <button
              onClick={() => {
                setError(null);
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                if (lastUser) {
                  handleSend(lastUser.content);
                }
              }}
              className="text-xs text-red-400 underline font-semibold cursor-pointer hover:text-red-300"
            >
              Retry
            </button>
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center space-x-2"
        >
          <Input
            disabled={isLoading}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your coach anything about this interview..."
            className="flex-1 bg-[#111111] border-[#1A1A1A] focus-visible:ring-emerald-500 text-zinc-100 placeholder-zinc-600 text-xs h-10 rounded-lg"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 h-10 w-10 rounded-lg cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </form>
      </div>

    </div>
  );
}
