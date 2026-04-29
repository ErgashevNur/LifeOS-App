/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildHabitBlocks } from "@/lib/scheduleEngine";
import { calculateStreak, checkNewMilestone, todayISO, MILESTONES } from "@/lib/streakEngine";
import {
  AUTH_SESSION_CHANGED_EVENT,
  apiRequest,
  isAuthenticated,
  loginUser,
  registerUser,
  clearAuthSession,
  loginWithGoogle,
  getMyProfile,
  saveAuthSession,
  getAuthSession,
} from "@/lib/auth";

const INITIAL_DATA = {
  content: {
    landing: { stats: [], features: [], founders: [] },
    dashboard: { quickModules: [] },
    assistant: { quickPrompts: [] },
    books: { categories: [] },
    health: { foodDatabase: [] },
    mastery: { milestones: [] },
    settings: { languages: [] },
  },
  dashboard: { tasks: [] },
  goals: [],
  habits: [],
  books: [],
  health: { calories: 0, waterMl: 0, sleepHours: 0, logs: [] },
  mastery: { skills: [], focusSessions: [] },
  network: { people: [], connectedIds: [], messageLog: {} },
  assistant: { messages: [], nextId: 1 },
  settings: {
    language: "",
    notifications: { habits: false, goals: false, assistant: false },
    integrations: { calendar: false, smartwatch: false, mobileSync: false },
  },
  adminUsers: [],
  plannedBlocks: [],
  onboardingCompleted: false,
  completionLogs: [],
  accountabilityPartners: [],
  environmentChecked: {},
  personalityType: null,
  activeLifeEvent: null,
  journalEntries: [],
  user: { name: "", personalityType: null },
};

const INITIAL_DASHBOARD_SUMMARY = {
  goalsCompletion: 0,
  streak: 0,
  focusHours: 0,
  completedHabits: 0,
  goalsCount: 0,
  habitsCount: 0,
  booksCount: 0,
};

const INITIAL_BACKEND_HEALTH = {
  ok: false,
  service: "",
  checkedAt: null,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function mergeStateWithInitial(nextData = {}, prevState = {}) {
  const source = nextData ?? {};

  return {
    ...INITIAL_DATA,
    ...source,
    // plannedBlocks is client-only — preserve from source chain or prevState, never reset to []
    plannedBlocks: source.plannedBlocks ?? prevState.plannedBlocks ?? INITIAL_DATA.plannedBlocks,
    content: {
      ...INITIAL_DATA.content,
      ...(source.content ?? {}),
      landing: {
        ...INITIAL_DATA.content.landing,
        ...(source.content?.landing ?? {}),
        stats: Array.isArray(source.content?.landing?.stats)
          ? source.content.landing.stats
          : INITIAL_DATA.content.landing.stats,
        features: Array.isArray(source.content?.landing?.features)
          ? source.content.landing.features
          : INITIAL_DATA.content.landing.features,
        founders: Array.isArray(source.content?.landing?.founders)
          ? source.content.landing.founders
          : INITIAL_DATA.content.landing.founders,
      },
      dashboard: {
        ...INITIAL_DATA.content.dashboard,
        ...(source.content?.dashboard ?? {}),
        quickModules: Array.isArray(source.content?.dashboard?.quickModules)
          ? source.content.dashboard.quickModules
          : INITIAL_DATA.content.dashboard.quickModules,
      },
      assistant: {
        ...INITIAL_DATA.content.assistant,
        ...(source.content?.assistant ?? {}),
        quickPrompts: Array.isArray(source.content?.assistant?.quickPrompts)
          ? source.content.assistant.quickPrompts
          : INITIAL_DATA.content.assistant.quickPrompts,
      },
      books: {
        ...INITIAL_DATA.content.books,
        ...(source.content?.books ?? {}),
        categories: Array.isArray(source.content?.books?.categories)
          ? source.content.books.categories
          : INITIAL_DATA.content.books.categories,
      },
      health: {
        ...INITIAL_DATA.content.health,
        ...(source.content?.health ?? {}),
        foodDatabase: Array.isArray(source.content?.health?.foodDatabase)
          ? source.content.health.foodDatabase
          : INITIAL_DATA.content.health.foodDatabase,
      },
      mastery: {
        ...INITIAL_DATA.content.mastery,
        ...(source.content?.mastery ?? {}),
        milestones: Array.isArray(source.content?.mastery?.milestones)
          ? source.content.mastery.milestones
          : INITIAL_DATA.content.mastery.milestones,
      },
      settings: {
        ...INITIAL_DATA.content.settings,
        ...(source.content?.settings ?? {}),
        languages: Array.isArray(source.content?.settings?.languages)
          ? source.content.settings.languages
          : INITIAL_DATA.content.settings.languages,
      },
    },
    dashboard: {
      ...INITIAL_DATA.dashboard,
      ...(source.dashboard ?? {}),
      tasks: Array.isArray(source.dashboard?.tasks)
        ? source.dashboard.tasks
        : INITIAL_DATA.dashboard.tasks,
    },
    goals: Array.isArray(source.goals) ? source.goals : INITIAL_DATA.goals,
    habits: Array.isArray(source.habits) ? source.habits : INITIAL_DATA.habits,
    books: Array.isArray(source.books) ? source.books : INITIAL_DATA.books,
    health: {
      ...INITIAL_DATA.health,
      ...(source.health ?? {}),
      logs: Array.isArray(source.health?.logs)
        ? source.health.logs
        : INITIAL_DATA.health.logs,
    },
    mastery: {
      ...INITIAL_DATA.mastery,
      ...(source.mastery ?? {}),
      skills: Array.isArray(source.mastery?.skills)
        ? source.mastery.skills
        : INITIAL_DATA.mastery.skills,
      focusSessions: Array.isArray(source.mastery?.focusSessions)
        ? source.mastery.focusSessions
        : INITIAL_DATA.mastery.focusSessions,
    },
    network: {
      ...INITIAL_DATA.network,
      ...(source.network ?? {}),
      people: Array.isArray(source.network?.people)
        ? source.network.people
        : INITIAL_DATA.network.people,
      connectedIds: Array.isArray(source.network?.connectedIds)
        ? source.network.connectedIds
        : INITIAL_DATA.network.connectedIds,
      messageLog:
        source.network?.messageLog && typeof source.network.messageLog === "object"
          ? source.network.messageLog
          : INITIAL_DATA.network.messageLog,
    },
    assistant: {
      ...INITIAL_DATA.assistant,
      ...(source.assistant ?? {}),
      messages: Array.isArray(source.assistant?.messages)
        ? source.assistant.messages
        : INITIAL_DATA.assistant.messages,
    },
    settings: {
      ...INITIAL_DATA.settings,
      ...(source.settings ?? {}),
      notifications: {
        ...INITIAL_DATA.settings.notifications,
        ...(source.settings?.notifications ?? {}),
      },
      integrations: {
        ...INITIAL_DATA.settings.integrations,
        ...(source.settings?.integrations ?? {}),
      },
    },
    adminUsers: Array.isArray(source.adminUsers)
      ? source.adminUsers
      : INITIAL_DATA.adminUsers,
  };
}

function buildSummaryFromState(state) {
  const goals = Array.isArray(state.goals) ? state.goals : [];
  const habits = Array.isArray(state.habits) ? state.habits : [];
  const books = Array.isArray(state.books) ? state.books : [];
  const focusSessions = Array.isArray(state.mastery?.focusSessions)
    ? state.mastery.focusSessions
    : [];

  const goalsCompletion =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((sum, item) => {
            const target = Number(item.targetValue) || 0;
            const current = Number(item.currentValue) || 0;
            if (target <= 0) {
              return sum;
            }
            return sum + (current / target) * 100;
          }, 0) / goals.length,
        );

  const streak = habits.reduce(
    (max, item) => Math.max(max, Number(item.streak) || 0),
    0,
  );

  const focusHours = Number(
    (
      focusSessions.reduce(
        (sum, session) => sum + (Number(session.durationMin) || 0),
        0,
      ) / 60
    ).toFixed(1),
  );

  const completedHabits = habits.filter((item) => item.completedToday).length;

  return {
    goalsCompletion,
    streak,
    focusHours,
    completedHabits,
    goalsCount: goals.length,
    habitsCount: habits.length,
    booksCount: books.length,
  };
}

const LifeOSDataContext = createContext(null);

export function LifeOSDataProvider({ children }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [dashboardSummary, setDashboardSummary] = useState(
    INITIAL_DASHBOARD_SUMMARY,
  );
  const [backendHealth, setBackendHealth] = useState(INITIAL_BACKEND_HEALTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshDashboardSummary = useCallback(async (fallbackState = null) => {
    if (!hasAccessToken()) {
      setDashboardSummary(INITIAL_DASHBOARD_SUMMARY);
      return null;
    }

    try {
      const summary = await apiRequest("/dashboard/summary", {}, { auth: true });
      const normalized = {
        ...INITIAL_DASHBOARD_SUMMARY,
        ...(summary ?? {}),
      };
      setDashboardSummary(normalized);
      return normalized;
    } catch {
      if (fallbackState) {
        setDashboardSummary(buildSummaryFromState(fallbackState));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const checkBackendHealth = async () => {
      try {
        const payload = await apiRequest("/healthz");
        if (!active) {
          return;
        }

        setBackendHealth({
          ok: Boolean(payload?.ok),
          service: typeof payload?.service === "string" ? payload.service : "",
          checkedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) {
          return;
        }

        setBackendHealth({
          ok: false,
          service: "",
          checkedAt: new Date().toISOString(),
        });
      }
    };

    void checkBackendHealth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadState = async () => {
      const currentRequestId = requestId + 1;
      requestId = currentRequestId;

      if (!isAuthenticated()) {
        if (active && currentRequestId === requestId) {
          setData(INITIAL_DATA);
          setDashboardSummary(INITIAL_DASHBOARD_SUMMARY);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      setIsLoading(true);

      try {
        const baseState = await apiRequest("/state", {}, { auth: true });

        const settled = await Promise.allSettled([
          apiRequest("/public/content"),
          apiRequest("/dashboard/summary", {}, { auth: true }),
          apiRequest("/goals", {}, { auth: true }),
          apiRequest("/habits", {}, { auth: true }),
          apiRequest("/books", {}, { auth: true }),
          apiRequest("/health", {}, { auth: true }),
          apiRequest("/mastery", {}, { auth: true }),
          apiRequest("/network", {}, { auth: true }),
          apiRequest("/assistant/messages", {}, { auth: true }),
          apiRequest("/settings", {}, { auth: true }),
        ]);

        if (!active || currentRequestId !== requestId) {
          return;
        }

        let nextState = mergeStateWithInitial(baseState, data);

        const [
          publicContentResult,
          summaryResult,
          goalsResult,
          habitsResult,
          booksResult,
          healthResult,
          masteryResult,
          networkResult,
          assistantMessagesResult,
          settingsResult,
        ] = settled;

        if (publicContentResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            content: publicContentResult.value,
          });
        }

        if (goalsResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            goals: goalsResult.value,
          });
        }

        if (habitsResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            habits: habitsResult.value,
          });
        }

        if (booksResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            books: booksResult.value,
          });
        }

        if (healthResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            health: healthResult.value,
          });
        }

        if (masteryResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            mastery: masteryResult.value,
          });
        }

        if (networkResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            network: networkResult.value,
          });
        }

        if (assistantMessagesResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            assistant: {
              ...nextState.assistant,
              messages: assistantMessagesResult.value,
            },
          });
        }

        if (settingsResult.status === "fulfilled") {
          nextState = mergeStateWithInitial({
            ...nextState,
            settings: settingsResult.value,
          });
        }

        // Use functional update so client-only plannedBlocks (not in server response) are preserved
        setData(prev => ({
          ...nextState,
          plannedBlocks: prev.plannedBlocks?.length > 0
            ? prev.plannedBlocks
            : (nextState.plannedBlocks || []),
        }));

        if (summaryResult.status === "fulfilled") {
          setDashboardSummary({
            ...INITIAL_DASHBOARD_SUMMARY,
            ...(summaryResult.value ?? {}),
          });
        } else {
          setDashboardSummary(buildSummaryFromState(nextState));
        }

        setError(null);
      } catch (requestError) {
        if (!active || currentRequestId !== requestId) {
          return;
        }
        setError(requestError.message);
      } finally {
        if (active && currentRequestId === requestId) {
          setIsLoading(false);
        }
      }
    };

    const handleAuthChanged = () => {
      if (!active) {
        return;
      }
      void loadState();
    };

    void loadState();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChanged);

    return () => {
      active = false;
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChanged);
    };
  }, []);

  const actions = useMemo(() => {
    const mutate = async (path, options) => {
      if (!isAuthenticated()) {
        setError("Kirish talab qilinadi.");
        return null;
      }

      try {
        const nextStatePayload = await apiRequest(path, options, { auth: true });
        // Use functional update so stale `data` closure can't overwrite locally-added plannedBlocks
        let merged;
        setData(prev => { merged = mergeStateWithInitial(nextStatePayload, prev); return merged; });
        setError(null);
        void refreshDashboardSummary(merged);
        return merged;
      } catch (requestError) {
        setError(requestError.message);
        return null;
      }
    };

    const refreshSlice = async (path, applySlice) => {
      if (!isAuthenticated()) {
        setError("Kirish talab qilinadi.");
        return null;
      }

      try {
        const payload = await apiRequest(path, {}, { auth: true });
        setData((prev) => mergeStateWithInitial(applySlice(prev, payload), prev));
        setError(null);
        return payload;
      } catch (requestError) {
        setError(requestError.message);
        return null;
      }
    };

    return {
      refreshState: () => mutate("/state", {}),
      refreshGoals: () => refreshSlice("/goals", (prev, payload) => ({ ...prev, goals: payload })),
      refreshHabits: () => refreshSlice("/habits", (prev, payload) => ({ ...prev, habits: payload })),
      refreshBooks: () => refreshSlice("/books", (prev, payload) => ({ ...prev, books: payload })),
      refreshHealth: () =>
        refreshSlice("/health", (prev, payload) => ({
          ...prev,
          health: { ...prev.health, ...payload },
        })),
      refreshMastery: () =>
        refreshSlice("/mastery", (prev, payload) => ({ ...prev, mastery: payload })),
      refreshNetwork: () =>
        refreshSlice("/network", (prev, payload) => ({ ...prev, network: payload })),
      refreshAssistantMessages: () =>
        refreshSlice("/assistant/messages", (prev, payload) => ({
          ...prev,
          assistant: { ...prev.assistant, messages: payload },
        })),
      refreshSettings: () =>
        refreshSlice("/settings", (prev, payload) => ({ ...prev, settings: payload })),
      refreshAdminUsers: () =>
        refreshSlice("/admin/users", (prev, payload) => ({
          ...prev,
          adminUsers: Array.isArray(payload) ? payload : [],
        })),
      async refreshMyProfile() {
        const user = await getMyProfile();
        if (!user) return;
        const current = getAuthSession();
        if (!current) return;
        saveAuthSession({ ...current, user });
      },
      refreshDashboardSummary: () => refreshDashboardSummary(data),

      addDashboardTask(title) {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }
        void mutate("/dashboard/tasks", {
          method: "POST",
          body: JSON.stringify({ title: trimmed }),
        });
      },
      toggleDashboardTask(taskId) {
        void mutate(`/dashboard/tasks/${taskId}/toggle`, { method: "PATCH" });
      },

      addGoal(payload) {
        if (!payload.title?.trim()) {
          return;
        }
        void mutate("/goals", {
          method: "POST",
          body: JSON.stringify({
            title: payload.title.trim(),
            period: payload.period || "Kunlik",
            targetValue: Number(payload.targetValue || 1),
            deadline: payload.deadline || new Date().toISOString().split("T")[0],
          }),
        });
      },
      updateGoalProgress(goalId, delta) {
        void mutate(`/goals/${goalId}/progress`, {
          method: "PATCH",
          body: JSON.stringify({ delta }),
        });
      },
      removeGoal(goalId) {
        void mutate(`/goals/${goalId}`, { method: "DELETE" });
      },

      // ── Local goal (from GoalOnboarding) ─────────────────────────
      addLocalGoal(goalData) {
        setData(prev => ({
          ...prev,
          goals: [goalData, ...(prev.goals || [])],
        }));
      },

      // Set goal progress to absolute % (0-100). Marks completedAt at 100.
      updateLocalGoalProgress(goalId, progress) {
        const clamped = Math.max(0, Math.min(100, Number(progress) || 0));
        setData(prev => ({
          ...prev,
          goals: (prev.goals || []).map(g => {
            if (g.id !== goalId) return g;
            const next = { ...g, progress: clamped };
            if (clamped >= 100 && !g.completedAt) {
              next.completedAt = new Date().toISOString();
            }
            if (clamped < 100 && g.completedAt) {
              // re-opened
              next.completedAt = null;
            }
            return next;
          }),
        }));
      },

      // Delete a local goal + cascade habits and their planner blocks.
      deleteLocalGoal(goalId) {
        setData(prev => {
          const habitsToRemove = (prev.habits || []).filter(
            h => h.linkedGoalId === goalId || h.goalId === goalId,
          );
          const removeHabitIds = new Set(habitsToRemove.map(h => h.id));
          return {
            ...prev,
            goals: (prev.goals || []).filter(g => g.id !== goalId),
            habits: (prev.habits || []).filter(
              h => h.linkedGoalId !== goalId && h.goalId !== goalId,
            ),
            plannedBlocks: (prev.plannedBlocks || []).filter(
              b => !removeHabitIds.has(b.refId),
            ),
          };
        });
      },

      // Toggle a goal milestone done flag at index.
      updateGoalMilestone(goalId, milestoneIndex, done = true) {
        setData(prev => ({
          ...prev,
          goals: (prev.goals || []).map(g => {
            if (g.id !== goalId) return g;
            const milestones = [...(g.milestones || [])];
            if (!milestones[milestoneIndex]) return g;
            milestones[milestoneIndex] = {
              ...milestones[milestoneIndex],
              done,
            };
            return { ...g, milestones };
          }),
        }));
      },

      // ── User profile (set during onboarding) ─────────────────────
      setUser(userData) {
        setData(prev => ({
          ...prev,
          user: { ...(prev.user || {}), ...userData },
        }));
      },

      addHabit(title) {
        const trimmed = title.trim();
        if (!trimmed) {
          return;
        }
        void mutate("/habits", {
          method: "POST",
          body: JSON.stringify({ title: trimmed }),
        });
      },

      // ── Local habit (from HabitBuilder wizard) ────────────────────
      addLocalHabit(habitData) {
        setData(prev => {
          const newBlocks =
            habitData.cueType === "time" &&
            (habitData.scheduledTime || habitData.cueValue || habitData.cue)
              ? buildHabitBlocks(habitData, 30)
              : [];

          // Deduplicate: remove any existing blocks for same refId
          const filtered = (prev.plannedBlocks || []).filter(
            b => b.refId !== habitData.id,
          );

          return {
            ...prev,
            habits: [habitData, ...prev.habits],
            plannedBlocks: [...filtered, ...newBlocks],
          };
        });
      },

      removeLocalHabit(habitId) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.filter(h => h.id !== habitId),
          plannedBlocks: (prev.plannedBlocks || []).filter(b => b.refId !== habitId),
        }));
      },

      updateHabitTime(habitId, newTime) {
        setData(prev => {
          const habit = prev.habits.find(h => h.id === habitId);
          if (!habit) return prev;
          const updated = { ...habit, scheduledTime: newTime, cueValue: newTime };
          const newBlocks = buildHabitBlocks(updated, 30);
          const filtered = (prev.plannedBlocks || []).filter(b => b.refId !== habitId);
          const updatedHabits = prev.habits.map(h => h.id === habitId ? updated : h);
          return {
            ...prev,
            habits: updatedHabits,
            plannedBlocks: [...filtered, ...newBlocks],
          };
        });
      },

      addTaskToSchedule(taskId, date, startTime, durationMinutes = 30) {
        setData(prev => {
          const [h, m] = startTime.split(":").map(Number);
          const total = h * 60 + m + durationMinutes;
          const endTime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
          const block = {
            id: `task-${taskId}-${date}-${startTime}`,
            type: "task",
            refId: taskId,
            date,
            startTime,
            endTime,
            locked: false,
            done: false,
          };
          return {
            ...prev,
            plannedBlocks: [...(prev.plannedBlocks || []), block],
          };
        });
      },

      markBlockDone(blockId) {
        setData(prev => ({
          ...prev,
          plannedBlocks: (prev.plannedBlocks || []).map(b =>
            b.id === blockId ? { ...b, done: !b.done } : b,
          ),
        }));
      },

      toggleHabitCompletion(habitId, date) {
        setData(prev => {
          // Toggle the block
          const updatedBlocks = (prev.plannedBlocks || []).map(b =>
            b.refId === habitId && b.date === date ? { ...b, done: !b.done } : b,
          );
          // Toggle habit.completedToday if date is today
          const today = new Date().toISOString().slice(0, 10);
          const updatedHabits =
            date === today
              ? prev.habits.map(h =>
                  h.id === habitId ? { ...h, completedToday: !h.completedToday } : h,
                )
              : prev.habits;
          return { ...prev, plannedBlocks: updatedBlocks, habits: updatedHabits };
        });
      },

      /**
       * Complete a habit via the ActiveHabitTimer.
       * Returns { newStreak, newMilestone } for the caller to react to.
       */
      completeHabitWithTimer(habitId, durationSeconds = 0) {
        const today = todayISO();
        let result = { newStreak: 0, newMilestone: null };

        setData(prev => {
          const habit = prev.habits.find(h => h.id === habitId);
          if (!habit) return prev;

          const completedDates = [
            ...(habit.completedDates || []).filter(d => d !== today),
            today,
          ];
          const newStreak = calculateStreak(completedDates, today);
          const recordStreak = Math.max(habit.recordStreak || 0, newStreak);
          const achievedMilestones = habit.achievedMilestones || [];
          const newMilestone = checkNewMilestone(newStreak, achievedMilestones);

          const updatedMilestones = newMilestone
            ? [...achievedMilestones, newMilestone]
            : achievedMilestones;

          result = { newStreak, newMilestone };

          const updatedHabit = {
            ...habit,
            completedDates,
            completedToday: true,
            streak: newStreak,
            recordStreak,
            achievedMilestones: updatedMilestones,
            isAutomatic: newStreak >= 66,
            totalMinutes: (habit.totalMinutes || 0) + Math.floor(durationSeconds / 60),
          };

          // Mark planned block done for today
          const updatedBlocks = (prev.plannedBlocks || []).map(b =>
            b.refId === habitId && b.date === today ? { ...b, done: true } : b,
          );

          return {
            ...prev,
            habits: prev.habits.map(h => h.id === habitId ? updatedHabit : h),
            plannedBlocks: updatedBlocks,
          };
        });

        return result;
      },

      /**
       * Skip a habit with a reason. Increments skipCount.
       */
      skipHabit(habitId, reason = null) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  skipCount: (h.skipCount || 0) + 1,
                  lastSkipReason: reason,
                  skippedToday: true,
                }
              : h,
          ),
        }));
      },

      /**
       * Acknowledge milestone — marks it as seen (already stored in achievedMilestones via completeHabitWithTimer)
       */
      acknowledgeMilestone(habitId, milestone) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  achievedMilestones: [
                    ...new Set([...(h.achievedMilestones || []), milestone]),
                  ],
                }
              : h,
          ),
        }));
      },

      /**
       * Enter recovery mode for a habit (soft restart without losing record)
       */
      enterRecoveryMode(habitId) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.map(h =>
            h.id === habitId
              ? { ...h, recoveryMode: true, recoveryCount: (h.recoveryCount || 0) + 1 }
              : h,
          ),
        }));
      },

      toggleHabitCheckIn(habitId) {
        void mutate(`/habits/${habitId}/check-in`, { method: "PATCH" });
      },
      removeHabit(habitId) {
        void mutate(`/habits/${habitId}`, { method: "DELETE" });
      },

      addBook(payload) {
        if (!payload.title.trim() || !payload.author.trim()) {
          return;
        }
        void mutate("/books", {
          method: "POST",
          body: JSON.stringify({
            title: payload.title.trim(),
            author: payload.author.trim(),
            category: payload.category,
            pages: Number(payload.pages),
          }),
        });
      },
      updateBookReadPages(bookId, readPages) {
        void mutate(`/books/${bookId}/read-pages`, {
          method: "PATCH",
          body: JSON.stringify({ readPages: Number(readPages) }),
        });
      },
      addBookComment(bookId, text) {
        const trimmed = text.trim();
        if (!trimmed) {
          return;
        }
        void mutate(`/books/${bookId}/comments`, {
          method: "POST",
          body: JSON.stringify({ text: trimmed }),
        });
      },
      toggleBookLike(bookId) {
        void mutate(`/books/${bookId}/like`, { method: "POST" });
      },

      addCalories(amount) {
        void mutate("/health/calories/add", {
          method: "POST",
          body: JSON.stringify({ amount: Number(amount) }),
        });
      },
      removeCalories(amount) {
        void mutate("/health/calories/remove", {
          method: "POST",
          body: JSON.stringify({ amount: Number(amount) }),
        });
      },
      addWater(amount = 250) {
        void mutate("/health/water", {
          method: "POST",
          body: JSON.stringify({ amount: Number(amount) }),
        });
      },
      setSleepHours(hours) {
        void mutate("/health/sleep", {
          method: "PATCH",
          body: JSON.stringify({ hours: Number(hours) }),
        });
      },

      addSkill(name, hours = 0) {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }
        void mutate("/mastery/skills", {
          method: "POST",
          body: JSON.stringify({ name: trimmed, hours: Number(hours) }),
        });
      },
      addFocusSession({ skillId, minutes }) {
        void mutate("/mastery/focus-sessions", {
          method: "POST",
          body: JSON.stringify({ skillId, minutes: Number(minutes) }),
        });
      },

      toggleConnection(userId) {
        void mutate("/network/toggle-connect", {
          method: "POST",
          body: JSON.stringify({ userId: Number(userId) }),
        });
      },
      sendNetworkMessage(userId, message) {
        const trimmed = message.trim();
        if (!trimmed) {
          return;
        }
        void mutate("/network/messages", {
          method: "POST",
          body: JSON.stringify({ userId: Number(userId), message: trimmed }),
        });
      },

      sendAssistantPrompt(prompt) {
        const trimmed = prompt.trim();
        if (!trimmed) {
          return;
        }
        void mutate("/assistant/messages", {
          method: "POST",
          body: JSON.stringify({ prompt: trimmed }),
        });
      },
      clearAssistantMessages() {
        void mutate("/assistant/messages", { method: "DELETE" });
      },

      setLanguage(language) {
        void mutate("/settings/language", {
          method: "PATCH",
          body: JSON.stringify({ language }),
        });
      },
      toggleNotification(key) {
        void mutate("/settings/notifications/toggle", {
          method: "PATCH",
          body: JSON.stringify({ key }),
        });
      },
      toggleIntegration(key) {
        void mutate("/settings/integrations/toggle", {
          method: "PATCH",
          body: JSON.stringify({ key }),
        });
      },

      completeOnboarding(personalityType = null) {
        setData(prev => ({
          ...prev,
          onboardingCompleted: true,
          ...(personalityType ? { personalityType } : {}),
        }));
      },

      setPersonalityType(type) {
        setData(prev => ({ ...prev, personalityType: type }));
      },

      setLifeEvent(event, durationLabel = null) {
        const { parseDurationLabel, adjustHabit } = require ? null : null;
        const endDate = event.defaultDuration
          ? (() => { const d = new Date(); d.setDate(d.getDate() + event.defaultDuration); return d.toISOString(); })()
          : durationLabel && durationLabel !== "Bilmayman"
          ? (() => {
              const map = { "1 hafta": 7, "2 hafta": 14, "1 oy": 30 };
              const days = map[durationLabel];
              if (!days) return null;
              const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString();
            })()
          : null;

        setData(prev => ({
          ...prev,
          activeLifeEvent: {
            eventId: event.id,
            startDate: new Date().toISOString(),
            endDate,
            adjustment: event.habitAdjustment,
            label: event.label,
            emoji: event.emoji,
          },
          habits: prev.habits.map(h => ({
            ...h,
            isAdjusted: true,
          })),
        }));
      },

      clearLifeEvent() {
        setData(prev => ({
          ...prev,
          activeLifeEvent: null,
          habits: prev.habits.map(h => ({
            ...h,
            isAdjusted: false,
            adjustedVersion: null,
          })),
        }));
      },

      addJournalEntry(milestone, question, answer) {
        setData(prev => {
          const topHabit = [...(prev.habits || [])]
            .sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];
          return {
            ...prev,
            journalEntries: [
              ...(prev.journalEntries || []),
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                milestone,
                question,
                answer,
                habitContext: {
                  activeHabits: prev.habits?.length || 0,
                  topHabit: topHabit ? (topHabit.name || topHabit.title) : null,
                },
              },
            ],
          };
        });
      },

      snoozeJournalEntry(milestone) {
        setData(prev => ({
          ...prev,
          journalEntries: [
            ...(prev.journalEntries || []),
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              milestone,
              snoozedAt: new Date().toISOString(),
              question: "",
              answer: null,
            },
          ],
        }));
      },

      acceptProgression(habitId, nextStageId) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  currentProgressionStage: nextStageId,
                  progressionOfferedAt: {
                    ...(h.progressionOfferedAt || {}),
                    [nextStageId]: new Date().toISOString(),
                  },
                }
              : h,
          ),
        }));
      },

      declineProgression(habitId, nextStageId) {
        setData(prev => ({
          ...prev,
          habits: prev.habits.map(h =>
            h.id === habitId
              ? {
                  ...h,
                  progressionOfferedAt: {
                    ...(h.progressionOfferedAt || {}),
                    [nextStageId]: new Date().toISOString(),
                  },
                  progressionDeclinedAt: new Date().toISOString(),
                }
              : h,
          ),
        }));
      },

      logCompletion(habitId, durationSeconds = 0) {
        setData(prev => ({
          ...prev,
          completionLogs: [
            ...(prev.completionLogs || []),
            { habitId, completedAt: new Date().toISOString(), durationSeconds },
          ],
        }));
      },

      addAccountabilityPartner(partner) {
        setData(prev => ({
          ...prev,
          accountabilityPartners: [...(prev.accountabilityPartners || []), partner],
        }));
      },

      markEnvironmentChecked(habitId) {
        setData(prev => ({
          ...prev,
          environmentChecked: { ...(prev.environmentChecked || {}), [habitId]: true },
        }));
      },

      resetState() {
        return mutate("/state/reset", { method: "POST" });
      },

      async uploadImage(file) {
        if (!isAuthenticated()) {
          setError("Kirish talab qilinadi.");
          return null;
        }

        if (!(file instanceof File)) {
          return null;
        }

        try {
          const formData = new FormData();
          formData.append("image", file);

          const payload = await apiRequest(
            "/uploads/image",
            {
              method: "POST",
              body: formData,
            },
            { auth: true },
          );

          setError(null);
          return payload;
        } catch (requestError) {
          setError(requestError.message);
          return null;
        }
      },
      // Auth actions exposed via store
      loginUser: async (email, password) => {
        try {
          const authData = await loginUser({ email, password });
          await mutate("/state", {}); // Refresh state after login
          return authData;
        } catch (err) {
          setError(err.message);
          throw err;
        }
      },
      registerUser: async (userData) => {
        try {
          const authData = await registerUser(userData);
          await mutate("/state", {});
          return authData;
        } catch (err) {
          setError(err.message);
          throw err;
        }
      },
      logoutUser: async () => {
        clearAuthSession();
        setData(INITIAL_DATA);
      },
      loginWithGoogle: async (credential) => {
        try {
          const authData = await loginWithGoogle(credential);
          await mutate("/state", {});
          return authData;
        } catch (err) {
          setError(err.message);
          throw err;
        }
      },
    };
  }, [data, refreshDashboardSummary]);

  const selectors = useMemo(() => {
    const goalCompletionRate =
      data.goals.length === 0
        ? 0
        : Math.round(
            data.goals.reduce((sum, goal) => {
              const progress = goal.targetValue
                ? (goal.currentValue / goal.targetValue) * 100
                : 0;
              return sum + progress;
            }, 0) / data.goals.length,
          );

    const completedHabits = data.habits.filter((habit) => habit.completedToday).length;
    const highestStreak = data.habits.reduce(
      (max, habit) => Math.max(max, habit.streak),
      0,
    );
    const focusMinutes = data.mastery.focusSessions.reduce(
      (sum, session) => sum + session.durationMin,
      0,
    );

    return {
      goalCompletionRate,
      completedHabits,
      highestStreak,
      focusHours: Number((focusMinutes / 60).toFixed(1)),
      goalsWithMeta: data.goals.map((goal) => {
        const progress = goal.targetValue
          ? clamp(Math.round((goal.currentValue / goal.targetValue) * 100), 0, 100)
          : 0;
        const status =
          progress >= 100
            ? "Tugatildi"
            : progress < 40
              ? "Xavf"
              : progress < 70
                ? "Jarayonda"
                : "Yaxshi";
        return { ...goal, progress, status };
      }),
      booksWithMeta: data.books.map((book) => {
        const progress = book.pages
          ? clamp(Math.round((book.readPages / book.pages) * 100), 0, 100)
          : 0;
        const status =
          progress >= 100 ? "Tugatildi" : progress <= 0 ? "O'qilmadi" : "O'qilmoqda";
        return { ...book, progress, status };
      }),
    };
  }, [data]);

  const contextValue = useMemo(
    () => ({
      data,
      actions,
      selectors,
      dashboardSummary,
      backendHealth,
      isLoading,
      error,
      // Convenience shortcuts consumed by Planner / Habits
      habits: data.habits,
      plannedBlocks: data.plannedBlocks || [],
      tasks: data.dashboard?.tasks || [],
      onboardingCompleted: data.onboardingCompleted ?? false,
      completionLogs: data.completionLogs || [],
      accountabilityPartners: data.accountabilityPartners || [],
      personalityType: data.personalityType || null,
      activeLifeEvent: data.activeLifeEvent || null,
      journalEntries: data.journalEntries || [],
      user: data.user || { name: "", personalityType: null },
    }),
    [actions, backendHealth, dashboardSummary, data, selectors, isLoading, error],
  );

  return (
    <LifeOSDataContext.Provider value={contextValue}>
      {children}
    </LifeOSDataContext.Provider>
  );
}

export function useLifeOSData() {
  const context = useContext(LifeOSDataContext);
  if (!context) {
    throw new Error("useLifeOSData must be used within LifeOSDataProvider.");
  }
  return context;
}
