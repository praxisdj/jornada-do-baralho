import { CardStatus, Prisma } from "@prisma/client";
import { z } from "zod";

export type User = Prisma.UserGetPayload<{
  include: {
    userCards: {
      include: {
        card: true;
      };
    };
  };
}>;

export interface UserCardUpdate {
  id: string;
  status: "SIGNED" | "PENDING";
  comment?: string | null;
  signedAt?: string | null;
}

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  image: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().optional(),
  userCards: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(CardStatus),
      comment: z.string().nullable().optional(),
      signedAt: z.string().nullable().optional(),
    }),
  ),
});

export const USER_ZOD_DEFINITION = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SingleUserResponseSchema = USER_ZOD_DEFINITION;
export const UsersResponseSchema = USER_ZOD_DEFINITION.array();
