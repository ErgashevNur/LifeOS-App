import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ResponseMessage } from "./response-message.decorator";

interface ApiSuccessOptions {
  message: string;
  status?: 200 | 201;
  auth?: boolean;
  dataSchema?: Record<string, unknown>;
}

export function ApiSuccess({
  message,
  status = 200,
  auth = false,
  dataSchema,
}: ApiSuccessOptions) {
  const responseDecorator =
    status === 201
      ? ApiCreatedResponse({
          description: message,
          schema: successEnvelopeSchema(message, dataSchema),
        })
      : ApiOkResponse({
          description: message,
          schema: successEnvelopeSchema(message, dataSchema),
        });

  return applyDecorators(
    ResponseMessage(message),
    responseDecorator,
    ApiBadRequestResponse({
      description: "So'rov validatsiyadan o'tmadi yoki noto'g'ri formatda.",
    }),
    ApiTooManyRequestsResponse({
      description:
        "Rate limit oshib ketdi. Birozdan keyin qayta urinib ko'ring.",
    }),
    ...(auth
      ? [
          ApiBearerAuth("access-token"),
          ApiUnauthorizedResponse({
            description: "Access token yaroqsiz yoki muddati tugagan.",
          }),
        ]
      : []),
  );
}

function successEnvelopeSchema(
  message: string,
  dataSchema?: Record<string, unknown>,
) {
  return {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: message,
      },
      data: {
        ...(dataSchema ?? {
          type: "object",
          additionalProperties: true,
        }),
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2026-04-01T10:00:00.000Z",
      },
      path: {
        type: "string",
        example: "/api/endpoint",
      },
    },
  };
}
