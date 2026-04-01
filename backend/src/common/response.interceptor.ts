import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";
import {
  RESPONSE_MESSAGE_KEY,
} from "./response-message.decorator";

interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiEnvelope<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiEnvelope<T>> {
    const request = context.switchToHttp().getRequest<{ originalUrl?: string }>();
    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? "So'rov muvaffaqiyatli bajarildi.";

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? "",
      })),
    );
  }
}
