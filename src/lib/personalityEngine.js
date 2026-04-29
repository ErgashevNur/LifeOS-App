// src/lib/personalityEngine.js

export const PERSONALITY_TYPES = {
  "morning-solo-growth":   { label: "Tinch o'suvchi",    emoji: "🌱", habits: ["meditation","journaling","reading","deep_work"]      },
  "morning-solo-result":   { label: "Samarali tong",     emoji: "⚡", habits: ["workout","cold_shower","planning","review"]          },
  "morning-social-growth": { label: "Ilhomli tong",      emoji: "🌟", habits: ["gratitude","learning","podcast","community"]         },
  "morning-social-result": { label: "Jamoat lideri",     emoji: "🏆", habits: ["standup","networking","challenge","accountability"]  },
  "evening-solo-growth":   { label: "Chuqur fikrlovchi", emoji: "🧠", habits: ["reflection","writing","reading","skill_practice"]    },
  "evening-solo-result":   { label: "Kechki samarali",   emoji: "🎯", habits: ["review","planning_tomorrow","fitness","coding"]      },
  "evening-social-growth": { label: "Guruh o'suvchi",    emoji: "🤝", habits: ["book_club","online_course","pair_workout","share"]   },
  "evening-social-result": { label: "Natija izlovchi",   emoji: "💪", habits: ["gym","competition","challenge","leaderboard"]        },
};

export function detectPersonality(answers) {
  const key = `${answers.energy}-${answers.social}-${answers.motivation}`;
  return key in PERSONALITY_TYPES ? key : "morning-solo-growth";
}

export function analyzeSocial(input) {
  const lower = input.toLowerCase();
  if (lower.match(/yolg'iz|o'zim|solo|individual|tinch|jim/)) return "solo";
  if (lower.match(/birgalikda|birov|do'st|jamoa|guruh|birga/)) return "social";
  return "solo";
}

export function analyzeMotivation(input) {
  const lower = input.toLowerCase();
  if (lower.match(/o'sish|rivojlan|bilib|o'rgan|process|yo'l/)) return "growth";
  if (lower.match(/natija|yutuq|maqsad|bajar|qil|tayyor|result/)) return "result";
  return "growth";
}

export function getPersonalityType(key) {
  return PERSONALITY_TYPES[key] || PERSONALITY_TYPES["morning-solo-growth"];
}
