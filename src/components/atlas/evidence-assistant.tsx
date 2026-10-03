import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { BookOpenText, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

const STORAGE_KEY = "rare-disease-atlas-conversation";
function readHistory(): UIMessage[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter(m => m && ["user", "assistant"].includes(m.role) && Array.isArray(m.parts)) : [];
  } catch { return []; }
}
export function EvidenceAssistant({ conditionId, conditionName, onClose }: { conditionId: string; conditionName: string; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const currentCondition = useRef(conditionId);
  currentCondition.current = conditionId;
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", prepareSendMessagesRequest: ({ messages }) => ({ body: { messages, conditionId: currentCondition.current } }) }), []);
  const { messages, setMessages, sendMessage, status, error, stop, clearError } = useChat({ id: "atlas-evidence-guide", transport, onFinish: ({ messages: completed }) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed)); } catch { /* Browser storage can be unavailable. */ } input.current?.focus(); } });
  useEffect(() => { setMessages(readHistory()); setReady(true); input.current?.focus(); }, [setMessages]);
  useEffect(() => { if (ready && messages.length && status !== "submitted" && status !== "streaming") { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* Storage is optional. */ } } }, [ready, messages, status]);
  const ask = (text: string) => { if (!text.trim() || status === "submitted" || status === "streaming") return; clearError(); void sendMessage({ text: text.trim() }); input.current?.focus(); };
  return <div className="assistant-backdrop" role="presentation" onClick={onClose}><section className="assistant-panel" role="dialog" aria-modal="true" aria-label="Ask about the atlas" onClick={e => e.stopPropagation()}>
    <header className="assistant-header"><div className="assistant-identity"><BookOpenText size={20}/><div><strong>Atlas evidence guide</strong><small>About {conditionName}</small></div></div><Button variant="ghost" size="icon" aria-label="Close questions" onClick={onClose}><X size={18}/></Button></header>
    <Conversation className="assistant-conversation"><ConversationContent className="gap-5 p-5">{messages.length === 0 && <div className="assistant-welcome"><h2>What would you like to understand?</h2><p>Ask about a connection, the evidence behind it, or who may be worth contacting.</p><div className="assistant-suggestions"><Button variant="outline" onClick={() => ask(`What connects ${conditionName} to the other conditions?`)}>What do the lines mean?</Button><Button variant="outline" onClick={() => ask(`What organizations are connected with ${conditionName}, and what is still uncertain?`)}>Who could I contact?</Button></div></div>}{messages.map(message => <Message from={message.role} key={message.id}><MessageContent>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null)}</MessageContent></Message>)}{status === "submitted" && <div className="assistant-waiting"><BookOpenText size={15}/><Shimmer>Looking at the available evidence…</Shimmer></div>}</ConversationContent><ConversationScrollButton /></Conversation>
    {error && <p className="assistant-error" role="alert">{error.message}</p>}
    <div className="assistant-compose"><PromptInput onSubmit={({ text }) => ask(text)}><PromptInputTextarea ref={input} aria-label="Ask a question" placeholder="Ask a question about the atlas…"/><PromptInputFooter><span className="assistant-privacy">Saved in this browser only</span><PromptInputSubmit status={status} onStop={stop}/></PromptInputFooter></PromptInput><p>Illustrative research, not medical advice. Check decisions with a care team.</p></div>
  </section></div>;
}
