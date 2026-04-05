import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  AppSettings,
  Prisma,
  User as PrismaUser,
} from "@prisma/client";
import { compareSync, hashSync } from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { JwtService } from "@nestjs/jwt";
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
  GoogleAuthDto,
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
  RefreshTokenPayload,
  SessionPayload,
} from "./types";
import { PrismaService } from "./prisma/prisma.service";

function createId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
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
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function isBcryptHash(password: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(password);
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim();
  if (!normalized) {
    return { firstName: "Google", lastName: "User" };
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0], lastName: "User" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly googleOAuthClient = new OAuth2Client();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  private normalizeRole(role: string): "admin" | "user" {
    return role === "admin" ? "admin" : "user";
  }

  private normalizeRequiredText(
    value: string,
    fieldName: string,
    minLength = 1,
  ): string {
    const normalized = value.trim();
    if (normalized.length < minLength) {
      throw new BadRequestException(
        `${fieldName} kamida ${minLength} ta belgidan iborat bo'lishi kerak.`,
      );
    }
    return normalized;
  }

  private normalizeEntityId(id: string, fieldName: string): string {
    const normalized = id.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} bo'sh bo'lishi mumkin emas.`);
    }
    return normalized;
  }

  private requirePositiveNumber(value: number, fieldName: string): number {
    if (!Number.isFinite(value) || value <= 0) {
      throw new BadRequestException(`${fieldName} 0 dan katta bo'lishi kerak.`);
    }
    return value;
  }

  private requireNonNegativeNumber(value: number, fieldName: string): number {
    if (!Number.isFinite(value) || value < 0) {
      throw new BadRequestException(
        `${fieldName} 0 yoki undan katta bo'lishi kerak.`,
      );
    }
    return value;
  }

  private requirePositiveInteger(value: number, fieldName: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestException(
        `${fieldName} musbat butun son bo'lishi kerak.`,
      );
    }
    return value;
  }

  private parseDateValue(value: string, fieldName: string): Date {
    const normalized = this.normalizeRequiredText(value, fieldName, 1);

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const date = new Date(`${normalized}T00:00:00.000Z`);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} sana formatida bo'lishi kerak.`);
    }

    return parsed;
  }

  private toDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private normalizeSeedUser(user: Partial<AuthUser>, index: number): AuthUser {
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
      email: String(user.email ?? "")
        .trim()
        .toLowerCase(),
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
      password: typeof user.password === "string" ? user.password : "",
      tokenVersion:
        typeof user.tokenVersion === "number" && user.tokenVersion >= 1
          ? Math.floor(user.tokenVersion)
          : 1,
      refreshTokenId:
        typeof user.refreshTokenId === "string" && user.refreshTokenId.trim()
          ? user.refreshTokenId.trim()
          : null,
      createdAt: user.createdAt ?? new Date().toISOString(),
    };
  }

  private toPrismaUserInput(user: AuthUser): Prisma.UserUncheckedCreateInput {
    const parsedCreatedAt = new Date(user.createdAt);
    const createdAt = Number.isNaN(parsedCreatedAt.getTime())
      ? new Date()
      : parsedCreatedAt;

    return {
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
      password: isBcryptHash(user.password)
        ? user.password
        : hashSync(user.password, PASSWORD_HASH_ROUNDS),
      tokenVersion: Math.max(1, Math.floor(user.tokenVersion)),
      refreshTokenId: user.refreshTokenId,
      createdAt,
    };
  }

  private async seedDefaults(): Promise<void> {
    const defaults = DEFAULT_PERSISTED_DATA;

    await this.prisma.$transaction(async (tx) => {
      const usersCount = await tx.user.count();
      if (usersCount === 0) {
        const normalizedUsers = defaults.users.map((user, index) =>
          this.normalizeSeedUser(user, index),
        );
        await tx.user.createMany({
          data: normalizedUsers.map((user) => this.toPrismaUserInput(user)),
        });
      }

      const publicContentCount = await tx.publicContent.count();
      if (publicContentCount === 0) {
        await tx.publicContent.create({
          data: {
            id: 1,
            payload: defaults.state.content as unknown as Prisma.InputJsonValue,
          },
        });
      }

      const appSettingsCount = await tx.appSettings.count();
      if (appSettingsCount === 0) {
        await tx.appSettings.create({
          data: {
            id: 1,
            language: defaults.state.settings.language,
            notifyHabits: defaults.state.settings.notifications.habits,
            notifyGoals: defaults.state.settings.notifications.goals,
            notifyAssistant: defaults.state.settings.notifications.assistant,
            integrationCalendar: defaults.state.settings.integrations.calendar,
            integrationSmartwatch:
              defaults.state.settings.integrations.smartwatch,
            integrationMobileSync:
              defaults.state.settings.integrations.mobileSync,
          },
        });
      }

      const healthOverviewCount = await tx.healthOverview.count();
      if (healthOverviewCount === 0) {
        await tx.healthOverview.create({
          data: {
            id: 1,
            calories: defaults.state.health.calories,
            waterMl: defaults.state.health.waterMl,
            sleepHours: defaults.state.health.sleepHours,
          },
        });
      }

      if ((await tx.dashboardTask.count()) === 0) {
        const tasks = defaults.state.dashboard.tasks;
        if (tasks.length > 0) {
          await tx.dashboardTask.createMany({
            data: tasks.map((task) => ({
              id: task.id,
              title: task.title,
              done: task.done,
            })),
          });
        }
      }

      if ((await tx.goal.count()) === 0) {
        const goals = defaults.state.goals;
        if (goals.length > 0) {
          await tx.goal.createMany({
            data: goals.map((goal) => ({
              id: goal.id,
              title: goal.title,
              period: goal.period,
              targetValue: Math.max(1, Math.floor(goal.targetValue)),
              currentValue: Math.max(0, Math.floor(goal.currentValue)),
              deadline: this.parseDateValue(goal.deadline, "Goal deadline"),
            })),
          });
        }
      }

      if ((await tx.habit.count()) === 0) {
        const habits = defaults.state.habits;
        if (habits.length > 0) {
          await tx.habit.createMany({
            data: habits.map((habit) => ({
              id: habit.id,
              title: habit.title,
              streak: habit.streak,
              longestStreak: habit.longestStreak,
              completedDays: habit.completedDays,
              completedToday: habit.completedToday,
            })),
          });
        }
      }

      if ((await tx.book.count()) === 0) {
        const books = defaults.state.books;
        if (books.length > 0) {
          await tx.book.createMany({
            data: books.map((book) => ({
              id: book.id,
              title: book.title,
              author: book.author,
              category: book.category,
              pages: Math.max(1, Math.floor(book.pages)),
              readPages: clamp(Math.floor(book.readPages), 0, Math.floor(book.pages)),
              rating: Math.floor(book.rating),
              note: book.note,
              likes: Math.max(0, Math.floor(book.likes)),
            })),
          });

          const comments = books.flatMap((book) =>
            book.comments.map((text) => ({
              bookId: book.id,
              text,
            })),
          );
          if (comments.length > 0) {
            await tx.bookComment.createMany({ data: comments });
          }
        }
      }

      if ((await tx.healthLog.count()) === 0) {
        const logs = defaults.state.health.logs;
        if (logs.length > 0) {
          await tx.healthLog.createMany({
            data: logs.map((log) => ({
              id: log.id,
              day: log.day,
              calories: log.calories,
              waterMl: log.waterMl,
              sleepHours: log.sleepHours,
            })),
          });
        }
      }

      if ((await tx.masterySkill.count()) === 0) {
        const skills = defaults.state.mastery.skills;
        if (skills.length > 0) {
          await tx.masterySkill.createMany({
            data: skills.map((skill) => ({
              id: skill.id,
              name: skill.name,
              hours: skill.hours,
            })),
          });
        }
      }

      if ((await tx.focusSession.count()) === 0) {
        const sessions = defaults.state.mastery.focusSessions;
        if (sessions.length > 0) {
          await tx.focusSession.createMany({
            data: sessions.map((session) => ({
              id: session.id,
              date: this.parseDateValue(session.date, "Focus session date"),
              durationMin: Math.max(1, Math.floor(session.durationMin)),
              skillId: session.skillId,
            })),
          });
        }
      }

      if ((await tx.networkPerson.count()) === 0) {
        const people = defaults.state.network.people;
        if (people.length > 0) {
          await tx.networkPerson.createMany({
            data: people.map((person) => ({
              id: person.id,
              name: person.name,
              username: person.username,
              job: person.job,
              skill: person.skill,
              streak: person.streak,
              mutualFriends: person.mutualFriends,
            })),
          });
        }
      }

      if ((await tx.networkConnection.count()) === 0) {
        const connectedIds = defaults.state.network.connectedIds;
        if (connectedIds.length > 0) {
          await tx.networkConnection.createMany({
            data: connectedIds.map((personId) => ({ personId })),
            skipDuplicates: true,
          });
        }
      }

      if ((await tx.networkMessage.count()) === 0) {
        const messageRows: Array<{ personId: number; message: string }> = [];
        for (const [idText, messages] of Object.entries(
          defaults.state.network.messageLog,
        )) {
          const personId = Number(idText);
          if (!Number.isInteger(personId) || personId <= 0) {
            continue;
          }

          for (const message of messages) {
            messageRows.push({ personId, message });
          }
        }

        if (messageRows.length > 0) {
          await tx.networkMessage.createMany({ data: messageRows });
        }
      }

      if ((await tx.assistantMessage.count()) === 0) {
        const assistantMessages = defaults.state.assistant.messages;
        if (assistantMessages.length > 0) {
          await tx.assistantMessage.createMany({
            data: assistantMessages.map((message) => ({
              id: message.id,
              role: message.role,
              text: message.text,
            })),
          });
        }
      }
    });
  }

  private mapSettingsRow(row: AppSettings): LifeOSState["settings"] {
    return {
      language: row.language,
      notifications: {
        habits: row.notifyHabits,
        goals: row.notifyGoals,
        assistant: row.notifyAssistant,
      },
      integrations: {
        calendar: row.integrationCalendar,
        smartwatch: row.integrationSmartwatch,
        mobileSync: row.integrationMobileSync,
      },
    };
  }

  private parseContentPayload(payload: Prisma.JsonValue): LifeOSState["content"] {
    const defaults = clone(DEFAULT_PERSISTED_DATA.state.content);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return defaults;
    }

    const parsed = clone(payload as unknown as Partial<LifeOSState["content"]>);
    const landingCandidate =
      parsed.landing &&
      typeof parsed.landing === "object" &&
      !Array.isArray(parsed.landing)
        ? (parsed.landing as Partial<LifeOSState["content"]["landing"]>)
        : undefined;

    const heroStatsCandidate =
      landingCandidate?.heroStats &&
      typeof landingCandidate.heroStats === "object" &&
      !Array.isArray(landingCandidate.heroStats)
        ? (landingCandidate.heroStats as Partial<
            LifeOSState["content"]["landing"]["heroStats"]
          >)
        : undefined;

    const heroStats = {
      goalsCount:
        typeof heroStatsCandidate?.goalsCount === "string" &&
        heroStatsCandidate.goalsCount.trim().length > 0
          ? heroStatsCandidate.goalsCount.trim()
          : defaults.landing.heroStats.goalsCount,
      productivityGrowth:
        typeof heroStatsCandidate?.productivityGrowth === "string" &&
        heroStatsCandidate.productivityGrowth.trim().length > 0
          ? heroStatsCandidate.productivityGrowth.trim()
          : defaults.landing.heroStats.productivityGrowth,
    };

    return {
      ...defaults,
      ...parsed,
      landing: {
        ...defaults.landing,
        ...(landingCandidate ?? {}),
        heroStats,
        stats: Array.isArray(landingCandidate?.stats)
          ? landingCandidate.stats
          : defaults.landing.stats,
        features: Array.isArray(landingCandidate?.features)
          ? landingCandidate.features
          : defaults.landing.features,
        founders: Array.isArray(landingCandidate?.founders)
          ? landingCandidate.founders
          : defaults.landing.founders,
      },
    };
  }

  private async getOrCreatePublicContent(): Promise<LifeOSState["content"]> {
    const row = await this.prisma.publicContent.findUnique({ where: { id: 1 } });
    if (row) {
      return this.parseContentPayload(row.payload);
    }

    await this.prisma.publicContent.create({
      data: {
        id: 1,
        payload: DEFAULT_PERSISTED_DATA.state.content as unknown as Prisma.InputJsonValue,
      },
    });
    return clone(DEFAULT_PERSISTED_DATA.state.content);
  }

  private async getOrCreateSettings(): Promise<AppSettings> {
    const row = await this.prisma.appSettings.findUnique({ where: { id: 1 } });
    if (row) {
      return row;
    }

    const defaults = DEFAULT_PERSISTED_DATA.state.settings;
    return this.prisma.appSettings.create({
      data: {
        id: 1,
        language: defaults.language,
        notifyHabits: defaults.notifications.habits,
        notifyGoals: defaults.notifications.goals,
        notifyAssistant: defaults.notifications.assistant,
        integrationCalendar: defaults.integrations.calendar,
        integrationSmartwatch: defaults.integrations.smartwatch,
        integrationMobileSync: defaults.integrations.mobileSync,
      },
    });
  }

  private async getOrCreateHealthOverview(): Promise<{
    id: number;
    calories: number;
    waterMl: number;
    sleepHours: number;
  }> {
    const row = await this.prisma.healthOverview.findUnique({ where: { id: 1 } });
    if (row) {
      return row;
    }

    const defaults = DEFAULT_PERSISTED_DATA.state.health;
    return this.prisma.healthOverview.create({
      data: {
        id: 1,
        calories: defaults.calories,
        waterMl: defaults.waterMl,
        sleepHours: defaults.sleepHours,
      },
    });
  }

  private toSessionUser(user: PrismaUser): SessionPayload["user"] {
    return {
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
      role: this.normalizeRole(user.role),
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async issueSession(user: PrismaUser): Promise<SessionPayload> {
    if (!user.email || !user.password) {
      throw new BadRequestException("Foydalanuvchi ma'lumotlari yaroqsiz.");
    }

    const refreshTokenId = createId("rft");
    const role = this.normalizeRole(user.role);

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role,
      tokenVersion: user.tokenVersion,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      refreshTokenId,
      type: "refresh",
    };

    const [accessToken, refreshToken, updatedUser] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: ACCESS_TOKEN_SECRET,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: REFRESH_TOKEN_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenId },
      }),
    ]);

    return {
      user: this.toSessionUser(updatedUser),
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
      loggedInAt: new Date().toISOString(),
    };
  }

  private async buildNetworkState(): Promise<LifeOSState["network"]> {
    const [peopleRows, connectionRows, messageRows] = await Promise.all([
      this.prisma.networkPerson.findMany({
        orderBy: { id: "asc" },
      }),
      this.prisma.networkConnection.findMany({
        select: { personId: true },
        orderBy: { personId: "asc" },
      }),
      this.prisma.networkMessage.findMany({
        select: {
          personId: true,
          message: true,
        },
        orderBy: [{ personId: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    const messageLog: Record<number, string[]> = {};
    for (const row of messageRows) {
      const existing = messageLog[row.personId] ?? [];
      if (existing.length < 6) {
        messageLog[row.personId] = [...existing, row.message];
      }
    }

    return {
      people: peopleRows.map((person) => ({
        id: person.id,
        name: person.name,
        username: person.username,
        job: person.job,
        skill: person.skill,
        streak: person.streak,
        mutualFriends: person.mutualFriends,
      })),
      connectedIds: connectionRows.map((row) => row.personId),
      messageLog,
    };
  }

  async getState(): Promise<LifeOSState> {
    const [
      content,
      dashboardTasks,
      goals,
      habits,
      books,
      healthOverview,
      healthLogs,
      masterySkills,
      focusSessions,
      network,
      assistantRows,
      settings,
    ] = await Promise.all([
      this.getOrCreatePublicContent(),
      this.prisma.dashboardTask.findMany({
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.goal.findMany({
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.habit.findMany({
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.book.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          comments: {
            select: { text: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      this.getOrCreateHealthOverview(),
      this.prisma.healthLog.findMany({
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.masterySkill.findMany({
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.focusSession.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      this.buildNetworkState(),
      this.prisma.assistantMessage.findMany({
        orderBy: { id: "asc" },
      }),
      this.getOrCreateSettings(),
    ]);

    const assistantMessages: LifeOSState["assistant"]["messages"] =
      assistantRows.map((message) => ({
        id: message.id,
        role: message.role === "user" ? "user" : "assistant",
        text: message.text,
      }));

    return {
      content,
      dashboard: {
        tasks: dashboardTasks.map((task) => ({
          id: task.id,
          title: task.title,
          done: task.done,
        })),
      },
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        period: goal.period as "Yillik" | "Oylik" | "Haftalik" | "Kunlik",
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        deadline: this.toDateOnly(goal.deadline),
      })),
      habits: habits.map((habit) => ({
        id: habit.id,
        title: habit.title,
        streak: habit.streak,
        longestStreak: habit.longestStreak,
        completedDays: habit.completedDays,
        completedToday: habit.completedToday,
      })),
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        pages: book.pages,
        readPages: book.readPages,
        rating: book.rating,
        note: book.note,
        likes: book.likes,
        comments: book.comments.map((comment) => comment.text),
      })),
      health: {
        calories: healthOverview.calories,
        waterMl: healthOverview.waterMl,
        sleepHours: healthOverview.sleepHours,
        logs: healthLogs.map((log) => ({
          id: log.id,
          day: log.day,
          calories: log.calories,
          waterMl: log.waterMl,
          sleepHours: log.sleepHours,
        })),
      },
      mastery: {
        skills: masterySkills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          hours: skill.hours,
        })),
        focusSessions: focusSessions.map((session) => ({
          id: session.id,
          date: this.toDateOnly(session.date),
          durationMin: session.durationMin,
          skillId: session.skillId,
        })),
      },
      network,
      assistant: {
        messages: assistantMessages,
        nextId:
          assistantMessages.length > 0
            ? assistantMessages[assistantMessages.length - 1].id + 1
            : 1,
      },
      settings: this.mapSettingsRow(settings),
    };
  }

  async resetState(): Promise<LifeOSState> {
    const defaults = DEFAULT_PERSISTED_DATA.state;

    await this.prisma.$transaction(async (tx) => {
      await tx.bookComment.deleteMany();
      await tx.focusSession.deleteMany();
      await tx.networkConnection.deleteMany();
      await tx.networkMessage.deleteMany();
      await tx.assistantMessage.deleteMany();

      await tx.dashboardTask.deleteMany();
      await tx.goal.deleteMany();
      await tx.habit.deleteMany();
      await tx.healthLog.deleteMany();
      await tx.book.deleteMany();
      await tx.masterySkill.deleteMany();
      await tx.networkPerson.deleteMany();

      if (defaults.dashboard.tasks.length > 0) {
        await tx.dashboardTask.createMany({
          data: defaults.dashboard.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            done: task.done,
          })),
        });
      }

      if (defaults.goals.length > 0) {
        await tx.goal.createMany({
          data: defaults.goals.map((goal) => ({
            id: goal.id,
            title: goal.title,
            period: goal.period,
            targetValue: Math.max(1, Math.floor(goal.targetValue)),
            currentValue: Math.max(0, Math.floor(goal.currentValue)),
            deadline: this.parseDateValue(goal.deadline, "Goal deadline"),
          })),
        });
      }

      if (defaults.habits.length > 0) {
        await tx.habit.createMany({
          data: defaults.habits.map((habit) => ({
            id: habit.id,
            title: habit.title,
            streak: habit.streak,
            longestStreak: habit.longestStreak,
            completedDays: habit.completedDays,
            completedToday: habit.completedToday,
          })),
        });
      }

      if (defaults.books.length > 0) {
        await tx.book.createMany({
          data: defaults.books.map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            pages: Math.max(1, Math.floor(book.pages)),
            readPages: clamp(Math.floor(book.readPages), 0, Math.floor(book.pages)),
            rating: Math.floor(book.rating),
            note: book.note,
            likes: Math.max(0, Math.floor(book.likes)),
          })),
        });

        const comments = defaults.books.flatMap((book) =>
          book.comments.map((text) => ({
            bookId: book.id,
            text,
          })),
        );
        if (comments.length > 0) {
          await tx.bookComment.createMany({ data: comments });
        }
      }

      if (defaults.health.logs.length > 0) {
        await tx.healthLog.createMany({
          data: defaults.health.logs.map((log) => ({
            id: log.id,
            day: log.day,
            calories: log.calories,
            waterMl: log.waterMl,
            sleepHours: log.sleepHours,
          })),
        });
      }

      if (defaults.mastery.skills.length > 0) {
        await tx.masterySkill.createMany({
          data: defaults.mastery.skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            hours: skill.hours,
          })),
        });
      }

      if (defaults.mastery.focusSessions.length > 0) {
        await tx.focusSession.createMany({
          data: defaults.mastery.focusSessions.map((session) => ({
            id: session.id,
            date: this.parseDateValue(session.date, "Focus session date"),
            durationMin: Math.max(1, Math.floor(session.durationMin)),
            skillId: session.skillId,
          })),
        });
      }

      if (defaults.network.people.length > 0) {
        await tx.networkPerson.createMany({
          data: defaults.network.people.map((person) => ({
            id: person.id,
            name: person.name,
            username: person.username,
            job: person.job,
            skill: person.skill,
            streak: person.streak,
            mutualFriends: person.mutualFriends,
          })),
        });
      }

      if (defaults.network.connectedIds.length > 0) {
        await tx.networkConnection.createMany({
          data: defaults.network.connectedIds.map((personId) => ({ personId })),
          skipDuplicates: true,
        });
      }

      const messageRows: Array<{ personId: number; message: string }> = [];
      for (const [idText, messages] of Object.entries(defaults.network.messageLog)) {
        const personId = Number(idText);
        if (!Number.isInteger(personId) || personId <= 0) {
          continue;
        }

        for (const message of messages) {
          messageRows.push({ personId, message });
        }
      }
      if (messageRows.length > 0) {
        await tx.networkMessage.createMany({ data: messageRows });
      }

      if (defaults.assistant.messages.length > 0) {
        await tx.assistantMessage.createMany({
          data: defaults.assistant.messages.map((message) => ({
            id: message.id,
            role: message.role,
            text: message.text,
          })),
        });
      }

      await tx.publicContent.upsert({
        where: { id: 1 },
        update: {
          payload: defaults.content as unknown as Prisma.InputJsonValue,
        },
        create: {
          id: 1,
          payload: defaults.content as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.appSettings.upsert({
        where: { id: 1 },
        update: {
          language: defaults.settings.language,
          notifyHabits: defaults.settings.notifications.habits,
          notifyGoals: defaults.settings.notifications.goals,
          notifyAssistant: defaults.settings.notifications.assistant,
          integrationCalendar: defaults.settings.integrations.calendar,
          integrationSmartwatch: defaults.settings.integrations.smartwatch,
          integrationMobileSync: defaults.settings.integrations.mobileSync,
        },
        create: {
          id: 1,
          language: defaults.settings.language,
          notifyHabits: defaults.settings.notifications.habits,
          notifyGoals: defaults.settings.notifications.goals,
          notifyAssistant: defaults.settings.notifications.assistant,
          integrationCalendar: defaults.settings.integrations.calendar,
          integrationSmartwatch: defaults.settings.integrations.smartwatch,
          integrationMobileSync: defaults.settings.integrations.mobileSync,
        },
      });

      await tx.healthOverview.upsert({
        where: { id: 1 },
        update: {
          calories: defaults.health.calories,
          waterMl: defaults.health.waterMl,
          sleepHours: defaults.health.sleepHours,
        },
        create: {
          id: 1,
          calories: defaults.health.calories,
          waterMl: defaults.health.waterMl,
          sleepHours: defaults.health.sleepHours,
        },
      });
    });

    return this.getState();
  }

  async getPublicContent(): Promise<LifeOSState["content"]> {
    return this.getOrCreatePublicContent();
  }

  async getLandingContent(): Promise<LifeOSState["content"]["landing"]> {
    const content = await this.getOrCreatePublicContent();
    return content.landing;
  }

  async register(dto: RegisterDto): Promise<SessionPayload> {
    const firstName = this.normalizeRequiredText(dto.firstName, "Ism", 2);
    const lastName = this.normalizeRequiredText(dto.lastName, "Familiya", 2);
    const phone = this.normalizeRequiredText(dto.phone, "Telefon raqami", 9);
    const address = this.normalizeRequiredText(dto.address, "Manzil", 5);
    const region = this.normalizeRequiredText(dto.region, "Viloyat", 2);
    const city = this.normalizeRequiredText(dto.city, "Shahar", 2);
    const district = this.normalizeRequiredText(dto.district, "Tuman", 2);
    const profession = this.normalizeRequiredText(dto.profession, "Kasb", 2);
    const password = this.normalizeRequiredText(dto.password, "Parol", 6);
    const email = this.normalizeRequiredText(dto.email, "Email", 5).toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan.");
    }

    const user = await this.prisma.user.create({
      data: {
        id: createId("user"),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        address,
        region,
        city,
        district,
        profession,
        role: "user",
        password: hashSync(password, PASSWORD_HASH_ROUNDS),
        tokenVersion: 1,
        refreshTokenId: null,
        createdAt: new Date(),
      },
    });

    return this.issueSession(user);
  }

  async login(dto: LoginDto): Promise<SessionPayload> {
    const email = this.normalizeRequiredText(dto.email, "Email", 5).toLowerCase();
    const password = this.normalizeRequiredText(dto.password, "Parol", 6);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri.");
    }

    const hashedPassword = isBcryptHash(user.password);
    const isValidPassword = hashedPassword
      ? compareSync(password, user.password)
      : user.password === password;

    if (!isValidPassword) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri.");
    }

    let normalizedUser = user;
    if (!hashedPassword) {
      normalizedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashSync(password, PASSWORD_HASH_ROUNDS),
        },
      });
    }

    return this.issueSession(normalizedUser);
  }

  async authWithGoogle(dto: GoogleAuthDto): Promise<SessionPayload> {
    if (GOOGLE_CLIENT_IDS.length === 0) {
      throw new BadRequestException(
        "Google auth sozlanmagan. GOOGLE_CLIENT_ID ni backend env ga kiriting.",
      );
    }

    const idToken = this.normalizeRequiredText(dto.idToken, "Google ID token", 20);

    let payload:
      | {
          email?: string;
          email_verified?: boolean;
          name?: string;
          given_name?: string;
          family_name?: string;
        }
      | undefined;

    try {
      const ticket = await this.googleOAuthClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_IDS,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException("Google ID token yaroqsiz.");
    }

    const email = payload?.email?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException(
        "Google akkaunt email ma'lumoti topilmadi.",
      );
    }

    if (payload?.email_verified === false) {
      throw new UnauthorizedException("Google email tasdiqlanmagan.");
    }

    const fullName =
      payload?.name?.trim() ||
      payload?.given_name?.trim() ||
      email.split("@")[0];
    const firstName =
      payload?.given_name?.trim() || splitName(fullName).firstName;
    const lastName =
      payload?.family_name?.trim() || splitName(fullName).lastName;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      const firstNameNext =
        !existing.firstName || existing.firstName === "User"
          ? firstName || existing.firstName
          : existing.firstName;
      const lastNameNext =
        !existing.lastName || existing.lastName === "Member"
          ? lastName || existing.lastName
          : existing.lastName;
      const fullNameNext =
        !existing.fullName || existing.fullName === "User"
          ? fullName || `${firstName} ${lastName}`.trim() || existing.fullName
          : existing.fullName;

      const updated =
        firstNameNext !== existing.firstName ||
        lastNameNext !== existing.lastName ||
        fullNameNext !== existing.fullName
          ? await this.prisma.user.update({
              where: { id: existing.id },
              data: {
                firstName: firstNameNext,
                lastName: lastNameNext,
                fullName: fullNameNext,
              },
            })
          : existing;

      return this.issueSession(updated);
    }

    const user = await this.prisma.user.create({
      data: {
        id: createId("user"),
        firstName: firstName || "Google",
        lastName: lastName || "User",
        fullName: fullName || `${firstName} ${lastName}`.trim() || "Google User",
        email,
        phone: "",
        address: "",
        region: "",
        city: "",
        district: "",
        profession: "Google user",
        role: "user",
        password: hashSync(`google-${createId("pwd")}`, PASSWORD_HASH_ROUNDS),
        tokenVersion: 1,
        refreshTokenId: null,
        createdAt: new Date(),
      },
    });

    return this.issueSession(user);
  }

  async refreshAccessToken(dto: RefreshTokenDto): Promise<SessionPayload> {
    const refreshToken = this.normalizeRequiredText(
      dto.refreshToken,
      "Refresh token",
      16,
    );

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: REFRESH_TOKEN_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException(
        "Refresh token yaroqsiz yoki muddati tugagan.",
      );
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Refresh token noto'g'ri formatda.");
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
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

  async validateAccessTokenPayload(payload: AccessTokenPayload): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
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

  async getAdminUsers(actorUserId: string): Promise<SessionPayload["user"][]> {
    const actor = await this.prisma.user.findUnique({ where: { id: actorUserId } });
    if (!actor || this.normalizeRole(actor.role) !== "admin") {
      throw new ForbiddenException("Bu bo'lim faqat admin uchun.");
    }

    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => this.toSessionUser(user));
  }

  async getDashboardSummary(): Promise<{
    goalsCompletion: number;
    streak: number;
    focusHours: number;
    completedHabits: number;
    goalsCount: number;
    habitsCount: number;
    booksCount: number;
  }> {
    const [goals, habits, focusAggregate, booksCount] = await Promise.all([
      this.prisma.goal.findMany({
        select: {
          targetValue: true,
          currentValue: true,
        },
      }),
      this.prisma.habit.findMany({
        select: {
          streak: true,
          completedToday: true,
        },
      }),
      this.prisma.focusSession.aggregate({
        _sum: {
          durationMin: true,
        },
      }),
      this.prisma.book.count(),
    ]);

    const goalsCompletion =
      goals.length === 0
        ? 0
        : Math.round(
            goals.reduce((sum, goal) => {
              if (goal.targetValue <= 0) {
                return sum;
              }
              return sum + (goal.currentValue / goal.targetValue) * 100;
            }, 0) / goals.length,
          );

    const streak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
    const completedHabits = habits.filter((habit) => habit.completedToday).length;
    const totalFocusMinutes = focusAggregate._sum.durationMin ?? 0;

    return {
      goalsCompletion,
      streak,
      focusHours: Number((totalFocusMinutes / 60).toFixed(1)),
      completedHabits,
      goalsCount: goals.length,
      habitsCount: habits.length,
      booksCount,
    };
  }

  async addDashboardTask(dto: AddTaskDto): Promise<LifeOSState> {
    const title = this.normalizeRequiredText(dto.title, "Task nomi", 1);
    await this.prisma.dashboardTask.create({
      data: {
        id: createId("task"),
        title,
        done: false,
      },
    });
    return this.getState();
  }

  async toggleDashboardTask(taskId: string): Promise<LifeOSState> {
    const normalizedTaskId = this.normalizeEntityId(taskId, "Task ID");
    const task = await this.prisma.dashboardTask.findUnique({
      where: { id: normalizedTaskId },
    });
    if (!task) {
      throw new NotFoundException("Task topilmadi.");
    }

    await this.prisma.dashboardTask.update({
      where: { id: normalizedTaskId },
      data: { done: !task.done },
    });

    return this.getState();
  }

  async getGoals(): Promise<LifeOSState["goals"]> {
    const goals = await this.prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      period: goal.period as "Yillik" | "Oylik" | "Haftalik" | "Kunlik",
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      deadline: this.toDateOnly(goal.deadline),
    }));
  }

  async addGoal(dto: CreateGoalDto): Promise<LifeOSState> {
    const title = this.normalizeRequiredText(dto.title, "Maqsad nomi", 2);
    const targetValue = this.requirePositiveNumber(dto.targetValue, "Maqsad qiymati");
    const deadline = this.parseDateValue(dto.deadline, "Deadline");

    await this.prisma.goal.create({
      data: {
        id: createId("goal"),
        title,
        period: dto.period,
        targetValue: Math.max(1, Math.floor(targetValue)),
        currentValue: 0,
        deadline,
      },
    });

    return this.getState();
  }

  async updateGoalProgress(
    goalId: string,
    dto: UpdateGoalProgressDto,
  ): Promise<LifeOSState> {
    const normalizedGoalId = this.normalizeEntityId(goalId, "Maqsad ID");
    if (!Number.isInteger(dto.delta)) {
      throw new BadRequestException("Progress delta butun son bo'lishi kerak.");
    }

    const goal = await this.prisma.goal.findUnique({
      where: { id: normalizedGoalId },
    });
    if (!goal) {
      throw new NotFoundException("Maqsad topilmadi.");
    }

    await this.prisma.goal.update({
      where: { id: normalizedGoalId },
      data: {
        currentValue: clamp(goal.currentValue + dto.delta, 0, goal.targetValue),
      },
    });

    return this.getState();
  }

  async removeGoal(goalId: string): Promise<LifeOSState> {
    const normalizedGoalId = this.normalizeEntityId(goalId, "Maqsad ID");
    const goal = await this.prisma.goal.findUnique({
      where: { id: normalizedGoalId },
      select: { id: true },
    });
    if (!goal) {
      throw new NotFoundException("Maqsad topilmadi.");
    }

    await this.prisma.goal.delete({ where: { id: normalizedGoalId } });
    return this.getState();
  }

  async getHabits(): Promise<LifeOSState["habits"]> {
    const habits = await this.prisma.habit.findMany({
      orderBy: { createdAt: "desc" },
    });

    return habits.map((habit) => ({
      id: habit.id,
      title: habit.title,
      streak: habit.streak,
      longestStreak: habit.longestStreak,
      completedDays: habit.completedDays,
      completedToday: habit.completedToday,
    }));
  }

  async addHabit(dto: CreateHabitDto): Promise<LifeOSState> {
    const title = this.normalizeRequiredText(dto.title, "Odat nomi", 2);
    await this.prisma.habit.create({
      data: {
        id: createId("habit"),
        title,
        streak: 0,
        longestStreak: 0,
        completedDays: 0,
        completedToday: false,
      },
    });

    return this.getState();
  }

  async toggleHabitCheckIn(habitId: string): Promise<LifeOSState> {
    const normalizedHabitId = this.normalizeEntityId(habitId, "Odat ID");
    const habit = await this.prisma.habit.findUnique({
      where: { id: normalizedHabitId },
    });
    if (!habit) {
      throw new NotFoundException("Odat topilmadi.");
    }

    if (habit.completedToday) {
      await this.prisma.habit.update({
        where: { id: normalizedHabitId },
        data: {
          completedToday: false,
          streak: Math.max(0, habit.streak - 1),
          completedDays: Math.max(0, habit.completedDays - 1),
        },
      });
      return this.getState();
    }

    const nextStreak = habit.streak + 1;
    await this.prisma.habit.update({
      where: { id: normalizedHabitId },
      data: {
        completedToday: true,
        streak: nextStreak,
        longestStreak: Math.max(habit.longestStreak, nextStreak),
        completedDays: clamp(habit.completedDays + 1, 0, 40),
      },
    });

    return this.getState();
  }

  async removeHabit(habitId: string): Promise<LifeOSState> {
    const normalizedHabitId = this.normalizeEntityId(habitId, "Odat ID");
    const habit = await this.prisma.habit.findUnique({
      where: { id: normalizedHabitId },
      select: { id: true },
    });
    if (!habit) {
      throw new NotFoundException("Odat topilmadi.");
    }

    await this.prisma.habit.delete({ where: { id: normalizedHabitId } });
    return this.getState();
  }

  async getBooks(): Promise<LifeOSState["books"]> {
    const books = await this.prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          select: { text: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      pages: book.pages,
      readPages: book.readPages,
      rating: book.rating,
      note: book.note,
      likes: book.likes,
      comments: book.comments.map((comment) => comment.text),
    }));
  }

  async addBook(dto: CreateBookDto): Promise<LifeOSState> {
    const title = this.normalizeRequiredText(dto.title, "Kitob nomi", 1);
    const author = this.normalizeRequiredText(dto.author, "Muallif", 1);
    const category = this.normalizeRequiredText(dto.category, "Kategoriya", 1);
    const pages = this.requirePositiveInteger(dto.pages, "Sahifalar soni");

    await this.prisma.book.create({
      data: {
        id: createId("book"),
        title,
        author,
        category,
        pages,
        readPages: 0,
        rating: 0,
        note: "Yangi kitob qo'shildi.",
        likes: 0,
      },
    });

    return this.getState();
  }

  async updateBookReadPages(
    bookId: string,
    dto: UpdateBookPagesDto,
  ): Promise<LifeOSState> {
    const normalizedBookId = this.normalizeEntityId(bookId, "Kitob ID");
    const readPages = this.requireNonNegativeNumber(dto.readPages, "O'qilgan sahifalar");

    const book = await this.prisma.book.findUnique({ where: { id: normalizedBookId } });
    if (!book) {
      throw new NotFoundException("Kitob topilmadi.");
    }

    await this.prisma.book.update({
      where: { id: normalizedBookId },
      data: {
        readPages: clamp(Math.floor(readPages), 0, book.pages),
      },
    });

    return this.getState();
  }

  async addBookComment(bookId: string, dto: AddCommentDto): Promise<LifeOSState> {
    const normalizedBookId = this.normalizeEntityId(bookId, "Kitob ID");
    const text = this.normalizeRequiredText(dto.text, "Izoh matni", 1);

    const book = await this.prisma.book.findUnique({
      where: { id: normalizedBookId },
      select: { id: true },
    });
    if (!book) {
      throw new NotFoundException("Kitob topilmadi.");
    }

    await this.prisma.bookComment.create({
      data: {
        bookId: normalizedBookId,
        text,
      },
    });

    return this.getState();
  }

  async likeBook(bookId: string): Promise<LifeOSState> {
    const normalizedBookId = this.normalizeEntityId(bookId, "Kitob ID");
    const book = await this.prisma.book.findUnique({
      where: { id: normalizedBookId },
      select: { id: true },
    });
    if (!book) {
      throw new NotFoundException("Kitob topilmadi.");
    }

    await this.prisma.book.update({
      where: { id: normalizedBookId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return this.getState();
  }

  async getHealth(): Promise<LifeOSState["health"]> {
    const [overview, logs] = await Promise.all([
      this.getOrCreateHealthOverview(),
      this.prisma.healthLog.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return {
      calories: overview.calories,
      waterMl: overview.waterMl,
      sleepHours: overview.sleepHours,
      logs: logs.map((log) => ({
        id: log.id,
        day: log.day,
        calories: log.calories,
        waterMl: log.waterMl,
        sleepHours: log.sleepHours,
      })),
    };
  }

  async addCalories(dto: AmountDto): Promise<LifeOSState> {
    const amount = this.requirePositiveNumber(dto.amount, "Kaloriya miqdori");
    const overview = await this.getOrCreateHealthOverview();

    await this.prisma.healthOverview.update({
      where: { id: overview.id },
      data: {
        calories: Math.max(0, overview.calories + Math.floor(amount)),
      },
    });

    return this.getState();
  }

  async removeCalories(dto: AmountDto): Promise<LifeOSState> {
    const amount = this.requirePositiveNumber(dto.amount, "Kaloriya miqdori");
    const overview = await this.getOrCreateHealthOverview();

    await this.prisma.healthOverview.update({
      where: { id: overview.id },
      data: {
        calories: Math.max(0, overview.calories - Math.floor(amount)),
      },
    });

    return this.getState();
  }

  async addWater(dto: AmountDto): Promise<LifeOSState> {
    const amount = this.requirePositiveNumber(dto.amount, "Suv miqdori");
    const overview = await this.getOrCreateHealthOverview();

    await this.prisma.healthOverview.update({
      where: { id: overview.id },
      data: {
        waterMl: Math.max(0, overview.waterMl + Math.floor(amount)),
      },
    });

    return this.getState();
  }

  async setSleep(dto: SleepDto): Promise<LifeOSState> {
    const hours = this.requireNonNegativeNumber(dto.hours, "Uyqu soati");
    const overview = await this.getOrCreateHealthOverview();

    await this.prisma.healthOverview.update({
      where: { id: overview.id },
      data: {
        sleepHours: clamp(hours, 0, 24),
      },
    });

    return this.getState();
  }

  async getMastery(): Promise<LifeOSState["mastery"]> {
    const [skills, sessions] = await Promise.all([
      this.prisma.masterySkill.findMany({
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.focusSession.findMany({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    return {
      skills: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        hours: skill.hours,
      })),
      focusSessions: sessions.map((session) => ({
        id: session.id,
        date: this.toDateOnly(session.date),
        durationMin: session.durationMin,
        skillId: session.skillId,
      })),
    };
  }

  async addSkill(dto: AddSkillDto): Promise<LifeOSState> {
    const name = this.normalizeRequiredText(dto.name, "Ko'nikma nomi", 2);
    const hours = this.requireNonNegativeNumber(dto.hours, "Soatlar");

    await this.prisma.masterySkill.create({
      data: {
        id: createId("skill"),
        name,
        hours,
      },
    });

    return this.getState();
  }

  async addFocusSession(dto: AddFocusSessionDto): Promise<LifeOSState> {
    const skillId = this.normalizeEntityId(dto.skillId, "Ko'nikma ID");
    const minutes = this.requirePositiveInteger(dto.minutes, "Fokus daqiqasi");

    await this.prisma.$transaction(async (tx) => {
      const skill = await tx.masterySkill.findUnique({ where: { id: skillId } });
      if (!skill) {
        throw new NotFoundException("Skill topilmadi.");
      }

      await tx.focusSession.create({
        data: {
          id: createId("fs"),
          date: new Date(),
          durationMin: minutes,
          skillId,
        },
      });

      await tx.masterySkill.update({
        where: { id: skillId },
        data: {
          hours: Number((skill.hours + minutes / 60).toFixed(2)),
        },
      });
    });

    return this.getState();
  }

  async getNetwork(): Promise<LifeOSState["network"]> {
    return this.buildNetworkState();
  }

  async toggleConnection(dto: ToggleConnectionDto): Promise<LifeOSState> {
    const userId = this.requirePositiveInteger(dto.userId, "Foydalanuvchi ID");

    await this.prisma.$transaction(async (tx) => {
      const person = await tx.networkPerson.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!person) {
        throw new NotFoundException("Foydalanuvchi topilmadi.");
      }

      const existing = await tx.networkConnection.findUnique({
        where: { personId: userId },
      });

      if (existing) {
        await tx.networkConnection.delete({ where: { id: existing.id } });
      } else {
        await tx.networkConnection.create({
          data: { personId: userId },
        });
      }
    });

    return this.getState();
  }

  async sendNetworkMessage(dto: SendNetworkMessageDto): Promise<LifeOSState> {
    const userId = this.requirePositiveInteger(dto.userId, "Foydalanuvchi ID");
    const message = this.normalizeRequiredText(dto.message, "Xabar", 1);

    await this.prisma.$transaction(async (tx) => {
      const person = await tx.networkPerson.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!person) {
        throw new NotFoundException("Foydalanuvchi topilmadi.");
      }

      await tx.networkMessage.create({
        data: {
          personId: userId,
          message,
        },
      });

      const overflow = await tx.networkMessage.findMany({
        where: { personId: userId },
        orderBy: { createdAt: "desc" },
        skip: 6,
        select: { id: true },
      });

      if (overflow.length > 0) {
        await tx.networkMessage.deleteMany({
          where: {
            id: {
              in: overflow.map((row) => row.id),
            },
          },
        });
      }
    });

    return this.getState();
  }

  async getAssistantMessages(): Promise<LifeOSState["assistant"]["messages"]> {
    const messages = await this.prisma.assistantMessage.findMany({
      orderBy: { id: "asc" },
    });

    return messages.map((message) => ({
      id: message.id,
      role: message.role === "user" ? "user" : "assistant",
      text: message.text,
    }));
  }

  private async assistantReply(prompt: string): Promise<string> {
    const lower = prompt.toLowerCase();

    const [habits, goals, focusAggregate] = await Promise.all([
      this.prisma.habit.findMany({
        select: { title: true, streak: true },
        orderBy: { streak: "desc" },
      }),
      this.prisma.goal.findMany({
        select: { title: true, currentValue: true, targetValue: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.focusSession.aggregate({
        _sum: { durationMin: true },
      }),
    ]);

    const topHabit = habits[0];
    const focusHours = (focusAggregate._sum.durationMin ?? 0) / 60;

    if (lower.includes("reja")) {
      const activeGoals = goals
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

  async sendAssistantPrompt(dto: AssistantPromptDto): Promise<LifeOSState> {
    const prompt = this.normalizeRequiredText(dto.prompt, "Prompt", 1);
    const reply = await this.assistantReply(prompt);

    await this.prisma.$transaction(async (tx) => {
      const maxRow = await tx.assistantMessage.aggregate({
        _max: { id: true },
      });
      const nextId = (maxRow._max.id ?? 0) + 1;

      await tx.assistantMessage.createMany({
        data: [
          {
            id: nextId,
            role: "user",
            text: prompt,
          },
          {
            id: nextId + 1,
            role: "assistant",
            text: reply,
          },
        ],
      });
    });

    return this.getState();
  }

  async clearAssistantMessages(): Promise<LifeOSState> {
    await this.prisma.$transaction(async (tx) => {
      await tx.assistantMessage.deleteMany();
      await tx.assistantMessage.create({
        data: {
          id: 1,
          role: "assistant",
          text: "Assalomu alaykum. Men sizning shaxsiy produktivlik yordamchingizman.",
        },
      });
    });

    return this.getState();
  }

  async getSettings(): Promise<LifeOSState["settings"]> {
    const settings = await this.getOrCreateSettings();
    return this.mapSettingsRow(settings);
  }

  async setLanguage(dto: UpdateLanguageDto): Promise<LifeOSState> {
    const language = this.normalizeRequiredText(dto.language, "Til", 2);

    const content = await this.getOrCreatePublicContent();
    const allowedLanguages = Array.isArray(content.settings.languages)
      ? content.settings.languages
      : DEFAULT_PERSISTED_DATA.state.content.settings.languages;

    if (!allowedLanguages.includes(language)) {
      throw new BadRequestException("Til qo'llab-quvvatlanmaydi.");
    }

    await this.prisma.appSettings.upsert({
      where: { id: 1 },
      update: { language },
      create: {
        id: 1,
        language,
      },
    });

    return this.getState();
  }

  async toggleNotification(dto: ToggleByKeyDto): Promise<LifeOSState> {
    const key = this.normalizeRequiredText(dto.key, "Notification key", 1);
    const settings = await this.getOrCreateSettings();

    if (key === "habits") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { notifyHabits: !settings.notifyHabits },
      });
      return this.getState();
    }

    if (key === "goals") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { notifyGoals: !settings.notifyGoals },
      });
      return this.getState();
    }

    if (key === "assistant") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { notifyAssistant: !settings.notifyAssistant },
      });
      return this.getState();
    }

    throw new NotFoundException("Notification key topilmadi.");
  }

  async toggleIntegration(dto: ToggleByKeyDto): Promise<LifeOSState> {
    const key = this.normalizeRequiredText(dto.key, "Integration key", 1);
    const settings = await this.getOrCreateSettings();

    if (key === "calendar") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { integrationCalendar: !settings.integrationCalendar },
      });
      return this.getState();
    }

    if (key === "smartwatch") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { integrationSmartwatch: !settings.integrationSmartwatch },
      });
      return this.getState();
    }

    if (key === "mobileSync") {
      await this.prisma.appSettings.update({
        where: { id: settings.id },
        data: { integrationMobileSync: !settings.integrationMobileSync },
      });
      return this.getState();
    }

    throw new NotFoundException("Integration key topilmadi.");
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
