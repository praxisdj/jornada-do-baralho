import { Prisma } from "@prisma/client";

export type Card = Prisma.CardGetPayload<object>;

export type CardStatus = "signed" | "pending";
