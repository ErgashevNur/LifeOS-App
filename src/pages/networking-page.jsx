import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
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
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='%230f172a'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='30' fill='white' font-family='Arial'>${initials}</text></svg>`;
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
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Foydalanuvchi yoki kasb bo'yicha qidiring..."
            className="h-11"
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPeople.map((person) => {
          const isConnected = data.network.connectedIds.includes(person.id);
          const latestMessage = data.network.messageLog[person.id]?.[0] ?? null;

          return (
            <Card key={person.id} className="border-slate-300">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarFromName(person.name)}
                    alt={person.name}
                    className="h-12 w-12 rounded-full border border-slate-900 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-sm text-slate-500">{person.job}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">Streak: {person.streak}</Badge>
                  <Badge variant="secondary">
                    Do'stlar: {person.mutualFriends}
                  </Badge>
                  <Badge variant="outline">{person.skill}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant={isConnected ? "outline" : "default"}
                    onClick={() => actions.toggleConnection(person.id)}
                  >
                    {isConnected ? "Ulangan" : "Ulash"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const text = (draftMessage[person.id] ?? "").trim();
                      actions.sendNetworkMessage(person.id, text);
                      setDraftMessage((prev) => ({ ...prev, [person.id]: "" }));
                    }}
                  >
                    Xabar
                  </Button>
                </div>

                <Input
                  value={draftMessage[person.id] ?? ""}
                  onChange={(event) =>
                    setDraftMessage((prev) => ({
                      ...prev,
                      [person.id]: event.target.value,
                    }))
                  }
                  placeholder="Qisqa xabar..."
                  className="h-10"
                />

                {latestMessage ? (
                  <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                    So'nggi xabar: {latestMessage}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
