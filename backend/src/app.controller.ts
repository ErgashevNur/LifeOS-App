import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { mkdirSync } from "node:fs";
import * as path from "node:path";
import { diskStorage } from "multer";
import { AppService } from "./app.service";
import { ApiSuccess } from "./common/api-success.decorator";
import { Public } from "./common/public.decorator";
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
import { AccessTokenPayload } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const ALLOWED_UPLOAD_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function resolveUploadExtension(mimetype: string): string | null {
  return ALLOWED_UPLOAD_MIME_TYPES[mimetype.toLowerCase()] ?? null;
}

function safeUploadName(originalName: string, mimetype: string): string {
  const ext = resolveUploadExtension(mimetype) ?? ".img";
  const base = path.parse(originalName).name;
  const cleaned =
    base
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";

  return `${Date.now()}-${cleaned}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

const LANDING_HERO_STATS_SCHEMA = {
  type: "object",
  required: ["goalsCount", "productivityGrowth"],
  properties: {
    goalsCount: {
      type: "string",
      example: "128,400+",
      description: "Bajarilgan jami maqsadlar ko'rsatkichi.",
    },
    productivityGrowth: {
      type: "string",
      example: "+48%",
      description: "Samaradorlik o'sishi foiz ko'rinishida.",
    },
  },
};

const LANDING_CONTENT_SCHEMA = {
  type: "object",
  required: ["heroStats", "stats", "features", "founders"],
  properties: {
    heroStats: LANDING_HERO_STATS_SCHEMA,
    stats: {
      type: "array",
      items: {
        type: "object",
        required: ["value", "label"],
        properties: {
          value: { type: "string", example: "10K+" },
          label: { type: "string", example: "foydalanuvchi" },
        },
      },
    },
    features: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "description", "icon"],
        properties: {
          title: { type: "string", example: "Goal" },
          description: {
            type: "string",
            example: "Yillikdan kunlikgacha maqsadlarni bir joyda kuzating.",
          },
          icon: { type: "string", example: "Target" },
        },
      },
    },
    founders: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "role", "image", "description"],
        properties: {
          name: { type: "string", example: "Ergashev MuhammadNurulloh" },
          role: { type: "string", example: "Dasturchi" },
          image: { type: "string", example: "/founder1.jpg" },
          description: {
            type: "string",
            example:
              "Frontend va backend qismlarini birlashtirib, LifeOS'ni quradi.",
          },
        },
      },
    },
  },
};

const PUBLIC_CONTENT_SCHEMA = {
  type: "object",
  required: [
    "landing",
    "dashboard",
    "assistant",
    "books",
    "health",
    "mastery",
    "settings",
  ],
  properties: {
    landing: LANDING_CONTENT_SCHEMA,
    dashboard: {
      type: "object",
      additionalProperties: true,
    },
    assistant: {
      type: "object",
      additionalProperties: true,
    },
    books: {
      type: "object",
      additionalProperties: true,
    },
    health: {
      type: "object",
      additionalProperties: true,
    },
    mastery: {
      type: "object",
      additionalProperties: true,
    },
    settings: {
      type: "object",
      additionalProperties: true,
    },
  },
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("healthz")
  @ApiTags("System")
  @ApiOperation({ summary: "Backend health check" })
  @ApiSuccess({ message: "Backend ishlayapti." })
  healthz() {
    return { ok: true, service: "lifeos-backend" };
  }

  @Public()
  @Get("public/content")
  @ApiTags("Public", "Landing")
  @ApiOperation({
    summary: "Get public app content for landing and catalogs",
    description:
      "Landing page uchun dinamik widget qiymatlari `landing.heroStats` orqali qaytadi.",
  })
  @ApiSuccess({
    message: "Public kontent muvaffaqiyatli olindi.",
    dataSchema: PUBLIC_CONTENT_SCHEMA,
  })
  getPublicContent() {
    return this.appService.getPublicContent();
  }

  @Public()
  @Get("public/landing")
  @ApiTags("Landing")
  @ApiOperation({
    summary: "Get landing page content (heroStats included)",
    description:
      "Landing sahifa hero qismidagi widget qiymatlari `heroStats.goalsCount` va `heroStats.productivityGrowth` maydonlari orqali olinadi.",
  })
  @ApiSuccess({
    message: "Landing page kontenti muvaffaqiyatli olindi.",
    dataSchema: LANDING_CONTENT_SCHEMA,
  })
  getLandingContent() {
    return this.appService.getLandingContent();
  }

  @Get("state")
  @ApiTags("State")
  @ApiOperation({ summary: "Get full LifeOS state" })
  @ApiSuccess({ message: "LifeOS holati muvaffaqiyatli olindi.", auth: true })
  getState() {
    return this.appService.getState();
  }

  @Post("state/reset")
  @HttpCode(200)
  @ApiTags("State")
  @ApiOperation({ summary: "Reset state to defaults" })
  @ApiSuccess({
    message: "LifeOS holati default qiymatga qaytarildi.",
    auth: true,
  })
  resetState() {
    return this.appService.resetState();
  }

  @Public()
  @Post("auth/register")
  @ApiTags("Auth")
  @ApiOperation({ summary: "Register new user and return access/refresh tokens" })
  @ApiSuccess({ message: "Foydalanuvchi ro'yxatdan o'tdi.", status: 201 })
  register(@Body() dto: RegisterDto) {
    return this.appService.register(dto);
  }

  @Public()
  @Post("auth/login")
  @HttpCode(200)
  @ApiTags("Auth")
  @ApiOperation({ summary: "Login user and return access/refresh tokens" })
  @ApiSuccess({ message: "Login muvaffaqiyatli bajarildi." })
  login(@Body() dto: LoginDto) {
    return this.appService.login(dto);
  }

  @Public()
  @Post("auth/google")
  @HttpCode(200)
  @ApiTags("Auth")
  @ApiOperation({
    summary:
      "Login/Register with Google ID token and return access/refresh tokens",
  })
  @ApiSuccess({ message: "Google orqali kirish muvaffaqiyatli bajarildi." })
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.appService.authWithGoogle(dto);
  }

  @Public()
  @Post("auth/token")
  @HttpCode(200)
  @ApiTags("Auth")
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiSuccess({ message: "Access token muvaffaqiyatli yangilandi." })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.appService.refreshAccessToken(dto);
  }

  @Public()
  @Post("token")
  @HttpCode(200)
  @ApiTags("Auth")
  @ApiOperation({
    summary:
      "Alias endpoint: refresh access token using refresh token (same as /auth/token)",
  })
  @ApiSuccess({ message: "Access token muvaffaqiyatli yangilandi." })
  refreshTokenAlias(@Body() dto: RefreshTokenDto) {
    return this.appService.refreshAccessToken(dto);
  }

  @Get("admin/users")
  @ApiTags("Admin")
  @ApiOperation({ summary: "Admin: get all registered users" })
  @ApiSuccess({
    message: "Ro'yxatdan o'tgan userlar ro'yxati olindi.",
    auth: true,
  })
  getAdminUsers(@Req() request: { user?: AccessTokenPayload }) {
    const actorUserId = request.user?.sub;
    if (!actorUserId) {
      throw new BadRequestException("User aniqlanmadi.");
    }
    return this.appService.getAdminUsers(actorUserId);
  }

  @Get("dashboard/summary")
  @ApiTags("Dashboard")
  @ApiOperation({ summary: "Get dashboard summary" })
  @ApiSuccess({ message: "Dashboard umumiy statistikasi olindi.", auth: true })
  dashboardSummary() {
    return this.appService.getDashboardSummary();
  }

  @Post("dashboard/tasks")
  @ApiTags("Dashboard")
  @ApiOperation({ summary: "Add dashboard task" })
  @ApiSuccess({ message: "Yangi task qo'shildi.", status: 201, auth: true })
  addTask(@Body() dto: AddTaskDto) {
    return this.appService.addDashboardTask(dto);
  }

  @Patch("dashboard/tasks/:id/toggle")
  @ApiTags("Dashboard")
  @ApiOperation({ summary: "Toggle dashboard task status" })
  @ApiSuccess({ message: "Task holati yangilandi.", auth: true })
  toggleTask(@Param("id") id: string) {
    return this.appService.toggleDashboardTask(id);
  }

  @Get("goals")
  @ApiTags("Goals")
  @ApiOperation({ summary: "List goals" })
  @ApiSuccess({ message: "Maqsadlar ro'yxati olindi.", auth: true })
  getGoals() {
    return this.appService.getGoals();
  }

  @Post("goals")
  @ApiTags("Goals")
  @ApiOperation({ summary: "Create goal" })
  @ApiSuccess({ message: "Maqsad muvaffaqiyatli yaratildi.", status: 201, auth: true })
  addGoal(@Body() dto: CreateGoalDto) {
    return this.appService.addGoal(dto);
  }

  @Patch("goals/:id/progress")
  @ApiTags("Goals")
  @ApiOperation({ summary: "Update goal progress by delta" })
  @ApiSuccess({ message: "Maqsad progressi yangilandi.", auth: true })
  updateGoalProgress(@Param("id") id: string, @Body() dto: UpdateGoalProgressDto) {
    return this.appService.updateGoalProgress(id, dto);
  }

  @Delete("goals/:id")
  @ApiTags("Goals")
  @ApiOperation({ summary: "Delete goal" })
  @ApiSuccess({ message: "Maqsad o'chirildi.", auth: true })
  removeGoal(@Param("id") id: string) {
    return this.appService.removeGoal(id);
  }

  @Get("habits")
  @ApiTags("Habits")
  @ApiOperation({ summary: "List habits" })
  @ApiSuccess({ message: "Odatlar ro'yxati olindi.", auth: true })
  getHabits() {
    return this.appService.getHabits();
  }

  @Post("habits")
  @ApiTags("Habits")
  @ApiOperation({ summary: "Create habit" })
  @ApiSuccess({ message: "Yangi odat qo'shildi.", status: 201, auth: true })
  addHabit(@Body() dto: CreateHabitDto) {
    return this.appService.addHabit(dto);
  }

  @Patch("habits/:id/check-in")
  @ApiTags("Habits")
  @ApiOperation({ summary: "Toggle habit check-in" })
  @ApiSuccess({ message: "Odat check-in holati yangilandi.", auth: true })
  checkInHabit(@Param("id") id: string) {
    return this.appService.toggleHabitCheckIn(id);
  }

  @Delete("habits/:id")
  @ApiTags("Habits")
  @ApiOperation({ summary: "Delete habit" })
  @ApiSuccess({ message: "Odat o'chirildi.", auth: true })
  removeHabit(@Param("id") id: string) {
    return this.appService.removeHabit(id);
  }

  @Get("books")
  @ApiTags("Books")
  @ApiOperation({ summary: "List books" })
  @ApiSuccess({ message: "Kitoblar ro'yxati olindi.", auth: true })
  getBooks() {
    return this.appService.getBooks();
  }

  @Post("books")
  @ApiTags("Books")
  @ApiOperation({ summary: "Create book" })
  @ApiSuccess({ message: "Yangi kitob qo'shildi.", status: 201, auth: true })
  addBook(@Body() dto: CreateBookDto) {
    return this.appService.addBook(dto);
  }

  @Patch("books/:id/read-pages")
  @ApiTags("Books")
  @ApiOperation({ summary: "Update read pages" })
  @ApiSuccess({ message: "O'qilgan sahifalar soni yangilandi.", auth: true })
  updateBookPages(@Param("id") id: string, @Body() dto: UpdateBookPagesDto) {
    return this.appService.updateBookReadPages(id, dto);
  }

  @Post("books/:id/comments")
  @ApiTags("Books")
  @ApiOperation({ summary: "Add comment to a book" })
  @ApiSuccess({ message: "Kitobga izoh qo'shildi.", status: 201, auth: true })
  addBookComment(@Param("id") id: string, @Body() dto: AddCommentDto) {
    return this.appService.addBookComment(id, dto);
  }

  @Post("books/:id/like")
  @HttpCode(200)
  @ApiTags("Books")
  @ApiOperation({ summary: "Increase book like count" })
  @ApiSuccess({ message: "Kitobga like qo'shildi.", auth: true })
  likeBook(@Param("id") id: string) {
    return this.appService.likeBook(id);
  }

  @Get("health")
  @ApiTags("Health")
  @ApiOperation({ summary: "Get health state" })
  @ApiSuccess({ message: "Sog'liq ma'lumotlari olindi.", auth: true })
  getHealth() {
    return this.appService.getHealth();
  }

  @Post("health/calories/add")
  @HttpCode(200)
  @ApiTags("Health")
  @ApiOperation({ summary: "Add calories" })
  @ApiSuccess({ message: "Kaloriya qo'shildi.", auth: true })
  addCalories(@Body() dto: AmountDto) {
    return this.appService.addCalories(dto);
  }

  @Post("health/calories/remove")
  @HttpCode(200)
  @ApiTags("Health")
  @ApiOperation({ summary: "Remove calories" })
  @ApiSuccess({ message: "Kaloriya kamaytirildi.", auth: true })
  removeCalories(@Body() dto: AmountDto) {
    return this.appService.removeCalories(dto);
  }

  @Post("health/water")
  @HttpCode(200)
  @ApiTags("Health")
  @ApiOperation({ summary: "Add water amount" })
  @ApiSuccess({ message: "Suv miqdori yangilandi.", auth: true })
  addWater(@Body() dto: AmountDto) {
    return this.appService.addWater(dto);
  }

  @Patch("health/sleep")
  @ApiTags("Health")
  @ApiOperation({ summary: "Set sleep hours" })
  @ApiSuccess({ message: "Uyqu soatlari yangilandi.", auth: true })
  setSleep(@Body() dto: SleepDto) {
    return this.appService.setSleep(dto);
  }

  @Get("mastery")
  @ApiTags("Mastery")
  @ApiOperation({ summary: "Get mastery data" })
  @ApiSuccess({ message: "Mahorat ma'lumotlari olindi.", auth: true })
  getMastery() {
    return this.appService.getMastery();
  }

  @Post("mastery/skills")
  @ApiTags("Mastery")
  @ApiOperation({ summary: "Create skill" })
  @ApiSuccess({ message: "Yangi skill qo'shildi.", status: 201, auth: true })
  addSkill(@Body() dto: AddSkillDto) {
    return this.appService.addSkill(dto);
  }

  @Post("mastery/focus-sessions")
  @ApiTags("Mastery")
  @ApiOperation({ summary: "Add focus session" })
  @ApiSuccess({
    message: "Fokus sessiya muvaffaqiyatli qo'shildi.",
    status: 201,
    auth: true,
  })
  addFocusSession(@Body() dto: AddFocusSessionDto) {
    return this.appService.addFocusSession(dto);
  }

  @Get("network")
  @ApiTags("Network")
  @ApiOperation({ summary: "Get network data" })
  @ApiSuccess({ message: "Networking ma'lumotlari olindi.", auth: true })
  getNetwork() {
    return this.appService.getNetwork();
  }

  @Post("network/toggle-connect")
  @HttpCode(200)
  @ApiTags("Network")
  @ApiOperation({ summary: "Toggle network connection" })
  @ApiSuccess({ message: "Ulanish holati yangilandi.", auth: true })
  toggleConnection(@Body() dto: ToggleConnectionDto) {
    return this.appService.toggleConnection(dto);
  }

  @Post("network/messages")
  @ApiTags("Network")
  @ApiOperation({ summary: "Send network message" })
  @ApiSuccess({ message: "Xabar yuborildi.", status: 201, auth: true })
  sendNetworkMessage(@Body() dto: SendNetworkMessageDto) {
    return this.appService.sendNetworkMessage(dto);
  }

  @Get("assistant/messages")
  @ApiTags("Assistant")
  @ApiOperation({ summary: "List assistant messages" })
  @ApiSuccess({ message: "Assistant xabarlari olindi.", auth: true })
  getAssistantMessages() {
    return this.appService.getAssistantMessages();
  }

  @Post("assistant/messages")
  @ApiTags("Assistant")
  @ApiOperation({ summary: "Send assistant prompt" })
  @ApiSuccess({
    message: "Assistant javobi muvaffaqiyatli yaratildi.",
    status: 201,
    auth: true,
  })
  sendAssistantPrompt(@Body() dto: AssistantPromptDto) {
    return this.appService.sendAssistantPrompt(dto);
  }

  @Delete("assistant/messages")
  @ApiTags("Assistant")
  @ApiOperation({ summary: "Clear assistant messages" })
  @ApiSuccess({ message: "Assistant xabarlari tozalandi.", auth: true })
  clearAssistantMessages() {
    return this.appService.clearAssistantMessages();
  }

  @Get("settings")
  @ApiTags("Settings")
  @ApiOperation({ summary: "Get settings" })
  @ApiSuccess({ message: "Sozlamalar olindi.", auth: true })
  getSettings() {
    return this.appService.getSettings();
  }

  @Patch("settings/language")
  @ApiTags("Settings")
  @ApiOperation({ summary: "Set language" })
  @ApiSuccess({ message: "Til sozlamasi yangilandi.", auth: true })
  setLanguage(@Body() dto: UpdateLanguageDto) {
    return this.appService.setLanguage(dto);
  }

  @Patch("settings/notifications/toggle")
  @ApiTags("Settings")
  @ApiOperation({ summary: "Toggle notification flag by key" })
  @ApiSuccess({ message: "Notification holati o'zgartirildi.", auth: true })
  toggleNotification(@Body() dto: ToggleByKeyDto) {
    return this.appService.toggleNotification(dto);
  }

  @Patch("settings/integrations/toggle")
  @ApiTags("Settings")
  @ApiOperation({ summary: "Toggle integration flag by key" })
  @ApiSuccess({ message: "Integration holati o'zgartirildi.", auth: true })
  toggleIntegration(@Body() dto: ToggleByKeyDto) {
    return this.appService.toggleIntegration(dto);
  }

  @Post("uploads/image")
  @ApiTags("Uploads")
  @ApiOperation({ summary: "Upload image and get accessible URL" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
      },
      required: ["image"],
    },
  })
  @ApiSuccess({ message: "Rasm muvaffaqiyatli yuklandi.", status: 201, auth: true })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          mkdirSync(UPLOAD_DIR, { recursive: true });
          callback(null, UPLOAD_DIR);
        },
        filename: (_req, file, callback) => {
          callback(null, safeUploadName(file.originalname, file.mimetype));
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!resolveUploadExtension(file.mimetype)) {
          callback(
            new BadRequestException(
              "Faqat JPG, PNG, WEBP, GIF yoki AVIF formatlari qo'llab-quvvatlanadi.",
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile()
    file?: {
      filename: string;
      mimetype: string;
      size: number;
    },
  ) {
    if (!file) {
      throw new BadRequestException("Rasm fayli yuborilmadi.");
    }
    return this.appService.getUploadedImagePayload(file);
  }
}
