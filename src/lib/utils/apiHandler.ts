/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/utils/logger";
import { AppError, ForbiddenError } from "@/lib/utils/errors";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";

type Handler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function apiHandler(handler: Handler) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}

export async function validateSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new ForbiddenError("Unauthorized. Please login to continue.");
  }

  return session;
}

function handleApiError(error: unknown, request: NextRequest): NextResponse {
  const requestMetadata = {
    method: request.method,
    url: request.url,
  };

  // Log the error
  if (error instanceof Error) {
    logger.error(error, requestMetadata);
  } else {
    logger.error(String(error), requestMetadata);
  }

  // Handle ValidationError
  if (error instanceof AppError && error.name === "ValidationError") {
    return NextResponse.json(
      {
        error: (error as unknown as { validationErrors: unknown[] })
          .validationErrors,
      },
      { status: error.statusCode },
    );
  }

  // Handle other AppErrors
  const errorMessage =
    error instanceof AppError ? error.message : "Unexpected Error";
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  return NextResponse.json({ error: errorMessage }, { status: statusCode });
}
