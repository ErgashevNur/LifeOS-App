export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  district: string;
  profession: string;
  role: "admin" | "user";
  password: string;
  tokenVersion: number;
  refreshTokenId: string | null;
  createdAt: string;
}

export interface SessionPayload {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    region: string;
    city: string;
    district: string;
    profession: string;
    role: "admin" | "user";
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  loggedInAt: string;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  fullName: string;
  role: "admin" | "user";
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  refreshTokenId: string;
  type: "refresh";
}

export interface DashboardTask {
  id: string;
  title: string;
  done: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  period: "Yillik" | "Oylik" | "Haftalik" | "Kunlik";
  targetValue: number;
  currentValue: number;
  deadline: string;
}

export interface HabitItem {
  id: string;
  title: string;
  streak: number;
  longestStreak: number;
  completedDays: number;
  completedToday: boolean;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  readPages: number;
  rating: number;
  note: string;
  likes: number;
  comments: string[];
}

export interface HealthLog {
  id: string;
  day: string;
  calories: number;
  waterMl: number;
  sleepHours: number;
}

export interface MasterySkill {
  id: string;
  name: string;
  hours: number;
}

export interface FocusSession {
  id: string;
  date: string;
  durationMin: number;
  skillId: string;
}

export interface NetworkPerson {
  id: number;
  name: string;
  username: string;
  job: string;
  skill: string;
  streak: number;
  mutualFriends: number;
}

export interface AssistantMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

export interface AppContent {
  landing: {
    stats: Array<{
      value: string;
      label: string;
    }>;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    founders: Array<{
      name: string;
      role: string;
      image: string;
      description: string;
    }>;
  };
  dashboard: {
    quickModules: Array<{
      title: string;
      to: string;
    }>;
  };
  assistant: {
    quickPrompts: string[];
  };
  books: {
    categories: string[];
  };
  health: {
    foodDatabase: Array<{
      id: number;
      name: string;
      calories: number;
    }>;
  };
  mastery: {
    milestones: number[];
  };
  settings: {
    languages: string[];
  };
}

export interface LifeOSState {
  content: AppContent;
  dashboard: {
    tasks: DashboardTask[];
  };
  goals: GoalItem[];
  habits: HabitItem[];
  books: BookItem[];
  health: {
    calories: number;
    waterMl: number;
    sleepHours: number;
    logs: HealthLog[];
  };
  mastery: {
    skills: MasterySkill[];
    focusSessions: FocusSession[];
  };
  network: {
    people: NetworkPerson[];
    connectedIds: number[];
    messageLog: Record<number, string[]>;
  };
  assistant: {
    messages: AssistantMessage[];
    nextId: number;
  };
  settings: {
    language: string;
    notifications: {
      habits: boolean;
      goals: boolean;
      assistant: boolean;
    };
    integrations: {
      calendar: boolean;
      smartwatch: boolean;
      mobileSync: boolean;
    };
  };
}

export interface PersistedData {
  users: AuthUser[];
  state: LifeOSState;
}
