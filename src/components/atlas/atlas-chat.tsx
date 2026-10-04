import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { listAtlasConversations, createAtlasConversation, getAtlasConversation } from "@/lib/atlas-chat.functions";
import { diseases } from "@/lib/atlas";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputTextarea, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { OpenAIAttribution } from "@/components/atlas/openai-attribution";

type Thread = { id: string; title: string; updatedAt: string };

export function AtlasChat({ threadId, diseaseId }: { threadId?: string; diseaseId: string }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(false);
  const [ready, setReady] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<UIMessage[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const condition = diseases.find((d) => d.id === diseaseId) ?? diseases[0];

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUser(Boolean(data.user)); setReady(true);
      if (data.user) {
        try { setThreads(await listAtlasConversations()); }
        catch { if (active) setError("Could not load saved conversations."); }
      }
    };
    void sync();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN" || event === "SIGNED_OUT") void sync(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user || !threadId) return;
    let active = true;
    setMessages(null); setError("");
    getAtlasConversation({ data: { id: threadId } }).then((result) => { if (active) setMessages(result.messages as unknown as UIMessage[]); }).catch(() => { if (active) setError("This conversation could not be opened."); });
    return () => { active = false; };
  }, [threadId, user]);

  async function newConversation() {
    setBusy(true); setError("");
    try {
      const result = await createAtlasConversation();
      const id = result.id;
      setThreads((current) => [{ id, title: "New conversation", updatedAt: new Date().toISOString() }, ...current]);
      await navigate({ to: "/chat/$threadId", params: { threadId: id }, search: { diseaseId } });
    } catch { setError("Could not create a conversation."); }
    finally { setBusy(false); }
  }

  async function signIn() {
    setSigningIn(true); setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) setError("Sign-in could not be completed.");
      else if (!result.redirected) setUser(true);
    } catch { setError("Sign-in could not be completed."); }
    finally { setSigningIn(false); }
  }

  return <div className="chat-workspace">
    <aside className="chat-thread-list"><div className="chat-thread-heading"><span className="eyebrow">ATLAS / CONVERSATIONS</span><Button type="button" variant="ghost" size="icon" title="New conversation" aria-label="New conversation" disabled={!user || busy} onClick={() => void newConversation()}><Plus size={17}/></Button></div><nav aria-label="Saved conversations">{threads.map((thread) => <Link key={thread.id} to="/chat/$threadId" params={{ threadId: thread.id }} search={{ diseaseId }} className={`chat-thread ${thread.id === threadId ? "active" : ""}`}>{thread.title}</Link>)}</nav></aside>
    <section className="chat-main"><div className="chat-main-heading"><div><Link to="/atlas/$id" params={{ id: diseaseId }} className="back-link"><ArrowLeft size={14}/> Back to chart</Link><h1>Atlas research guide</h1><p>{condition?.label ?? "Chart"} · illustrative records</p></div><OpenAIAttribution /></div>
      {!ready ? <div className="chat-empty">Loading conversations…</div> : !user ? <div className="chat-empty"><h2>Continue with your account</h2><p>Conversations are saved to your account.</p><Button onClick={() => void signIn()} disabled={signingIn}>{signingIn ? "Opening sign-in…" : "Continue with Google"}</Button></div> : !threadId ? <div className="chat-empty"><h2>Explore a connection</h2><Button onClick={() => void newConversation()} disabled={busy}><Plus size={16}/> New conversation</Button></div> : messages ? <ChatWindow key={threadId} threadId={threadId} diseaseId={diseaseId} initialMessages={messages} onAnswered={() => { void listAtlasConversations().then(setThreads).catch(() => {}); }}/>: <div className="chat-empty">{error || "Loading conversation…"}</div>}
      {error && <p className="chat-error" role="alert">{error}</p>}
    </section>
  </div>;
}

function ChatWindow({ threadId, diseaseId, initialMessages, onAnswered }: { threadId: string; diseaseId: string; initialMessages: UIMessage[]; onAnswered: () => void }) {
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId, messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat", body: { id: threadId, diseaseId }, headers: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
    } }),
    onFinish: () => { onAnswered(); input.current?.focus(); },
  });
  const active = status === "submitted" || status === "streaming";
  useEffect(() => { input.current?.focus(); }, [threadId, status]);
  return <div className="chat-dialog"><Conversation><ConversationContent>{messages.length === 0 && <div className="chat-intro"><MessageCircle size={24}/><h2>Ask about this chart</h2><p>Explore mechanisms, relationship lines, evidence levels or the selected condition.</p></div>}{messages.map((message) => <Message key={message.id} from={message.role}><MessageContent>{message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : part.type === "reasoning" ? <details key={index}><summary>Analysis</summary><p>{part.text}</p></details> : null)}</MessageContent></Message>)}{status === "submitted" && <div className="chat-waiting">Reviewing the chart…</div>}</ConversationContent><ConversationScrollButton/></Conversation>
    {error && <p className="chat-error" role="alert">{error.message}</p>}
    <div className="chat-composer"><PromptInput onSubmit={({ text: submitted }) => { if (!submitted.trim() || active) return; void sendMessage({ text: submitted.trim() }); setText(""); input.current?.focus(); }}><PromptInputBody><PromptInputTextarea ref={input} value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about a connection…" aria-label="Ask about this chart" /></PromptInputBody><PromptInputFooter><span>Illustrative research only · not medical advice</span><PromptInputSubmit status={status} disabled={!active && !text.trim()} onStop={stop}/></PromptInputFooter></PromptInput></div>
  </div>;
}