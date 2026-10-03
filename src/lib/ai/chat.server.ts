import { convertToModelMessages, type UIMessage } from "ai";
import { diseases, allEdges, getNextSteps } from "@/lib/atlas";
import { createResponsesCall } from "./responses.ts";
import { withLovableAiGatewayRunIdHeader } from "./run-id.ts";

export async function handleAtlasChat(request: Request) {
  try {
    const input = await request.json() as { messages?: UIMessage[]; conditionId?: string };
    const messages = input.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 80 || JSON.stringify(messages).length > 120000 || messages.some(m => !m || !["user", "assistant"].includes(m.role))) return Response.json({ error: "The conversation is too long or could not be read." }, { status: 400 });
    const latest = messages.at(-1);
    if (latest?.role !== "user" || !latest.parts?.some(p => p.type === "text" && p.text.trim())) return Response.json({ error: "Please enter a question." }, { status: 400 });
    const condition = diseases.find(d => d.id === input.conditionId);
    const partners = condition ? await getNextSteps(condition.id, "devon") : [];
    const relevantEdges = condition ? allEdges.filter(e => e.source === condition.id || e.target === condition.id) : [];
    const context = JSON.stringify({ condition: condition ? { name: condition.label, gene: condition.attributes.gene, description: condition.attributes.description } : null, connections: relevantEdges.map(e => ({ explanation: e.plain_explanation, evidence: e.evidence_type, source: e.source_name, contradicted: e.contradicted_by.length > 0, negated: e.negated })), partners: partners.map(p => ({ name: p.name, region: p.region, approach: p.approach, status: p.stage, source: p.sourceUrl })) });
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return Response.json({ error: "The assistant is not configured yet." }, { status: 503 });
    const { result, runIdFetch } = createResponsesCall(request, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, model: "openai/gpt-6-astra" }, await convertToModelMessages(messages), `You are the Rare Disease Atlas evidence guide for people with no medical background. Answer briefly in everyday language. Explain words as you use them. Current atlas context: ${context}. This atlas uses ILLUSTRATIVE mock biological links, NOT verified citations. Named partner leads have public source URLs but statuses may change. Never present a mock relationship, confidence score, study, contact or treatment as verified or approved. A link between diseases does not mean a treatment transfers. Cite partner source URLs only when present; say when a source is missing. For information outside this context, say you cannot verify it here rather than invent. Do not diagnose or advise treatment; encourage questions for a care team. Do not ask for or repeat personal health or genetic report details. If asked about specific organizations, describe only those present in the context and point to the profile page for outreach.`);
    const stream = result.toUIMessageStreamResponse({ originalMessages: messages, sendReasoning: false, onError: error => error instanceof Error ? error.message : "The assistant could not finish the answer." });
    return withLovableAiGatewayRunIdHeader(stream, runIdFetch);
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    console.error("Atlas chat error", error);
    return Response.json({ error: "The assistant could not answer right now. Please try again." }, { status: 500 });
  }
}
