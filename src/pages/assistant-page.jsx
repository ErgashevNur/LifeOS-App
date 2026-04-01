import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function AssistantPage() {
  const { data, actions } = useLifeOSData();
  const [prompt, setPrompt] = useState("");
  const quickPrompts = data.content.assistant.quickPrompts;

  const sendPrompt = (text) => {
    actions.sendAssistantPrompt(text);
    setPrompt("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">AI Yordamchi</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">OpenAI-ready</Badge>
            <Button variant="outline" onClick={actions.clearAssistantMessages}>
              <Trash2 className="h-4 w-4" />
              Xabarlarni tozalash
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[430px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {data.assistant.messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "mr-10 rounded-lg border border-slate-300 bg-white p-3 text-sm"
                    : "ml-10 rounded-lg border border-slate-900 bg-slate-900 p-3 text-sm text-white"
                }
              >
                <p className="mb-1 text-[11px] tracking-[0.12em] uppercase opacity-70">
                  {message.role === "assistant" ? "AI" : "Siz"}
                </p>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => sendPrompt(item)}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:border-slate-900"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Savol yozing..."
              className="h-11"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendPrompt(prompt);
                }
              }}
            />
            <Button onClick={() => sendPrompt(prompt)} className="h-11">
              Yuborish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
