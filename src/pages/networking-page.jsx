import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Search, Send, UserPlus, UserCheck, Users, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";

function initialsFromName(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function avatarFromName(name) {
  const initials = initialsFromName(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='%23e0e7ff'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='34' font-weight='900' fill='%234f46e5' font-family='Inter, sans-serif'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function NetworkingPage() {
  const { data, actions } = useLifeOSData();
  const [query, setQuery] = useState("");
  const [draftMessage, setDraftMessage] = useState({});

  const filteredPeople = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) {
      return data.network.people;
    }

    return data.network.people.filter(
      (person) =>
        person.name.toLowerCase().includes(text) ||
        person.job.toLowerCase().includes(text) ||
        person.skill.toLowerCase().includes(text),
    );
  }, [data.network.people, query]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Foydalanuvchi yoki kasb bo'yicha qidiring..."
          className="h-16 w-full pl-14 pr-6 rounded-[2rem] border-0 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 bg-white font-medium text-lg text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
        />
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeople.map((person) => {
          const isConnected = data.network.connectedIds.includes(person.id);
          const latestMessage = data.network.messageLog[person.id]?.[0] ?? null;

          return (
            <Card key={person.id} className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden hover:-translate-y-1 transition-all duration-300">
              <CardContent className="space-y-6 pt-8 pb-8 px-8">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarFromName(person.name)}
                    alt={person.name}
                    className="h-16 w-16 rounded-full border-0 shadow-md ring-2 ring-white object-cover"
                  />
                  <div>
                    <p className="font-extrabold text-xl text-slate-900 line-clamp-1">{person.name}</p>
                    <p className="text-sm font-bold text-slate-400 mt-0.5">{person.job}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-0 bg-orange-50 text-orange-600 shadow-none">
                    Streak: {person.streak}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-0 bg-indigo-50 text-indigo-600 shadow-none">
                    Do'stlar: {person.mutualFriends}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-0 bg-slate-100 text-slate-600 shadow-none">
                    {person.skill}
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button
                    className={cn(
                      "flex-1 rounded-2xl h-12 font-bold shadow-md transition-transform active:scale-95 group",
                      isConnected 
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-none" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                    )}
                    onClick={() => actions.toggleConnection(person.id)}
                  >
                    {isConnected ? (
                      <><UserCheck className="h-4 w-4 mr-2" />Ulangan</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />Ulash</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-12 font-bold bg-white hover:bg-slate-50 border-0 ring-1 ring-slate-200 text-slate-600 transition-transform active:scale-95"
                    onClick={() => {
                      const text = (draftMessage[person.id] ?? "").trim();
                      if(!text) return;
                      actions.sendNetworkMessage(person.id, text);
                      setDraftMessage((prev) => ({ ...prev, [person.id]: "" }));
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Xabar
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    value={draftMessage[person.id] ?? ""}
                    onChange={(event) =>
                      setDraftMessage((prev) => ({
                        ...prev,
                        [person.id]: event.target.value,
                      }))
                    }
                    placeholder="Qisqa xabar..."
                    className="h-12 w-full rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 pr-12 font-medium"
                    onKeyDown={(event) => {
                       if(event.key === "Enter") {
                         event.preventDefault();
                         const text = (draftMessage[person.id] ?? "").trim();
                         if(!text) return;
                         actions.sendNetworkMessage(person.id, text);
                         setDraftMessage((prev) => ({ ...prev, [person.id]: "" }));
                       }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const text = (draftMessage[person.id] ?? "").trim();
                      if(!text) return;
                      actions.sendNetworkMessage(person.id, text);
                      setDraftMessage((prev) => ({ ...prev, [person.id]: "" }));
                    }}
                    className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Send className="h-4 w-4 transform -translate-y-px translate-x-px" />
                  </button>
                </div>

                {latestMessage ? (
                  <div className="rounded-2xl border-0 bg-indigo-50/50 p-4 relative overflow-hidden ring-1 ring-indigo-100 shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">So'nggi xabar</p>
                    <p className="text-sm font-medium text-slate-700 italic">"{latestMessage}"</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
