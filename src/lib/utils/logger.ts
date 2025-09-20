/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from "winston";
import SlackHook from "winston-slack-webhook-transport";
import { AppError } from "./errors";

const { combine, timestamp, printf, colorize, align } = winston.format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logColors = {
  fatal: "red",
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  trace: "magenta",
};

winston.addColors(logColors);

// Create console-only logger
const consoleLogger = winston.createLogger({
  levels: logLevels,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    colorize({ all: true }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  transports: [new winston.transports.Console()],
});

// Create Slack-only logger (if configured)
let slackLogger: winston.Logger | null = null;
if (process.env.SLACK_WEBHOOK_URL) {
  slackLogger = winston.createLogger({
    levels: logLevels,
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
    ),
    transports: [
      new SlackHook({
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        level: "error",
      }),
    ],
  });
}

class SmartLogger {
  info(message: string, meta?: Record<string, unknown>) {
    consoleLogger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    consoleLogger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    consoleLogger.debug(message, meta);
  }

  error(error: string | Error | AppError | unknown, meta?: any) {
    let errorMessage: string;
    let isCriticalError = true; // Default to true
    let stackTrace: string | undefined;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof AppError) {
      errorMessage = error.message;
      isCriticalError = error.isCriticalError !== false; // Use isCriticalError if defined, otherwise default to true
      stackTrace = error.stack;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      stackTrace = error.stack;
    } else {
      errorMessage = String(error);
    }

    const prefix = isCriticalError ? "🔴" : "🟡";
    consoleLogger.error(`${prefix} ${errorMessage}`);

    if (meta) {
      consoleLogger.error(`┗ Request metadata: ${JSON.stringify(meta)}`);
    }

    if (error instanceof AppError && error.meta) {
      consoleLogger.error(`┗ Error metadata: ${JSON.stringify(error.meta)}`);
    }

    if (stackTrace && isCriticalError) {
      consoleLogger.error(`┗ Stack trace:\n${stackTrace}`);
    }

    if (isCriticalError && slackLogger) {
      slackLogger.error(errorMessage, meta);
    }
  }
}

export function createLogger(): SmartLogger {
  return new SmartLogger();
}

export default createLogger();
