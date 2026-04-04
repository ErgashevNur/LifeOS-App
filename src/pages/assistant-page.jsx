import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Bot, Send, Trash2, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function AssistantPage() {
  const { data, actions } = useLifeOSData();
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef(null);
  const quickPrompts = data.content.assistant.quickPrompts;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data.assistant.messages]);

  const sendPrompt = (text) => {
    if (!text.trim()) return;
    actions.sendAssistantPrompt(text);
    setPrompt("");
  };

  return (
    <div className="h-full flex flex-col space-y-8 max-w-5xl mx-auto">
      <Card className="flex-1 flex flex-col border-0 shadow-2xl shadow-indigo-900/5 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-8 py-6 bg-white z-10 border-b border-slate-100/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight">AI Yordamchi</CardTitle>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Sizning shaxsiy ustozingiz</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-full px-4 py-1.5 text-[9px] uppercase font-black tracking-widest border-0 bg-indigo-50 text-indigo-600 shadow-none hidden sm:inline-flex">
              <Sparkles className="h-3 w-3 mr-1" />
              OpenAI Tayyor
            </Badge>
            <Button 
              variant="outline" 
              onClick={actions.clearAssistantMessages}
              className="rounded-xl h-11 px-4 font-bold bg-white shadow-sm ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-600 border-0 transition-all text-slate-500 group"
            >
              <Trash2 className="h-4 w-4 sm:mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Tozalash</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-8 bg-slate-50/30">
          <div className="flex-1 overflow-y-auto custom-scroll pr-4 space-y-6">
            {data.assistant.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                <Bot className="h-24 w-24 text-slate-400" />
                <p className="text-xl font-bold text-slate-500">Menga savol bering</p>
              </div>
            ) : (
              data.assistant.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === "assistant" ? "self-start items-start" : "self-end items-end ml-auto"
                  )}
                >
                  <p className="mb-2 text-[10px] tracking-[0.15em] font-black uppercase text-slate-400 ml-1">
                    {message.role === "assistant" ? "AI Yordamchi" : "Siz"}
                  </p>
                  <div
                    className={cn(
                      "p-5 text-[0.95rem] font-medium leading-relaxed shadow-sm",
                      message.role === "assistant"
                        ? "bg-white border border-slate-100 rounded-3xl rounded-tl-sm text-slate-700"
                        : "bg-slate-900 border border-slate-900 rounded-3xl rounded-tr-sm text-white shadow-md shadow-slate-900/10"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-8 space-y-4">
            {data.assistant.messages.length === 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
                {quickPrompts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendPrompt(item)}
                    className="rounded-xl bg-white border-0 ring-1 ring-slate-200 px-4 py-2.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:ring-indigo-200 hover:shadow-sm transition-all text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-center bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-2 border-0 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Savolingizni yozing..."
                className="h-14 border-0 bg-transparent px-4 font-medium text-slate-900 shadow-none focus-visible:ring-0 text-base"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendPrompt(prompt);
                  }
                }}
              />
              <Button 
                onClick={() => sendPrompt(prompt)} 
                className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 p-0 transition-transform hover:scale-105 ml-2 shrink-0 group"
              >
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
