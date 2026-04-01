import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleDestroy,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { compareSync, hashSync } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import * as path from "node:path";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_SECRET,
} from "./auth.constants";
import { DEFAULT_PERSISTED_DATA } from "./default-data";
import {
  AddCommentDto,
  AddFocusSessionDto,
  AddSkillDto,
  AddTaskDto,
  AmountDto,
  AssistantPromptDto,
  CreateBookDto,
  CreateGoalDto,
  CreateHabitDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  SendNetworkMessageDto,
  SleepDto,
  ToggleByKeyDto,
  ToggleConnectionDto,
  UpdateBookPagesDto,
  UpdateGoalProgressDto,
  UpdateLanguageDto,
} from "./dto";
import {
  AccessTokenPayload,
  AuthUser,
  LifeOSState,
  PersistedData,
  RefreshTokenPayload,
  SessionPayload,
} from "./types";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

const PASSWORD_HASH_ROUNDS = 10;

function isBcryptHash(password: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(password);
}

@Injectable()
export class AppService implements OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);
  private readonly dbPath = path.join(process.cwd(), "data", "db.json");
  private readonly persistDebounceMs = 120;

  private data: PersistedData;
  private persistTimer: NodeJS.Timeout | null = null;
  private persistInFlight = false;
  private persistRequested = false;

  constructor(private readonly jwtService: JwtService) {
    this.data = this.loadData();
  }

  async onModuleDestroy() {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }

    if (this.persistRequested || this.persistInFlight) {
      await this.flushPersist();
    }
  }

  private normalizeUser(user: Partial<AuthUser>, index: number): AuthUser {
    const fullName = String(user.fullName ?? "").trim();
    const derivedFirstName =
      typeof user.firstName === "string" && user.firstName.trim()
        ? user.firstName.trim()
        : fullName.split(" ")[0] || "User";
    const derivedLastName =
      typeof user.lastName === "string" && user.lastName.trim()
        ? user.lastName.trim()
        : fullName.split(" ").slice(1).join(" ") || "Member";

    return {
      id: user.id ?? `user-${index + 1}`,
      firstName: derivedFirstName,
      lastName: derivedLastName,
      fullName:
        fullName || `${derivedFirstName} ${derivedLastName}`.trim() || "User",
      email: String(user.email ?? "").trim().toLowerCase(),
      phone: typeof user.phone === "string" ? user.phone : "",
      address: typeof user.address === "string" ? user.address : "",
      region: typeof user.region === "string" ? user.region : "",
      city: typeof user.city === "string" ? user.city : "",
      district: typeof user.district === "string" ? user.district : "",
      profession: typeof user.profession === "string" ? user.profession : "",
      role:
        user.role === "admin" || user.role === "user"
          ? user.role
          : index === 0
            ? "admin"
            : "user",
      password: user.password ?? "",
      tokenVersion:
        typeof user.tokenVersion === "number" && user.tokenVersion >= 1
          ? user.tokenVersion
          : 1,
      refreshTokenId:
        typeof user.refreshTokenId === "string" && user.refreshTokenId.trim()
          ? user.refreshTokenId
          : null,
      createdAt: user.createdAt ?? new Date().toISOString(),
    };
  }

  private loadData(): PersistedData {
    try {
      const raw = readFileSync(this.dbPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<PersistedData>;
      const users = Array.isArray(parsed.users)
        ? parsed.users.map((user, index) =>
            this.normalizeUser(user as Partial<AuthUser>, index),
          )
        : clone(DEFAULT_PERSISTED_DATA.users);
      let hasPasswordMigration = false;
      const normalizedUsers = users.map((user) => {
        if (!user.password || isBcryptHash(user.password)) {
          return user;
        }

        hasPasswordMigration = true;
        return {
          ...user,
          password: hashSync(user.password, PASSWORD_HASH_ROUNDS),
        };
      });

      const loadedData: PersistedData = {
        users: normalizedUsers,
        state: {
          ...clone(DEFAULT_PERSISTED_DATA.state),
          ...(parsed.state ?? {}),
        },
      };

      if (hasPasswordMigration) {
        this.persist(loadedData);
      }

      return loadedData;
    } catch {
      const initial = clone(DEFAULT_PERSISTED_DATA);
      this.persist(initial);
      return initial;
    }
  }

  private persist(nextData: PersistedData): void {
    mkdirSync(path.dirname(this.dbPath), { recursive: true });
    writeFileSync(this.dbPath, JSON.stringify(nextData, null, 2), "utf8");
  }

  private commit(): void {
    this.persistRequested = true;

    if (this.persistTimer) {
      return;
    }

    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      void this.flushPersist();
    }, this.persistDebounceMs);
  }

  private async flushPersist(): Promise<void> {
    if (this.persistInFlight) {
      return;
    }

    this.persistInFlight = true;
    try {
      while (this.persistRequested) {
        this.persistRequested = false;
        mkdirSync(path.dirname(this.dbPath), { recursive: true });
        await writeFile(this.dbPath, JSON.stringify(this.data, null, 2), "utf8");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ma'lumotni saqlashda xatolik.";
      this.logger.error(message);
    } finally {
      this.persistInFlight = false;
      if (this.persistRequested && !this.persistTimer) {
        this.persistTimer = setTimeout(() => {
          this.persistTimer = null;
          void this.flushPersist();
        }, this.persistDebounceMs);
      }
    }
  }

  private setState(nextState: LifeOSState): LifeOSState {
    this.data.state = nextState;
    this.commit();
    return this.getState();
  }

  private state(): LifeOSState {
    return this.data.state;
  }

  private issueSession(user: AuthUser): SessionPayload {
    if (!user.email || !user.password) {
      throw new BadRequestException("Foydalanuvchi ma'lumotlari yaroqsiz.");
    }

    const refreshTokenId = createId("rft");
    user.refreshTokenId = refreshTokenId;

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      refreshTokenId,
      type: "refresh",
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    });

    this.commit();

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        region: user.region,
        city: user.city,
        district: user.district,
        profession: user.profession,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      loggedInAt: new Date().toISOString(),
    };
  }

  getState(): LifeOSState {
    return clone(this.data.state);
  }

  resetState(): LifeOSState {
    this.data.state = clone(DEFAULT_PERSISTED_DATA.state);
    this.commit();
    return this.getState();
  }

  getPublicContent() {
    return clone(this.data.state.content);
  }

  register(dto: RegisterDto): SessionPayload {
    const email = dto.email.trim().toLowerCase();
    const existing = this.data.users.find((user) => user.email.toLowerCase() === email);
    if (existing) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan.");
    }

    const user: AuthUser = {
      id: createId("user"),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim(),
      email,
      phone: dto.phone.trim(),
      address: dto.address.trim(),
      region: dto.region.trim(),
      city: dto.city.trim(),
      district: dto.district.trim(),
      profession: dto.profession.trim(),
      role: "user",
      password: hashSync(dto.password, PASSWORD_HASH_ROUNDS),
      tokenVersion: 1,
      refreshTokenId: null,
      createdAt: new Date().toISOString(),
    };
    this.data.users.unshift(user);

    return this.issueSession(user);
  }

  login(dto: LoginDto): SessionPayload {
    const email = dto.email.trim().toLowerCase();
    const user = this.data.users.find((item) => item.email.toLowerCase() === email);

    if (!user || !user.password) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri.");
    }

    const hashedPassword = isBcryptHash(user.password);
    const isValidPassword = hashedPassword
      ? compareSync(dto.password, user.password)
      : user.password === dto.password;
    if (!isValidPassword) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri.");
    }

    if (!hashedPassword) {
      user.password = hashSync(dto.password, PASSWORD_HASH_ROUNDS);
      this.commit();
    }

    return this.issueSession(user);
  }

  refreshAccessToken(dto: RefreshTokenDto): SessionPayload {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(dto.refreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException(
        "Refresh token yaroqsiz yoki muddati tugagan.",
      );
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Refresh token noto'g'ri formatda.");
    }

    const user = this.data.users.find((item) => item.id === payload.sub);
    if (!user) {
      throw new UnauthorizedException("Refresh token uchun user topilmadi.");
    }

    if (
      user.tokenVersion !== payload.tokenVersion ||
      !user.refreshTokenId ||
      user.refreshTokenId !== payload.refreshTokenId
    ) {
      throw new UnauthorizedException(
        "Refresh token bekor qilingan yoki almashtirilgan.",
      );
    }

    return this.issueSession(user);
  }

  validateAccessTokenPayload(payload: AccessTokenPayload): void {
    const user = this.data.users.find((item) => item.id === payload.sub);
    if (!user) {
      throw new UnauthorizedException("Access token uchun user topilmadi.");
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException(
        "Access token bekor qilingan yoki almashtirilgan.",
      );
    }

    if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new UnauthorizedException("Access token ma'lumotlari mos emas.");
    }
  }

  getAdminUsers(actorUserId: string) {
    const actor = this.data.users.find((user) => user.id === actorUserId);
    if (!actor || actor.role !== "admin") {
      throw new ForbiddenException("Bu bo'lim faqat admin uchun.");
    }

    return this.data.users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      region: user.region,
      city: user.city,
      district: user.district,
      profession: user.profession,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }

  getDashboardSummary() {
    const state = this.state();
    const goalsCompletion =
      state.goals.length === 0
        ? 0
        : Math.round(
            state.goals.reduce(
              (sum, item) => sum + (item.currentValue / item.targetValue) * 100,
              0,
            ) / state.goals.length,
          );
    const streak = state.habits.reduce((max, item) => Math.max(max, item.streak), 0);
    const focusHours = Number(
      (
        state.mastery.focusSessions.reduce(
          (sum, item) => sum + item.durationMin,
          0,
        ) / 60
      ).toFixed(1),
    );
    const completedHabits = state.habits.filter((item) => item.completedToday).length;

    return {
      goalsCompletion,
      streak,
      focusHours,
      completedHabits,
      goalsCount: state.goals.length,
      habitsCount: state.habits.length,
      booksCount: state.books.length,
    };
  }

  addDashboardTask(dto: AddTaskDto): LifeOSState {
    const state = this.state();
    state.dashboard.tasks.unshift({
      id: createId("task"),
      title: dto.title.trim(),
      done: false,
    });
    return this.setState(state);
  }

  toggleDashboardTask(taskId: string): LifeOSState {
    const state = this.state();
    state.dashboard.tasks = state.dashboard.tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task,
    );
    return this.setState(state);
  }

  getGoals() {
    return clone(this.state().goals);
  }

  addGoal(dto: CreateGoalDto): LifeOSState {
    const state = this.state();
    state.goals.unshift({
      id: createId("goal"),
      title: dto.title.trim(),
      period: dto.period,
      targetValue: Math.max(1, dto.targetValue),
      currentValue: 0,
      deadline: dto.deadline,
    });
    return this.setState(state);
  }

  updateGoalProgress(goalId: string, dto: UpdateGoalProgressDto): LifeOSState {
    const state = this.state();
    state.goals = state.goals.map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            currentValue: clamp(goal.currentValue + dto.delta, 0, goal.targetValue),
          }
        : goal,
    );
    return this.setState(state);
  }

  removeGoal(goalId: string): LifeOSState {
    const state = this.state();
    state.goals = state.goals.filter((goal) => goal.id !== goalId);
    return this.setState(state);
  }

  getHabits() {
    return clone(this.state().habits);
  }

  addHabit(dto: CreateHabitDto): LifeOSState {
    const state = this.state();
    state.habits.unshift({
      id: createId("habit"),
      title: dto.title.trim(),
      streak: 0,
      longestStreak: 0,
      completedDays: 0,
      completedToday: false,
    });
    return this.setState(state);
  }

  toggleHabitCheckIn(habitId: string): LifeOSState {
    const state = this.state();
    state.habits = state.habits.map((habit) => {
      if (habit.id !== habitId) {
        return habit;
      }

      if (habit.completedToday) {
        return {
          ...habit,
          completedToday: false,
          streak: Math.max(0, habit.streak - 1),
          completedDays: Math.max(0, habit.completedDays - 1),
        };
      }

      const nextStreak = habit.streak + 1;
      return {
        ...habit,
        completedToday: true,
        streak: nextStreak,
        longestStreak: Math.max(habit.longestStreak, nextStreak),
        completedDays: clamp(habit.completedDays + 1, 0, 40),
      };
    });
    return this.setState(state);
  }

  removeHabit(habitId: string): LifeOSState {
    const state = this.state();
    state.habits = state.habits.filter((habit) => habit.id !== habitId);
    return this.setState(state);
  }

  getBooks() {
    return clone(this.state().books);
  }

  addBook(dto: CreateBookDto): LifeOSState {
    const state = this.state();
    state.books.unshift({
      id: createId("book"),
      title: dto.title.trim(),
      author: dto.author.trim(),
      category: dto.category,
      pages: Math.max(1, dto.pages),
      readPages: 0,
      rating: 0,
      note: "Yangi kitob qo'shildi.",
      likes: 0,
      comments: [],
    });
    return this.setState(state);
  }

  updateBookReadPages(bookId: string, dto: UpdateBookPagesDto): LifeOSState {
    const state = this.state();
    state.books = state.books.map((book) =>
      book.id === bookId
        ? {
            ...book,
            readPages: clamp(dto.readPages, 0, book.pages),
          }
        : book,
    );
    return this.setState(state);
  }

  addBookComment(bookId: string, dto: AddCommentDto): LifeOSState {
    const state = this.state();
    state.books = state.books.map((book) =>
      book.id === bookId
        ? {
            ...book,
            comments: [dto.text.trim(), ...book.comments],
          }
        : book,
    );
    return this.setState(state);
  }

  likeBook(bookId: string): LifeOSState {
    const state = this.state();
    state.books = state.books.map((book) =>
      book.id === bookId
        ? {
            ...book,
            likes: book.likes + 1,
          }
        : book,
    );
    return this.setState(state);
  }

  getHealth() {
    return clone(this.state().health);
  }

  addCalories(dto: AmountDto): LifeOSState {
    const state = this.state();
    state.health.calories = Math.max(0, state.health.calories + dto.amount);
    return this.setState(state);
  }

  removeCalories(dto: AmountDto): LifeOSState {
    const state = this.state();
    state.health.calories = Math.max(0, state.health.calories - dto.amount);
    return this.setState(state);
  }

  addWater(dto: AmountDto): LifeOSState {
    const state = this.state();
    state.health.waterMl = Math.max(0, state.health.waterMl + dto.amount);
    return this.setState(state);
  }

  setSleep(dto: SleepDto): LifeOSState {
    const state = this.state();
    state.health.sleepHours = clamp(dto.hours, 0, 24);
    return this.setState(state);
  }

  getMastery() {
    return clone(this.state().mastery);
  }

  addSkill(dto: AddSkillDto): LifeOSState {
    const state = this.state();
    state.mastery.skills.push({
      id: createId("skill"),
      name: dto.name.trim(),
      hours: Math.max(0, dto.hours),
    });
    return this.setState(state);
  }

  addFocusSession(dto: AddFocusSessionDto): LifeOSState {
    const state = this.state();
    const skill = state.mastery.skills.find((item) => item.id === dto.skillId);
    if (!skill) {
      throw new NotFoundException("Skill topilmadi.");
    }

    state.mastery.focusSessions.unshift({
      id: createId("fs"),
      date: new Date().toISOString().slice(0, 10),
      durationMin: dto.minutes,
      skillId: dto.skillId,
    });
    skill.hours = Number((skill.hours + dto.minutes / 60).toFixed(2));
    return this.setState(state);
  }

  getNetwork() {
    return clone(this.state().network);
  }

  toggleConnection(dto: ToggleConnectionDto): LifeOSState {
    const state = this.state();
    const personExists = state.network.people.some((person) => person.id === dto.userId);
    if (!personExists) {
      throw new NotFoundException("Foydalanuvchi topilmadi.");
    }

    const alreadyConnected = state.network.connectedIds.includes(dto.userId);
    state.network.connectedIds = alreadyConnected
      ? state.network.connectedIds.filter((id) => id !== dto.userId)
      : [...state.network.connectedIds, dto.userId];

    return this.setState(state);
  }

  sendNetworkMessage(dto: SendNetworkMessageDto): LifeOSState {
    const state = this.state();
    const personExists = state.network.people.some((person) => person.id === dto.userId);
    if (!personExists) {
      throw new NotFoundException("Foydalanuvchi topilmadi.");
    }

    const existing = state.network.messageLog[dto.userId] ?? [];
    state.network.messageLog[dto.userId] = [dto.message.trim(), ...existing].slice(0, 6);

    return this.setState(state);
  }

  getAssistantMessages() {
    return clone(this.state().assistant.messages);
  }

  private assistantReply(prompt: string): string {
    const lower = prompt.toLowerCase();
    const state = this.state();
    const topHabit = [...state.habits].sort((a, b) => b.streak - a.streak)[0];
    const focusHours =
      state.mastery.focusSessions.reduce((sum, item) => sum + item.durationMin, 0) /
      60;

    if (lower.includes("reja")) {
      const activeGoals = state.goals
        .filter((goal) => goal.currentValue < goal.targetValue)
        .slice(0, 2)
        .map((goal) => goal.title);
      if (activeGoals.length > 0) {
        return `Bugungi plan: 1) ${activeGoals.join(", ")}, 2) ${topHabit?.title ?? "odat"} check-in, 3) 2 ta fokus sessiya.`;
      }
      return "Maqsadlar yopilgan. Bugun yangi maqsad qo'yib 30 daqiqa fokus sessiya boshlang.";
    }

    if (lower.includes("streak")) {
      return topHabit
        ? `${topHabit.title} bo'yicha streak ${topHabit.streak} kun. Shu vaqtni doimiy saqlang.`
        : "Streak uchun bitta oddiy odat yarating va 3 kun ketma-ket bajaring.";
    }

    if (lower.includes("fokus")) {
      return `Joriy fokus jami ${focusHours.toFixed(1)} soat. Bugun yana 2 ta sessiya qo'shish tavsiya etiladi.`;
    }

    return "Savolingiz qabul qilindi. Maqsad, odat va fokus ko'rsatkichlariga qarab tavsiya beraman.";
  }

  sendAssistantPrompt(dto: AssistantPromptDto): LifeOSState {
    const state = this.state();
    const userMessage = {
      id: state.assistant.nextId,
      role: "user" as const,
      text: dto.prompt.trim(),
    };
    const assistantMessage = {
      id: state.assistant.nextId + 1,
      role: "assistant" as const,
      text: this.assistantReply(dto.prompt),
    };
    state.assistant.messages.push(userMessage, assistantMessage);
    state.assistant.nextId += 2;

    return this.setState(state);
  }

  clearAssistantMessages(): LifeOSState {
    const state = this.state();
    state.assistant.messages = [
      {
        id: 1,
        role: "assistant",
        text: "Assalomu alaykum. Men sizning shaxsiy produktivlik yordamchingizman.",
      },
    ];
    state.assistant.nextId = 2;
    return this.setState(state);
  }

  getSettings() {
    return clone(this.state().settings);
  }

  setLanguage(dto: UpdateLanguageDto): LifeOSState {
    const state = this.state();
    state.settings.language = dto.language;
    return this.setState(state);
  }

  toggleNotification(dto: ToggleByKeyDto): LifeOSState {
    const state = this.state();
    const key = dto.key as keyof LifeOSState["settings"]["notifications"];
    if (!(key in state.settings.notifications)) {
      throw new NotFoundException("Notification key topilmadi.");
    }
    state.settings.notifications[key] = !state.settings.notifications[key];
    return this.setState(state);
  }

  toggleIntegration(dto: ToggleByKeyDto): LifeOSState {
    const state = this.state();
    const key = dto.key as keyof LifeOSState["settings"]["integrations"];
    if (!(key in state.settings.integrations)) {
      throw new NotFoundException("Integration key topilmadi.");
    }
    state.settings.integrations[key] = !state.settings.integrations[key];
    return this.setState(state);
  }

  getUploadedImagePayload(file: {
    filename: string;
    mimetype: string;
    size: number;
  }) {
    return {
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
    };
  }
}
