import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateInterviewerResponse,
  generateInterviewerResponseStream,
  shouldEndInterview,
  cleanResponse,
} from "@/services/conversationEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Extract messages and sessionId from Vapi metadata
    const messages = body.messages as Array<{
      role: string;
      content: string;
    }>;
    const sessionId = body.call?.metadata?.sessionId as string | undefined;

    // 2. Build context — fetch from DB if sessionId present, fall back to generic defaults
    let context = {
      interviewType: "Behavioral",
      candidateName: null as string | null,
      candidateRole: null as string | null,
      candidateExperience: null as string | null,
      messageCount: messages.length,
    };

    if (sessionId) {
      const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (session) {
        const capitalizedName = session.user.name
          ? session.user.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          : null;

        context = {
          interviewType: session.type,
          candidateName: capitalizedName,
          candidateRole: session.user.role,
          candidateExperience: session.user.experience,
          messageCount: messages.length,
        };
      }
    }

    // 3. Handle Streaming Response if requested by Vapi
    if (body.stream === true) {
      const encoder = new TextEncoder();
      let fullResponseText = "";

      const customStream = new ReadableStream({
        async start(controller) {
          try {
            const groqStream = await generateInterviewerResponseStream(messages, context);

            for await (const chunk of groqStream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                fullResponseText += content;
                // Only stream content that doesn't contain the end interview tag
                const cleanChunkContent = content.replace("[END_INTERVIEW]", "").trim();
                if (cleanChunkContent || !content.includes("[END_INTERVIEW]")) {
                  const data = {
                    id: `chatcmpl-${Date.now()}`,
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model: "custom-model",
                    choices: [
                      {
                        index: 0,
                        delta: {
                          role: "assistant",
                          content: cleanChunkContent,
                        },
                        finish_reason: null,
                      },
                    ],
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                }
              }
            }

            const shouldEnd = shouldEndInterview(fullResponseText);
            if (shouldEnd && sessionId) {
              prisma.interviewSession
                .update({
                  where: { id: sessionId },
                  data: { status: "completing" },
                })
                .catch(console.error);
            }

            // Stream final end-of-stream chunk
            const endData = {
              id: `chatcmpl-${Date.now()}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: "custom-model",
              choices: [
                {
                  index: 0,
                  delta: shouldEnd
                    ? {
                        function_call: {
                          name: "endCall",
                          arguments: "{}",
                        },
                      }
                    : {},
                  finish_reason: shouldEnd ? "function_call" : "stop",
                },
              ],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(endData)}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            console.error("Streaming error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // 4. Fallback to Non-Streaming Response
    const rawResponse = await generateInterviewerResponse(messages, context);
    const shouldEnd = shouldEndInterview(rawResponse);
    const cleanedResponse = cleanResponse(rawResponse);

    if (shouldEnd && sessionId) {
      prisma.interviewSession
        .update({
          where: { id: sessionId },
          data: { status: "completing" },
        })
        .catch(console.error);
    }

    return NextResponse.json({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "custom-model",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: cleanedResponse,
            ...(shouldEnd && {
              function_call: {
                name: "endCall",
                arguments: "{}",
              },
            }),
          },
          finish_reason: shouldEnd ? "function_call" : "stop",
        },
      ],
    });
  } catch (error) {
    console.error("Vapi webhook handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
