import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import * as path from "node:path";
import { AppModule } from "./app.module";

const DEFAULT_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const SWAGGER_TAGS: Array<{ name: string; description: string }> = [
  {
    name: "Auth",
    description:
      "Autentifikatsiya: register, login, access token refresh va token hayot sikli.",
  },
  {
    name: "Admin",
    description: "Admin bo'limi: userlar ro'yxati va boshqaruv endpointlari.",
  },
  {
    name: "Dashboard",
    description: "Dashboard statistikasi va tasklar boshqaruvi.",
  },
  {
    name: "Goals",
    description: "Yillik/oylik/haftalik/kunlik maqsadlar CRUD API.",
  },
  {
    name: "Habits",
    description: "40 kunlik odatlar va streak boshqaruvi API.",
  },
  {
    name: "Books",
    description: "Kitoblar, progress, izoh va like endpointlari.",
  },
  {
    name: "Health",
    description: "Kaloriya, suv va uyqu monitoring endpointlari.",
  },
  { name: "Mastery", description: "Ko'nikmalar va fokus sessiya API." },
  { name: "Network", description: "Networking ulanish va xabar endpointlari." },
  { name: "Assistant", description: "AI assistant xabarlari endpointlari." },
  {
    name: "Settings",
    description: "Til, bildirishnoma va integratsiya sozlamalari.",
  },
  {
    name: "Uploads",
    description: "Rasm yuklash va statik URL olish endpointi.",
  },
  { name: "State", description: "To'liq app state va reset endpointlari." },
  { name: "Public", description: "Public kontent endpointlari." },
  {
    name: "Landing",
    description:
      "Landing page kontenti va hero widget qiymatlari (heroStats) endpointlari.",
  },
  {
    name: "System",
    description: "Servis holati va health-check endpointlari.",
  },
];

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return DEFAULT_CORS_ORIGINS;
  }

  const origins = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
}

function safeEquals(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

function readBasicAuthHeader(
  authorizationHeader?: string,
): { username: string; password: string } | null {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return null;
  }

  const encoded = authorizationHeader.slice("Basic ".length).trim();
  if (!encoded) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const delimiterIndex = decoded.indexOf(":");
    if (delimiterIndex < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, delimiterIndex),
      password: decoded.slice(delimiterIndex + 1),
    };
  } catch {
    return null;
  }
}

function swaggerBasicAuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const swaggerUsername = process.env.SWAGGER_USERNAME;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  if (!swaggerUsername || !swaggerPassword) {
    response.status(503).json({
      success: false,
      message:
        "Swagger credentials sozlanmagan. SWAGGER_USERNAME va SWAGGER_PASSWORD ni o'rnating.",
    });
    return;
  }

  const credentials = readBasicAuthHeader(request.headers.authorization);
  if (
    !credentials ||
    !safeEquals(credentials.username, swaggerUsername) ||
    !safeEquals(credentials.password, swaggerPassword)
  ) {
    response.setHeader("WWW-Authenticate", 'Basic realm="LifeOS Swagger"');
    response.status(401).send("Swagger authentication required.");
    return;
  }

  next();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance() as {
    disable: (name: string) => void;
  };

  app.setGlobalPrefix("api");
  expressApp.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  const uploadsDir = process.env.VERCEL
    ? "/tmp/lifeos-uploads"
    : path.join(process.cwd(), "uploads");
  app.useStaticAssets(uploadsDir, { prefix: "/uploads/" });

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

  const globalRateLimiter = rateLimit({
    windowMs: parseIntEnv("RATE_LIMIT_WINDOW_MS", 60_000),
    max: parseIntEnv("RATE_LIMIT_MAX", 240),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "So'rovlar soni juda ko'p. Keyinroq qayta urinib ko'ring.",
    },
  });
  const authRateLimiter = rateLimit({
    windowMs: parseIntEnv("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    max: parseIntEnv("AUTH_RATE_LIMIT_MAX", 30),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message:
        "Kirish urinishlari limiti oshib ketdi. 15 daqiqadan so'ng qayta urinib ko'ring.",
    },
  });

  app.use("/api", globalRateLimiter);
  app.use("/api/auth", authRateLimiter);
  app.use("/api/token", authRateLimiter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("LifeOS API")
    .setDescription(
      "NestJS backend for LifeOS with JWT auth, refresh-token flow, role-based access and image uploads",
    )
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "AccessToken ni `Authorization: Bearer <token>` shaklida yuboring.",
      },
      "access-token",
    );

  for (const tag of SWAGGER_TAGS) {
    config.addTag(tag.name, tag.description);
  }

  const document = SwaggerModule.createDocument(app, config.build(), {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  app.use("/docs", swaggerBasicAuthMiddleware);
  app.use("/docs-json", swaggerBasicAuthMiddleware);
  app.use("/docs-yaml", swaggerBasicAuthMiddleware);

  SwaggerModule.setup("docs", app, document, {
    jsonDocumentUrl: "docs-json",
    yamlDocumentUrl: "docs-yaml",
    customSiteTitle: "LifeOS API Docs",
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
      persistAuthorization: true,
      docExpansion: "none",
      tagsSorter: (first: string, second: string) => {
        const firstPriority = first === "Auth" ? 0 : 1;
        const secondPriority = second === "Auth" ? 0 : 1;

        if (firstPriority !== secondPriority) {
          return firstPriority - secondPriority;
        }

        return first.localeCompare(second);
      },
      operationsSorter: "alpha",
    },
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`LifeOS backend running on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs (protected): http://localhost:${port}/docs`);
}

bootstrap();
