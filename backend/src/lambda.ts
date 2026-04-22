import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { mkdirSync } from "node:fs";
import { AppModule } from "./app.module";

const UPLOAD_DIR = "/tmp/lifeos-uploads";

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return ["http://localhost:5173"];
  const origins = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return origins.length ? origins : ["http://localhost:5173"];
}

// Cache the handler across warm lambda invocations
let cachedHandler: ((req: unknown, res: unknown) => void) | null = null;

async function bootstrap(): Promise<(req: unknown, res: unknown) => void> {
  if (cachedHandler) return cachedHandler;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn"],
  });

  const httpAdapter = app.getHttpAdapter();
  (httpAdapter.getInstance() as { disable: (name: string) => void }).disable(
    "x-powered-by",
  );

  app.setGlobalPrefix("api");

  mkdirSync(UPLOAD_DIR, { recursive: true });
  app.useStaticAssets(UPLOAD_DIR, { prefix: "/uploads/" });

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });

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

  app.use(
    "/api",
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
      max: Number(process.env.RATE_LIMIT_MAX ?? 240),
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        success: false,
        message: "So'rovlar soni juda ko'p. Keyinroq qayta urinib ko'ring.",
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  cachedHandler = httpAdapter.getInstance() as (req: unknown, res: unknown) => void;
  return cachedHandler;
}

export default async function handler(req: unknown, res: unknown): Promise<void> {
  const app = await bootstrap();
  (app as (req: unknown, res: unknown) => void)(req, res);
}
